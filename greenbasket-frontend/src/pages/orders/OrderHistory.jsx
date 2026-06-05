import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Search, ChevronDown, ChevronUp, Eye, Truck,
  RotateCcw, FileText, Clock, CheckCircle, XCircle, Box,
  MapPin, ShoppingBag, Sparkles, Store,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { orderApi } from '@/api/orders'
import { Pagination } from '@/components/common/Pagination'
import { Skeleton, OrderCardSkeleton } from '@/components/common/Skeleton'
import { formatCurrency, formatDateTime, getImageUrl } from '@/utils/helpers'
import { ORDER_STATUS } from '@/utils/constants'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED']

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700',
    ring: 'ring-amber-200', border: 'border-amber-200', icon: Clock, light: 'bg-amber-100/50',
  },
  CONFIRMED: {
    label: 'Confirmed', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700',
    ring: 'ring-blue-200', border: 'border-blue-200', icon: CheckCircle, light: 'bg-blue-100/50',
  },
  PACKING: {
    label: 'Packing', dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700',
    ring: 'ring-indigo-200', border: 'border-indigo-200', icon: Box, light: 'bg-indigo-100/50',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery', dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700',
    ring: 'ring-orange-200', border: 'border-orange-200', icon: Truck, light: 'bg-orange-100/50',
  },
  DELIVERED: {
    label: 'Delivered', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700',
    ring: 'ring-emerald-200', border: 'border-emerald-200', icon: MapPin, light: 'bg-emerald-100/50',
  },
  CANCELLED: {
    label: 'Cancelled', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700',
    ring: 'ring-red-200', border: 'border-red-200', icon: XCircle, light: 'bg-red-100/50',
  },
}

const FILTERS = ['All', 'PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

export function OrderHistory() {
  const [orders, setOrders] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [activeFilter, setActiveFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const statusParam = activeFilter === 'All' ? undefined : activeFilter
      const { data } = await orderApi.getAll({ page, size: 10, sort: 'createdAt,desc', status: statusParam })
      setOrders(data.data)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page, activeFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleFilter = (f) => {
    setActiveFilter(f)
    setPage(0)
    setExpandedId(null)
  }

  const statusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  const statusIdx = (status) => STATUS_STEPS.indexOf(status)

  const handleTrackOrder = (orderId) => {
    const el = document.getElementById(`order-${orderId}`)
    if (el) {
      setExpandedId(expandedId === orderId ? null : orderId)
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
    }
  }

  const handleReorder = (order) => {
    if (order.items?.length === 1) {
      window.open(`/products/${order.items[0].productSlug}`, '_self')
    } else {
      window.open('/products', '_self')
    }
    toast.success('Redirecting to products...')
  }

  const handleDownloadInvoice = () => {
    toast.success('Invoice download will be available soon')
  }

  if (loading) {
    return (
      <div className="page-container py-6 lg:py-8 animate-fade-in">
        <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-900 font-medium">My Orders</span>
        </nav>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2 mb-6">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => <OrderCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const items = orders.content || []

  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="page-container py-6 lg:py-8 animate-fade-in">
        <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-900 font-medium">My Orders</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">My Orders</h1>
            <p className="text-surface-500 mt-1">Track and manage all your orders</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scroll-smooth">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f
            const cfg = f === 'All' ? null : STATUS_CONFIG[f]
            return (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200 ring-1 ring-primary-400'
                    : `${cfg ? cfg.bg + ' ' + cfg.text + ' ring-1 ' + cfg.ring : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`
                }`}
              >
                {f !== 'All' && (
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg?.dot || 'bg-surface-400'}`} />
                )}
                {f === 'All' ? 'All Orders' : ORDER_STATUS[f] || f}
              </button>
            )
          })}
        </div>

        {items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-gradient-to-b from-white to-surface-50 py-20 px-6">
            <div className="relative mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-emerald-50 shadow-lg ring-1 ring-primary-100">
                <Package className="h-12 w-12 text-primary-300" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 border-2 border-white shadow-sm">
                <Truck className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-surface-900">No orders yet</h3>
            <p className="mt-1.5 text-sm text-surface-500 text-center max-w-xs leading-relaxed">
              You haven't placed any orders. Start exploring our fresh farm produce and come back here to track them!
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-surface-400 bg-surface-100 px-2.5 py-1 rounded-full">
                <Store className="h-3 w-3" /> Farm Fresh
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-surface-400 bg-surface-100 px-2.5 py-1 rounded-full">
                <Truck className="h-3 w-3" /> Free Delivery
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-surface-400 bg-surface-100 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" /> Quality Guaranteed
              </span>
            </div>
            <Link
              to="/products"
              className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl shadow-button hover:shadow-lg transition-all"
            >
              <Search className="h-4 w-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((order) => {
              const cfg = statusConfig(order.status)
              const Icon = cfg.icon
              const isExpanded = expandedId === order.id
              const currentStepIdx = statusIdx(order.status)
              const isCancelled = order.status === 'CANCELLED'

              return (
                <div
                  id={`order-${order.id}`}
                  key={order.id}
                  className={`rounded-xl sm:rounded-2xl bg-white border shadow-sm transition-all duration-300 ${
                    isExpanded ? 'shadow-card border-primary-200/80' : 'border-surface-200/80 hover:shadow-md hover:border-surface-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-surface-400 tracking-wider">
                            #{order.orderNumber}
                          </span>
                          <span className="text-surface-200">|</span>
                          <span className="text-xs text-surface-400">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          {isExpanded && !isCancelled && (
                            <span className="text-xs text-surface-400 font-medium">
                              Step {currentStepIdx + 1} of {STATUS_STEPS.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg sm:text-xl font-extrabold text-surface-900">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-surface-400">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Brief progress bar (non-cancelled) */}
                    {!isCancelled && currentStepIdx >= 0 && (
                      <div className="mt-3 h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${((currentStepIdx + 1) / STATUS_STEPS.length) * 100}%`,
                            background: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
                          }}
                        />
                      </div>
                    )}

                    {/* Expand toggle */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:hidden">
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn-primary text-xs px-3 py-1.5 rounded-lg shadow-button gap-1"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Link>
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-primary-600 transition-colors"
                      >
                        {isExpanded ? 'Show less' : `View details`}
                        <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </span>
                      </button>
                      {!isCancelled && (
                        <Link
                          to={`/orders/${order.id}`}
                          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </Link>
                      )}
                    </div>

                    {/* Address preview */}
                    <p className="mt-2 text-xs text-surface-400 truncate">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {order.deliveryAddress}
                    </p>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-surface-100 animate-fade-in">
                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Items preview */}
                        {order.items?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                              <ShoppingBag className="h-3 w-3" /> Items
                            </h4>
                            <div className="divide-y divide-surface-100 rounded-xl border border-surface-200 overflow-hidden bg-surface-50/50">
                              {order.items.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5">
                                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100 ring-1 ring-surface-200/50">
                                    <img
                                      src={getImageUrl(item.imageUrl)}
                                      alt={item.productName}
                                      className="h-full w-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-surface-900 truncate">
                                      {item.productName}
                                    </p>
                                    <p className="text-xs text-surface-400">
                                      {formatCurrency(item.unitPrice)} x {item.quantity}
                                    </p>
                                  </div>
                                  <span className="text-xs font-bold text-surface-900 shrink-0">
                                    {formatCurrency(item.unitPrice * item.quantity)}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <div className="px-2.5 py-2 text-center">
                                  <span className="text-xs text-surface-400">
                                    +{order.items.length - 3} more item{(order.items.length - 3) !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick status timeline preview */}
                        {!isCancelled && (
                          <div>
                            <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                              <Truck className="h-3 w-3" /> Progress
                            </h4>
                            <div className="flex items-center gap-1.5">
                              {STATUS_STEPS.map((step, i) => {
                                const stepCfg = STATUS_CONFIG[step]
                                const StepIcon = stepCfg.icon
                                const isActive = i <= currentStepIdx
                                const isCurrent = i === currentStepIdx
                                return (
                                  <div key={step} className="flex items-center gap-1.5 flex-1">
                                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                                      isActive ? `${stepCfg.bg} ${stepCfg.text} ring-2 ${stepCfg.ring}` : 'bg-surface-100 text-surface-300'
                                    } ${isCurrent ? 'scale-110 ring-4' : ''}`}>
                                      <StepIcon className="h-3 w-3" />
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                      <div className={`flex-1 h-0.5 rounded-full ${i < currentStepIdx ? 'bg-emerald-400' : 'bg-surface-200'}`} />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Link
                            to={`/orders/${order.id}`}
                            className="btn-primary text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-button gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                          {!isCancelled && (
                            <Link
                              to={`/orders/${order.id}`}
                              className="btn-secondary text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg gap-1.5 border-2"
                            >
                              <Truck className="h-3.5 w-3.5" /> Track Order
                            </Link>
                          )}
                          <button
                            onClick={() => handleReorder(order)}
                            className="btn-secondary text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg gap-1.5"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Reorder
                          </button>
                          <button
                            onClick={handleDownloadInvoice}
                            className="btn-ghost text-xs sm:text-sm px-3.5 py-2 sm:py-2.5 rounded-lg gap-1.5"
                          >
                            <FileText className="h-3.5 w-3.5" /> Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="pt-6">
              <Pagination
                page={orders.pageNumber || orders.page || 0}
                totalPages={orders.totalPages}
                totalElements={orders.totalElements}
                size={10}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
