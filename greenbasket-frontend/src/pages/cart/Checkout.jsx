import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, ArrowLeft, Shield, Truck, Leaf, BadgeCheck,
  Package, ChevronRight, MapPin, Phone, User, PenLine,
  Store, CheckCircle2, AlertCircle, CreditCard,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { orderApi } from '@/api/orders'
import { CheckoutSkeleton } from '@/components/common/Skeleton'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

function DeliveryProgress({ subtotal, threshold = 500 }) {
  const progress = Math.min((subtotal / threshold) * 100, 100)
  const remaining = threshold - subtotal
  if (remaining <= 0) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 p-3 sm:p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <Truck className="h-4 w-4" />
          Free Delivery Unlocked!
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3 sm:p-3.5">
      <p className="flex items-center gap-2 text-xs font-medium text-amber-800">
        <Truck className="h-4 w-4 shrink-0" />
        Add <span className="font-bold">{formatCurrency(remaining)}</span> more for <span className="font-bold text-emerald-600">free delivery</span>
      </p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

const STEPS = [
  { label: 'Cart', icon: ShoppingBag },
  { label: 'Checkout', icon: PenLine },
  { label: 'Confirmed', icon: CheckCircle2 },
]

const TRUST_ITEMS = [
  { icon: Leaf, label: 'Fresh From Farmers', desc: 'Directly sourced from local farms', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Free delivery above Rs. 500', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Shield, label: 'Secure Ordering', desc: 'Your data is encrypted & protected', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Store, label: 'Order Tracking', desc: 'Real-time updates from farm to door', color: 'text-primary-600', bg: 'bg-primary-50' },
]

export function Checkout() {
  const { isAuthenticated } = useAuth()
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart()
  const navigate = useNavigate()

  const [placing, setPlacing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState({})
  const previewRef = useRef(null)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!loading && cart && (!cart.items || cart.items.length === 0)) {
      navigate('/cart', { replace: true })
    }
  }, [loading, cart, navigate])

  useEffect(() => {
    if (submitted && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [submitted])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    else if (!/^98\d{8}$/.test(form.phone.trim()) && !/^\d{7,20}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid phone number'
    if (!form.address.trim()) errs.address = 'Delivery address is required'
    else if (form.address.trim().length < 10) errs.address = 'Please enter a complete address (min 10 characters)'
    if (!form.city.trim()) errs.city = 'City is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleReviewOrder = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors in your form')
      return
    }
    setSubmitted(true)
    setShowPreview(true)
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return
    setPlacing(true)
    try {
      const deliveryAddress = `${form.fullName.trim()}\n${form.address.trim()}\n${form.city.trim()}`
      const { data } = await orderApi.placeOrder({
        deliveryAddress,
        phone: form.phone.trim(),
        deliveryNotes: form.notes.trim() || undefined,
      })
      toast.success('Order placed successfully!')
      await clearCart()
      const orderId = data?.data?.id || data?.data?.orderNumber
      navigate(orderId ? `/orders/success/${orderId}` : '/orders')
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  if (loading) return <CheckoutSkeleton />

  const subtotal = cart?.subtotal || 0
  const deliveryCharge = subtotal >= 500 ? 0 : 50
  const discount = cart?.discount || 0
  const total = subtotal + deliveryCharge - discount
  const itemCount = cart?.items?.length || 0

  if (!cart?.items?.length) return null

  const showOrderPreview = submitted && showPreview

  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="page-container py-4 sm:py-6 lg:py-8 animate-fade-in">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-surface-500 overflow-x-auto pb-1">
          <Link to="/" className="whitespace-nowrap hover:text-primary-600 transition-colors font-medium">Home</Link>
          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-surface-300 shrink-0" />
          <Link to="/cart" className="whitespace-nowrap hover:text-primary-600 transition-colors font-medium">Cart</Link>
          <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-surface-300 shrink-0" />
          <span className="text-surface-900 font-semibold">Checkout</span>
        </nav>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            const isActive = idx === 1
            const isComplete = idx < 1
            return (
              <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isComplete ? 'bg-emerald-500 text-white shadow-sm' :
                  isActive ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md scale-110' :
                  'bg-surface-100 text-surface-400'
                }`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isComplete ? 'text-white' : ''}`} />
                </div>
                <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  isActive ? 'text-primary-700' : isComplete ? 'text-emerald-600' : 'text-surface-400'
                }`}>
                  {step.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-8 lg:w-12 h-0.5 rounded-full ${
                    isComplete ? 'bg-emerald-400' : 'bg-surface-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-5">
          {/* Left Column: Delivery Form + Items */}
          <div className="lg:col-span-3 space-y-5 sm:space-y-6">
            {/* Delivery Info Section */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="bg-gradient-to-r from-primary-600 to-emerald-600 px-4 sm:px-6 py-3.5 sm:py-4">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  Delivery Information
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-surface-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      errors.fullName ? 'text-red-400' : 'text-surface-400'
                    }`} />
                    <input
                      id="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`input-field pl-10 rounded-xl text-sm ${
                        errors.fullName ? 'border-red-400 ring-red-200/50' : ''
                      }`}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-surface-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      errors.phone ? 'text-red-400' : 'text-surface-400'
                    }`} />
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`input-field pl-10 rounded-xl text-sm ${
                        errors.phone ? 'border-red-400 ring-red-200/50' : ''
                      }`}
                      placeholder="98XXXXXXXX"
                      autoComplete="tel"
                      maxLength={20}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.phone}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-surface-400">We'll use this for delivery updates</p>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-surface-700 mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-3 h-4 w-4 ${
                      errors.address ? 'text-red-400' : 'text-surface-400'
                    }`} />
                    <textarea
                      id="address"
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows={3}
                      className={`input-field pl-10 rounded-xl text-sm resize-none ${
                        errors.address ? 'border-red-400 ring-red-200/50' : ''
                      }`}
                      placeholder="Street, ward number, landmark"
                      autoComplete="street-address"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.address}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-surface-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      errors.city ? 'text-red-400' : 'text-surface-400'
                    }`} />
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className={`input-field pl-10 rounded-xl text-sm ${
                        errors.city ? 'border-red-400 ring-red-200/50' : ''
                      }`}
                      placeholder="e.g. Kathmandu, Pokhara"
                      autoComplete="address-level2"
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.city}
                    </p>
                  )}
                </div>

                {/* Delivery Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-surface-700 mb-1.5">
                    Delivery Notes <span className="text-surface-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <PenLine className="absolute left-3 top-3 h-4 w-4 text-surface-400" />
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      rows={2}
                      className="input-field pl-10 rounded-xl text-sm resize-none"
                      placeholder="Gate code, delivery instructions, etc."
                      maxLength={500}
                    />
                  </div>
                  <p className="mt-1 text-xs text-surface-400 text-right">{form.notes.length}/500</p>
                </div>
              </div>
            </div>

            {/* Items Review */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-surface-100">
                <h2 className="text-sm sm:text-base font-bold text-surface-900 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  Items ({itemCount})
                </h2>
              </div>
              <div className="divide-y divide-surface-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 transition-colors hover:bg-surface-50/50">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-surface-100 shadow-sm ring-1 ring-surface-200/50">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/80x80/e2e8f0/64748b?text=N' }}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="text-sm sm:text-base font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        {item.farmerName && (
                          <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                            <Store className="h-3 w-3" /> {item.farmerName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs sm:text-sm text-surface-500">
                          Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}
                          {item.unit && <span className="text-surface-400"> / {item.unit}</span>}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-surface-900">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start space-y-4 sm:space-y-5">
            {/* Order Summary */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="bg-gradient-to-r from-primary-600 to-emerald-600 px-4 sm:px-6 py-3.5 sm:py-4">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order Summary
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Subtotal</span>
                    <span className="font-semibold text-surface-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-500">Delivery</span>
                    <span className={deliveryCharge === 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-surface-900'}>
                      {deliveryCharge === 0 ? (
                        <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Free</span>
                      ) : formatCurrency(deliveryCharge)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 bg-emerald-50/80 -mx-2 px-2 py-1.5 rounded-lg">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <DeliveryProgress subtotal={subtotal} />

                <div className="border-t border-surface-200 pt-3 sm:pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-bold text-surface-900">Grand Total</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-primary-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {!showOrderPreview && (
                  <button
                    onClick={handleReviewOrder}
                    className="btn-primary w-full py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Review Order
                  </button>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Why shop with us
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {TRUST_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-2.5 p-2 rounded-lg bg-surface-50/50 transition-colors hover:bg-surface-100">
                    <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                      <item.icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-surface-900 truncate">{item.label}</p>
                      <p className="text-[10px] sm:text-[11px] text-surface-500 truncate leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="rounded-xl sm:rounded-2xl bg-white border border-surface-200/80 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary-50 shrink-0">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-surface-900">Cash on Delivery</p>
                  <p className="text-[10px] sm:text-xs text-surface-400">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Preview + Place Order */}
        {showOrderPreview && (
          <div ref={previewRef} className="mt-6 sm:mt-8 animate-fade-in">
            <div className="rounded-xl sm:rounded-2xl bg-white border-2 border-primary-200 shadow-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-emerald-500 px-4 sm:px-6 py-3.5 sm:py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  <h2 className="text-sm sm:text-base font-bold text-white">Review Your Order</h2>
                </div>
                <p className="text-xs text-white/80 mt-0.5">Please verify all details before placing your order</p>
              </div>

              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Summary Grid */}
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
                  <div className="rounded-xl bg-surface-50 p-3.5 sm:p-4 border border-surface-200/60">
                    <div className="flex items-center gap-2 text-primary-600 mb-2">
                      <ShoppingBag className="h-4 w-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">Products</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {cart.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-xs sm:text-sm">
                          <span className="text-surface-600 truncate max-w-[140px] sm:max-w-[180px]">
                            {item.productName} &times; {item.quantity}
                          </span>
                          <span className="font-semibold text-surface-900 shrink-0 ml-2">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-surface-50 p-3.5 sm:p-4 border border-surface-200/60">
                    <div className="flex items-center gap-2 text-primary-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">Delivery To</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-surface-700 font-medium whitespace-pre-line">{form.fullName}</p>
                    <p className="text-xs sm:text-sm text-surface-600 whitespace-pre-line">{form.address}</p>
                    <p className="text-xs sm:text-sm text-surface-600">{form.city}</p>
                  </div>
                  <div className="rounded-xl bg-surface-50 p-3.5 sm:p-4 border border-surface-200/60">
                    <div className="flex items-center gap-2 text-primary-600 mb-2">
                      <Phone className="h-4 w-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">Contact</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-surface-700 font-medium">{form.phone}</p>
                    {form.notes && (
                      <>
                        <h4 className="text-xs font-semibold text-surface-500 mt-2 mb-0.5">Notes:</h4>
                        <p className="text-xs sm:text-sm text-surface-600">{form.notes}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Total Bar */}
                <div className="rounded-xl bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-200/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-surface-500 font-medium">Grand Total</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-primary-700">{formatCurrency(total)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-surface-400">
                      <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-surface-200">Subtotal: {formatCurrency(subtotal)}</span>
                      <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-surface-200">
                        {deliveryCharge === 0 ? 'Free Delivery' : `Delivery: ${formatCurrency(deliveryCharge)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => { setShowPreview(false); setSubmitted(false) }}
                    className="btn-secondary py-3 sm:py-3.5 px-5 sm:px-6 text-sm sm:text-base font-semibold rounded-xl border-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Edit Details
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="btn-primary flex-1 py-3.5 sm:py-4 text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-70 gap-2"
                  >
                    {placing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Package className="h-5 w-5" />
                        Place Order — {formatCurrency(total)}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky CTA - only shows before order review */}
        {!showOrderPreview && (
          <>
            <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden animate-slide-up">
              <div className="bg-white border-t border-surface-200 shadow-modal px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-surface-400">Grand Total</p>
                    <p className="text-lg font-extrabold text-primary-600">{formatCurrency(total)}</p>
                  </div>
                  <p className="text-xs text-surface-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </div>
                <button
                  onClick={handleReviewOrder}
                  className="btn-primary w-full py-3.5 text-sm font-bold rounded-xl shadow-lg active:scale-[0.99] transition-all gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Review Order
                </button>
              </div>
            </div>
            <div className="h-24 sm:h-[88px] lg:hidden" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  )
}
