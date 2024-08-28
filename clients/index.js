#!/usr/bin/env node
import cowsay from "cowsay";

console.log(process.argv)
if(process.argv[2] === "check") {
	console.log(cowsay.say({text: "checking..."}));
	process.exit(0);
}
console.log(cowsay.say({text: "Hello world2!"}))
