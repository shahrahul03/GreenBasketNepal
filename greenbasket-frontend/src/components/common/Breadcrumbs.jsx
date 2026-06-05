import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const labelMap = {
  admin: 'Admin',
  farmer: 'Farmer',
  deliveries: 'Deliveries',
  users: 'Users',
  products: 'Products',
  orders: 'Orders',
  categories: 'Categories',
  analytics: 'Analytics',
  settings: 'Settings',
  profile: 'Profile',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 1 && segments[0] === 'admin') return null
  if (segments.length === 1 && segments[0] === 'farmer') return null
  if (segments.length === 1 && segments[0] === 'deliveries') return null

  return (
    <nav className="flex items-center gap-1.5 text-sm text-surface-500">
      <Link to="/" className="hover:text-primary-600 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const label = labelMap[seg] || seg
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-surface-300" />
            {isLast ? (
              <span className="font-medium text-surface-900 capitalize">{label}</span>
            ) : (
              <Link to={path} className="capitalize hover:text-primary-600 transition-colors text-surface-500">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
