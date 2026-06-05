# Green Basket Nepal — Frontend

React 18 single-page application for the Farm-to-Home marketplace.

## Tech Stack

- React 18, Vite 5
- React Router 6 (nested routes, guards)
- Axios (interceptors, token refresh queue)
- Tailwind CSS 3 (utility-first, custom theme)
- Recharts (dashboard charts)
- react-hot-toast (notifications)
- date-fns (date formatting)
- lucide-react (icons)

## Project Structure

```
src/
├── api/              # Axios instance + endpoint modules (9 files)
├── components/
│   ├── common/       # Navbar, Footer, Sidebar, Pagination, Loader
│   ├── guards/       # ProtectedRoute, RoleGuard (Admin/Farmer/Delivery)
│   └── layout/       # MainLayout, AdminLayout, DashboardLayout
├── context/          # AuthContext (user, login, logout, hasRole)
├── hooks/            # useAuth, useApi
├── pages/
│   ├── auth/         # Login, Register
│   ├── home/         # Landing page (hero, categories, products)
│   ├── products/     # List, Detail, Form (create/edit)
│   ├── cart/         # Cart + checkout
│   ├── orders/       # History, Detail
│   ├── wishlist/     # Wishlist
│   ├── admin/        # Dashboard, Users, Products, Orders, Categories, Deliveries
│   ├── deliveries/   # MyDeliveries (partner flow)
│   └── profile/      # Profile (edit, password, delete)
├── routes/           # AppRoutes (central routing config)
└── utils/            # Constants, helpers (formatCurrency, formatDate, etc.)
```

## Auth Flow

1. Login → stores `accessToken`, `refreshToken`, `user` in localStorage
2. Axios interceptor attaches `Authorization: Bearer <token>` to every request
3. On 401 → interceptor queues concurrent requests, calls `/auth/refresh`, retries
4. Refresh fails → clears auth → redirects to `/login`

## Available Scripts

```bash
# Install dependencies
npm install

# Development (hot reload at localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Role-Based Routing

| Route | Guard | Role |
|-------|-------|------|
| `/cart`, `/orders`, `/wishlist` | `ProtectedRoute` | Any authenticated |
| `/admin/*` | `AdminGuard` | ADMIN |
| `/products/new` | `FarmerGuard` | ADMIN, FARMER |
| `/deliveries` | `DeliveryGuard` | ADMIN, DELIVERY_PARTNER |

All public routes (Home, Products, Login, Register) are accessible without authentication.
