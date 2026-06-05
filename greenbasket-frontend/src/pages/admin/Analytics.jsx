import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Users, ShoppingCart, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency } from '@/utils/helpers'

export function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getAnalytics()
      .then(({ data }) => setData(data.data))
      .catch(() => console.warn('[Analytics] Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data) return null

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue || 0), icon: DollarSign, color: 'stat-card-green' },
    { label: 'Total Orders', value: data.totalOrders || 0, icon: ShoppingCart, color: 'stat-card-blue' },
    { label: 'Total Users', value: data.totalUsers || 0, icon: Users, color: 'stat-card-purple' },
    { label: 'Avg Order Value', value: formatCurrency(data.averageOrderValue || 0), icon: TrendingUp, color: 'stat-card-amber' },
  ]

  const monthlySales = data.monthlySales?.map((item) => ({
    month: item.month || '',
    revenue: item.revenue || 0,
    orders: item.orderCount || 0,
  })) || []

  const userGrowth = data.userGrowth?.map((item) => ({
    month: item.month || '',
    count: item.count || 0,
  })) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
          <BarChart3 className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">Platform-wide performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color} animate-scale-in`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color === 'stat-card-green' ? 'bg-emerald-100 text-emerald-600' : stat.color === 'stat-card-blue' ? 'bg-blue-100 text-blue-600' : stat.color === 'stat-card-purple' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'} shadow-sm`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="heading-xs">Monthly Revenue</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-surface-500">
                <span className="status-dot-success" />
                Revenue
              </span>
            </div>
          </div>
          {monthlySales.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-surface-400">No data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="heading-xs">User Growth</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-surface-500">
                <span className="status-dot-success" />
                Users
              </span>
            </div>
          </div>
          {userGrowth.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-surface-400">No data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
