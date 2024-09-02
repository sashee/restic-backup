#!/usr/bin/env node
import * as fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import {AwsClient} from "aws4fetch";
import util from "node:util";
import childProcess from "node:child_process";
import {finished} from "node:stream/promises";
import {Buffer} from "node:buffer";

const execFile = util.promisify(childProcess.execFile);

console.log(process.argv)
if(process.argv[2] === "check") {
	console.log(AwsClient);
	process.exit(0);
}

const constructURL = (base, pathname, searchParams) => {
	const url = new URL(base);
	url.pathname = pathname;
	url.search = new URLSearchParams(searchParams);
	return url;
};

console.log(JSON.stringify(process.env, undefined, 4));
const runId = crypto.randomUUID();

const monitoringAwsSecretAccessKey = await fs.readFile(path.join(process.env.CREDENTIALS_DIRECTORY, "monitoring_aws_secret_access_key"));
const aws = new AwsClient({accessKeyId: process.env.MONITORING_AWS_ACCESS_KEY_ID, secretAccessKey: monitoringAwsSecretAccessKey});
const sendMonitoring = async ({pathname, searchParams, method, body}) => {
	const res = await aws.fetch(constructURL(process.env.MONITORING_URL, pathname, searchParams), {
		method,
		body,
		aws: {
			service: "lambda",
			region: process.env.MONITORING_REGION,
		},
	});
	if (!res.ok) {
		const restext = await res.text();
		throw new Error(`Error sending monitoring event: ${restext}`);
	}
}

const awsSecretAccessKey = await fs.readFile(path.join(process.env.CREDENTIALS_DIRECTORY, "aws_secret_access_key"));

const runCommand = async ({label, command, args, env, isJson}) => {
	try {
		const {stdout, stderr} = await execFile(command, args, {env});
		await sendMonitoring({pathname: "/log", searchParams: {runid: runId, label}, method: "POST", body: JSON.stringify({stdout: isJson ? JSON.parse(stdout) : stdout, stderr})});
	}catch(e) {
		if (e.stdout !== undefined && e.stderr !== undefined) {
			// error is thrown by the execFile
			console.log(e.stderr, e.stderr);
			await sendMonitoring({pathname: "/log", searchParams: {runid: runId, label: `${label}-error`}, method: "POST", body: JSON.stringify({stdout: e.stdout, stderr: e.stderr})});
			throw e;
		}else {
			throw e;
		}
	}
}

await sendMonitoring({pathname: "/run", searchParams: {runid: runId, monitor: process.env.MONITORING_MONITOR_NAME}, method: "GET"});

try {
	const resticPassword = await fs.readFile(path.join(process.env.CREDENTIALS_DIRECTORY, "restic_password"));
	await runCommand({label: "unlock", command: "restic", args: ["unlock"], env: {AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY, AWS_SECRET_ACCESS_KEY: awsSecretAccessKey, RESTIC_PASSWORD: resticPassword}, isJson: false});
	try {
		const backup = childProcess.spawn("restic", [
			"backup", "--group-by", "", "--json", ...process.env.BACKUP_DIRS.split(" "), ...process.env.EXCLUDES.split(" ")
		], {
			env: {
				AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
				RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY,
				AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
				RESTIC_PASSWORD: resticPassword
			}}
		);
		const [logsSettled, runSettled] = await Promise.allSettled([
			new Promise((res, rej) => {
				let accumulator = "";
				backup.stdout.on("data", (data) => {
					accumulator = (accumulator + data.toString()).split("\n").slice(-2).join("\n");
				});
				const stderr = [];
				backup.stderr.on("data", (data) => stderr.push(data));
				Promise.all([finished(backup.stdout).catch(() => {}), finished(backup.stderr).catch(() => {})]).then(() => {
					res({stdout: accumulator.split("\n").reverse().filter((line) => line.trim() !== "")[0] ?? "", stderr: Buffer.concat(stderr).toString()});
				}).catch((e) => rej(e));
			}),
			new Promise((res, rej) => {
				backup.on("close", (code) => {
					if (code === 0) {
						res();
					}else {
						rej(code);
					}
				});
				backup.on("error", (err) => {
					rej(err);
				});
			}),
		]);
		if (logsSettled.status === "rejected") {
			throw logsSettled.reason;
		}
		if (runSettled.status === "rejected") {
			throw {...logsSettled.value, error: runSettled.reason};
		}
		await sendMonitoring({pathname: "/log", searchParams: {runid: runId, label: "backup"}, method: "POST", body: JSON.stringify({stdout: JSON.parse(logsSettled.value.stdout), stderr: logsSettled.value.stderr})});
	}catch(e) {
		if (e.stdout !== undefined && e.stderr !== undefined) {
			// error is thrown by the spawn
			console.log(e.stderr, e.stdout, e.error);
			await sendMonitoring({pathname: "/log", searchParams: {runid: runId, label: "backup-error"}, method: "POST", body: JSON.stringify({stdout: e.stdout, stderr: e.stderr, error: e.error})});
			throw e;
		}else {
			throw e;
		}
	}
	if (process.env.PRUNE) {
		await runCommand({label: "forget", command: "restic", args: ["forget", "--json", ...process.env.PRUNE.split(" "), "--group-by", ""], env: {AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY, AWS_SECRET_ACCESS_KEY: awsSecretAccessKey, RESTIC_PASSWORD: resticPassword}, isJson: true});
		await runCommand({label: "prune", command: "restic", args: ["prune"], env: {AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY, AWS_SECRET_ACCESS_KEY: awsSecretAccessKey, RESTIC_PASSWORD: resticPassword}, isJson: false});
	}
	await runCommand({label: "check", command: "restic", args: ["check"], env: {AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY, AWS_SECRET_ACCESS_KEY: awsSecretAccessKey, RESTIC_PASSWORD: resticPassword}, isJson: false});
	await runCommand({label: "snapshots", command: "restic", args: ["snapshots", "--json"], env: {AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY, AWS_SECRET_ACCESS_KEY: awsSecretAccessKey, RESTIC_PASSWORD: resticPassword}, isJson: true});
	await runCommand({label: "stats", command: "restic", args: ["stats", "latest", "--json"], env: {AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, RESTIC_REPOSITORY: process.env.RESTIC_REPOSITORY, AWS_SECRET_ACCESS_KEY: awsSecretAccessKey, RESTIC_PASSWORD: resticPassword}, isJson: true});

	await sendMonitoring({pathname: "/success", searchParams: {runid: runId}, method: "GET"});
}catch(e) {
	await sendMonitoring({pathname: "/fail", searchParams: {runid: runId}, method: "GET"});
	throw e;
}
