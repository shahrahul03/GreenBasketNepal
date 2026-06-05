import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { wishlistApi } from '@/api/wishlist'
import { PageLoader } from '@/components/common/Loader'
import { useCart } from '@/hooks/useCart'
import { formatCurrency, getImageUrl } from '@/utils/helpers'

export function Wishlist() {
  const { addToCart } = useCart()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistApi.getAll()
      .then(({ data }) => setItems(data.data?.content || data.data || []))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false))
  }, [])

  const removeItem = async (id) => {
    try {
      await wishlistApi.removeById(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Removed from wishlist')
    } catch (err) { toast.error(err.message) }
  }

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1)
      toast.success('Added to cart!')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <PageLoader />

  const products = items.map((i) => i.product || i)

  return (
    <div className="page-container py-6 lg:py-8 animate-fade-in">
      <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="text-surface-300">/</span>
        <span className="text-surface-900 font-medium">My Wishlist</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">My Wishlist</h1>
          <p className="mt-1 text-sm text-surface-500">{products.length} {products.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        {products.length > 0 && (
          <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-white py-24 px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-primary-100 mb-6">
            <Heart className="h-10 w-10 text-primary-300" />
          </div>
          <h3 className="text-xl font-bold text-surface-900">Your wishlist is empty</h3>
          <p className="mt-1.5 text-sm text-surface-500 max-w-sm text-center">Save your favorite products for later and come back when you're ready to order!</p>
          <Link to="/products" className="btn-primary mt-8 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group rounded-2xl bg-white shadow-md shadow-surface-200/50 ring-1 ring-surface-200/50 overflow-hidden hover:shadow-xl hover:shadow-surface-200/70 transition-all duration-300">
              <Link to={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-100">
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={(e) => { e.preventDefault(); removeItem(product.id) }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-white hover:text-red-600 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
              <div className="p-4 lg:p-5">
                <Link to={`/products/${product.slug}`} className="font-semibold text-surface-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm lg:text-base">
                  {product.name}
                </Link>
                <p className="mt-2 text-lg lg:text-xl font-bold text-surface-900">{formatCurrency(product.price)}</p>
                <button onClick={() => handleAddToCart(product.id)} className="btn-primary mt-4 w-full text-sm py-2.5 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300">
                  <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
