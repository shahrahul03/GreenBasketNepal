import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle,
  ArrowUp, ArrowDown, Store, Truck, UserCheck, Clock, BarChart3,
  UserPlus, Sprout, Settings, ChevronRight, Search, RefreshCw,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import { formatCurrency, formatDate } from '@/utils/helpers'

// ─── Reusable Sub-Components ───────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, trend, trendLabel, color, loading }) {
  const colorMap = {
    emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-50', iconBg: 'text-emerald-600 bg-emerald-100', dot: 'bg-emerald-500' },
    blue:    { border: 'border-l-blue-500',    bg: 'bg-blue-50',    iconBg: 'text-blue-600 bg-blue-100',       dot: 'bg-blue-500' },
    purple:  { border: 'border-l-purple-500',  bg: 'bg-purple-50',  iconBg: 'text-purple-600 bg-purple-100',   dot: 'bg-purple-500' },
    amber:   { border: 'border-l-amber-500',   bg: 'bg-amber-50',   iconBg: 'text-amber-600 bg-amber-100',     dot: 'bg-amber-500' },
    rose:    { border: 'border-l-rose-500',    bg: 'bg-rose-50',    iconBg: 'text-rose-600 bg-rose-100',       dot: 'bg-rose-500' },
    cyan:    { border: 'border-l-cyan-500',    bg: 'bg-cyan-50',    iconBg: 'text-cyan-600 bg-cyan-100',       dot: 'bg-cyan-500' },
    indigo:  { border: 'border-l-indigo-500',  bg: 'bg-indigo-50',  iconBg: 'text-indigo-600 bg-indigo-100',   dot: 'bg-indigo-500' },
    orange:  { border: 'border-l-orange-500',  bg: 'bg-orange-50',  iconBg: 'text-orange-600 bg-orange-100',   dot: 'bg-orange-500' },
  }
  const c = colorMap[color] || colorMap.emerald

  if (loading) {
    return (
      <div className="card-hover p-5 border-l-4 overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="skeleton animate-shimmer h-4 w-24" />
            <div className="skeleton animate-shimmer h-8 w-20" />
            <div className="skeleton animate-shimmer h-3 w-16" />
          </div>
          <div className="skeleton animate-shimmer h-12 w-12 rounded-xl shrink-0" />
        </div>
      </div>
    )
  }

  const trendUp = trend > 0
  const trendDown = trend < 0

  return (
    <div className={`card-hover p-5 border-l-4 ${c.border} ${c.bg} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1 truncate">{value}</p>
          {trendLabel && (
            <div className="mt-2 flex items-center gap-1.5">
              {trendUp && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <ArrowUp className="h-3 w-3" /> {trendLabel}
                </span>
              )}
              {trendDown && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  <ArrowDown className="h-3 w-3" /> {trendLabel}
                </span>
              )}
              {!trendUp && !trendDown && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg} flex-shrink-0 shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, icon: Icon, children, action, accent = 'emerald' }) {
  const dotMap = { emerald: 'status-dot-success', blue: 'status-dot-info', purple: 'status-dot', amber: 'status-dot-warning' }
  const badgeMap = { emerald: 'bg-emerald-100 text-emerald-700', blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700', amber: 'bg-amber-100 text-amber-700' }
  return (
    <div className="card-hover p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${badgeMap[accent]}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
            {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider ${badgeMap[accent]}`}>
            <span className={dotMap[accent]} /> {action}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function ManagementCard({ label, icon: Icon, path, description, color, stats }) {
  const colorMap = {
    emerald: { icon: 'text-emerald-600 bg-emerald-100', hover: 'group-hover:bg-emerald-50' },
    blue:    { icon: 'text-blue-600 bg-blue-100',       hover: 'group-hover:bg-blue-50' },
    purple:  { icon: 'text-purple-600 bg-purple-100',   hover: 'group-hover:bg-purple-50' },
    amber:   { icon: 'text-amber-600 bg-amber-100',     hover: 'group-hover:bg-amber-50' },
    rose:    { icon: 'text-rose-600 bg-rose-100',       hover: 'group-hover:bg-rose-50' },
    cyan:    { icon: 'text-cyan-600 bg-cyan-100',       hover: 'group-hover:bg-cyan-50' },
  }
  const c = colorMap[color] || colorMap.emerald
  return (
    <Link to={path} className={`card-hover p-5 group transition-all ${c.hover}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.icon} shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">{label}</h3>
            <ChevronRight className="h-4 w-4 text-surface-300 group-hover:text-primary-500 transition-colors shrink-0" />
          </div>
          <p className="text-xs text-surface-500 mt-0.5">{description}</p>
          {stats && (
            <div className="flex items-center gap-3 mt-2">
              {stats.map((s, i) => (
                <span key={i} className="text-xs text-surface-600"><strong className="text-surface-900">{s.count}</strong> {s.label}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function AlertCard({ icon: Icon, label, count, path, color = 'amber' }) {
  const colorMap = {
    amber: { bg: 'bg-amber-50 border-amber-100', iconBg: 'bg-amber-100 text-amber-600', text: 'text-amber-800', subtext: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    red:   { bg: 'bg-red-50 border-red-100',     iconBg: 'bg-red-100 text-red-600',     text: 'text-red-800',  subtext: 'text-red-600',  badge: 'bg-red-100 text-red-700' },
    blue:  { bg: 'bg-blue-50 border-blue-100',   iconBg: 'bg-blue-100 text-blue-600',   text: 'text-blue-800', subtext: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  }
  const c = colorMap[color] || colorMap.amber
  return (
    <Link to={path} className={`flex items-center justify-between rounded-lg border ${c.bg} p-3 hover:shadow-sm transition-all`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.iconBg} shrink-0`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${c.text} truncate`}>{label}</p>
          <p className={`text-xs ${c.subtext}`}>{count} {count === 1 ? 'item' : 'items'} need attention</p>
        </div>
      </div>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${c.badge} shrink-0 ml-2`}>{count}</span>
    </Link>
  )
}

function ActivityItem({ icon: Icon, color, title, subtitle, timestamp }) {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    rose: 'bg-rose-100 text-rose-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  }
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[color]} shrink-0 mt-0.5`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-surface-900">{title}</p>
        {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
      </div>
      {timestamp && <span className="text-xs text-surface-400 shrink-0 whitespace-nowrap">{timestamp}</span>}
    </div>
  )
}

function SimpleStat({ label, value, color = 'text-surface-900' }) {
  return (
    <div className="flex items-baseline justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-xs text-surface-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-dropdown p-3 text-xs">
      <p className="font-semibold text-surface-900 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-surface-600">{entry.name}:</span>
          <span className="font-semibold text-surface-900">{formatter ? formatter(entry.value) : entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Admin Dashboard Skeleton ──────────────────────────────────────────────

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="skeleton animate-shimmer h-8 w-56" />
          <div className="skeleton animate-shimmer h-4 w-72" />
        </div>
        <div className="skeleton animate-shimmer h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card-hover p-5 border-l-4 border-l-surface-300">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="skeleton animate-shimmer h-4 w-24" />
                <div className="skeleton animate-shimmer h-8 w-20" />
                <div className="skeleton animate-shimmer h-3 w-16" />
              </div>
              <div className="skeleton animate-shimmer h-12 w-12 rounded-xl shrink-0" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-hover p-5">
          <div className="skeleton animate-shimmer h-5 w-40 mb-5" />
          <div className="skeleton animate-shimmer h-64 w-full rounded-xl" />
        </div>
        <div className="card-hover p-5">
          <div className="skeleton animate-shimmer h-5 w-40 mb-5" />
          <div className="skeleton animate-shimmer h-64 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card-hover p-5">
          <div className="skeleton animate-shimmer h-5 w-36 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton animate-shimmer h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton animate-shimmer h-4 w-48" />
                  <div className="skeleton animate-shimmer h-3 w-32" />
                </div>
                <div className="skeleton animate-shimmer h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-hover p-5">
          <div className="skeleton animate-shimmer h-5 w-32 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton animate-shimmer h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-hover p-5">
            <div className="flex items-start gap-4">
              <div className="skeleton animate-shimmer h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="skeleton animate-shimmer h-4 w-32" />
                <div className="skeleton animate-shimmer h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats()
      .then(({ data: res }) => setData(res.data))
      .catch(() => console.warn('[AdminDashboard] Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminDashboardSkeleton />

  const overview = data?.overview || {}
  const revenue = data?.revenue || {}
  const productStats = data?.productStats || {}
  const recentOrders = data?.recentOrders || []
  const topProducts = data?.topSellingProducts || []
  const monthlySales = (data?.monthlySales || []).map((item) => ({
    month: item.month || '',
    revenue: item.revenue || 0,
    orders: item.orderCount || 0,
  }))
  const userGrowth = (data?.userGrowth || []).map((item) => ({
    month: item.month || '',
    count: item.count || 0,
  }))

  const pendingApprovals = (overview.pendingFarmers || 0) + (overview.pendingDeliveries || 0)
  const totalUsers = overview.totalUsers || 0
  const totalCustomers = overview.totalCustomers ?? totalUsers - (overview.totalFarmers || 0) - (overview.totalDeliveryPartners || 0)
  const totalFarmers = overview.totalFarmers || 0
  const totalDeliveryPartners = overview.totalDeliveryPartners || 0
  const totalProducts = overview.totalProducts || 0
  const totalOrders = overview.totalOrders || 0
  const totalRevenue = revenue.totalRevenue || 0
  const thisMonthRevenue = revenue.thisMonthRevenue || 0
  const activeProducts = productStats.activeProducts || 0
  const lowStockProducts = productStats.lowStockProducts || 0
  const outOfStockProducts = productStats.outOfStockProducts || 0

  const kpiRow1 = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, trend: totalUsers > 0 ? 12 : 0, trendLabel: `${totalFarmers} farmers`, color: 'blue' },
    { label: 'Customers', value: totalCustomers.toLocaleString(), icon: UserCheck, trend: totalCustomers > 0 ? 8 : 0, trendLabel: 'Active buyers', color: 'emerald' },
    { label: 'Farmers', value: totalFarmers.toLocaleString(), icon: Sprout, trend: totalFarmers > 0 ? 5 : 0, trendLabel: 'Registered', color: 'amber' },
    { label: 'Delivery Partners', value: totalDeliveryPartners.toLocaleString(), icon: Truck, trend: 0, trendLabel: totalDeliveryPartners > 0 ? 'Active' : 'No partners', color: 'purple' },
  ]

  const kpiRow2 = [
    { label: 'Total Products', value: totalProducts.toLocaleString(), icon: Package, trend: totalProducts > 0 ? activeProducts : 0, trendLabel: `${activeProducts} active`, color: 'cyan' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingCart, trend: 0, trendLabel: `${overview.pendingOrders || 0} pending`, color: 'indigo' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, trend: thisMonthRevenue > 0 ? 15 : 0, trendLabel: `${formatCurrency(thisMonthRevenue)} this month`, color: 'emerald' },
    { label: 'Pending Approvals', value: pendingApprovals.toLocaleString(), icon: Clock, trend: pendingApprovals > 0 ? pendingApprovals : 0, trendLabel: pendingApprovals > 0 ? 'Requires review' : 'All clear', color: 'rose' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">
            <span className="text-gradient">Admin Dashboard</span>
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            Your marketplace command center ·{' '}
            <span className="text-surface-400">{formatDate(new Date().toISOString(), 'EEEE, MMMM do, yyyy')}</span>
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); dashboardApi.getStats().then(({ data: res }) => setData(res.data)).catch(() => {}).finally(() => setLoading(false)) }}
          className="btn-secondary btn-sm inline-flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── KPI Cards — Row 1: User Metrics ────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-surface-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">People</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiRow1.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} loading={false} />
          ))}
        </div>
      </div>

      {/* ── KPI Cards — Row 2: Business Metrics ────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-surface-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">Business</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiRow2.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} loading={false} />
          ))}
        </div>
      </div>

      {/* ── Charts Section ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Monthly Revenue"
          subtitle="Platform revenue over time"
          icon={DollarSign}
          action={monthlySales.length > 0 ? `${monthlySales.length} months` : null}
          accent="emerald"
        >
          {monthlySales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-surface-400">
              <DollarSign className="h-10 w-10 mb-2 text-surface-300" />
              <p className="text-sm font-medium">No revenue data yet</p>
              <p className="text-xs mt-1">Sales data will appear once orders are placed</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="User Growth"
          subtitle="New user registrations"
          icon={TrendingUp}
          action={userGrowth.length > 0 ? `${userGrowth.length} months` : null}
          accent="blue"
        >
          {userGrowth.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-surface-400">
              <TrendingUp className="h-10 w-10 mb-2 text-surface-300" />
              <p className="text-sm font-medium">No user data yet</p>
              <p className="text-xs mt-1">User registrations will appear here</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#3b82f6', strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#userGrowthGradient)" dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Activity Feed & Alerts ─────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card-hover p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100">
                <Clock className="h-4 w-4 text-surface-500" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900">Recent Activity</h3>
            </div>
          </div>
          <div className="divide-y divide-surface-100">
            {overview.newUsersToday > 0 && (
              <ActivityItem icon={UserPlus} color="emerald" title="New Users" subtitle={`${overview.newUsersToday} user${overview.newUsersToday !== 1 ? 's' : ''} registered today`} />
            )}
            {overview.newFarmersToday > 0 && (
              <ActivityItem icon={Sprout} color="amber" title="New Farmers" subtitle={`${overview.newFarmersToday} farmer${overview.newFarmersToday !== 1 ? 's' : ''} joined today`} />
            )}
            {overview.newOrdersToday > 0 && (
              <ActivityItem icon={ShoppingCart} color="purple" title="New Orders" subtitle={`${overview.newOrdersToday} order${overview.newOrdersToday !== 1 ? 's' : ''} placed today`} />
            )}
            {overview.recentDeliveries > 0 && (
              <ActivityItem icon={Truck} color="blue" title="Recent Deliveries" subtitle={`${overview.recentDeliveries} deliver${overview.recentDeliveries !== 1 ? 'ies' : 'y'} completed`} />
            )}
            {overview.newUsersToday === 0 && overview.newFarmersToday === 0 && overview.newOrdersToday === 0 && overview.recentDeliveries === 0 && (
              <div className="flex flex-col items-center py-10 text-surface-400">
                <Clock className="h-10 w-10 mb-2 text-surface-300" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here as things happen</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-hover p-5 animate-slide-up">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-surface-900">Alerts</h3>
          </div>
          <div className="space-y-3">
            {(overview.pendingFarmers || 0) > 0 && (
              <AlertCard icon={UserCheck} label="Pending Farmer Approvals" count={overview.pendingFarmers} path="/admin/farmers" color="amber" />
            )}
            {(overview.pendingDeliveries || 0) > 0 && (
              <AlertCard icon={Truck} label="Pending Deliveries" count={overview.pendingDeliveries} path="/admin/deliveries" color="blue" />
            )}
            {lowStockProducts > 0 && (
              <AlertCard icon={Package} label="Low Stock Products" count={lowStockProducts} path="/admin/products" color="amber" />
            )}
            {outOfStockProducts > 0 && (
              <AlertCard icon={AlertTriangle} label="Out of Stock Products" count={outOfStockProducts} path="/admin/products" color="red" />
            )}
            {(overview.pendingFarmers || 0) === 0 && (overview.pendingDeliveries || 0) === 0 && lowStockProducts === 0 && outOfStockProducts === 0 && (
              <div className="flex flex-col items-center py-8 text-surface-400">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
                  <Package className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-surface-700">All clear!</p>
                <p className="text-xs mt-1 text-center">No pending approvals or stock issues</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Management Cards ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-surface-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">Quick Management</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ManagementCard label="Manage Users" icon={Users} path="/admin/users" description="View, edit, and manage all platform users" color="blue" stats={[{ count: totalUsers, label: 'total' }]} />
          <ManagementCard label="Manage Farmers" icon={Sprout} path="/admin/farmers" description="Approve and manage farmer accounts" color="amber" stats={[{ count: totalFarmers, label: 'farmers' }, { count: overview.pendingFarmers || 0, label: 'pending' }]} />
          <ManagementCard label="Manage Products" icon={Package} path="/admin/products" description="Oversee product listings and inventory" color="emerald" stats={[{ count: totalProducts, label: 'products' }, { count: activeProducts, label: 'active' }]} />
          <ManagementCard label="Manage Orders" icon={ShoppingCart} path="/admin/orders" description="Track and manage customer orders" color="purple" stats={[{ count: totalOrders, label: 'orders' }, { count: overview.pendingOrders || 0, label: 'pending' }]} />
          <ManagementCard label="Manage Deliveries" icon={Truck} path="/admin/deliveries" description="Assign and monitor deliveries" color="cyan" stats={[{ count: overview.totalDeliveries || 0, label: 'total' }, { count: overview.pendingDeliveries || 0, label: 'pending' }]} />
          <ManagementCard label="Analytics" icon={BarChart3} path="/admin/analytics" description="Deep dive into platform performance" color="rose" stats={[{ count: monthlySales.length, label: 'months data' }]} />
        </div>
      </div>
    </div>
  )
}
