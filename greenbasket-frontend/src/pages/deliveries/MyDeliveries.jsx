import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck, MapPin, Phone, Package, CheckCircle2, Clock, Navigation,
  ChevronRight, Search, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { deliveryApi } from '@/api/deliveries'
import { formatDateTime } from '@/utils/helpers'
import { useAuth } from '@/hooks/useAuth'

// ─── Constants ─────────────────────────────────────────────────────────────

const TRANSITIONS = {
  ASSIGNED: ['PICKED_UP'],
  PICKED_UP: ['ON_THE_WAY'],
  ON_THE_WAY: ['DELIVERED'],
}

const STATUS_FLOW = ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED']

const STATUS_META = {
  ASSIGNED:  { label: 'Assigned',    icon: Package,     color: 'text-amber-600',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500',  stepInactive: 'bg-surface-200 text-surface-400' },
  PICKED_UP: { label: 'Picked Up',   icon: Package,     color: 'text-blue-600',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',   stepInactive: 'bg-surface-200 text-surface-400' },
  ON_THE_WAY:{ label: 'On the Way',  icon: Navigation,  color: 'text-violet-600', bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', stepInactive: 'bg-surface-200 text-surface-400' },
  DELIVERED: { label: 'Delivered',   icon: CheckCircle2,color: 'text-emerald-600',bg: 'bg-emerald-50',badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500',stepInactive: 'bg-surface-200 text-surface-400' },
}

const FILTER_TABS = [
  { key: '',       label: 'All' },
  { key: 'ASSIGNED', label: 'Assigned', icon: Clock },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Package },
  { key: 'ON_THE_WAY', label: 'On the Way', icon: Navigation },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
]

// ─── Progress Stepper ─────────────────────────────────────────────────────

function ProgressStepper({ currentStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus)

  return (
    <div className="flex items-center w-full py-2">
      {STATUS_FLOW.map((s, i) => {
        const completed = i <= currentIdx
        const isCurrent = i === currentIdx
        const meta = STATUS_META[s]
        return (
          <div key={s} className={`flex items-center ${i < STATUS_FLOW.length - 1 ? 'flex-1' : ''}`}>
            <div className={`flex flex-col items-center`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                completed && currentIdx === STATUS_FLOW.length - 1
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : completed
                    ? 'bg-primary-500 text-white shadow-sm'
                    : isCurrent
                      ? 'bg-primary-500 text-white ring-2 ring-primary-200 shadow-sm'
                      : 'bg-surface-100 text-surface-400'
              }`}>
                {completed && currentIdx === STATUS_FLOW.length - 1 ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[9px] font-medium mt-1 leading-tight text-center ${
                completed ? 'text-surface-700' : 'text-surface-400'
              }`}>
                {meta.label}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-1.25rem] rounded-full transition-colors duration-300 ${
                i < currentIdx ? 'bg-primary-500' : 'bg-surface-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Delivery Card ─────────────────────────────────────────────────────────

function DeliveryCard({ delivery, onAccept, onStatusUpdate, updatingId, onViewAddress }) {
  const order = delivery?.order || {}
  const status = delivery?.status || 'ASSIGNED'
  const meta = STATUS_META[status] || STATUS_META.ASSIGNED
  const isUpdating = updatingId === delivery?.id
  const isAssigned = status === 'ASSIGNED'
  const transitions = TRANSITIONS[status] || []

  const nextAction = transitions[0]

  const actionConfig = {
    ASSIGNED:   { label: 'Accept Delivery',   icon: CheckCircle2, color: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-200' },
    PICKED_UP:  { label: 'Mark as On the Way', icon: Navigation,   color: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg shadow-blue-200' },
    ON_THE_WAY: { label: 'Mark as Delivered',  icon: CheckCircle2, color: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-200' },
  }

  const action = actionConfig[nextAction] || null

  const handleAction = () => {
    if (isAssigned) {
      onAccept(delivery?.id)
    } else if (nextAction) {
      onStatusUpdate(delivery?.id, nextAction)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      {/* Top bar: status + order number */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${meta.bg} border-surface-100`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-semibold ${meta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          <span className="font-mono text-2xs text-surface-500 bg-white/60 px-2 py-0.5 rounded-md font-medium truncate">
            {order?.orderNumber || `#${delivery?.id}`}
          </span>
        </div>
        <span className="text-2xs text-surface-400 shrink-0">
          {delivery?.createdAt ? formatDateTime(delivery.createdAt) : ''}
        </span>
      </div>

      {/* Customer info */}
      <div className="p-4 space-y-3">
        {order?.customerName && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold text-sm shrink-0">
              {order.customerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-surface-900 truncate">{order.customerName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                <span className="text-2xs text-surface-500 font-medium capitalize">{status.replace(/_/g, ' ').toLowerCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Phone + Address row */}
        <div className="space-y-2">
          {order?.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 border border-surface-100 hover:bg-primary-50 hover:border-primary-200 active:bg-primary-100 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-surface-400 font-medium">Phone</p>
                <p className="text-sm font-semibold text-surface-900">{order.customerPhone}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-surface-300 shrink-0" />
            </a>
          )}
          {order?.deliveryAddress && (
            <button
              onClick={() => onViewAddress?.(order.deliveryAddress)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 border border-surface-100 hover:bg-primary-50 hover:border-primary-200 active:bg-primary-100 transition-all w-full text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-surface-400 font-medium">Delivery Address</p>
                <p className="text-sm font-medium text-surface-700 line-clamp-2 leading-snug">{order.deliveryAddress}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-surface-300 shrink-0" />
            </button>
          )}
        </div>

        {/* Order total */}
        {order?.total > 0 && (
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-surface-500 font-medium">Order Value</span>
            <span className="text-base font-bold text-surface-900">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', minimumFractionDigits: 2 }).format(order.total)}
            </span>
          </div>
        )}

        {/* Progress stepper */}
        {status !== 'DELIVERED' && (
          <div className="bg-surface-50 rounded-xl p-3">
            <ProgressStepper currentStatus={status} />
          </div>
        )}

        {/* Action buttons */}
        {status !== 'DELIVERED' && (
          <div className="space-y-2 pt-1">
            {action && (
              <button
                onClick={handleAction}
                disabled={isUpdating}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] ${action.color}`}
              >
                {isUpdating ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <action.icon className="h-5 w-5" />
                )}
                {isUpdating ? 'Updating...' : action.label}
              </button>
            )}
            {status === 'ON_THE_WAY' && (
              <Link
                to={`/orders/${order?.id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-surface-300 px-5 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50 active:bg-surface-100 transition-all min-h-[48px]"
              >
                <Package className="h-5 w-5" /> View Order Details
              </Link>
            )}
          </div>
        )}

        {/* Completed badge */}
        {status === 'DELIVERED' && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Delivered Successfully</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function DeliverySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-surface-100 skeleton animate-shimmer" />
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="skeleton animate-shimmer h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton animate-shimmer h-4 w-40" />
                <div className="skeleton animate-shimmer h-3 w-24" />
              </div>
            </div>
            <div className="skeleton animate-shimmer h-14 w-full rounded-xl" />
            <div className="skeleton animate-shimmer h-14 w-full rounded-xl" />
            <div className="skeleton animate-shimmer h-12 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function MyDeliveries() {
  const { user } = useAuth()
  const [data, setData] = useState({ content: [], totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(null)
  const tabsRef = useRef(null)
  const [refreshing, setRefreshing] = useState(false)

  const normalizeResponse = (raw) => {
    if (Array.isArray(raw)) return { content: raw, totalElements: raw.length, totalPages: 1, pageNumber: 0 }
    if (raw?.content) return raw
    return { content: [], totalElements: 0, totalPages: 0, pageNumber: 0 }
  }

  const fetchDeliveries = (showLoader = true) => {
    if (showLoader) setLoading(true)
    const params = { page: 0, size: 50, sort: 'createdAt,desc' }
    if (filterTab) params.status = filterTab
    deliveryApi.getMyDeliveries(params)
      .then(({ data: res }) => setData(normalizeResponse(res.data || res)))
      .catch(() => toast.error('Failed to load deliveries'))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => {
    fetchDeliveries()
  }, [filterTab])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDeliveries(false)
  }

  const handleAccept = async (id) => {
    try {
      await deliveryApi.acceptDelivery(id)
      toast.success('Delivery accepted!')
      fetchDeliveries(false)
    } catch (err) {
      toast.error(err.message || 'Failed to accept')
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      await deliveryApi.updateStatus(id, { status: newStatus })
      toast.success(`Status updated to ${STATUS_META[newStatus]?.label || newStatus}`)
      setData((prev) => ({
        ...prev,
        content: (prev.content || []).map((d) => d.id === id ? { ...d, status: newStatus } : d),
      }))
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const items = Array.isArray(data?.content) ? data.content : []

  const stats = {
    assigned: items.filter((d) => d.status === 'ASSIGNED').length,
    pickedUp: items.filter((d) => d.status === 'PICKED_UP').length,
    onTheWay: items.filter((d) => d.status === 'ON_THE_WAY').length,
    delivered: items.filter((d) => d.status === 'DELIVERED').length,
    inProgress: items.filter((d) => d.status === 'PICKED_UP' || d.status === 'ON_THE_WAY').length,
    pendingPickups: items.filter((d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP').length,
  }

  const completedToday = items.filter(
    (d) => d.status === 'DELIVERED'
  ).length

  const showNoDeliveries = !loading && items.length === 0 && !filterTab
  const showFilteredEmpty = !loading && items.length === 0 && filterTab
  const allDelivered = !loading && items.length > 0 && items.every((d) => d.status === 'DELIVERED')

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">
            {user?.fullName?.split(' ')[0] ? `Hey, ${user.fullName.split(' ')[0]}!` : 'Deliveries'}
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {data.totalElements || 0} delivery{(data.totalElements || 0) !== 1 ? 'ies' : 'y'} assigned
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-icon flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-500 hover:bg-surface-200 active:bg-surface-300 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── KPI Chips ────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Assigned', count: stats.assigned, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
          { label: 'Active', count: stats.inProgress, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Navigation },
          { label: 'Done', count: completedToday, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
          { label: 'Pickups', count: stats.pendingPickups, color: 'bg-violet-50 text-violet-700 border-violet-200', icon: Package },
        ].map((chip) => (
          <div key={chip.label} className={`flex flex-col items-center justify-center rounded-xl border ${chip.color} p-2.5 min-h-[68px]`}>
            <chip.icon className="h-4 w-4 mb-1" />
            <span className="text-lg font-bold leading-none">{chip.count}</span>
            <span className="text-[10px] font-medium mt-0.5 leading-tight text-center">{chip.label}</span>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ──────────────────────────────── */}
      <div ref={tabsRef} className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {FILTER_TABS.map((t) => {
          const isActive = filterTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all min-h-[36px] flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200 active:bg-surface-300'
              }`}
            >
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Map Placeholder ──────────────────────────── */}
      {items.some((d) => d.status !== 'DELIVERED') && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-100 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100">
              <MapPin className="h-3.5 w-3.5 text-primary-600" />
            </div>
            <span className="text-xs font-semibold text-surface-700">Live Map</span>
            <span className="ml-auto text-[10px] text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full font-medium">
              Coming Soon
            </span>
          </div>
          <div className="h-32 bg-gradient-to-br from-surface-50 to-surface-100 flex flex-col items-center justify-center">
            <MapPin className="h-6 w-6 text-surface-300 mb-1" />
            <p className="text-xs font-medium text-surface-400">Map integration will appear here</p>
            <p className="text-[10px] text-surface-300 mt-0.5">Navigate to customer locations in real-time</p>
          </div>
        </div>
      )}

      {/* ── Loading State ────────────────────────────── */}
      {loading && items.length === 0 && <DeliverySkeleton />}

      {/* ── Empty State ──────────────────────────────── */}
      {showNoDeliveries && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-white py-16 px-6 animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 shadow-sm mb-4">
            <Truck className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 text-center">No Deliveries Assigned</h3>
          <p className="text-sm text-surface-500 mt-1.5 text-center max-w-xs">
            New deliveries will appear here when assigned to you. Check back soon or pull to refresh.
          </p>
          <div className="flex items-center gap-2 mt-6 text-xs text-surface-400 bg-surface-50 rounded-full px-4 py-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Tap the refresh button above
          </div>
        </div>
      )}

      {/* ── Filtered Empty ───────────────────────────── */}
      {showFilteredEmpty && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-white py-16 px-6 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 mb-3">
            <Search className="h-8 w-8 text-surface-300" />
          </div>
          <h3 className="text-base font-semibold text-surface-900 text-center">No {FILTER_TABS.find((t) => t.key === filterTab)?.label || ''} Deliveries</h3>
          <p className="text-sm text-surface-500 mt-1 text-center max-w-xs">Try a different filter to see more deliveries.</p>
          <button onClick={() => setFilterTab('')} className="btn-ghost text-sm font-semibold mt-4">
            Clear Filter
          </button>
        </div>
      )}

      {/* ── All Completed ────────────────────────────── */}
      {allDelivered && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200 p-5 text-center animate-fade-in">
          <div className="flex justify-center mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-emerald-800">All Deliveries Completed!</h3>
          <p className="text-sm text-emerald-600 mt-1">Great job! You've completed all your deliveries.</p>
        </div>
      )}

      {/* ── Delivery Cards ───────────────────────────── */}
      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {/* Ongoing first, then delivered */}
          {items
            .filter((d) => d.status !== 'DELIVERED')
            .concat(items.filter((d) => d.status === 'DELIVERED'))
            .map((delivery) => (
              <DeliveryCard
                key={delivery?.id ?? Math.random()}
                delivery={delivery}
                onAccept={handleAccept}
                onStatusUpdate={handleStatusUpdate}
                updatingId={updatingId}
                onViewAddress={(addr) => setShowAddressModal(addr)}
              />
            ))}
        </div>
      )}

      {/* ── History link ─────────────────────────────── */}
      {data.totalElements > 5 && (
        <div className="text-center pt-2">
          <Link
            to="/deliveries/history"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View Full History <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── Address Modal ────────────────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddressModal(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-modal animate-slide-up overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-surface-900">Delivery Address</span>
              </div>
              <button onClick={() => setShowAddressModal(null)} className="btn-icon h-8 w-8">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-5 py-6">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-sm text-surface-700 leading-relaxed">{showAddressModal}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-surface-400 bg-surface-50 rounded-xl p-3">
                <Navigation className="h-3.5 w-3.5 shrink-0" />
                <span>Navigation will be available once map integration is live</span>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-surface-100 flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(showAddressModal)
                  toast.success('Address copied')
                }}
                className="flex-1 btn-secondary text-sm py-2.5 rounded-xl"
              >
                Copy Address
              </button>
              <button
                onClick={() => {
                  const encoded = encodeURIComponent(showAddressModal)
                  window.open(`https://www.google.com/maps/search/${encoded}`, '_blank')
                }}
                className="flex-1 btn-primary text-sm py-2.5 rounded-xl"
              >
                Open in Maps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
