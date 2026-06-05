import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Search, Package, Leaf, Eye, Edit3, Trash2, ToggleLeft, ToggleRight,
  LayoutGrid, Star, TrendingUp, AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminUserApi } from '@/api/users'
import { Pagination } from '@/components/common/Pagination'
import { formatCurrency, getImageUrl } from '@/utils/helpers'

function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-surface-200/80 p-5 shadow-sm transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.07]`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-surface-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      active
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
        : 'bg-surface-100 text-surface-500 ring-1 ring-inset ring-surface-300/30'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-surface-400'}`} />
      {active ? 'Published' : 'Draft'}
    </span>
  )
}

function FeaturedBadge({ featured }) {
  if (!featured) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-2xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200/50">
      <Star className="h-2.5 w-2.5" />
      Featured
    </span>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return <span className="badge-danger text-2xs px-1.5 py-0.5">Out of stock</span>
  }
  if (stock <= 5) {
    return <span className="badge-warning text-2xs px-1.5 py-0.5">Low: {stock}</span>
  }
  return <span className="text-sm font-medium text-surface-700">{stock}</span>
}

export function AdminProducts() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState('')
  const [sort, setSort] = useState('createdAt,desc')

  const fetchProducts = () => {
    setLoading(true)
    const params = { page, size: 15, sort }
    if (search) params.search = search
    import('@/api/products').then(({ productApi }) =>
      productApi.getAll(params)
        .then(({ data: res }) => setData(res.data || res))
        .catch(() => toast.error('Failed to load'))
        .finally(() => setLoading(false))
    )
  }

  useEffect(() => { fetchProducts() }, [page, search, sort])

  const stats = useMemo(() => {
    const items = data.content || []
    return {
      total: data.totalElements || 0,
      active: items.filter((p) => p.active || p.isActive).length,
      outOfStock: items.filter((p) => (p.stock ?? 0) === 0).length,
      featured: items.filter((p) => p.featured || p.isFeatured).length,
    }
  }, [data])

  const handleToggleActive = async (id, current) => {
    try {
      if (current) await adminUserApi.deactivateProduct(id)
      else await adminUserApi.activateProduct(id)
      toast.success('Product updated')
      setData((prev) => ({
        ...prev,
        content: prev.content.map((p) =>
          p.id === id ? { ...p, active: !current, isActive: !current } : p
        ),
      }))
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleFeatured = async (id) => {
    try {
      await adminUserApi.toggleFeatured(id)
      toast.success('Featured toggled')
      fetchProducts()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      const { productApi } = await import('@/api/products')
      await productApi.delete(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) { toast.error(err.message) }
  }

  const filtered = useMemo(() => {
    let items = data.content || []
    if (categoryFilter) {
      items = items.filter((p) => String(p.category?.id) === categoryFilter || p.category?.name === categoryFilter)
    }
    if (availabilityFilter === 'in_stock') items = items.filter((p) => (p.stock ?? 0) > 0)
    if (availabilityFilter === 'out_of_stock') items = items.filter((p) => (p.stock ?? 0) === 0)
    if (featuredFilter === 'featured') items = items.filter((p) => p.featured || p.isFeatured)
    if (featuredFilter === 'not_featured') items = items.filter((p) => !p.featured && !p.isFeatured)
    return items
  }, [data, categoryFilter, availabilityFilter, featuredFilter])

  const categories = useMemo(() => {
    const seen = new Set()
    return (data.content || []).reduce((acc, p) => {
      const key = p.category?.id || p.category?.name
      if (key && !seen.has(key)) {
        seen.add(key)
        acc.push(p.category)
      }
      return acc
    }, [])
  }, [data])

  const SORT_OPTIONS = [
    { value: 'createdAt,desc', label: 'Newest First' },
    { value: 'name,asc', label: 'Name A-Z' },
    { value: 'price,asc', label: 'Price Low-High' },
    { value: 'price,desc', label: 'Price High-Low' },
    { value: 'soldCount,desc', label: 'Best Selling' },
  ]

  if (loading && !data.content.length) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="skeleton h-7 w-32 rounded-lg" />
            <div className="skeleton h-4 w-24 rounded-md" />
          </div>
          <div className="skeleton h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Products</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {data.totalElements || 0} product{(data.totalElements || 0) !== 1 ? 's' : ''} in your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success('Import feature coming soon')}
            className="btn-secondary text-sm px-4 py-2.5 rounded-xl"
          >
            <TrendingUp className="mr-1.5 h-4 w-4" />
            Import
          </button>
          <Link to="/admin/products/new" className="btn-primary text-sm px-5 py-2.5 rounded-xl shadow-button hover:shadow-lg transition-all">
            <Plus className="mr-1.5 h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard icon={Package} label="Total" value={stats.total} color="bg-primary-50 text-primary-600" gradient="from-primary-500 to-emerald-500" />
        <StatCard icon={LayoutGrid} label="Published" value={stats.active} color="bg-emerald-50 text-emerald-600" gradient="from-emerald-500 to-green-500" />
        <StatCard icon={AlertTriangle} label="Out of Stock" value={stats.outOfStock} color="bg-red-50 text-red-600" gradient="from-red-500 to-rose-500" />
        <StatCard icon={Star} label="Featured" value={stats.featured} color="bg-amber-50 text-amber-600" gradient="from-amber-500 to-orange-500" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white border border-surface-200/80 p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search products..."
            className="input-field pl-10 w-full text-sm rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field text-sm min-w-[130px] rounded-xl"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.id || cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="input-field text-sm min-w-[120px] rounded-xl"
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="input-field text-sm min-w-[120px] rounded-xl"
          >
            <option value="">All Items</option>
            <option value="featured">Featured</option>
            <option value="not_featured">Not Featured</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0) }}
            className="input-field text-sm min-w-[140px] rounded-xl"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-200 bg-gradient-to-b from-white to-surface-50 py-24">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-100 mb-5 shadow-inner">
            <Package className="h-10 w-10 text-surface-300" />
          </div>
          <h3 className="text-xl font-bold text-surface-900">No products found</h3>
          <p className="mt-1 text-sm text-surface-500 max-w-sm text-center">
            {search || categoryFilter || availabilityFilter || featuredFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first product'}
          </p>
          <Link to="/admin/products/new" className="btn-primary mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl shadow-button hover:shadow-lg transition-all">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50/80">
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm">Product</th>
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm hidden md:table-cell">Category</th>
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm hidden lg:table-cell">Farmer</th>
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm">Price</th>
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm">Stock</th>
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm hidden sm:table-cell">Status</th>
                  <th className="sticky top-0 z-10 bg-surface-50/80 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-surface-500 backdrop-blur-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="group transition-all duration-200 hover:bg-surface-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100 border border-surface-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-surface-300">
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-surface-900 truncate max-w-[200px]">{product.name}</p>
                            <FeaturedBadge featured={product.featured || product.isFeatured} />
                          </div>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {product.seller?.fullName || 'N/A'}
                            <span className="sm:hidden"> · {product.category?.name || 'N/A'}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-surface-600 bg-surface-50 rounded-lg px-2.5 py-1">
                        {product.isOrganic && <Leaf className="h-3 w-3 text-primary-500" />}
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-surface-600">{product.seller?.fullName || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-surface-900">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StockBadge stock={product.stock ?? 0} />
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <StatusBadge active={product.active ?? product.isActive} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          to={`/products/${product.slug}`}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-surface-400 hover:bg-primary-50 hover:text-primary-600 transition-all"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleActive(product.id, product.active ?? product.isActive)}
                          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-all ${
                            (product.active ?? product.isActive)
                              ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
                              : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                          title={(product.active ?? product.isActive) ? 'Deactivate' : 'Activate'}
                        >
                          {(product.active ?? product.isActive) ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(product.id)}
                          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-all ${
                            (product.featured || product.isFeatured)
                              ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
                              : 'text-surface-400 hover:bg-surface-100 hover:text-surface-600'
                          }`}
                          title={(product.featured || product.isFeatured) ? 'Remove Featured' : 'Mark Featured'}
                        >
                          <Star className={`h-4 w-4 ${(product.featured || product.isFeatured) ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">
          Showing {filtered.length} of {data.totalElements || 0} products
        </p>
        <Pagination
          page={data.pageNumber || data.page || 0}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={15}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
