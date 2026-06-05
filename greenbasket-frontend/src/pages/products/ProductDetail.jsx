import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, Minus, Plus, Leaf, Star, Shield, Truck,
  Store, Package, ChevronLeft, ChevronRight,
  Info, MessageSquare, Award, LeafyGreen, Sparkles,
  ArrowLeft, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { productApi } from '@/api/products'
import { reviewApi } from '@/api/reviews'
import { ProductDetailSkeleton } from '@/components/common/Skeleton'
import { formatCurrency, getImageUrl } from '@/utils/helpers'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { ROLES } from '@/utils/constants'
import { ReviewsSection } from '@/components/reviews/ReviewsSection'
import { StarRating } from '@/components/reviews/StarRating'
import { ProductCard } from '@/components/common/ProductCard'

export function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, hasRole } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [zoomActive, setZoomActive] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [similarCategory, setSimilarCategory] = useState([])
  const [similarFarmer, setSimilarFarmer] = useState([])
  const [similarLoading, setSimilarLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 })
  const [reviews, setReviews] = useState([])

  const imageContainerRef = useRef(null)
  const thumbnailContainerRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setSimilarLoading(true)
    setQuantity(1)
    setActiveTab('description')

    productApi.getBySlug(slug)
      .then(({ data }) => {
        const p = data.data
        setProduct(p)
        setSelectedImage(p.imageUrl)
        window.scrollTo({ top: 0, behavior: 'smooth' })

        if (p?.id) {
          reviewApi.getReviewStats(p.id)
            .then(({ data: s }) => setReviewStats(s.data || { averageRating: 0, reviewCount: 0 }))
            .catch(() => {})

          reviewApi.getProductReviews(p.id)
            .then(({ data: r }) => setReviews(r.data || []))
            .catch(() => {})

          const catId = p.category?.id || p.category?.categoryId
          if (catId) {
            productApi.getAll({ categoryId: catId, page: 0, size: 10 })
              .then(({ data: res }) => {
                const items = res.data?.content || res.data || []
                setSimilarCategory(items.filter((item) => item.id !== p.id).slice(0, 6))
              })
              .catch(() => {})
          }

          if (p.seller?.id) {
            productApi.getAll({ sellerId: p.seller.id, page: 0, size: 10 })
              .then(({ data: res }) => {
                const items = res.data?.content || res.data || []
                setSimilarFarmer(items.filter((item) => item.id !== p.id).slice(0, 6))
              })
              .catch(() => {})
          }
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => { setLoading(false); setSimilarLoading(false) })
  }, [slug])

  const ratingBreakdown = useCallback(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      const star = Math.round(r.rating)
      if (star >= 1 && star <= 5) counts[star]++
    })
    const total = reviews.length || 1
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percentage: (counts[star] / total) * 100,
    }))
  }, [reviews])

  const images = [
    product?.imageUrl,
    ...(product?.images?.map((i) => i.imageUrl) || []),
  ].filter(Boolean)

  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.error('Please sign in first')
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      toast.success(`Added ${quantity} item(s) to cart!`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) return toast.error('Please sign in first')
    setBuying(true)
    try {
      await addToCart(product.id, quantity)
      navigate('/cart')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBuying(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) return toast.error('Please sign in first')
    try {
      const { wishlistApi } = await import('@/api/wishlist')
      await wishlistApi.add(product.id)
      toast.success('Added to wishlist!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const scrollThumbnails = (direction) => {
    if (thumbnailContainerRef.current) {
      const scrollAmount = 100
      thumbnailContainerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const isCustomer = isAuthenticated && hasRole(ROLES.CUSTOMER)
  const isOutOfStock = product && !product.isAvailable

  if (loading) return <ProductDetailSkeleton />
  if (!product) {
    return (
      <div className="page-container py-16 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100 mx-auto mb-5">
          <Package className="h-10 w-10 text-surface-300" />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Product Not Found</h2>
        <p className="mt-1.5 text-surface-500 max-w-sm mx-auto">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products" className="btn-primary mt-6 inline-flex items-center gap-2 shadow-button">
          <ArrowLeft className="h-4 w-4" /> Browse Products
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'description', label: 'Description', icon: Info },
    { id: 'additional', label: 'Additional Info', icon: Award },
    { id: 'reviews', label: `Reviews (${reviewStats.reviewCount || 0})`, icon: MessageSquare },
  ]

  const trustItems = [
    { icon: LeafyGreen, label: 'Farm Fresh', desc: 'Direct from farmers', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Truck, label: 'Fast Delivery', desc: 'On orders above Rs. 500', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Shield, label: 'Quality Assured', desc: '100% satisfaction', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Star, label: 'Top Rated', desc: `${reviewStats.averageRating || 0} avg. rating`, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="page-container py-4 sm:py-6 lg:py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-surface-500 overflow-x-auto pb-1">
        <Link to="/" className="whitespace-nowrap hover:text-primary-600 transition-colors font-medium">Home</Link>
        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-surface-300 shrink-0" />
        <Link to="/products" className="whitespace-nowrap hover:text-primary-600 transition-colors font-medium">Products</Link>
        {product.category?.name && (
          <>
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-surface-300 shrink-0" />
            <Link
              to={`/products?category=${product.category.slug || product.category.id}`}
              className="whitespace-nowrap hover:text-primary-600 capitalize transition-colors font-medium"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-surface-300 shrink-0" />
        <span className="text-surface-900 font-semibold truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
        {/* Left: Image Gallery */}
        <div>
          <div
            ref={imageContainerRef}
            className="relative aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl bg-surface-100 border border-surface-200 shadow-card-hover group cursor-crosshair"
            onMouseMove={handleZoom}
            onMouseEnter={() => setZoomActive(true)}
            onMouseLeave={() => setZoomActive(false)}
            role="img"
            aria-label={`Image of ${product.name}`}
          >
            <img
              src={getImageUrl(selectedImage)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 ease-out will-change-transform"
              style={{
                transform: zoomActive ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=No+Image'
              }}
            />
            {zoomActive && (
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none transition-opacity duration-200"
                aria-hidden="true"
              />
            )}
            {product.isOrganic && (
              <span className="absolute left-2 sm:left-3 top-2 sm:top-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-emerald-600/90 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-sm shadow-lg ring-1 ring-white/20">
                <Leaf className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Organic
              </span>
            )}
            {product.featured && (
              <span className="absolute left-2 sm:left-3 top-10 sm:top-12 inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-amber-500/90 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-sm shadow-lg ring-1 ring-white/20">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Featured
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="absolute right-2 sm:right-3 top-2 sm:top-3 inline-flex items-center rounded-full bg-accent-500/90 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-900/60 backdrop-blur-[2px] z-10">
                <span className="rounded-xl bg-white px-5 py-2.5 text-base font-bold text-surface-900 shadow-xl">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 sm:mt-4 relative">
              {images.length > 4 && (
                <button
                  onClick={() => scrollThumbnails(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md text-surface-600 hover:text-surface-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 -ml-3"
                  aria-label="Previous thumbnails"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <div
                ref={thumbnailContainerRef}
                className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scroll-smooth"
                role="tablist"
                aria-label="Product image thumbnails"
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    role="tab"
                    aria-selected={img === selectedImage}
                    aria-label={`View image ${idx + 1}`}
                    className={`h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                      img === selectedImage
                        ? 'border-primary-600 ring-2 ring-primary-200 ring-offset-2 shadow-md scale-105'
                        : 'border-surface-200 hover:border-surface-400 hover:shadow-sm opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  </button>
                ))}
              </div>
              {images.length > 4 && (
                <button
                  onClick={() => scrollThumbnails(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md text-surface-600 hover:text-surface-900 hover:bg-white transition-all opacity-0 group-hover:opacity-100 -mr-3"
                  aria-label="Next thumbnails"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              {/* Image counter */}
              <div className="mt-2 text-center">
                <span className="text-xs text-surface-400 font-medium">
                  {images.indexOf(selectedImage) + 1} / {images.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Info Panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Category + Farmer */}
          <div className="flex flex-wrap items-center gap-2 text-sm mb-2 sm:mb-3">
            {product.category?.name && (
              <Link
                to={`/products?category=${product.category.slug || product.category.id}`}
                className="badge-primary capitalize hover:bg-primary-100 transition-colors text-xs"
              >
                {product.category.name}
              </Link>
            )}
            {product.seller?.fullName && (
              <span className="inline-flex items-center gap-1.5 text-xs text-surface-500 bg-surface-100 rounded-full px-2.5 py-1">
                <Store className="h-3 w-3" />
                by <span className="font-semibold text-surface-700">{product.seller.fullName}</span>
              </span>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-surface-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-2 sm:mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <StarRating value={Math.round(reviewStats.averageRating)} size="sm" interactive={false} />
              <span className="text-sm font-bold text-surface-900">
                {reviewStats.averageRating || '-'}
              </span>
            </div>
            <span className="text-sm text-surface-400">
              ({reviewStats.reviewCount} {reviewStats.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
            {reviewStats.reviewCount > 0 && (
              <button
                onClick={() => {
                  const tabEl = document.getElementById('tab-reviews')
                  if (tabEl) { setActiveTab('reviews'); setTimeout(() => tabEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors ml-1"
              >
                See reviews
              </button>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 sm:mt-5 flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <span className="text-sm sm:text-base text-surface-400 font-medium">
              /{product.unit || 'kg'}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-base sm:text-lg text-surface-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save {formatCurrency(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Stock Status + Badges */}
          <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-3.5 py-1.5 text-xs font-medium transition-all ${
              isOutOfStock ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            }`}>
              <span className={`inline-block h-2 w-2 rounded-full ${isOutOfStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock || product.availableStock || 0} available)`}
            </div>
            {product.isOrganic && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 sm:px-3.5 py-1.5 text-xs font-medium text-primary-700 ring-1 ring-primary-200">
                <Leaf className="h-3 w-3" /> Certified Organic
              </span>
            )}
            {product.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 sm:px-3.5 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
            {trustItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-surface-200 bg-white p-2.5 sm:p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-surface-300 hover:-translate-y-0.5"
              >
                <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-surface-900 truncate">{item.label}</p>
                  <p className="text-[10px] sm:text-xs text-surface-500 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-5 sm:my-6" />

          {/* Quantity + CTA */}
          {!isOutOfStock && (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-sm font-semibold text-surface-700">Quantity:</span>
                <div className="flex items-center rounded-full border-2 border-surface-200 bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-surface-500 hover:text-surface-700 hover:bg-surface-50 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <span
                    className="flex w-12 sm:w-14 items-center justify-center text-center text-base sm:text-lg font-bold text-surface-900 select-none tabular-nums"
                    aria-live="polite"
                    aria-label={`Quantity: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-surface-500 hover:text-surface-700 hover:bg-surface-50 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity >= (product.stock || 99)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-surface-400">
                  (<span className="font-medium text-surface-600">{product.stock || 99}</span> available)
                </span>
              </div>

              <div className="flex gap-2 sm:gap-3">
                {isCustomer && (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="btn-primary flex-1 py-3 sm:py-3.5 text-sm sm:text-base shadow-button gap-1.5 sm:gap-2 disabled:opacity-70 transition-all duration-200 active:scale-[0.98] hover:shadow-lg"
                    >
                      {adding ? (
                        <>
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Add to Cart — <span className="font-bold">{formatCurrency(product.price * quantity)}</span></span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={buying}
                      className="btn-accent flex-1 py-3 sm:py-3.5 text-sm sm:text-base shadow-button gap-1.5 sm:gap-2 disabled:opacity-70 transition-all duration-200 active:scale-[0.98] hover:shadow-lg"
                    >
                      {buying ? (
                        <>
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Buy Now</span>
                        </>
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={handleAddToWishlist}
                  className="btn-secondary px-3 sm:px-4 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-200 active:scale-95"
                  title="Add to Wishlist"
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs sm:text-sm text-surface-400 text-center">
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">Sign in</Link> to add items to your cart
                </p>
              )}
            </div>
          )}

          {isOutOfStock && (
            <div className="rounded-xl bg-surface-50 border border-surface-200 p-4 sm:p-5 text-center">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-surface-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-surface-700">This product is currently unavailable</p>
              <p className="text-xs text-surface-500 mt-1">Check back later or browse similar products below</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-10 sm:mt-14">
        <div className="border-b border-surface-200" role="tablist" aria-label="Product information tabs">
          <div className="flex gap-0 sm:gap-1 overflow-x-auto -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                    isActive
                      ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                      : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-primary-600' : ''}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Panels */}
        <div className="mt-5 sm:mt-6">
          {/* Description Panel */}
          {activeTab === 'description' && (
            <div
              id="panel-description"
              role="tabpanel"
              aria-labelledby="tab-description"
              className="animate-fade-in"
            >
              <div className="prose prose-sm sm:prose max-w-none">
                {product.description ? (
                  <div className="text-sm sm:text-base text-surface-600 leading-relaxed space-y-3">
                    <p>{product.description}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-surface-200 bg-gradient-to-b from-white to-surface-50">
                    <Info className="h-10 w-10 text-surface-300 mb-3" />
                    <p className="text-sm font-semibold text-surface-900">No description available</p>
                    <p className="text-xs text-surface-500 mt-1">We're updating this product's details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Info Panel */}
          {activeTab === 'additional' && (
            <div
              id="panel-additional"
              role="tabpanel"
              aria-labelledby="tab-additional"
              className="animate-fade-in"
            >
              <div className="rounded-xl sm:rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: 'Product Name', value: product.name },
                      { label: 'Category', value: product.category?.name || 'N/A' },
                      { label: 'Farmer', value: product.seller?.fullName || 'N/A' },
                      { label: 'Price', value: formatCurrency(product.price) },
                      { label: 'Unit', value: product.unit || 'kg' },
                      { label: 'Stock Status', value: isOutOfStock ? 'Out of Stock' : `${product.stock || product.availableStock || 0} available` },
                      { label: 'Type', value: product.isOrganic ? 'Certified Organic' : 'Conventional' },
                      { label: 'Availability', value: product.isAvailable ? 'Available' : 'Unavailable' },
                    ].map((row, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-surface-50/50' : 'bg-white'}`}>
                        <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-surface-500 font-medium whitespace-nowrap w-1/3">{row.label}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-surface-900 font-semibold">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Panel */}
          {activeTab === 'reviews' && (
            <div
              id="panel-reviews"
              role="tabpanel"
              aria-labelledby="tab-reviews"
              className="animate-fade-in"
            >
              {/* Rating Summary + Breakdown */}
              {reviewStats.reviewCount > 0 && (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mb-6 sm:mb-8">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-4xl sm:text-5xl font-bold text-surface-900">{reviewStats.averageRating}</span>
                      <span className="text-sm text-surface-400">/ 5</span>
                    </div>
                    <StarRating value={Math.round(reviewStats.averageRating)} size="md" interactive={false} />
                    <p className="text-sm text-surface-500 mt-2 font-medium">
                      {reviewStats.reviewCount} {reviewStats.reviewCount === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {ratingBreakdown().map(({ star, count, percentage }) => (
                      <div key={star} className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-medium text-surface-600 w-6 sm:w-8 text-right">{star}</span>
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 h-2 sm:h-2.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out-expo"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-surface-500 w-8 sm:w-10 text-right font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ReviewsSection in compact mode (no header) */}
              <ReviewsSection productId={product.id} compact />
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {!similarLoading && (similarCategory.length > 0 || similarFarmer.length > 0) && (
        <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-10">
          {similarCategory.length > 0 && (
            <section aria-label={`More from ${product.category?.name}`}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                    <Store className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-surface-900">
                      More in {product.category?.name || 'this category'}
                    </h2>
                    <p className="text-xs text-surface-400">Similar products you might like</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 -mx-1 px-1 scroll-smooth snap-x snap-mandatory">
                {similarCategory.map((item) => (
                  <div key={item.id} className="w-48 sm:w-56 shrink-0 snap-start">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {similarFarmer.length > 0 && (
            <section aria-label={`More from ${product.seller?.fullName}`}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <LeafyGreen className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-surface-900">
                      More from {product.seller?.fullName || 'this farmer'}
                    </h2>
                    <p className="text-xs text-surface-400">Farm fresh products from the same source</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 -mx-1 px-1 scroll-smooth snap-x snap-mandatory">
                {similarFarmer.map((item) => (
                  <div key={item.id} className="w-48 sm:w-56 shrink-0 snap-start">
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Mobile Sticky CTA */}
      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-slide-up">
          <div className="bg-white border-t border-surface-200 shadow-modal px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-surface-900">{formatCurrency(product.price * quantity)}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-surface-400 line-through">{formatCurrency(product.compareAtPrice * quantity)}</span>
                  )}
                </div>
                <p className="text-xs text-surface-400">/{product.unit || 'kg'}</p>
              </div>
              <div className="flex items-center rounded-full border-2 border-surface-200 bg-white shadow-sm shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center text-surface-500 hover:text-surface-700 rounded-full transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="flex w-10 items-center justify-center text-center text-sm font-bold text-surface-900 select-none tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="flex h-8 w-8 items-center justify-center text-surface-500 hover:text-surface-700 rounded-full transition-colors disabled:opacity-40"
                  disabled={quantity >= (product.stock || 99)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {isCustomer && (
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn-primary py-2.5 sm:py-3 px-4 sm:px-5 text-sm shadow-button gap-1.5 whitespace-nowrap disabled:opacity-70 active:scale-[0.98] transition-all duration-200"
                >
                  {adding ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add
                    </>
                  )}
                </button>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="btn-primary py-2.5 px-4 text-sm shadow-button whitespace-nowrap">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile sticky CTA */}
      {!isOutOfStock && (
        <div className="h-16 sm:h-[72px] lg:hidden" aria-hidden="true" />
      )}
    </div>
  )
}
