# Green Basket Nepal — Backend

Spring Boot 3.2.5 REST API for the Farm-to-Home marketplace.

## Tech Stack

- Java 21, Spring Boot 3.2.5
- Spring Security + JWT (access 15m / refresh 7d) + BCrypt(12)
- Spring Data JPA + Hibernate + Flyway migrations
- MySQL 8 (production), H2 (tests)
- SpringDoc OpenAPI 2.5 (Swagger UI)
- Maven 3.9

## Project Structure

```
src/main/java/com/greenbasket/nepal/
├── config/           # Security, Web, OpenAPI configuration
├── security/         # JWT service, filter, entry point, annotations
├── common/           # ApiResponse, PagedResponse, exceptions, audit
├── domain/
│   ├── auth/         # AuthController, DTOs
│   ├── user/         # User, Role, RefreshToken entities + services
│   ├── product/      # Product, ProductImage entities + services
│   ├── category/     # Category entity + service
│   ├── cart/         # Cart, CartItem entities + service
│   ├── wishlist/     # Wishlist entity + service
│   ├── order/        # Order, OrderItem entities + service
│   ├── delivery/     # Delivery entity + service
│   └── admin/        # Admin dashboard + user/order management
```

## Build & Run

```bash
# Build
mvn clean package -DskipTests

# Run (dev profile — expects MySQL on localhost:3306)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run (production profile)
java -jar target/green-basket-nepal-*.jar --spring.profiles.active=prod
```

## Key API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/register` | Public | Register |
| GET | `/api/v1/products` | Public | List/search products |
| GET | `/api/v1/categories` | Public | List categories |
| GET | `/api/v1/cart` | CUSTOMER | Get cart |
| POST | `/api/v1/orders` | CUSTOMER | Place order |
| GET | `/api/v1/admin/dashboard` | ADMIN | Dashboard stats |
| PUT | `/api/v1/admin/orders/{id}/status` | ADMIN | Update order status |
| POST | `/api/v1/admin/deliveries` | ADMIN | Assign delivery |

Full API documentation: `http://localhost:8080/swagger-ui.html`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | No | `jdbc:mysql://localhost:3306/green_basket_nepal` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | No | `root` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | No | `root` | DB password |
| `JWT_ACCESS_SECRET` | **Yes** | — | 256-bit base64 HMAC-SHA key |
| `JWT_REFRESH_SECRET` | **Yes** | — | 256-bit base64 HMAC-SHA key |

## Database

6 Flyway migrations (V1–V6) create and seed all tables. Run automatically on startup.

```bash
# Connect (Docker)
docker exec -it greenbasket-mysql mysql -u root -p green_basket_nepal
```
