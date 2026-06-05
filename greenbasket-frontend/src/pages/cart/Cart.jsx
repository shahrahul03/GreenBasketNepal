import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Shield, Truck,
  Tag, Store, Leaf, BadgeCheck, Package, ChevronRight,
  CreditCard, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '@/components/common/Loader'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

function DeliveryProgress({ subtotal, threshold = 500 }) {
  const progress = Math.min((subtotal / threshold) * 100, 100)
  const remaining = threshold - subtotal
  if (remaining <= 0) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <Truck className="h-4 w-4" />
          Free Delivery Unlocked!
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3.5">
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

export function Cart() {
  const { isAuthenticated } = useAuth()
  const { cart, loading, updateCartItem, removeFromCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return
    try {
      await updateCartItem(itemId, newQty)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId)
      toast.success('Item removed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <PageLoader />

  const subtotal = cart?.subtotal || 0
  const deliveryCharge = subtotal >= 500 ? 0 : 50
  const total = subtotal + deliveryCharge

  if (!cart?.items?.length) {
    return (
      <div className="page-container py-16 animate-fade-in">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-primary-50 shadow-lg shadow-emerald-100/50 ring-1 ring-emerald-100/50">
            <ShoppingBag className="h-14 w-14 text-primary-300" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-surface-900">Your basket is empty</h2>
          <p className="mt-2 text-surface-500 leading-relaxed">
            Looks like you haven't added anything yet.<br />
            Start exploring our fresh farm produce!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-surface-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-3 py-1">
              <Leaf className="h-3 w-3 text-primary-500" /> Farm Fresh
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-3 py-1">
              <Truck className="h-3 w-3 text-primary-500" /> Free Delivery
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-3 py-1">
              <BadgeCheck className="h-3 w-3 text-primary-500" /> Quality Guaranteed
            </span>
          </div>
          <Link
            to="/products"
            className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl shadow-button hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50/50">
      <div className="page-container py-6 lg:py-8 animate-fade-in">
        <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-surface-300" />
          <span className="text-surface-900 font-medium">Shopping Cart</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">
              Shopping Cart{' '}
              <span className="text-surface-400 text-lg lg:text-xl font-normal">({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</span>
            </h1>
            <p className="text-sm text-surface-500 mt-1">Review your items before proceeding to checkout</p>
          </div>
          <Link to="/products" className="btn-ghost inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl hover:bg-surface-100 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl bg-white border border-surface-200/80 p-3 sm:p-5 transition-all duration-300 hover:shadow-card-hover hover:border-surface-300"
              >
                <div className="flex gap-3 sm:gap-6">
                  <div className="h-20 w-20 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100 shadow-sm ring-1 ring-surface-200/50 transition-all duration-300 group-hover:shadow-md">
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.productName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'https://placehold.co/128x128/e2e8f0/64748b?text=N' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="font-bold text-surface-900 hover:text-primary-600 transition-colors line-clamp-1 text-sm sm:text-lg"
                        >
                          {item.productName}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {item.farmerName && (
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-surface-400 bg-surface-50 px-2 py-0.5 rounded-full">
                              <Store className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[80px] sm:max-w-none">{item.farmerName}</span>
                            </span>
                          )}
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-200/50">
                            <Leaf className="h-2.5 w-2.5" />
                            Fresh
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-surface-500 font-medium">
                          {formatCurrency(item.unitPrice)} <span className="text-surface-400">/ {item.unit || 'kg'}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-surface-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-2 sm:mt-4">
                      <div className="inline-flex items-center rounded-xl border border-surface-200 bg-white shadow-sm ring-1 ring-surface-200/10">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-l-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex h-8 w-8 sm:h-10 sm:w-12 items-center justify-center text-xs sm:text-sm font-bold text-surface-900 select-none border-x border-surface-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-r-xl transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-lg font-bold text-surface-900">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="sm:hidden mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50/30 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Remove Item
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              <div className="overflow-hidden rounded-2xl bg-white border border-surface-200/80 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="bg-gradient-to-r from-primary-600 to-emerald-600 px-6 py-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5" />
                    Order Summary
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Subtotal</span>
                      <span className="font-semibold text-surface-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Delivery</span>
                      <span className={deliveryCharge === 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-surface-900'}>
                        {deliveryCharge === 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5" /> Free
                          </span>
                        ) : formatCurrency(deliveryCharge)}
                      </span>
                    </div>
                  </div>

                  <DeliveryProgress subtotal={subtotal} />

                  <div className="border-t border-surface-200 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-surface-900">Total</span>
                      <span className="text-2xl font-extrabold text-primary-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="btn-primary w-full py-3.5 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Package className="h-5 w-5" />
                    Proceed to Checkout
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-surface-200/80 p-5 shadow-sm">
                <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-4">Why shop with us</h4>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 shrink-0 ring-1 ring-inset ring-emerald-200/50">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-700">Secure Checkout</p>
                      <p className="text-xs text-surface-400">Your info is protected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 shrink-0 ring-1 ring-inset ring-primary-200/50">
                      <Truck className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-700">Free Delivery</p>
                      <p className="text-xs text-surface-400">On orders above Rs. 500</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100 shrink-0 ring-1 ring-inset ring-accent-200/50">
                      <CreditCard className="h-4 w-4 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-700">Cash on Delivery</p>
                      <p className="text-xs text-surface-400">Pay when you receive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-surface-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] lg:hidden animate-slide-up">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Total Amount</span>
              <span className="text-xl font-extrabold text-primary-600 leading-none mt-0.5">{formatCurrency(total)}</span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full ring-1 ring-inset ring-emerald-200/50">
                <Truck className="h-3 w-3" />
                {deliveryCharge === 0 ? 'Free Shipping' : '+ Rs. 50 Delivery'}
              </span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="btn-primary w-full py-4 text-sm font-bold rounded-2xl shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Package className="h-4.5 w-4.5" />
            Checkout Now
          </Link>
          {/* Safe area for mobile home indicator */}
          <div className="h-safe-bottom" />
        </div>
      )}
    </div>
  )
}
