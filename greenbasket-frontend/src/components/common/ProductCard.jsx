import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star, Leaf, Plus, Minus, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { ROLES } from '@/utils/constants'

export function ProductCard({ product, onToggleWishlist }) {
  const { isAuthenticated, hasRole } = useAuth()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  
  const isCustomer = !isAuthenticated || hasRole(ROLES.CUSTOMER)
  const isOutOfStock = !product.isAvailable
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) return toast.error('Please sign in first')
    try {
      await addToCart(product.id, quantity)
      toast.success(`Added ${quantity} ${product.unit || 'item'}(s) to cart!`)
      setQuantity(1)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) return toast.error('Please sign in first')
    onToggleWishlist?.(product.id)
  }

  const incrementQty = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuantity(prev => prev + 1)
  }

  const decrementQty = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity > 1) setQuantity(prev => prev - 1)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative flex flex-col h-full bg-white rounded-2xl border border-surface-200/60 shadow-sm hover:shadow-card-hover hover:border-emerald-100 transition-all duration-300 animate-fade-in"
    >
      {/* Top Badges & Actions */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/10 uppercase tracking-tighter">
              <Leaf className="h-2.5 w-2.5" /> Organic
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center rounded-lg bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600 border border-red-100 uppercase tracking-tighter">
              Out of Stock
            </span>
          )}
        </div>
        <button
          onClick={handleToggleWishlist}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-400 hover:text-red-500 hover:shadow-md transition-all active:scale-90 shadow-sm border border-surface-100"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-surface-50">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/f8fafc/64748b?text=Fresh+Produce' }}
          loading="lazy"
        />
        {discountPercent > 0 && (
          <div className="absolute bottom-2 left-0 bg-accent-500 text-white text-[10px] font-black px-2 py-1 rounded-r-md shadow-lg">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="ml-0.5 text-[11px] font-bold text-surface-700">{product.rating || '4.5'}</span>
          </div>
          <span className="text-[11px] text-surface-400">({product.reviewCount || '24'})</span>
          <span className="ml-auto text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
            <BadgeCheck className="h-3 w-3" /> Verified
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-surface-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors duration-200 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-xs text-surface-500 font-medium">{product.unit || '1 kg'}</span>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-lg font-black text-surface-900">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-surface-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Bottom Action Area */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {isCustomer && !isOutOfStock ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center justify-between rounded-xl bg-surface-50 border border-surface-200 p-1">
                <button
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 hover:bg-white hover:text-primary-600 disabled:opacity-30 transition-all"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-surface-900">{quantity}</span>
                <button
                  onClick={incrementQty}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-500 hover:bg-white hover:text-primary-600 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex h-10 w-12 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-sm active:scale-95 transition-all"
                title="Add to cart"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-surface-100 text-surface-400 text-xs font-bold cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

