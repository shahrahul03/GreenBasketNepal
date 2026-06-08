# Green Basket Nepal

Green Basket Nepal is a full-stack agricultural marketplace that connects local farmers directly with customers. The platform enables farmers to manage products and inventory, customers to browse and purchase fresh produce, delivery partners to manage deliveries, and administrators to oversee the entire marketplace.

## Overview

The system provides a complete farm-to-home shopping experience with secure authentication, role-based access control, product management, order processing, delivery tracking, and analytics dashboards.

## Features

### Customer

* User Registration and Login
* Google OAuth Login
* Product Search and Filtering
* Shopping Cart and Wishlist
* Secure Checkout Process
* Order Tracking and History
* Product Reviews and Ratings

### Farmer

* Farmer Registration and Approval Workflow
* Product Management (Create, Update, Delete)
* Inventory Management
* Order Monitoring
* Dashboard and Sales Overview

### Delivery Partner

* Delivery Assignment Management
* Delivery Status Updates
* Delivery Dashboard

### Administrator

* User Management
* Farmer Approval System
* Product Moderation
* Delivery Assignment
* Analytics Dashboard
* Marketplace Monitoring

## Technology Stack

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* JWT Authentication
* Google OAuth
* MySQL
* Flyway Migration

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts

## System Architecture

```text
Customer/Farmer/Admin/Delivery Partner
                │
                ▼
         React Frontend
                │
                ▼
        Spring Boot API
                │
                ▼
              MySQL
```

## Security Features

* JWT Access and Refresh Tokens
* Role-Based Access Control (RBAC)
* BCrypt Password Encryption
* Google OAuth Authentication
* Protected API Endpoints
* Account Lockout Protection

## Key Learning Outcomes

* Full-Stack Application Development
* RESTful API Design
* Authentication and Authorization
* Database Design and Management
* Role-Based Access Control
* State Management and Routing
* Secure Software Development Practices

## Project Highlights

* Multi-role marketplace platform
* Production-ready architecture
* Responsive user interface
* Secure authentication system
* Real-world business workflows
* Comprehensive order and delivery management
