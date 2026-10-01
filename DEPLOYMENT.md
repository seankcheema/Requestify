# Requestify Deployment Guide

This guide takes Requestify from this repository to a live HTTPS website on **Google Cloud (GCP)** or
**Amazon Web Services (AWS)**, with every command you need. It takes about 45 minutes the first time.

You will end up with one Linux server running four Docker containers:

```
Internet ──► caddy :80/:443 (automatic HTTPS)
               ├── /api/*  ──► api  (Flask + Socket.IO)  ──► db (MySQL 8.4, data in a Docker volume)
               └── /*      ──► web  (React app + DJ message socket)
```

## Contents

1. [Collect your credentials](#step-1--collect-your-credentials)
2. [(Optional) Test on your own computer](#step-2--optional-test-on-your-own-computer)
3. [Create the server](#step-3--create-the-server) on [GCP](#option-a-google-cloud-gcp) or [AWS](#option-b-amazon-web-services-aws)
4. [Prepare the server](#step-4--prepare-the-server)
5. [Point your domain at the server](#step-5--point-your-domain-at-the-server)
6. [Launch Requestify](#step-6--launch-requestify)
7. [Verify it works](#step-7--verify-it-works)
8. [Connect Stripe and Firebase](#step-8--connect-stripe-and-firebase)
9. [Day-to-day operations](#step-9--day-to-day-operations)
10. [(Optional) Use a managed database](#step-10--optional-use-a-managed-database)
11. [Troubleshooting](#step-11--troubleshooting)
12. [Shut down and delete everything](#step-12--shut-down-and-delete-everything)

## Quick reference

If you have done this before, here is the whole deployment once you are logged in to a fresh Ubuntu server:

```bash
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER && newgrp docker
git clone -b cloud-branch https://github.com/seankcheema/Requestify.git && cd Requestify
nano requestify/Firebase-Service-Key.json && chmod 644 requestify/Firebase-Service-Key.json
cp .env.example .env && nano .env
docker compose up -d --build
```

## Conventions used in this guide

- **On your computer** means a terminal on your own machine: Git Bash on Windows, or Terminal on macOS/Linux.
  Instead, you can run the cloud commands in your browser using **GCP Cloud Shell** or **AWS CloudShell**,
  which already have the cloud tools installed. That is the easiest option.
- **On the server** means inside an SSH session on the cloud server you create in Step 3.
- Replace anything in `<angle brackets>` with your own value, for example `<server-ip>` becomes `34.123.45.67`.
- The examples use the domain `requestify.example.com`. Replace it with your own.

---

## Step 1 — Collect your credentials

Gather these before you start. If you already run Requestify locally with `start.bat`, most of these values are
already in your `requestify/.env` file.

| What | Where to find it | Goes in |
| --- | --- | --- |
| Firebase web config (7 values) | [Firebase console](https://console.firebase.google.com) > ⚙ Project settings > General > Your apps > Web app > **Config** | `.env`: `REACT_APP_FIREBASE_*` |
| Firebase service account key | Firebase console > ⚙ Project settings > **Service accounts** > *Generate new private key* (downloads a `.json` file) | `requestify/Firebase-Service-Key.json` |
| Spotify client ID and secret | [Spotify developer dashboard](https://developer.spotify.com/dashboard) > your app > **Settings** | `.env`: `REACT_APP_SPOTIFY_*` |
| Stripe secret key | [Stripe dashboard](https://dashboard.stripe.com) > Developers > **API keys** > Secret key (`sk_live_...` or `sk_test_...`) | `.env`: `REACT_APP_STRIPE_SECRET_KEY` |
| Stripe webhook signing secret | You create this in [Step 8](#step-8--connect-stripe-and-firebase). Leave it blank for now. | `.env`: `REACT_APP_STRIPE_SIGNING_KEY` |
| A domain name | Any registrar (Namecheap, GoDaddy, Cloudflare, Squarespace, …). Optional for a first test. | `.env`: `SITE_ADDRESS`, `PUBLIC_APP_URL` |

---

## Step 2 — (Optional) Test on your own computer

This catches configuration mistakes before you pay for a server. It needs
[Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

**On your computer:**

```bash
git clone -b cloud-branch https://github.com/seankcheema/Requestify.git
cd Requestify
cp .env.example .env
```

Open `.env` in any editor and fill it in (see [Step 4.6](#46-create-the-env-config-file) for what each line means),
but set these two lines for local testing:

```
SITE_ADDRESS=:80
PUBLIC_APP_URL=http://localhost
```

Copy your Firebase service account key to `requestify/Firebase-Service-Key.json`, then start everything:

```bash
docker compose up -d --build
docker compose ps
```

Open <http://localhost> in your browser. When you are done:

```bash
docker compose down
```

---

## Step 3 — Create the server

Pick **one** cloud and follow only that option.

Recommended size: **2 vCPU, 4 GB RAM, 20 GB disk, Ubuntu 24.04**. Building the React app needs memory. A 2 GB server
also works if you add swap in [Step 4.2](#42-add-swap-memory).

### Option A: Google Cloud (GCP)

**3A.1 — Open a terminal with `gcloud`.**
Go to <https://console.cloud.google.com> and click the **Activate Cloud Shell** button (`>_`) in the top-right corner.
To use your own computer instead, install the [gcloud CLI](https://cloud.google.com/sdk/docs/install) and run `gcloud init`.

**3A.2 — Select your project and turn on Compute Engine.** The project needs billing enabled.

```bash
gcloud projects list
gcloud config set project <your-project-id>
gcloud services enable compute.googleapis.com
```

**3A.3 — Reserve a static IP address**, so the server's address never changes:

```bash
gcloud compute addresses create requestify-ip --region=us-central1
gcloud compute addresses describe requestify-ip --region=us-central1 --format='value(address)'
```

Write down the IP address it prints. This is your `<server-ip>`.

**3A.4 — Open the web ports** (HTTP and HTTPS):

```bash
gcloud compute firewall-rules create requestify-web \
  --network=default \
  --allow=tcp:80,tcp:443,udp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=requestify
```

**3A.5 — Create the server:**

```bash
gcloud compute instances create requestify \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2404-lts-amd64 \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --address=requestify-ip \
  --tags=requestify
```

**3A.6 — Connect to it:**

```bash
gcloud compute ssh requestify --zone=us-central1-a
```

The first time, it asks to create an SSH key. Press Enter to accept the defaults.
You can also click **SSH** next to the server in Console > Compute Engine > VM instances.

Now continue with [Step 4](#step-4--prepare-the-server).

### Option B: Amazon Web Services (AWS)

**3B.1 — Open a terminal with the `aws` CLI.**
Sign in at <https://console.aws.amazon.com>, choose your region in the top-right corner (for example *US East (N. Virginia)*),
and click the **CloudShell** icon (`>_`) in the top bar. To use your own computer instead, install the
[AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and run `aws configure`.

> Run all of Option B in **one** terminal session. The commands save IDs in shell variables like `$SG_ID`.
> If you close the terminal, [Step 12](#aws) shows how to look them up again.

**3B.2 — Create an SSH key pair:**

```bash
aws ec2 create-key-pair --key-name requestify-key \
  --query 'KeyMaterial' --output text > requestify-key.pem
chmod 400 requestify-key.pem
```

Keep `requestify-key.pem` safe. It is the only way to log in to the server.

**3B.3 — Create a firewall (security group)** that allows SSH, HTTP, and HTTPS:

```bash
SG_ID=$(aws ec2 create-security-group --group-name requestify-sg \
  --description "Requestify web server" --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol udp --port 443 --cidr 0.0.0.0/0
```

SSH login only works with your key file. If you always connect from the same network, you can replace
`0.0.0.0/0` on the port 22 rule with `<your-ip>/32`.

**3B.4 — Launch the server** (Ubuntu 24.04, `t3.medium`, 20 GB disk):

```bash
AMI_ID=$(aws ssm get-parameter \
  --name /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \
  --query 'Parameter.Value' --output text)

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.medium \
  --key-name requestify-key \
  --security-group-ids $SG_ID \
  --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=requestify}]' \
  --query 'Instances[0].InstanceId' --output text)

aws ec2 wait instance-running --instance-ids $INSTANCE_ID
echo "Instance $INSTANCE_ID is running"
```

**3B.5 — Give it a static IP address (Elastic IP):**

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
aws ec2 describe-addresses --allocation-ids $ALLOC_ID --query 'Addresses[0].PublicIp' --output text
```

Write down the IP address it prints. This is your `<server-ip>`.

**3B.6 — Connect to it.** Wait about a minute after launch for SSH to come up:

```bash
ssh -i requestify-key.pem ubuntu@<server-ip>
```

Type `yes` when asked to trust the host. You can also use EC2 console > Instances > *requestify* > **Connect** > EC2 Instance Connect.

> **Windows (PowerShell) only:** if `ssh` refuses the key with "UNPROTECTED PRIVATE KEY FILE", lock down its permissions:
> `icacls .\requestify-key.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"`

---

## Step 4 — Prepare the server

Every command in this step runs **on the server**, and they are the same for GCP and AWS.

### 4.1 Update the system

```bash
sudo apt-get update
sudo NEEDRESTART_MODE=a apt-get upgrade -y
```

### 4.2 Add swap memory

Swap protects the build from running out of memory. It is required on a 2 GB server and harmless on bigger ones.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

The `Swap:` row should now show `2.0Gi`.

### 4.3 Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Check that it works:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

The last command should print "Hello from Docker!".

### 4.4 Download Requestify

```bash
cd ~
git clone -b cloud-branch https://github.com/seankcheema/Requestify.git
cd Requestify
```

> Every command from here on runs inside the `~/Requestify` folder. If you reconnect later, run `cd ~/Requestify` first.

### 4.5 Add the Firebase service account key

**Option 1: paste it.** Open the downloaded `.json` file on your computer in a text editor and copy everything. Then run:

```bash
nano requestify/Firebase-Service-Key.json
```

Paste with right-click or Ctrl+Shift+V. Save with **Ctrl+O**, press **Enter**, then exit with **Ctrl+X**.

**Option 2: copy the file over.** Run this **on your computer**, not the server:

```bash
# GCP
gcloud compute scp <path-to-your-key>.json requestify:~/Requestify/requestify/Firebase-Service-Key.json --zone=us-central1-a
# AWS
scp -i requestify-key.pem <path-to-your-key>.json ubuntu@<server-ip>:~/Requestify/requestify/Firebase-Service-Key.json
```

Then, **on the server**, make the file readable by the app and check that it is valid JSON:

```bash
chmod 644 requestify/Firebase-Service-Key.json
python3 -m json.tool requestify/Firebase-Service-Key.json > /dev/null && echo "Firebase key OK"
```

### 4.6 Create the `.env` config file

Generate two strong database passwords and copy them somewhere:

```bash
openssl rand -hex 24
openssl rand -hex 24
```

Create the config file from the template and open it:

```bash
cp .env.example .env
nano .env
```

Fill in every value. A completed file looks like this:

```bash
# Your domain (or :80 to test by IP without a domain; see Step 5)
SITE_ADDRESS=requestify.example.com
PUBLIC_APP_URL=https://requestify.example.com

# Database (bundled MySQL container)
COMPOSE_PROFILES=db
DB_HOST=db
DB_PORT=3306
DB_NAME=Requestify
DB_USER=requestify
DB_PASSWORD=<first generated password>
DB_ROOT_PASSWORD=<second generated password>

# Firebase
FIREBASE_KEY_FILE=./requestify/Firebase-Service-Key.json
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1234567890
REACT_APP_FIREBASE_APP_ID=1:1234567890:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# Spotify
REACT_APP_SPOTIFY_CLIENT_ID=...
REACT_APP_SPOTIFY_SECRET_CLIENT_ID=...

# Stripe (the signing key is added in Step 8)
REACT_APP_STRIPE_SECRET_KEY=sk_live_...
REACT_APP_STRIPE_SIGNING_KEY=
```

Save with **Ctrl+O**, **Enter**, **Ctrl+X**. Then protect the file and check the configuration:

```bash
chmod 600 .env
docker compose config --quiet && echo "Config OK"
```

If a required value is missing, the second command names it.

---

## Step 5 — Point your domain at the server

**5.1 — Add a DNS record.** At your domain registrar's DNS settings, create an **A record**:

| Type | Host / Name | Value | TTL |
| --- | --- | --- | --- |
| A | `requestify` (for `requestify.example.com`) or `@` (for `example.com` itself) | `<server-ip>` | 300 |

> **Cloudflare users:** set the record's proxy status to **DNS only** (grey cloud) so the server can get its HTTPS certificate.

**5.2 — Wait for it to take effect** (usually a few minutes, occasionally up to an hour). Check **on the server**:

```bash
getent hosts requestify.example.com
```

When it prints your `<server-ip>`, continue. If it prints nothing, wait and try again.

**No domain yet?** You can test over plain HTTP using the IP address. Set these in `.env`:

```
SITE_ADDRESS=:80
PUBLIC_APP_URL=http://<server-ip>
```

Switch to a real domain **before** DJs create accounts, because each DJ's QR code stores the address that was set when they signed up.

---

## Step 6 — Launch Requestify

**On the server:**

```bash
docker compose up -d --build
```

The first build takes about 5–10 minutes. Later updates are faster. When it finishes, check the services:

```bash
docker compose ps
```

All four services (`db`, `api`, `web`, `caddy`) should show `running`, and `db` should show `(healthy)`. Then check the logs:

```bash
docker compose logs api --tail 20
docker compose logs caddy | grep -iE "certificate obtained|error"
```

- The `api` log should include `Tables created or verified successfully`.
- The `caddy` log should include `certificate obtained successfully` (only when using a domain).

---

## Step 7 — Verify it works

**From any terminal:**

```bash
curl -I https://requestify.example.com
curl https://requestify.example.com/api/tracks/test
```

Expected output:

- The first command prints `HTTP/2 200`.
- The second prints `{"message":"No tracks found"}`, which shows the API and database are working.

**In a browser:**

1. Open `https://requestify.example.com/login` and create a DJ account
2. The dashboard should show your QR code. Scan it with your phone.
3. Request a song on your phone. It should appear in the DJ's queue within a second or two.
4. Upvote it on the phone and watch the count update on the dashboard

---

## Step 8 — Connect Stripe and Firebase

### 8.1 Firebase: allow your domain

Firebase console > **Authentication** > **Settings** > **Authorized domains** > **Add domain**, and enter `requestify.example.com`.

### 8.2 Stripe: create the payment webhook

1. Stripe dashboard > **Developers** > **Webhooks** > **Add endpoint** (called *Add destination* in newer dashboards)
2. Endpoint URL: `https://requestify.example.com/api/webhooks/stripe`
3. Events to send: select **only** `payment_intent.succeeded`
4. Save, then reveal and copy the **Signing secret** (`whsec_...`)

**On the server**, add the signing secret to `.env` and apply the change:

```bash
nano .env          # set REACT_APP_STRIPE_SIGNING_KEY=whsec_...
docker compose up -d
```

`docker compose up -d` restarts only the containers whose settings changed.

---

## Step 9 — Day-to-day operations

All commands run **on the server**, inside `~/Requestify`.

### Deploy a new version

```bash
cd ~/Requestify
git pull
docker compose up -d --build
docker image prune -f        # removes old image layers to free disk space
```

### Change a setting

```bash
nano .env
docker compose up -d                  # for most settings
docker compose up -d --build web      # if you changed any REACT_APP_FIREBASE_* value (they are built into the frontend)
```

### Common commands

| Task | Command |
| --- | --- |
| Status of all services | `docker compose ps` |
| Follow all logs live (Ctrl+C to stop) | `docker compose logs -f` |
| Logs for one service | `docker compose logs -f api` (or `web`, `db`, `caddy`) |
| Last 100 log lines | `docker compose logs --tail 100 api` |
| Restart one service | `docker compose restart web` |
| Stop everything (data is kept) | `docker compose down` |
| Start everything | `docker compose up -d` |
| CPU and memory use | `docker stats --no-stream` |
| Disk space | `df -h` |
| Open a MySQL shell | `docker compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" Requestify'` |

The containers start automatically when the server reboots. You can test that with `sudo reboot`, wait a minute,
reconnect, and run `docker compose ps`.

> ⚠️ Restarting the `api` service (or the whole server) **clears every song queue and track history**, because the
> app recreates those tables at startup. DJ accounts and payments are kept. Avoid restarting during an event.

### Back up the database

```bash
mkdir -p ~/backups
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --no-tablespaces Requestify' > ~/backups/requestify-$(date +%F).sql
ls -lh ~/backups
```

### Restore a backup

```bash
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" Requestify' < ~/backups/requestify-<YYYY-MM-DD>.sql
```

### Automatic nightly backups

```bash
crontab -e
```

Choose `nano` if asked, then add these two lines at the bottom. The first backs up at 3 AM every day, and the second
deletes backups older than 14 days.

```
0 3 * * * cd ~/Requestify && docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --no-tablespaces Requestify' > ~/backups/requestify-$(date +\%F).sql 2>/dev/null
30 3 * * * find ~/backups -name 'requestify-*.sql' -mtime +14 -delete
```

### Download a backup to your computer

Run **on your computer**:

```bash
# GCP
gcloud compute scp requestify:~/backups/requestify-<YYYY-MM-DD>.sql . --zone=us-central1-a
# AWS
scp -i requestify-key.pem ubuntu@<server-ip>:~/backups/requestify-<YYYY-MM-DD>.sql .
```

---

## Step 10 — (Optional) Use a managed database

By default MySQL runs in a container on the same server, which is simple and fine for most use. A managed database
(Cloud SQL or RDS) adds automatic backups and failover, but costs more. Skip this step unless you need that.

### 10A. GCP Cloud SQL

Run in **Cloud Shell**:

```bash
gcloud services enable sqladmin.googleapis.com

gcloud sql instances create requestify-db \
  --database-version=MYSQL_8_4 \
  --edition=enterprise \
  --tier=db-f1-micro \
  --region=us-central1 \
  --database-flags=log_bin_trust_function_creators=on \
  --authorized-networks=<server-ip>/32

gcloud sql databases create Requestify --instance=requestify-db
gcloud sql users create requestify --instance=requestify-db --host=% --password=<db-password>

gcloud sql instances describe requestify-db --format='value(ipAddresses[0].ipAddress)'
```

The last command prints the database's IP address. That is your `<db-host>`.

### 10B. AWS RDS

Run in **CloudShell**:

```bash
SG_ID=$(aws ec2 describe-security-groups --group-names requestify-sg --query 'SecurityGroups[0].GroupId' --output text)

read ENGINE_VERSION PG_FAMILY <<< $(aws rds describe-db-engine-versions --engine mysql --default-only \
  --query 'DBEngineVersions[0].[EngineVersion,DBParameterGroupFamily]' --output text)

aws rds create-db-parameter-group --db-parameter-group-name requestify-mysql \
  --db-parameter-group-family $PG_FAMILY --description "Requestify MySQL"
aws rds modify-db-parameter-group --db-parameter-group-name requestify-mysql \
  --parameters "ParameterName=log_bin_trust_function_creators,ParameterValue=1,ApplyMethod=immediate"

DB_SG_ID=$(aws ec2 create-security-group --group-name requestify-db-sg \
  --description "Requestify database" --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $DB_SG_ID --protocol tcp --port 3306 --source-group $SG_ID

aws rds create-db-instance \
  --db-instance-identifier requestify-db \
  --engine mysql --engine-version $ENGINE_VERSION \
  --db-instance-class db.t4g.micro \
  --allocated-storage 20 \
  --db-name Requestify \
  --master-username requestify \
  --master-user-password <db-password> \
  --db-parameter-group-name requestify-mysql \
  --vpc-security-group-ids $DB_SG_ID \
  --no-publicly-accessible

aws rds wait db-instance-available --db-instance-identifier requestify-db
aws rds describe-db-instances --db-instance-identifier requestify-db \
  --query 'DBInstances[0].Endpoint.Address' --output text
```

Creating the database takes 5–10 minutes. The last command prints its endpoint. That is your `<db-host>`.

### 10C. Move your data and switch over

**On the server**, copy the existing data into the new database:

```bash
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --no-tablespaces --skip-triggers --set-gtid-purged=OFF Requestify' > migrate.sql
docker run --rm -i mysql:8.4 mysql -h <db-host> -u requestify -p'<db-password>' Requestify < migrate.sql
```

Stop the bundled database and point the app at the new one:

```bash
docker compose stop db
nano .env
```

Change these lines in `.env`:

```
COMPOSE_PROFILES=
DB_HOST=<db-host>
DB_PASSWORD=<db-password>
```

Apply the change and check the API connected:

```bash
docker compose up -d
docker compose logs api --tail 20
```

Once everything works, you can delete the old local database container and its data:

```bash
docker compose rm -f db
docker volume rm requestify_db-data
```

---

## Step 11 — Troubleshooting

Start with `docker compose ps` and `docker compose logs <service>`. The error message usually tells you what is wrong.

| Symptom | Cause and fix |
| --- | --- |
| `required variable DB_PASSWORD is missing` (or another variable) | `.env` is missing or incomplete. Make sure you are in `~/Requestify` and the file exists (`ls -la .env`). |
| `permission denied ... /var/run/docker.sock` | Your user isn't in the docker group yet. Run `newgrp docker`, or log out and back in. |
| Build stops with `Killed` or `exit code 137` | The server ran out of memory. Add swap ([4.2](#42-add-swap-memory)) or use a larger server. |
| Site doesn't load / Caddy logs certificate errors | DNS doesn't point at the server yet ([5.2](#step-5--point-your-domain-at-the-server)), or ports 80/443 are closed in the cloud firewall. Fix it, then run `docker compose restart caddy`. |
| `api` keeps restarting with `Permission denied: '/run/secrets/firebase-key.json'` | Run `chmod 644 requestify/Firebase-Service-Key.json`, then `docker compose up -d`. |
| `api` logs `Spotify client id and secret not found` or `Stripe secret key not found` | Fill in those values in `.env`, then run `docker compose up -d`. |
| `api` logs `Can't connect to MySQL server` | Bundled DB: check `docker compose logs db`. Managed DB: check `DB_HOST`, and that the database firewall allows the server. |
| `api` logs error `1419` (`SUPER privilege and binary logging`) | Managed DB only: `log_bin_trust_function_creators` isn't on ([Step 10](#step-10--optional-use-a-managed-database)). |
| Login page shows `auth/invalid-api-key` | The Firebase web config was blank when the frontend was built. Fix the `REACT_APP_FIREBASE_*` values in `.env`, then run `docker compose up -d --build web`. |
| QR code opens the wrong address | `PUBLIC_APP_URL` was wrong when that DJ signed up. Fix `.env` and run `docker compose up -d`. The DJ then needs to delete and re-create their account to get a new QR code. |
| Stripe tips don't show up | Check `docker compose logs api` for `Webhook signature verification failed`. If you see it, `REACT_APP_STRIPE_SIGNING_KEY` doesn't match the webhook's signing secret. |

---

## Step 12 — Shut down and delete everything

Cloud resources cost money while they exist, including an unused static IP. A 4 GB server costs very roughly
$25–35 per month on either cloud. Check the GCP or AWS pricing calculator for your region.

To pause the app without deleting anything, run `docker compose down` on the server. To delete it all:

### GCP

Run in **Cloud Shell**:

```bash
gcloud compute instances delete requestify --zone=us-central1-a
gcloud compute addresses delete requestify-ip --region=us-central1
gcloud compute firewall-rules delete requestify-web
gcloud sql instances delete requestify-db          # only if you did Step 10A
```

### AWS

Run in **CloudShell**. The first block looks up the IDs again, in case you opened a new terminal.

```bash
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=requestify" "Name=instance-state-name,Values=pending,running,stopping,stopped" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)
ALLOC_ID=$(aws ec2 describe-addresses --filters "Name=instance-id,Values=$INSTANCE_ID" \
  --query 'Addresses[0].AllocationId' --output text)

# Only if you did Step 10B: delete the database first
aws rds delete-db-instance --db-instance-identifier requestify-db --skip-final-snapshot
aws rds wait db-instance-deleted --db-instance-identifier requestify-db
aws ec2 delete-security-group --group-name requestify-db-sg
aws rds delete-db-parameter-group --db-parameter-group-name requestify-mysql

# The server, its IP, firewall, and key
aws ec2 terminate-instances --instance-ids $INSTANCE_ID
aws ec2 wait instance-terminated --instance-ids $INSTANCE_ID
aws ec2 release-address --allocation-id $ALLOC_ID
aws ec2 delete-security-group --group-name requestify-sg
aws ec2 delete-key-pair --key-name requestify-key
rm -f requestify-key.pem
```

---

## Things to know

- **Set `PUBLIC_APP_URL` before DJs sign up.** Each DJ's QR code is generated once at registration and saved,
  so changing the domain later leaves existing QR codes pointing at the old address.
- **Restarting the API clears queues and track history**, as noted in [Step 9](#common-commands).
- **Scale up, not out.** The API runs as a single process because Flask-SocketIO needs all of a client's requests to
  reach the same process. If the server gets slow, move to a bigger one. Running several copies would need a
  Socket.IO message queue (e.g. Redis) and sticky sessions. DJ messages are also kept in the web server's memory.
- **Local development is unchanged.** `start.bat` / `start.sh` still work as before.
