import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, Package, ArrowUp, ArrowDown, Calendar, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { farmerApi } from '@/api/farmer'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency, formatDate } from '@/utils/helpers'

export function FarmerAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    farmerApi.getAnalytics()
      .then(({ data }) => setData(data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data) return null

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue || 0), icon: DollarSign, change: 'All time', positive: true, borderColor: 'border-l-emerald-500', bgColor: 'bg-emerald-50', iconBg: 'text-emerald-600 bg-emerald-100' },
    { label: 'This Month', value: formatCurrency(data.monthRevenue || 0), icon: TrendingUp, change: data.monthRevenue > 0 ? `${((data.monthRevenue / (data.totalRevenue || 1)) * 100).toFixed(0)}% of total` : 'No sales', positive: data.monthRevenue > 0, borderColor: 'border-l-blue-500', bgColor: 'bg-blue-50', iconBg: 'text-blue-600 bg-blue-100' },
    { label: 'Today', value: formatCurrency(data.todayRevenue || 0), icon: ShoppingBag, change: data.todayRevenue > 0 ? 'Active today' : 'No sales today', positive: data.todayRevenue > 0, borderColor: 'border-l-purple-500', bgColor: 'bg-purple-50', iconBg: 'text-purple-600 bg-purple-100' },
    { label: 'Active Products', value: data.activeProducts || 0, icon: Package, change: `${data.totalProducts || 0} total`, positive: true, borderColor: 'border-l-amber-500', bgColor: 'bg-amber-50', iconBg: 'text-amber-600 bg-amber-100' },
  ]

  const monthlyData = data.monthlySales?.map((item) => ({
    month: formatDate(item.month + '-01', 'MMM yy') || item.month,
    revenue: item.revenue || 0,
    orders: item.orderCount || 0,
  })) || []

  const topProducts = data.topProducts || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title text-lg font-semibold text-surface-900">Analytics</h2>
          <p className="page-subtitle text-sm text-surface-500 mt-1">Track your farm's performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-500">
            <Calendar className="h-4 w-4" />
            <span>This Year</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const changeIsUp = typeof stat.change === 'string' && stat.change.includes('Active')
          return (
            <div key={stat.label} className="stat-card border-l-4 relative overflow-hidden">
              <div className={`absolute inset-0 opacity-50 ${stat.bgColor}`} />
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.borderColor}`} />
              <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</p>
                  <p className="mt-2 text-xs text-surface-500">{stat.change}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} flex-shrink-0 shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-hover p-5">
          <h3 className="heading-sm text-sm font-semibold text-surface-900 mb-4">Monthly Revenue</h3>
          {monthlyData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-surface-400">No revenue data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card-hover p-5">
          <h3 className="heading-sm text-sm font-semibold text-surface-900 mb-4">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-surface-400">No sales data yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 10).map((product, i) => (
                <div key={product.productId || i} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-700 shadow-sm' : i === 1 ? 'bg-surface-200 text-surface-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-surface-100 text-surface-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{product.productName}</p>
                      <p className="text-xs text-surface-500">{product.totalSold || 0} sold</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-surface-900 flex-shrink-0 ml-2">
                    {formatCurrency(product.totalRevenue || 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
