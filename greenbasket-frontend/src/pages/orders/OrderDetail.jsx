import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, XCircle, CheckCircle, Package, Truck, MapPin,
  Clock, Phone, CreditCard, ChevronRight, ShoppingBag,
  RotateCcw, FileText, Eye, Store, Sparkles, AlertCircle, Star,
  MessageSquare, Send, X, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { orderApi } from '@/api/orders'
import { reviewApi } from '@/api/reviews'
import { OrderDetailSkeleton } from '@/components/common/Skeleton'
import { formatCurrency, formatDateTime, getImageUrl } from '@/utils/helpers'
import { ORDER_STATUS } from '@/utils/constants'
import { StarRating } from '@/components/reviews/StarRating'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

const STATUS_STEPS = [
  { key: 'PENDING', icon: Clock, label: 'Order Placed', desc: 'Order has been placed successfully' },
  { key: 'CONFIRMED', icon: CheckCircle, label: 'Confirmed', desc: 'Order has been confirmed' },
  { key: 'PACKING', icon: Package, label: 'Packing', desc: 'Your items are being packed' },
  { key: 'OUT_FOR_DELIVERY', icon: Truck, label: 'Out for Delivery', desc: 'Your order is on the way!' },
  { key: 'DELIVERED', icon: MapPin, label: 'Delivered', desc: 'Order delivered successfully' },
]

const STATUS_COLORS = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500', gradient: 'from-amber-400 to-amber-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', dot: 'bg-blue-500', gradient: 'from-blue-400 to-blue-500' },
  PACKING: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', dot: 'bg-indigo-500', gradient: 'from-indigo-400 to-indigo-500' },
  OUT_FOR_DELIVERY: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', dot: 'bg-orange-500', gradient: 'from-orange-400 to-orange-500' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', dot: 'bg-red-500', gradient: 'from-red-400 to-red-500' },
}

const currentStatusDesc = (status) => {
  switch (status) {
    case 'PENDING': return 'Awaiting confirmation from the seller'
    case 'CONFIRMED': return 'Your order has been confirmed and will be packed soon'
    case 'PACKING': return 'Your fresh items are being carefully packed'
    case 'OUT_FOR_DELIVERY': return 'Your order is on its way to your doorstep'
    case 'DELIVERED': return 'Order delivered — enjoy your fresh produce!'
    default: return ''
  }
}

const REVIEW_LABELS = {
  0.5: 'Poor', 1: 'Poor', 1.5: 'Average', 2: 'Average',
  2.5: 'Good', 3: 'Good', 3.5: 'Great', 4: 'Great',
  4.5: 'Excellent', 5: 'Excellent',
}

export function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, hasRole } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [reviewingItem, setReviewingItem] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [existingReviews, setExistingReviews] = useState({})

  const fetchExistingReviews = async (orderData) => {
    if (!isAuthenticated || !hasRole(ROLES.CUSTOMER)) return
    try {
      const { data } = await reviewApi.getMyReviews({ page: 0, size: 50 })
      const myReviews = data.data?.content || []
      const reviewMap = {}
      orderData.items?.forEach((item) => {
        const productId = item.productId || item.product?.id
        const found = myReviews.find((r) => r.productId === productId && r.orderId === orderData.id)
        if (found) reviewMap[productId] = found
      })
      setExistingReviews(reviewMap)
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    orderApi.getById(id)
      .then(({ data }) => {
        setOrder(data.data)
        fetchExistingReviews(data.data)
      })
      .catch(() => {
        toast.error('Order not found')
        navigate('/orders')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleSubmitReview = async (item) => {
    const productId = item.productId || item.product?.id
    if (reviewRating < 1) {
      toast.error('Please select a rating')
      return
    }
    setSubmittingReview(true)
    try {
      await reviewApi.create({
        rating: reviewRating,
        comment: reviewComment,
        productId,
        orderId: order.id,
      })
      toast.success('Review submitted successfully!')
      setReviewingItem(null)
      setReviewRating(0)
      setReviewComment('')
      fetchExistingReviews(order)
    } catch (err) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await orderApi.cancel(id)
      toast.success('Order cancelled')
      setOrder((prev) => ({ ...prev, status: 'CANCELLED' }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = () => {
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

  if (loading) return <OrderDetailSkeleton />
  if (!order) return null

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status)
  const statusColors = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING
  const statusIdx = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="page-container py-6 lg:py-8 animate-fade-in">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500 overflow-x-auto pb-1">
          <Link to="/" className="whitespace-nowrap hover:text-primary-600 transition-colors font-medium">Home</Link>
          <ChevronRight className="h-3 w-3 text-surface-300 shrink-0" />
          <Link to="/orders" className="whitespace-nowrap hover:text-primary-600 transition-colors font-medium">My Orders</Link>
          <ChevronRight className="h-3 w-3 text-surface-300 shrink-0" />
          <span className="text-surface-900 font-semibold truncate max-w-[200px]">{order.orderNumber}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header Card */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className={`p-5 sm:p-6 ${statusColors.bg}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-lg sm:text-xl font-bold text-surface-900 font-mono">
                        #{order.orderNumber}
                      </h1>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusColors.bg} ${statusColors.text} ring-1 ${statusColors.ring}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                        {ORDER_STATUS[order.status] || order.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-surface-500">
                      Placed on {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {cancelling ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick actions row */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-surface-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/orders/${order.id}`}
                    className="btn-primary text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-lg shadow-button gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Link>
                  {!isCancelled && (
                    <Link
                      to="#timeline"
                      onClick={(e) => {
                        e.preventDefault()
                        const el = document.getElementById('order-timeline')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="btn-secondary text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-lg gap-1.5 border-2"
                    >
                      <Truck className="h-3.5 w-3.5" /> Track Order
                    </Link>
                  )}
                  <button
                    onClick={handleReorder}
                    className="btn-secondary text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-lg gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reorder
                  </button>
                  <button
                    onClick={handleDownloadInvoice}
                    className="btn-ghost text-xs sm:text-sm px-3.5 py-2 rounded-lg gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" /> Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {!isCancelled ? (
              <div id="order-timeline" className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="px-5 sm:px-6 py-4 border-b border-surface-100">
                  <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary-500" />
                    Order Progress
                  </h3>
                </div>
                <div className="p-5 sm:p-6 sm:p-8">
                  <div className="relative">
                    {STATUS_STEPS.map((step, i) => {
                      const StepIcon = step.icon
                      const isActive = i <= statusIdx
                      const isCurrent = i === statusIdx
                      const sColors = STATUS_COLORS[step.key]

                      return (
                        <div key={step.key} className="flex items-start gap-4 sm:gap-6 pb-8 sm:pb-10 last:pb-0">
                          <div className="relative flex flex-col items-center">
                            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full z-10 transition-all duration-500 ${
                              isActive
                                ? `bg-gradient-to-br ${sColors.gradient} text-white shadow-lg shadow-${step.key === 'DELIVERED' ? 'emerald' : 'primary'}-200`
                                : 'bg-surface-100 text-surface-400'
                            } ${isCurrent ? 'ring-4 ring-offset-2 scale-110 ' + sColors.ring : ''}`}>
                              <StepIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isCurrent ? 'animate-bounce-subtle' : ''}`} />
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`absolute top-10 sm:top-12 w-0.5 h-8 sm:h-10 transition-all duration-500 ${
                                i < statusIdx ? 'bg-gradient-to-b from-primary-400 to-primary-300' : 'bg-surface-200'
                              }`} />
                            )}
                          </div>
                          <div className="pt-1 sm:pt-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`text-sm sm:text-base font-bold transition-all duration-300 ${
                                isActive ? 'text-surface-900' : 'text-surface-400'
                              }`}>
                                {step.label}
                              </p>
                              {isActive && !isCurrent && (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              )}
                            </div>
                            <p className={`text-xs sm:text-sm mt-0.5 transition-all duration-300 ${
                              isActive ? 'text-surface-500' : 'text-surface-300'
                            }`}>
                              {isCurrent ? currentStatusDesc(order.status) : step.desc}
                            </p>
                            {isCurrent && order.status === 'OUT_FOR_DELIVERY' && (
                              <p className="text-xs text-primary-600 mt-1.5 font-semibold flex items-center gap-1.5 bg-primary-50 rounded-lg px-3 py-1.5 w-fit border border-primary-100">
                                <Truck className="h-3.5 w-3.5 animate-bounce-subtle" />
                                Your order is on the way — get ready!
                              </p>
                            )}
                            {isCurrent && order.status === 'DELIVERED' && (
                              <p className="text-xs text-emerald-600 mt-1.5 font-semibold flex items-center gap-1.5 bg-emerald-50 rounded-lg px-3 py-1.5 w-fit border border-emerald-100">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Delivered successfully — enjoy your fresh produce!
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl sm:rounded-2xl bg-white border-2 border-red-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-red-100/50 px-5 sm:px-6 py-5 sm:py-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shrink-0 shadow-inner">
                      <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-red-500" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-surface-900">Order Cancelled</p>
                      {order.cancellationReason && (
                        <p className="text-sm text-surface-500 mt-0.5">{order.cancellationReason}</p>
                      )}
                      <p className="text-xs text-surface-400 mt-1">
                        Cancelled on {formatDateTime(order.cancelledAt || order.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="px-5 sm:px-6 py-4 border-b border-surface-100">
                <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary-500" />
                  Items ({order.items?.length || 0})
                </h3>
              </div>
              <div className="divide-y divide-surface-100">
                {order.items?.map((item, i) => {
                  const productId = item.productId || item.product?.id
                  const existingReview = existingReviews[productId]
                  const isReviewing = reviewingItem === i
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 transition-colors hover:bg-surface-50/50">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100 shadow-sm ring-1 ring-surface-200/50">
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-surface-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
                            {formatCurrency(item.unitPrice)} x {item.quantity}
                            {item.unit && <span className="text-surface-400"> / {item.unit}</span>}
                          </p>
                          {order.status === 'DELIVERED' && (
                            <div className="mt-1.5">
                              {existingReview ? (
                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                  <span className="text-xs font-medium text-emerald-700">Reviewed</span>
                                  <StarRating value={existingReview.rating} size="sm" interactive={false} />
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setReviewingItem(i); setReviewRating(0); setReviewComment('') }}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg px-2 py-1 transition-colors"
                                >
                                  <Star className="h-3 w-3" /> Write a Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-bold text-surface-900 whitespace-nowrap">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                      {isReviewing && (
                        <div className="border-t border-surface-100 bg-primary-50/30 px-4 sm:px-6 py-4 animate-slide-down">
                          <div className="max-w-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                Review: {item.productName}
                              </p>
                              <button
                                onClick={() => setReviewingItem(null)}
                                className="btn-icon h-7 w-7 text-surface-400 hover:text-surface-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-surface-600 mb-1.5">Rating</p>
                              <div className="inline-flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 border border-surface-200">
                                <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
                                {reviewRating > 0 && (
                                  <span className="text-sm font-medium text-surface-600">{REVIEW_LABELS[reviewRating]}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={3}
                                className="input-field resize-none text-sm"
                                placeholder="Share your experience with this product..."
                                maxLength={2000}
                              />
                              <p className="text-xs text-surface-400 mt-1 text-right">{reviewComment.length}/2000</p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleSubmitReview(item)}
                                disabled={submittingReview || reviewRating < 1}
                                className="btn-primary inline-flex items-center gap-1.5 text-sm py-2.5"
                              >
                                {submittingReview ? (
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                ) : <Send className="h-4 w-4" />}
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                              </button>
                              <button
                                onClick={() => setReviewingItem(null)}
                                className="btn-secondary text-sm py-2.5"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 sm:space-y-6">
            {/* Delivery Details */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="bg-gradient-to-r from-primary-600 to-emerald-600 px-5 sm:px-6 py-3.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Details
                </h3>
              </div>
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                    <MapPin className="h-4 w-4 text-surface-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Address</p>
                    <p className="text-sm font-semibold text-surface-700 mt-0.5 whitespace-pre-line leading-relaxed">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                    <Phone className="h-4 w-4 text-surface-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-semibold text-surface-700 mt-0.5">{order.phone || 'N/A'}</p>
                  </div>
                </div>
                {order.deliveryNotes && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                      <AlertCircle className="h-4 w-4 text-surface-500" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Notes</p>
                      <p className="text-sm text-surface-600 mt-0.5">{order.deliveryNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="bg-gradient-to-r from-primary-600 to-emerald-600 px-5 sm:px-6 py-3.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Summary
                </h3>
              </div>
              <div className="p-4 sm:p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="font-semibold text-surface-900">{formatCurrency(order.subtotal || order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Delivery</span>
                  <span className={`font-semibold ${order.deliveryCharge === 0 ? 'text-emerald-600' : 'text-surface-900'}`}>
                    {order.deliveryCharge === 0 ? (
                      <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> Free</span>
                    ) : formatCurrency(order.deliveryCharge)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 bg-emerald-50 -mx-2 px-2 py-1.5 rounded-lg">
                    <span className="font-medium">Discount</span>
                    <span className="font-bold">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-surface-200 pt-3" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-bold text-surface-900">Total</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-primary-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-surface-50 to-primary-50 border border-surface-200 p-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                    <CreditCard className="h-4 w-4 text-surface-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-surface-900">Payment Method</p>
                    <p className="text-xs text-surface-500">Cash on Delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 p-4 sm:p-5 shadow-sm">
              <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {!isCancelled && (
                  <>
                    <Link
                      to="#timeline"
                      onClick={(e) => {
                        e.preventDefault()
                        const el = document.getElementById('order-timeline')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-surface-50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                        <Truck className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-surface-900">Track Order</p>
                        <p className="text-xs text-surface-400">See real-time progress</p>
                      </div>
                    </Link>
                  </>
                )}
                <button
                  onClick={handleReorder}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-surface-50 transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    <RotateCcw className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-surface-900">Reorder</p>
                    <p className="text-xs text-surface-400">Buy the same items again</p>
                  </div>
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-surface-50 transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <FileText className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-surface-900">Download Invoice</p>
                    <p className="text-xs text-surface-400">Save as PDF</p>
                  </div>
                </button>
                <Link
                  to="/products"
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-surface-50 transition-colors group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-100 group-hover:bg-surface-200 transition-colors">
                    <ShoppingBag className="h-4 w-4 text-surface-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-surface-900">Shop More</p>
                    <p className="text-xs text-surface-400">Browse fresh products</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-6 border-t border-surface-200">
          <Link to={`/orders/${order.id}`} className="btn-primary inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl shadow-button hover:shadow-lg transition-all">
            <Eye className="h-4 w-4" />
            View Order Details
          </Link>
          <button
            onClick={handleReorder}
            className="btn-secondary inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl border-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reorder
          </button>
          <Link to="/products" className="btn-ghost inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm rounded-xl hover:bg-surface-100 transition-all">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-surface-400">
            Need help?{' '}
            <Link to="/profile" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors underline underline-offset-2">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
