# Green Basket Nepal 🥦

Farm-to-Home Vegetable and Fruit Marketplace — a full-stack e-commerce platform connecting local farmers directly to consumers in Nepal.

## Monorepo Structure

```
GreenBasket-Nepal/
│
├── greenbasket-backend/          # Spring Boot 3.2.5 + Java 21 API
│   ├── src/                      #   Application source code
│   ├── uploads/                  #   Local file upload storage
│   ├── pom.xml                   #   Maven build configuration
│   ├── Dockerfile                #   Multi-stage backend Docker build
│   └── README.md                 #   Backend-specific documentation
│
├── greenbasket-frontend/         # React 18 + Vite + Tailwind SPA
│   ├── src/                      #   Application source code
│   ├── public/                   #   Static assets
│   ├── package.json              #   npm dependencies & scripts
│   ├── Dockerfile                #   React → Nginx multi-stage build
│   ├── nginx.conf                #   Production Nginx configuration
│   └── README.md                 #   Frontend-specific documentation
│
├── docker-compose.yml            # Full-stack Docker orchestration
├── DEPLOYMENT.md                 # Production deployment guide
└── README.md                     # This file
```

## Quick Start

### Prerequisites

- JDK 21+, Node.js 20+, Docker & Docker Compose (for containerized deployment)

### Local Development (Backend)

```bash
cd greenbasket-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
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
export JWT_ACCESS_SECRET=<your-256-bit-base64-secret>
export JWT_REFRESH_SECRET=<your-256-bit-base64-secret>
docker compose up --build -d
```

- Frontend: `http://localhost`
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Hibernate, Flyway, MySQL 8 |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router 6, Axios, Recharts |
| **Auth** | JWT (access + refresh tokens), BCrypt(12), role-based access control |
| **API Docs** | SpringDoc OpenAPI 2.5 (Swagger UI) |
| **Infra** | Docker, Docker Compose, Nginx |

## Key Features

- Role-based access: ADMIN, CUSTOMER, FARMER, DELIVERY_PARTNER
- Product catalog with search, filter, and pagination
- Shopping cart, wishlist, and order management
- Delivery assignment and tracking with state machine
- Admin dashboard with aggregated analytics
- JWT token rotation and refresh flow
- Flyway-managed database migrations
- Local filesystem image uploads (swappable to S3/Cloudinary)

See `greenbasket-backend/README.md` and `greenbasket-frontend/README.md` for detailed module documentation.
