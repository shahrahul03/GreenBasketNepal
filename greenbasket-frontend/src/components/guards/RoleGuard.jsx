import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

export function RoleGuard({ roles = [] }) {
  const { hasRole, isAuthenticated, loading } = useAuth()

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" /></div>

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

// Convenience guards
export function AdminGuard() {
  return <RoleGuard roles={[ROLES.ADMIN]} />
}

export function FarmerGuard() {
  return <RoleGuard roles={[ROLES.FARMER]} />
}

export function AdminOrFarmerGuard() {
  return <RoleGuard roles={[ROLES.ADMIN, ROLES.FARMER]} />
}

export function DeliveryGuard() {
  return <RoleGuard roles={[ROLES.DELIVERY_PARTNER]} />
}
