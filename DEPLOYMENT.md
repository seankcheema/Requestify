# Deploying Requestify

Requestify runs as four containers defined in `docker-compose.yml`. Because everything is containerized, the same
steps work on any Linux VM: GCP Compute Engine, AWS EC2/Lightsail, or anything else with Docker.

```
Internet ──► caddy :80/:443 (automatic HTTPS)
               ├── /api/*  ──► api  (Flask + Socket.IO, gunicorn)  ──► db (MySQL 8.4, Docker volume)
               └── /*      ──► web  (React build + Node message socket)
```

The frontend talks to both backends through the same origin (`/api/...` and `/socket.io/...`),
so there are no hardcoded IPs or ports and HTTPS works end to end.

## What you need

- A domain name (optional for a first test, required for HTTPS)
- `requestify/Firebase-Service-Key.json` (Firebase console > Project settings > Service accounts)
- Your Firebase web config, Spotify client ID/secret, and Stripe keys

## 1. Create a VM

Use Ubuntu 24.04 with **4 GB RAM** (building the React app needs memory) and a 20 GB disk.
Open ports 22, 80, and 443 and give the VM a static IP.

**GCP (Compute Engine)**

```bash
gcloud compute addresses create requestify-ip --region=us-central1
gcloud compute instances create requestify \
  --zone=us-central1-a --machine-type=e2-medium \
  --image-family=ubuntu-2404-lts-amd64 --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB --address=requestify-ip --tags=http-server,https-server
gcloud compute firewall-rules create requestify-web \
  --allow=tcp:80,tcp:443,udp:443 --target-tags=http-server,https-server
gcloud compute ssh requestify --zone=us-central1-a
```

**AWS (EC2)**

1. EC2 > Launch instance: Ubuntu Server 24.04, `t3.medium`, 20 GB gp3, choose or create a key pair
2. Security group: allow SSH (your IP), HTTP (0.0.0.0/0), HTTPS (0.0.0.0/0)
3. EC2 > Elastic IPs > Allocate, then associate it with the instance
4. `ssh -i your-key.pem ubuntu@<elastic-ip>`

(Lightsail works too: pick a 4 GB Ubuntu instance, attach a static IP, and open ports 80/443 under Networking.)

## 2. Install Docker on the VM

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
```

## 3. Get the code and secrets onto the VM

```bash
git clone <your-repo-url> Requestify && cd Requestify
cp .env.example .env && nano .env        # fill in every value
```

Copy the Firebase key from your machine, for example:

```bash
scp requestify/Firebase-Service-Key.json <user>@<vm-ip>:~/Requestify/requestify/
# GCP: gcloud compute scp requestify/Firebase-Service-Key.json requestify:~/Requestify/requestify/ --zone=us-central1-a
```

The API runs as a non-root user, so the key must be world-readable (`chmod 644`) or it will fail with "permission denied".

## 4. Point your domain at the VM

Create a DNS **A record**, for example `requestify.example.com` pointing to the VM's static IP. Then set these in `.env`:

```
SITE_ADDRESS=requestify.example.com
PUBLIC_APP_URL=https://requestify.example.com
```

Caddy gets and renews the TLS certificate automatically on first start.

*No domain yet?* Use `SITE_ADDRESS=:80` and `PUBLIC_APP_URL=http://<vm-ip>` to test over plain HTTP.

## 5. Start it

```bash
docker compose up -d --build
docker compose ps                  # all four services should be "running"
docker compose logs -f api         # look for "Tables created or verified successfully"
```

## 6. Configure the external services

- **Stripe**: add a webhook endpoint `https://<your-domain>/api/webhooks/stripe` and put its signing secret in
  `REACT_APP_STRIPE_SIGNING_KEY`
- **Firebase**: Authentication > Settings > Authorized domains, then add your domain

Run `docker compose up -d` after changing `.env`. Firebase web config changes need `--build`, because they are baked into the frontend.

## Day-to-day operations

| Task | Command |
| --- | --- |
| Deploy a new version | `git pull && docker compose up -d --build` |
| View logs | `docker compose logs -f api` (or `web`, `caddy`, `db`) |
| Restart | `docker compose restart` |
| Stop | `docker compose down` (data in the `db-data` volume is kept) |
| Back up the database | `docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" Requestify' > backup.sql` |

## Using a managed database (Cloud SQL / RDS)

To move MySQL off the VM, create a MySQL 8 instance and a database plus user for Requestify. Then in `.env`:

```
COMPOSE_PROFILES=                  # stops running the bundled MySQL container
DB_HOST=<instance private IP or endpoint>
DB_PORT=3306
```

On startup the API creates a trigger, and managed MySQL only allows that for non-admin users when
`log_bin_trust_function_creators` is on:

- **Cloud SQL**: Edit instance > Flags > `log_bin_trust_function_creators = on`
- **RDS**: create a DB parameter group with `log_bin_trust_function_creators = 1` and attach it to the instance

Keep the database on a private network reachable from the VM: the same VPC, or the Cloud SQL Auth Proxy.

## Things to know

- **Set `PUBLIC_APP_URL` before DJs sign up.** Each DJ's QR code is generated once at registration and stored in the
  database, so changing the domain later leaves existing QR codes pointing at the old address.
- **Restarting the `api` container clears every queue and track history**, because `main.py` drops the `tracks`
  and `track_history` tables at startup. DJ accounts and payments are kept.
- **Scale up, not out.** The API runs as a single gunicorn worker because Flask-SocketIO needs all of a client's
  requests to reach the same process. Running multiple instances would require a Socket.IO message queue (e.g. Redis)
  and sticky sessions. DJ messages are also held in the Node server's memory.
- **Local development is unchanged.** `start.bat` / `start.sh` still work, because the frontend falls back to
  `http://<REACT_APP_API_IP>:5001` when `REACT_APP_API_URL` isn't set.
