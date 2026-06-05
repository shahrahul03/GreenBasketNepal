import { Routes, Route, Navigate } from 'react-router-dom'

import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { AdminGuard, FarmerGuard, AdminOrFarmerGuard, DeliveryGuard } from '@/components/guards/RoleGuard'

// Auth
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
// Home
import { Home } from '@/pages/home/Home'
// Products
import { ProductList } from '@/pages/products/ProductList'
import { ProductDetail } from '@/pages/products/ProductDetail'
import { ProductForm } from '@/pages/products/ProductForm'
// Cart / Checkout
import { Cart } from '@/pages/cart/Cart'
import { Checkout } from '@/pages/cart/Checkout'
// Orders
import { OrderHistory } from '@/pages/orders/OrderHistory'
import { OrderDetail } from '@/pages/orders/OrderDetail'
import { OrderSuccess } from '@/pages/orders/OrderSuccess'
// Wishlist
import { Wishlist } from '@/pages/wishlist/Wishlist'
// Profile
import { Profile } from '@/pages/profile/Profile'
// Farmer
import { FarmerDashboard } from '@/pages/farmer/FarmerDashboard'
import { FarmerProducts } from '@/pages/farmer/FarmerProducts'
import { FarmerOrders } from '@/pages/farmer/FarmerOrders'
import { FarmerAnalytics } from '@/pages/farmer/FarmerAnalytics'
import { FarmerReviews } from '@/pages/farmer/FarmerReviews'
// Admin
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminUsers } from '@/pages/admin/Users'
import { AdminFarmers } from '@/pages/admin/Farmers'
import { FarmerDetail } from '@/pages/admin/FarmerDetail'
import { AdminProducts } from '@/pages/admin/Products'
import { AdminOrders } from '@/pages/admin/Orders'
import { AdminReviews } from '@/pages/admin/AdminReviews'
import { AdminCategories } from '@/pages/admin/Categories'
import { AdminDeliveries } from '@/pages/admin/Deliveries'
import { UserDetail } from '@/pages/admin/UserDetail'
import { Analytics } from '@/pages/admin/Analytics'
import { Settings } from '@/pages/admin/Settings'
// Delivery Partner
import { MyDeliveries } from '@/pages/deliveries/MyDeliveries'
// 404
import { NotFound } from '@/pages/errors/NotFound'

export function AppRoutes() {
  return (
    <Routes>
      {/* ════════════════════════════════════════════
          PUBLIC ROUTES (MainLayout)
          ════════════════════════════════════════════ */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />

        {/* — Authenticated-only routes under MainLayout — */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/success/:id" element={<OrderSuccess />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<Profile />} />

          {/* Farmer/Admin — product forms (also accessible from sidebar) */}
          <Route element={<AdminOrFarmerGuard />}>
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:slug/edit" element={<ProductForm />} />
          </Route>
        </Route>
      </Route>

      {/* ════════════════════════════════════════════
          FARMER DASHBOARD ROUTES (DashboardLayout + Sidebar)
          ════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<FarmerGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/products" element={<FarmerProducts />} />
            <Route path="/farmer/products/new" element={<ProductForm />} />
            <Route path="/farmer/products/:slug/edit" element={<ProductForm />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
            <Route path="/farmer/analytics" element={<FarmerAnalytics />} />
            <Route path="/farmer/reviews" element={<FarmerReviews />} />
          </Route>
        </Route>
      </Route>

      {/* ════════════════════════════════════════════
          ADMIN DASHBOARD ROUTES (DashboardLayout + Sidebar)
          ════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/farmers" element={<AdminFarmers />} />
            <Route path="/admin/farmers/:id" element={<FarmerDetail />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/deliveries" element={<AdminDeliveries />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      {/* ════════════════════════════════════════════
          DELIVERY PARTNER ROUTES (DashboardLayout + Sidebar)
          ════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DeliveryGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/deliveries" element={<MyDeliveries />} />
            <Route path="/deliveries/history" element={<MyDeliveries />} />
            <Route path="/deliveries/:id" element={<OrderDetail />} />
          </Route>
        </Route>
      </Route>

      {/* ════════════════════════════════════════════
           404 — catch-all
           ════════════════════════════════════════════ */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
