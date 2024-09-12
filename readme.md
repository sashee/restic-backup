## Systemd

```
sudo mkdir -p /etc/systemd/system/serverless-restic-backup-client@.service.d
```

/etc/systemd/system/serverless-restic-backup-client@.service.d/override.conf

```
# replace with the username
User=sashee
ProtectHome=tmpfs

BindReadOnlyPaths=/home/sashee/laptop-backup
# ... add multiple paths like this
```

config: example path: /etc/restic_configs/restic-testing

```
mkdir -p /etc/restic_configs/restic-testing
```

```
cd /etc/restic_configs/restic-testing

systemd-ask-password -n | systemd-creds encrypt --tpm2-pcrs="" - aws_secret_access_key
systemd-ask-password -n | systemd-creds encrypt --tpm2-pcrs="" - monitoring_aws_secret_access_key
systemd-ask-password -n | systemd-creds encrypt --tpm2-pcrs="" - restic_password
```

config:

```
AWS_ACCESS_KEY_ID="..."
RESTIC_REPOSITORY="..."
MONITORING_URL="..."
MONITORING_REGION="..."
MONITORING_MONITOR_NAME="..."
MONITORING_AWS_ACCESS_KEY_ID="..."
PRUNE="--keep-last 10 --keep-within-daily 30d --keep-within-weekly 6m"
BACKUP_DIRS="..."
EXCLUDES="--exclude=.stversions"
```

```
systemctl daemon-reload
# change /etc/... path to the correct config
sudo systemctl enable --now $(systemd-escape --path --template=serverless-restic-backup-client@.timer "/etc/restic_configs/restic-testing")
```

## Android

```
serverless-restic-backup-client check
mkdir -p $PREFIX/etc/serverless-restic-backup-client/configs/<name>/config
```

config: $TERMUX_PREFIX/etc/serverless-restic-backup-client/configs/<name>/config

```
AWS_ACCESS_KEY_ID="..."
RESTIC_REPOSITORY="..."
MONITORING_URL="..."
MONITORING_REGION="..."
MONITORING_MONITOR_NAME="..."
MONITORING_AWS_ACCESS_KEY_ID="..."
PRUNE="--keep-last 10 --keep-within-daily 30d --keep-within-weekly 6m"
BACKUP_DIRS="..."
EXCLUDES="--exclude=.stversions"
AWS_SECRET_ACCESS_KEY="..."
MONITORING_AWS_SECRET_ACCESS_KEY="..."
RESTIC_PASSWORD="..."
```

```
serverless-restic-backup-client schedule
```


