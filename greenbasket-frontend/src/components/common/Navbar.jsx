import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Heart, User, LogOut, Menu, X, Search, MapPin, ChevronDown,
  Package, LayoutDashboard, Truck, Store, Leaf, Grid3X3, Sparkles, TrendingUp,
  Star, Apple, Milk, Wheat, Coffee, Cherry,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { ROLES } from '@/utils/constants'
import { categoryApi } from '@/api/categories'

const CATEGORY_ICONS = {
  Vegetables: '🥬',
  Fruits: '🍎',
  Dairy: '🥛',
  Organic: '🌱',
  Seasonal: '🍂',
  Beverages: '🧃',
  Herbs: '🌿',
  Grains: '🌾',
  Spices: '🌶️',
}

const CATEGORY_COLORS = {
  Vegetables: 'bg-emerald-100 text-emerald-700',
  Fruits: 'bg-red-100 text-red-700',
  Dairy: 'bg-blue-100 text-blue-700',
  Organic: 'bg-green-100 text-green-700',
  Seasonal: 'bg-orange-100 text-orange-700',
  Beverages: 'bg-purple-100 text-purple-700',
  Herbs: 'bg-lime-100 text-lime-700',
  Grains: 'bg-amber-100 text-amber-700',
  Spices: 'bg-rose-100 text-rose-700',
}

const ANNOUNCEMENTS = [
  '🥬 Free delivery on orders above Rs. 500',
  '🌱 Fresh from farm to your table',
  '🎉 New farmers joined this week',
]

const INLINE_LINKS = [
  { label: 'Vegetables', slug: 'vegetables', icon: '🥬', isSort: false },
  { label: 'Fruits', slug: 'fruits', icon: '🍎', isSort: false },
  { label: 'Organic', slug: 'organic', icon: '🌱', isSort: false },
  { label: 'Best Sellers', slug: null, icon: '⭐', isSort: true, sort: 'soldCount,desc' },
  { label: 'New Arrivals', slug: null, icon: '🆕', isSort: true, sort: 'createdAt,desc' },
]

export function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth()
  const { cartItemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [locationLabel, setLocationLabel] = useState('Kathmandu')
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const megaRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    categoryApi.getAll({ page: 0, size: 50 }).then(({ data }) => {
      setCategories(data.data?.content || data.data || [])
    }).catch(() => console.warn('[Navbar] Failed to load categories'))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setShowMegaMenu(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setShowMegaMenu(false)
    setShowProfileDropdown(false)
    setMobileCatOpen(false)
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = user?.role?.name || user?.role || ''

  const dashboardLink = hasRole(ROLES.ADMIN)
    ? '/admin'
    : hasRole(ROLES.FARMER)
      ? '/farmer'
      : hasRole(ROLES.DELIVERY_PARTNER)
        ? '/deliveries'
        : '/orders'

  const inlineCategoryNames = INLINE_LINKS.map((l) => l.label)
  const dropdownCategories = categories.filter(
    (cat) => !inlineCategoryNames.includes(cat.name)
  )

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 text-white overflow-hidden">
        <div className="page-container">
          <div className="relative h-9 flex items-center justify-center overflow-hidden">
            {ANNOUNCEMENTS.map((msg, i) => (
              <div
                key={i}
                className={`absolute whitespace-nowrap text-xs sm:text-sm font-medium tracking-wide transition-all duration-700 ${
                  i === announcementIndex
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                }`}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="border-b border-surface-100 bg-white/95 backdrop-blur-sm">
        <div className="page-container">
          <div className="flex h-16 items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 -ml-2.5 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-800 lg:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 shadow-md shadow-emerald-100 group-hover:scale-105 transition-all duration-300">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="hidden text-xl font-black tracking-tight text-surface-900 sm:inline uppercase">
                Green<span className="text-emerald-600">Basket</span>
              </span>
            </Link>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {isAuthenticated && hasRole(ROLES.CUSTOMER) && (
                <Link
                  to="/cart"
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-surface-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
                >
                  <ShoppingCart className="h-5 w-5" />
                   {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-lg ring-2 ring-white">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex h-11 items-center gap-2 rounded-2xl px-2 text-surface-600 hover:bg-surface-50 transition-all border border-transparent hover:border-surface-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`hidden h-3.5 w-3.5 sm:inline transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-64 rounded-[2rem] border border-surface-200 bg-white shadow-modal animate-scale-in z-50 overflow-hidden">
                      <div className="bg-emerald-600 p-6 text-white">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white text-lg font-black shadow-inner">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black truncate">{user?.fullName}</p>
                            <p className="text-[10px] text-emerald-100 font-bold truncate opacity-80 uppercase tracking-wider">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <Link to="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-surface-700 hover:bg-surface-50 hover:text-emerald-600 transition-all">
                          <User className="h-4 w-4 opacity-50" /> My Profile
                        </Link>
                        {hasRole(ROLES.CUSTOMER) && (
                          <>
                            <Link to="/orders" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-surface-700 hover:bg-surface-50 hover:text-emerald-600 transition-all">
                              <Package className="h-4 w-4 opacity-50" /> My Orders
                            </Link>
                            <Link to="/wishlist" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-surface-700 hover:bg-surface-50 hover:text-emerald-600 transition-all">
                              <Heart className="h-4 w-4 opacity-50" /> Wishlist
                            </Link>
                          </>
                        )}
                        <Link to={dashboardLink} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-surface-700 hover:bg-surface-50 hover:text-emerald-600 transition-all">
                          <LayoutDashboard className="h-4 w-4 opacity-50" /> Dashboard
                        </Link>
                      </div>
                      <div className="border-t border-surface-100 p-3">
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 transition-all">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Navigation ─── */}
      <div className="hidden border-b border-surface-100 bg-white lg:block">
        <div className="page-container">
          <div className="flex h-11 items-center">
            {/* All Categories Mega Menu Trigger */}
            <div className="relative" ref={megaRef}>
              <button
                onClick={() => setShowMegaMenu(!showMegaMenu)}
                onMouseEnter={() => setShowMegaMenu(true)}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  showMegaMenu
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span>All Categories</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showMegaMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* ─── Mega Menu Dropdown ─── */}
              {showMegaMenu && (
                <div
                  className="absolute left-0 top-full mt-1 w-[640px] rounded-2xl border border-surface-200 bg-white shadow-modal animate-scale-in z-50"
                  onMouseLeave={() => setShowMegaMenu(false)}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-100">
                      <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">
                        Shop by Category
                      </h3>
                      <Link
                        to="/products"
                        onClick={() => setShowMegaMenu(false)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        View All Products →
                      </Link>
                    </div>

                    {/* Dynamic categories grid */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug || cat.id}`}
                          onClick={() => setShowMegaMenu(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-surface-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        >
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${CATEGORY_COLORS[cat.name] || 'bg-surface-100 text-surface-500'} group-hover:scale-110 transition-transform`}>
                            {CATEGORY_ICONS[cat.name] || '📦'}
                          </span>
                          <span className="font-medium">{cat.name}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Quick sort links */}
                    <div className="mt-4 pt-3 border-t border-surface-100">
                      <div className="flex items-center gap-3">
                        <Link
                          to="/products?sort=soldCount,desc"
                          onClick={() => setShowMegaMenu(false)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-surface-600 hover:text-emerald-600 transition-colors"
                        >
                          <Star className="h-3.5 w-3.5" /> Best Sellers
                        </Link>
                        <span className="text-surface-200">|</span>
                        <Link
                          to="/products?sort=createdAt,desc"
                          onClick={() => setShowMegaMenu(false)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-surface-600 hover:text-emerald-600 transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" /> New Arrivals
                        </Link>
                        <span className="text-surface-200">|</span>
                        <Link
                          to="/products?isOrganic=true"
                          onClick={() => setShowMegaMenu(false)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-surface-600 hover:text-emerald-600 transition-colors"
                        >
                          <Leaf className="h-3.5 w-3.5" /> Organic
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inline featured links */}
            <div className="flex items-center gap-1 ml-6">
              {INLINE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.isSort ? `/products?sort=${link.sort}` : `/products?category=${link.slug}`}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-surface-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all whitespace-nowrap"
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Spacer + secondary link */}
            <div className="flex-1" />
            <Link
              to="/products"
              className="flex items-center gap-1 text-xs font-medium text-surface-400 hover:text-emerald-600 transition-colors"
            >
              <Package className="h-3.5 w-3.5" /> All Products
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-modal animate-slide-in-left overflow-y-auto">
            <div className="flex h-16 items-center justify-between px-4 border-b border-surface-100">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-extrabold text-surface-900">
                  Green<span className="text-emerald-600">Basket</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Mobile Location */}
              <div className="flex items-center gap-2 rounded-xl bg-surface-50 border border-surface-200 px-3.5 py-2.5 mb-4">
                <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <select
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-surface-900 focus:outline-none cursor-pointer border-none w-full"
                >
                  <option>Kathmandu</option>
                  <option>Pokhara</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                  <option>Bharatpur</option>
                  <option>Chitwan</option>
                </select>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="input-field pl-9"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <div className="flex flex-col gap-0.5">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors">
                  <Store className="h-4 w-4 text-surface-400" /> Home
                </Link>

                {/* Mobile Categories - Collapsible */}
                <div>
                  <button
                    onClick={() => setMobileCatOpen(!mobileCatOpen)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Grid3X3 className="h-4 w-4 text-surface-400" /> Categories
                    </span>
                    <ChevronDown className={`h-4 w-4 text-surface-400 transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileCatOpen && (
                    <div className="ml-4 mt-1 mb-2 space-y-0.5 border-l-2 border-emerald-100 pl-3">
                      {/* Quick sort links */}
                      <Link to="/products?sort=soldCount,desc" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-surface-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                        <Star className="h-4 w-4 text-amber-500" /> Best Sellers
                      </Link>
                      <Link to="/products?sort=createdAt,desc" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-surface-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                        <Sparkles className="h-4 w-4 text-emerald-500" /> New Arrivals
                      </Link>
                      {/* API categories */}
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.slug || cat.id}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-surface-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <span className="text-base">{CATEGORY_ICONS[cat.name] || '📦'}</span>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="divider my-2" />

                {isAuthenticated && hasRole(ROLES.CUSTOMER) && (
                  <>
                    <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors">
                      <ShoppingCart className="h-4 w-4 text-surface-400" /> Cart
                    </Link>
                    <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors">
                      <Heart className="h-4 w-4 text-surface-400" /> Wishlist
                    </Link>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors">
                      <Truck className="h-4 w-4 text-surface-400" /> My Orders
                    </Link>
                  </>
                )}
                {isAuthenticated && (
                  <>
                    <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors">
                      <LayoutDashboard className="h-4 w-4 text-surface-400" /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors">
                      <User className="h-4 w-4 text-surface-400" /> Profile
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-3 text-center !rounded-xl">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
