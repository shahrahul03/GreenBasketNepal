# Green Basket Nepal

Farm-to-Home Vegetable and Fruit Marketplace — a full-stack e-commerce platform connecting local farmers directly to consumers in Nepal.

## Monorepo Structure

```
GreenBasket-Nepal/
│
├── greenbasket-backend/          # Spring Boot 3.2.5 + Java 21 API
│   ├── src/                      # Application source code
│   ├── uploads/                  # File upload storage directory
│   ├── pom.xml                   # Maven build configuration
│   ├── Dockerfile                # Multi-stage backend Docker build
│   └── .env.example              # Backend environment variable template
│
├── greenbasket-frontend/         # React 18 + Vite + Tailwind SPA
│   ├── src/                      # Application source code
│   ├── public/                   # Static assets
│   ├── package.json              # npm dependencies & scripts
│   ├── Dockerfile                # React → Nginx multi-stage build
│   ├── nginx.conf                # Production Nginx configuration
│   ├── vercel.json               # Vercel deployment configuration
│   └── .env.example              # Frontend environment variable template
│
├── docker-compose.yml            # Full-stack Docker orchestration
├── DEPLOYMENT.md                 # Comprehensive deployment guide
└── README.md                     # This file
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Hibernate, Flyway, MySQL 8 |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router 6, Axios, Recharts |
| **Auth** | JWT (access + refresh tokens), BCrypt(12), Google OAuth |
| **API Docs** | SpringDoc OpenAPI 2.5 (Swagger UI) |
| **Infra** | Docker, Docker Compose, Nginx |

## Quick Start

### Prerequisites
- JDK 21+, Node.js 20+, Docker & Docker Compose (for containerized deployment)

### Local Development (Backend)
```bash
cd greenbasket-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
API: `http://localhost:8080` | Swagger: `http://localhost:8080/swagger-ui.html`

### Local Development (Frontend)
```bash
cd greenbasket-frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173` (proxies `/api` and `/uploads` to backend)

### Docker (Full Stack)
```bash
docker compose up --build -d
```
Frontend: `http://localhost` | API: `http://localhost:8080`

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

### Supported Platforms

| Component | Platform |
|-----------|----------|
| **Frontend** | Vercel, Netlify, Docker/Nginx |
| **Backend** | Render, Railway, Docker |
| **Database** | Railway MySQL, Cloud MySQL, Docker MySQL |

### Environment Variables
- Backend: `greenbasket-backend/.env.example`
- Frontend: `greenbasket-frontend/.env.example`

## Key Features

- Role-based access: ADMIN, CUSTOMER, FARMER, DELIVERY_PARTNER
- Product catalog with search, filter, and pagination
- Shopping cart, wishlist, and order management
- Delivery assignment and tracking with state machine
- Admin dashboard with aggregated analytics
- JWT token rotation and refresh flow
- Google OAuth authentication
- Flyway-managed database migrations
