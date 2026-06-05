import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, CheckCircle, Package, Truck, MapPin, ShoppingBag, Eye, ArrowRight, CreditCard, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderApi } from '@/api/orders'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency, formatDateTime, getImageUrl } from '@/utils/helpers'
import { ORDER_STATUS } from '@/utils/constants'

const TIMELINE_STEPS = [
  { key: 'PENDING', icon: Clock, label: 'Order Placed' },
  { key: 'CONFIRMED', icon: CheckCircle, label: 'Confirmed' },
  { key: 'PACKING', icon: Package, label: 'Packed' },
  { key: 'OUT_FOR_DELIVERY', icon: Truck, label: 'Out for Delivery' },
  { key: 'DELIVERED', icon: MapPin, label: 'Delivered' },
]

export function OrderSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.getById(id)
      .then(({ data }) => setOrder(data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!order) return null

  const statusIdx = TIMELINE_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="page-container py-6 lg:py-10 animate-fade-in">
      <div className="mx-auto max-w-4xl">
        <div className="card-hover rounded-2xl p-8 sm:p-12 text-center mb-6 relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white border border-emerald-100/60">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-emerald-100/40 blur-xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary-100/30 blur-xl" />
            <div className="absolute top-1/4 left-1/3 h-2 w-2 rounded-full bg-emerald-300/40 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-primary-300/30 animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="absolute bottom-1/3 left-1/4 h-1.5 w-1.5 rounded-full bg-amber-300/40 animate-ping" style={{ animationDuration: '4s' }} />
            <div className="absolute top-2/3 right-1/3 h-2 w-2 rounded-full bg-emerald-200/40 animate-ping" style={{ animationDuration: '3.5s' }} />
            <svg className="absolute top-0 right-0 h-48 w-48 text-emerald-100/20 -translate-y-1/4 translate-x-1/4" viewBox="0 0 200 200" fill="currentColor">
              <circle cx="100" cy="100" r="80" />
            </svg>
            <svg className="absolute bottom-0 left-0 h-36 w-36 text-primary-100/20 translate-y-1/4 -translate-x-1/4" viewBox="0 0 200 200" fill="currentColor">
              <circle cx="100" cy="100" r="80" />
            </svg>
          </div>
          <div className="relative">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200/60 animate-scale-in">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-surface-500 mb-8 max-w-lg mx-auto leading-relaxed">
              Thank you for your order. We'll confirm it shortly and keep you updated every step of the way.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link to={`/orders/${order.id}`} className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm shadow-button hover:shadow-lg transition-all rounded-xl">
                <Eye className="h-4 w-4" />
                View Order Details
              </Link>
              <Link to="/products" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl border-2 hover:bg-surface-50 transition-all">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
              <Link to="/orders" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl hover:bg-surface-100 transition-all">
                My Orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="card-hover rounded-xl p-5 sm:p-6 mb-6 bg-white border border-surface-200/80 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-3 rounded-xl bg-surface-50">
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">Order Number</p>
              <p className="text-sm font-bold text-surface-900 font-mono">{order.orderNumber}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-50">
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">Order Date</p>
              <p className="text-sm font-semibold text-surface-900">{formatDateTime(order.placedAt || order.createdAt)}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-50">
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-sm font-bold text-primary-600">{formatCurrency(order.total)}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-50">
              <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">Payment</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CreditCard className="h-3.5 w-3.5 text-surface-400" />
                <p className="text-sm font-semibold text-surface-900">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-hover rounded-xl p-5 sm:p-6 mb-6 bg-white border border-surface-200/80 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 shrink-0 shadow-sm">
              <MapPin className="h-5 w-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-900 mb-1">Delivery Address</p>
              <p className="text-sm text-surface-600 leading-relaxed">{order.deliveryAddress}</p>
              {order.phone && (
                <p className="text-sm text-surface-400 mt-1.5 flex items-center gap-1.5">
                  <span className="font-medium text-surface-500">Phone:</span> {order.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {order.status !== 'CANCELLED' && (
          <div className="card-hover rounded-xl p-5 sm:p-6 mb-6 bg-white border border-surface-200/80 shadow-sm">
            <h3 className="text-sm font-semibold text-surface-900 mb-8 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              Order Progress
            </h3>
            <div className="relative">
              {TIMELINE_STEPS.map((step, i) => {
                const Icon = step.icon
                const isActive = i <= statusIdx
                const isCurrent = i === statusIdx
                return (
                  <div key={step.key} className="flex items-start gap-5 pb-10 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full z-10 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-200'
                          : 'bg-surface-100 text-surface-400'
                      } ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`absolute top-10 w-0.5 h-10 transition-all duration-300 ${
                          i < statusIdx ? 'bg-gradient-to-b from-primary-500 to-primary-300' : 'bg-surface-200'
                        }`} />
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`text-sm font-semibold transition-all ${
                        isActive ? 'text-surface-900' : 'text-surface-400'
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary-600 mt-1 font-medium">
                          {order.status === 'PENDING' && 'Awaiting confirmation'}
                          {order.status === 'CONFIRMED' && 'Order has been confirmed'}
                          {order.status === 'PACKING' && 'Your items are being packed'}
                          {order.status === 'OUT_FOR_DELIVERY' && 'Your order is on the way!'}
                          {order.status === 'DELIVERED' && 'Order delivered successfully'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="card-hover rounded-xl p-5 sm:p-6 mb-6 bg-white border border-surface-200/80 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-900 mb-5">
            Items ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-surface-100">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100 shadow-sm ring-1 ring-surface-200/50">
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 truncate">{item.productName}</p>
                  <p className="text-sm text-surface-500 mt-0.5">
                    Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-bold text-surface-900 whitespace-nowrap">
                  {formatCurrency(item.subtotal || item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover rounded-xl p-5 sm:p-6 mb-6 bg-white border border-surface-200/80 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-900 mb-5 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary-500" />
            Payment Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-500">Subtotal</span>
              <span className="font-semibold text-surface-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Delivery Charge</span>
              <span className={`font-semibold ${order.deliveryCharge === 0 ? 'text-emerald-600' : 'text-surface-900'}`}>
                {order.deliveryCharge === 0 ? 'Free' : formatCurrency(order.deliveryCharge)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 bg-emerald-50 -mx-2 px-2 py-1 rounded-lg">
                <span className="font-medium">Discount</span>
                <span className="font-bold">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-surface-200 pt-3" />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-surface-900">Grand Total</span>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-6">
          <Link to={`/orders/${order.id}`} className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm shadow-button hover:shadow-lg transition-all rounded-xl">
            <Eye className="h-4 w-4" />
            View Order Details
          </Link>
          <Link to="/products" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl border-2 hover:bg-surface-50 transition-all">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl hover:bg-surface-100 transition-all">
            My Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="text-center py-6">
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
