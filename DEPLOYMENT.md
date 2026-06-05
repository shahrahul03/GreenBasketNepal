# Green Basket Nepal - Deployment Guide

## Overview

This guide covers production deployment for Green Basket Nepal across multiple platforms.

| Component | Platform | Technology |
|-----------|----------|------------|
| **Frontend** | Vercel | React + Vite SPA |
| **Backend** | Render / Railway | Spring Boot 3.2.5 + Java 21 |
| **Database** | Railway MySQL / Cloud MySQL | MySQL 8.0 |
| **File Storage** | Backend filesystem (ephemeral) | `/app/uploads` |

---

## Prerequisites

- Java 21+ (for local build verification)
- Node.js 20+ (for local build verification)
- Docker & Docker Compose (for containerized deployment)
- A Railway / Render account
- A Vercel account
- A Google Cloud Console project (for OAuth)

---

## Environment Variables

### Backend Required Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Yes | JDBC MySQL connection URL | `jdbc:mysql://host:3306/db?useSSL=true&serverTimezone=UTC` |
| `SPRING_DATASOURCE_USERNAME` | Yes | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Yes | Database password | |
| `JWT_ACCESS_SECRET` | Yes | 64+ char base64 JWT signing key | Generate: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Yes | 64+ char base64 JWT refresh key | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | From Google Cloud Console |
| `FRONTEND_URL` | Yes | Frontend URL | `https://greenbasket.vercel.app` |
| `ALLOWED_ORIGINS` | Yes | CORS origins (comma-separated) | `https://greenbasket.vercel.app` |
| `MAIL_HOST` | No | SMTP host (default: localhost) | `smtp.gmail.com` |
| `MAIL_PORT` | No | SMTP port (default: 587) | `587` |
| `MAIL_USERNAME` | No | SMTP username | |
| `MAIL_PASSWORD` | No | SMTP password / app password | |
| `MAIL_FROM` | No | From address | `noreply@greenbasketnepal.com` |
| `ADMIN_EMAIL` | No | Admin notification email | `admin@greenbasketnepal.com` |
| `UPLOAD_DIR` | No | Upload directory (default: ./uploads) | `/app/uploads` |

### Frontend Required Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | Yes | Backend API URL | For Vercel: `https://api.greenbasket.com.np/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | From Google Cloud Console |
| `VITE_APP_NAME` | No | App name | `Green Basket Nepal` |
| `VITE_APP_URL` | No | App URL | `https://greenbasket.vercel.app` |

---

## Deployment Option 1: Docker Compose (VPS)

Deploy to any Linux VPS with Docker installed.

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/green-basket-nepal.git
   cd green-basket-nepal
   ```

2. **Create `.env` file**
   ```bash
   cat > .env << 'EOF'
   MYSQL_PASSWORD=<strong-random-password>
   JWT_ACCESS_SECRET=$(openssl rand -base64 32)
   JWT_REFRESH_SECRET=$(openssl rand -base64 32)
   GOOGLE_CLIENT_ID=<your-google-client-id>
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=<your-email>
   MAIL_PASSWORD=<your-app-password>
   FRONTEND_URL=https://<your-domain>
   ALLOWED_ORIGINS=https://<your-domain>
   EOF
   ```

3. **Build and start**
   ```bash
   docker compose up --build -d
   ```

4. **Verify**
   ```bash
   docker compose ps
   docker compose logs app --tail=20
   ```

---

## Deployment Option 2: Vercel (Frontend) + Render (Backend) + Railway MySQL

### Step 1: Database - Railway MySQL

1. Create a new MySQL project on [Railway](https://railway.app)
2. Copy the connection string: `jdbc:mysql://<host>:<port>/<db>?useSSL=true&requireSSL=true&serverTimezone=UTC`
3. Note the username and password

### Step 2: Backend - Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `greenbasket-backend`
   - **Build Command**: `mvn clean package -DskipTests -B`
   - **Start Command**: `java -jar target/green-basket-nepal-1.0.0.jar`
   - **Java Version**: 21
4. Add all **Backend Required Variables** (see above)
5. Set `SPRING_PROFILES_ACTIVE=prod`
6. Deploy

### Step 3: Frontend - Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `greenbasket-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add all **Frontend Required Variables** (see above)
5. Set `VITE_API_BASE_URL` to your Render backend URL, e.g.:
   `https://greenbasket-api.onrender.com/api/v1`
6. Deploy

### Step 4: Configure Google OAuth

Add the following authorized redirect URIs in Google Cloud Console:
- `https://<vercel-domain>`
- `https://<vercel-domain>/login`

---

## JWT Secret Generation

```bash
# Generate 256-bit base64 secrets
ACCESS_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)
echo "JWT_ACCESS_SECRET=$ACCESS_SECRET"
echo "JWT_REFRESH_SECRET=$REFRESH_SECRET"
```

---

## Build Commands (Local Verification)

### Backend
```bash
cd greenbasket-backend
mvn clean package -DskipTests -B
# Output: target/green-basket-nepal-1.0.0.jar
```

### Frontend
```bash
cd greenbasket-frontend
npm ci
npm run build
# Output: dist/
```

---

## Run Commands (Local)

### Backend (requires MySQL)
```bash
cd greenbasket-backend
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/green_basket_nepal?useSSL=false&serverTimezone=Asia/Kathmandu
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=root
export JWT_ACCESS_SECRET="<64-char-secret>"
export JWT_REFRESH_SECRET="<64-char-secret>"
export GOOGLE_CLIENT_ID="<your-client-id>"
java -jar target/green-basket-nepal-1.0.0.jar --spring.profiles.active=prod
```

### Frontend (dev mode)
```bash
cd greenbasket-frontend
cp .env.example .env
# Edit .env with your values
npm run dev
```

---

## Docker

### Build individual images

```bash
# Backend
docker build -t greenbasket-backend ./greenbasket-backend

# Frontend
docker build \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  --build-arg VITE_GOOGLE_CLIENT_ID=<your-client-id> \
  -t greenbasket-frontend ./greenbasket-frontend
```

### Run full stack
```bash
docker compose up --build -d
```

---

## Security Checklist

- [ ] JWT secrets are 256-bit base64 random values
- [ ] Database password is strong and unique
- [ ] CORS origins are restricted to your domain only
- [ ] Google OAuth client ID is restricted to your domain
- [ ] SMTP credentials use app-specific passwords
- [ ] Production profile disables Hibernate DDL auto-update
- [ ] Flyway manages schema migrations
- [ ] Default admin password changed immediately after first login
- [ ] SSL/TLS enabled in production
- [ ] File upload size is limited (10MB max)

---

## Rollback Procedure

```bash
# Docker
docker compose down
git checkout <previous-tag>
docker compose up --build -d

# Database rollback requires backup restoration
# docker exec greenbasket-mysql mysql -u root -p<password> green_basket_nepal < backup.sql
```
