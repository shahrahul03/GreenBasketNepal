import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings,
  Truck, Store, Leaf, ChevronLeft, Menu, ChevronDown, LogOut, User,
  Grid3X3, HelpCircle, MapPin, Sprout, Star,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

const SIDEBAR_CONFIG = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', end: true },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Farmers', icon: Sprout, path: '/admin/farmers' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Categories', icon: Grid3X3, path: '/admin/categories' },
    { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Deliveries', icon: Truck, path: '/admin/deliveries' },
    { label: 'Reviews', icon: Star, path: '/admin/reviews' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
  [ROLES.FARMER]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/farmer', end: true },
    { label: 'My Products', icon: Package, path: '/farmer/products' },
    { label: 'Orders', icon: ShoppingCart, path: '/farmer/orders' },
    { label: 'Reviews', icon: Star, path: '/farmer/reviews' },
    { label: 'Analytics', icon: BarChart3, path: '/farmer/analytics' },
  ],
  [ROLES.DELIVERY_PARTNER]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/deliveries', end: true },
    { label: 'My Deliveries', icon: Truck, path: '/deliveries' },
    { label: 'History', icon: MapPin, path: '/deliveries/history' },
  ],
}

const BOTTOM_LINKS = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Visit Store', icon: Store, path: '/' },
]

export function DashboardSidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout, hasRole } = useAuth()
  const location = useLocation()
  const sidebarRef = useRef(null)

  const role = user?.role?.name || user?.role || ''
  const navItems = SIDEBAR_CONFIG[role] || []

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-surface-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shadow-sm">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-surface-900">
          Green<span className="text-primary-600">Basket</span>
        </span>
        <span className="ml-auto rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 uppercase tracking-wider">
          {role === ROLES.ADMIN ? 'Admin' : role === ROLES.FARMER ? 'Farmer' : 'Partner'}
        </span>
      </div>

      <div className="border-b border-surface-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="avatar-initials flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-900 truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-surface-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-surface-400">Menu</p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-surface-100 p-3 space-y-1">
        {BOTTOM_LINKS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-1 flex-col border-r border-surface-200 bg-white shadow-nav">
          {sidebarContent}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside ref={sidebarRef} className="absolute left-0 inset-y-0 w-72 bg-white shadow-modal animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

export function DashboardHeader({ onToggle }) {
  const { user, hasRole } = useAuth()
  const location = useLocation()

  const pageTitle = {
    '/admin': 'Admin Dashboard',
    '/admin/users': 'Users',
    '/admin/products': 'Products',
    '/admin/categories': 'Categories',
    '/admin/orders': 'Orders',
    '/admin/deliveries': 'Deliveries',
    '/admin/reviews': 'Reviews',
    '/admin/analytics': 'Analytics',
    '/admin/settings': 'Settings',
    '/farmer': 'Farm Dashboard',
    '/farmer/products': 'My Products',
    '/farmer/orders': 'Orders',
    '/farmer/analytics': 'Analytics',
    '/deliveries': 'My Deliveries',
    '/deliveries/history': 'Delivery History',
  }[location.pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-surface-200 bg-white/95 backdrop-blur-sm shadow-header px-4 sm:px-6">
      <button
        onClick={onToggle}
        className="btn-icon flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <h1 className="page-title text-lg font-bold text-surface-900">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-3">
        <NavLink to="/" className="btn-ghost text-sm">
          <Store className="mr-1.5 h-4 w-4" /> Store
        </NavLink>
        <NavLink to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors">
          <div className="avatar-initials flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
            {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <span className="hidden sm:inline">{user?.fullName?.split(' ')[0]}</span>
        </NavLink>
      </div>
    </header>
  )
}
