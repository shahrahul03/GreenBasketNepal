# Deployment Guide

This guide covers production deployment for Green Basket Nepal using Docker Compose on a VPS.

## Prerequisites

- Linux VPS (Ubuntu 22.04 LTS recommended)
- Docker Engine 24+ and Docker Compose v2+
- Domain names: `api.greenbasket.com.np`, `greenbasket.com.np`
- SSL certificates (via Let's Encrypt / Certbot)
- Nginx reverse proxy on the host

## 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. Generate JWT Secrets

```bash
ACCESS_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)
echo "JWT_ACCESS_SECRET=$ACCESS_SECRET"
echo "JWT_REFRESH_SECRET=$REFRESH_SECRET"
```

## 3. Clone & Configure

```bash
sudo mkdir -p /opt/greenbasket
sudo chown $USER:$USER /opt/greenbasket
cd /opt/greenbasket

git clone https://github.com/your-org/green-basket-nepal.git .

# Create .env file
cat > .env << EOF
MYSQL_PASSWORD=change_this_to_a_strong_password
JWT_ACCESS_SECRET=<your-access-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
EOF
```

## 4. Build & Run

```bash
docker compose up --build -d
```

### Verify

```bash
docker compose ps
# All three services should show "Up"

docker compose logs app --tail=20
# Look for "Started GreenBasketApplication"
```

## 5. Nginx Reverse Proxy (Host-Level)

Create `/etc/nginx/sites-available/greenbasket`:

```nginx
# API subdomain
server {
    listen 80;
    server_name api.greenbasket.com.np;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
        client_max_body_size 10M;
    }
}

# Main domain (React frontend)
server {
    listen 80;
    server_name greenbasket.com.np www.greenbasket.com.np;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/greenbasket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d greenbasket.com.np -d www.greenbasket.com.np -d api.greenbasket.com.np
```

## 7. Monitoring & Backups

```bash
# View logs
docker compose logs -f app
docker compose logs -f frontend

# Resource usage
docker stats

# Database backup
docker exec greenbasket-mysql mysqldump -u root -p$MYSQL_PASSWORD green_basket_nepal > backup_$(date +%F).sql
```

### Automated Backup Cron

```bash
sudo crontab -e
# Add:
0 2 * * * docker exec greenbasket-mysql mysqldump -u root -p<password> green_basket_nepal > /opt/backups/db_$(date +\%F).sql && find /opt/backups -name "*.sql" -mtime +7 -delete
```

## 8. Update Deployment

```bash
cd /opt/greenbasket
git pull
docker compose up --build -d
# Flyway migrations run automatically
```

## 9. Rollback

```bash
docker compose down
git checkout <previous-commit>
docker compose up --build -d
# For DB rollback, restore from backup:
# docker exec -i greenbasket-mysql mysql -u root -p<password> green_basket_nepal < backup_file.sql
```

## 10. Security Checklist

- [ ] MySQL root password changed from default
- [ ] JWT secrets are 256-bit base64-encoded random values
- [ ] Firewall restricts ports 22, 80, 443 only
- [ ] SSL enabled with auto-renewal
- [ ] Fail2ban installed for SSH brute-force protection
- [ ] Regular automated DB backups configured
- [ ] Docker containers run as non-root users
- [ ] `.env` file has restricted permissions (`chmod 600`)

## Architecture Diagram

```
                                ┌─────────────┐
                                │   Browser    │
                                └──────┬──────┘
                                       │
                              ┌────────┴────────┐
                              │  Nginx (Host)    │
                              │  80/443 → SSL    │
                              └────────┬────────┘
                         ┌──────────────┼──────────────┐
                         │              │              │
                         ▼              ▼              ▼
                  ┌──────────┐   ┌──────────┐   ┌──────────┐
                  │ Frontend │   │ Backend  │   │   MySQL   │
                  │  :80     │   │  :8080   │   │  :3306   │
                  │  Nginx   │   │  Spring  │   │          │
                  │  React   │   │  Boot    │   │          │
                  └──────────┘   └──────────┘   └──────────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │ Uploads  │
                                 │ Volumes  │
                                 └──────────┘
```
