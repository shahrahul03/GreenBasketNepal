import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Edit, Eye, Trash2, Search, Package, Leaf, ToggleLeft, ToggleRight,
  SlidersHorizontal, X, AlertTriangle, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { farmerApi } from '@/api/farmer'
import { Pagination } from '@/components/common/Pagination'
import { formatCurrency, getImageUrl } from '@/utils/helpers'

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Low Stock', value: 'lowStock' },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt,desc' },
  { label: 'Oldest', value: 'createdAt,asc' },
  { label: 'Price: Low to High', value: 'price,asc' },
  { label: 'Price: High to Low', value: 'price,desc' },
  { label: 'Name: A to Z', value: 'name,asc' },
  { label: 'Name: Z to A', value: 'name,desc' },
]

function ProductCard({ product, onToggle, onDelete }) {
  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = !product.isAvailable || product.stock === 0
  const stockPercent = Math.min(((product.stock || 0) / 20) * 100, 100)

  return (
    <div className="card-hover group overflow-hidden">
      <div className="relative aspect-[4/3] bg-surface-100 overflow-hidden">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=N/A' }}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {product.isOrganic && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-emerald-700 shadow-sm">
              <Leaf className="h-2.5 w-2.5" /> Organic
            </span>
          )}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/products/${product.slug}`}
            className="flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-surface-700 shadow-sm hover:bg-white transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-900 truncate">{product.name}</p>
            <p className="text-xs text-surface-500 mt-0.5">{product.category?.name || 'General'}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium flex-shrink-0 ${
            product.isAvailable
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-surface-100 text-surface-500'
          }`}>
            {product.isAvailable ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-surface-900">{formatCurrency(product.price)}</span>
          {isOutOfStock ? (
            <span className="text-[10px] font-medium text-red-600 flex items-center gap-0.5">
              <AlertTriangle className="h-3 w-3" /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-medium text-amber-600">{product.stock} left</span>
          ) : (
            <span className="text-[10px] font-medium text-surface-500">{product.stock} in stock</span>
          )}
        </div>

        {!isOutOfStock && (
          <div className="w-full bg-surface-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                isLowStock ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${stockPercent}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-surface-100">
          <button
            onClick={() => onToggle(product)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              product.isAvailable
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {product.isAvailable ? (
              <><ToggleRight className="h-3.5 w-3.5" /> Deactivate</>
            ) : (
              <><ToggleLeft className="h-3.5 w-3.5" /> Activate</>
            )}
          </button>
          <div className="flex items-center gap-1">
            <Link
              to={`/farmer/products/${product.slug}/edit`}
              className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => onDelete(product.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="card-hover overflow-hidden">
      <div className="aspect-[4/3] skeleton animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="skeleton animate-shimmer h-4 w-3/4" />
            <div className="skeleton animate-shimmer h-3 w-1/2" />
          </div>
          <div className="skeleton animate-shimmer h-5 w-14 rounded-full shrink-0" />
        </div>
        <div className="flex items-center justify-between">
          <div className="skeleton animate-shimmer h-6 w-20" />
          <div className="skeleton animate-shimmer h-3 w-16" />
        </div>
        <div className="skeleton animate-shimmer h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between pt-1 border-t border-surface-100">
          <div className="skeleton animate-shimmer h-7 w-24 rounded-lg" />
          <div className="flex gap-1">
            <div className="skeleton animate-shimmer h-7 w-7 rounded-md" />
            <div className="skeleton animate-shimmer h-7 w-7 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FarmerProducts() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('createdAt,desc')

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = { page, size: 12, sort }
    if (search) params.search = search
    if (statusFilter === 'active') params.isAvailable = true
    else if (statusFilter === 'inactive') params.isAvailable = false
    else if (statusFilter === 'lowStock') params.lowStock = true
    farmerApi.getProducts(params)
      .then(({ data: res }) => setData(res.data || res))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter, sort])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      const { productApi } = await import('@/api/products')
      await productApi.delete(id)
      toast.success('Product deleted')
      setData((prev) => ({ ...prev, content: prev.content.filter((p) => p.id !== id), totalElements: prev.totalElements - 1 }))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleAvailability = async (product) => {
    try {
      const { productApi } = await import('@/api/products')
      await productApi.update(product.id, { isAvailable: !product.isAvailable })
      toast.success(product.isAvailable ? 'Product deactivated' : 'Product activated')
      setData((prev) => ({
        ...prev,
        content: prev.content.map((p) =>
          p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p
        ),
      }))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const totalCount = data.totalElements ?? data.content?.length ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-surface-900">My Products</h2>
          <p className="text-sm text-surface-500 mt-1">Manage your product inventory</p>
        </div>
        <Link to="/farmer/products/new" className="btn-primary inline-flex items-center shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field appearance-none pr-8 text-sm cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400 pointer-events-none" />
          </div>
          <p className="text-sm text-surface-500 whitespace-nowrap">{totalCount} product{totalCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {opt.value === 'lowStock' && <AlertTriangle className="h-3 w-3" />}
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : data.content?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white py-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100">
            <Package className="h-8 w-8 text-surface-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-surface-900">No products yet</h3>
          <p className="mt-1 text-sm text-surface-500">Add your first product to start selling</p>
          <Link to="/farmer/products/new" className="btn-primary mt-6 inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggle={handleToggleAvailability}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination
              page={data.pageNumber ?? data.page ?? 0}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              size={12}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
