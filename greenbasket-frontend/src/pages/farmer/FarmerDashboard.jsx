import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingCart, TrendingUp, DollarSign, AlertTriangle, Plus,
  Eye, ArrowUp, ChevronRight, BarChart3, Sprout,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { farmerApi } from '@/api/farmer'
import { StatCardSkeleton } from '@/components/common/Skeleton'
import { formatCurrency } from '@/utils/helpers'
import { STATUS_COLORS } from '@/utils/constants'

const QUICK_ACTIONS = [
  { label: 'New Product', icon: Plus, path: '/farmer/products/new', color: 'bg-primary-100 text-primary-600', hoverBorder: 'hover:border-primary-300 hover:bg-primary-50' },
  { label: 'Products', icon: Package, path: '/farmer/products', color: 'bg-blue-100 text-blue-600', hoverBorder: 'hover:border-blue-300 hover:bg-blue-50' },
  { label: 'Orders', icon: ShoppingCart, path: '/farmer/orders', color: 'bg-amber-100 text-amber-600', hoverBorder: 'hover:border-amber-300 hover:bg-amber-50' },
  { label: 'Analytics', icon: BarChart3, path: '/farmer/analytics', color: 'bg-purple-100 text-purple-600', hoverBorder: 'hover:border-purple-300 hover:bg-purple-50' },
]

function StatCard({ label, value, icon: Icon, change, positive, borderColor, bgColor, iconBg }) {
  const changeIsUp = typeof change === 'string' && change.startsWith('+')
  return (
    <div className={`card-hover relative overflow-hidden border-l-4 ${borderColor} ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1.5">
              {changeIsUp ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <ArrowUp className="h-3 w-3" />
                  {change}
                </span>
              ) : positive ? (
                <span className="text-xs text-surface-500">{change}</span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {change}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} flex-shrink-0 shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

function RecentOrdersCard({ orders }) {
  if (!orders?.length) return null
  return (
    <div className="card-hover p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-surface-400" />
          Recent Orders
        </h3>
        <Link to="/farmer/orders" className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors">
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="flex items-center justify-between rounded-lg border border-surface-100 bg-surface-50/50 p-3 hover:bg-surface-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 flex-shrink-0">
                <Package className="h-4 w-4 text-surface-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">{order.orderNumber || `#${order.id}`}</p>
                <p className="text-xs text-surface-500 truncate">{order.customerName || 'Customer'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-semibold text-surface-900">{formatCurrency(order.total || 0)}</span>
              {order.status && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[order.status] || 'bg-surface-100 text-surface-600'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StockAlertsCard({ lowStock, outOfStock }) {
  const totalAlerts = (lowStock?.length || 0) + (outOfStock || 0)
  return (
    <div className="card-hover p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-surface-400" />
          Stock Alerts
        </h3>
        {totalAlerts > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
            {totalAlerts}
          </span>
        )}
      </div>
      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Package className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="mt-3 text-sm font-medium text-surface-900">All stocked up!</p>
          <p className="text-xs text-surface-500 mt-1">No low stock alerts right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {outOfStock > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-800">Out of Stock</p>
                  <p className="text-xs text-red-600">{outOfStock} products</p>
                </div>
              </div>
              <Link to="/farmer/products" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          )}
          {lowStock?.slice(0, 5).map((product) => (
            <div key={product.id} className="rounded-lg bg-amber-50 p-3 border border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 flex-shrink-0">
                    <Package className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-800 truncate">{product.name}</p>
                    <p className="text-xs text-amber-600">Stock: {product.stock ?? product.availableStock}</p>
                  </div>
                </div>
                <Link to="/farmer/products" className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors flex-shrink-0">
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
              {(product.stock ?? product.availableStock) > 0 && (
                <div className="mt-2 w-full bg-amber-200/50 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(((product.stock ?? product.availableStock) / 10) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuickActionsCard() {
  return (
    <div className="card-hover p-5">
      <h3 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
        <Sprout className="h-4 w-4 text-surface-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`flex flex-col items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 p-4 transition-all ${action.hoverBorder} hover:shadow-sm`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-surface-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function TopProductsCard({ products }) {
  if (!products?.length) return null
  return (
    <div className="card-hover p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-surface-400" />
          Top Products
        </h3>
      </div>
      <div className="space-y-3">
        {products.slice(0, 4).map((product, idx) => (
          <div key={product.id} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-100 text-xs font-bold text-surface-500 flex-shrink-0">
              {idx + 1}
            </span>
            <div className="h-9 w-9 rounded-lg bg-surface-100 overflow-hidden flex-shrink-0">
              <img
                src={product.imageUrl || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-surface-900 truncate">{product.name}</p>
              <p className="text-xs text-surface-500">{product.soldCount || 0} sold</p>
            </div>
            <span className="text-sm font-semibold text-surface-900">{formatCurrency(product.price || 0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FarmerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    farmerApi.getDashboard()
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card-hover p-5">
              <div className="skeleton animate-shimmer h-5 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton animate-shimmer h-14 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="card-hover p-5">
            <div className="skeleton animate-shimmer h-5 w-28 mb-4" />
            <div className="skeleton animate-shimmer h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, change: '+12%', positive: true, borderColor: 'border-l-emerald-500', bgColor: 'bg-emerald-50', iconBg: 'text-emerald-600 bg-emerald-100' },
    { label: "Today's Revenue", value: formatCurrency(data?.todayRevenue || 0), icon: TrendingUp, change: data?.todayRevenue > 0 ? 'Active' : 'No sales', positive: data?.todayRevenue > 0, borderColor: 'border-l-blue-500', bgColor: 'bg-blue-50', iconBg: 'text-blue-600 bg-blue-100' },
    { label: 'Active Products', value: data?.activeProducts || 0, icon: Package, change: `${data?.inactiveProducts || 0} inactive`, positive: true, borderColor: 'border-l-purple-500', bgColor: 'bg-purple-50', iconBg: 'text-purple-600 bg-purple-100' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingCart, change: `${data?.pendingOrders || 0} pending`, positive: data?.pendingOrders === 0, borderColor: 'border-l-amber-500', bgColor: 'bg-amber-50', iconBg: 'text-amber-600 bg-amber-100' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-surface-900">Farm Overview</h2>
          <p className="text-sm text-surface-500 mt-1">Here's what's happening with your farm today.</p>
        </div>
        <Link to="/farmer/products/new" className="btn-primary inline-flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <QuickActionsCard />

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentOrdersCard orders={data?.recentOrders} />
        <div className="space-y-6">
          <StockAlertsCard
            lowStock={data?.lowStockProducts}
            outOfStock={data?.outOfStockProducts}
          />
          <TopProductsCard products={data?.topProducts || data?.bestSellingProducts} />
        </div>
      </div>
    </div>
  )
}
