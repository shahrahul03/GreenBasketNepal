import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Grid3X3, List, ChevronDown, Leaf, Package, RotateCcw } from 'lucide-react'
import { productApi } from '@/api/products'
import { categoryApi } from '@/api/categories'
import { ProductCard } from '@/components/common/ProductCard'
import { ProductCardSkeleton } from '@/components/common/Skeleton'
import { Loader } from '@/components/common/Loader'
import { Pagination } from '@/components/common/Pagination'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'name,asc', label: 'Name: A-Z' },
  { value: 'soldCount,desc', label: 'Best Selling' },
]

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [mobileFilters, setMobileFilters] = useState(false)

  const params = useMemo(() => ({
    page: parseInt(searchParams.get('page') || '0'),
    size: parseInt(searchParams.get('size') || '12'),
    sort: searchParams.get('sort') || 'createdAt,desc',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isOrganic: searchParams.get('isOrganic') || '',
    isAvailable: searchParams.get('isAvailable') || 'true',
  }), [searchParams])

  useEffect(() => {
    categoryApi.getAll({ page: 0, size: 50 })
      .then(({ data }) => setCategories(data.data?.content || data.data || []))
      .catch(() => console.warn('[ProductList] Failed to load categories'))
  }, [])

  useEffect(() => {
    setLoading(true)
    const queryParams = { ...params }
    Object.keys(queryParams).forEach((k) => {
      if (!queryParams[k] && queryParams[k] !== 0) delete queryParams[k]
    })
    productApi.getAll(queryParams)
      .then(({ data }) => setProducts(data.data || { content: [], totalElements: 0, totalPages: 0 }))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [params])

  const updateParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.set('page', '0')
      return next
    })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  const hasActiveFilters = params.search || params.category || params.minPrice || params.maxPrice || params.isOrganic || params.isAvailable !== 'true'

  const handleToggleWishlist = async (productId) => {
    try {
      const { wishlistApi } = await import('@/api/wishlist')
      await wishlistApi.add(productId)
      toast.success('Added to wishlist!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const selectedCategory = categories.find((c) => String(c.slug || c.id) === params.category)

  return (
    <div className="page-container py-6 lg:py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-surface-500">
        <a href="/" className="hover:text-primary-600 transition-colors">Home</a>
        <span className="text-surface-300">/</span>
        <span className="text-surface-900 font-medium">{selectedCategory?.name || (params.search ? `Search: "${params.search}"` : 'All Products')}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="card p-5 space-y-6">
              <div>
                <h3 className="heading-xs mb-2.5">
                  <Search className="mr-1.5 inline h-3.5 w-3.5" /> Search
                </h3>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={params.search}
                    onChange={(e) => updateParam('search', e.target.value)}
                    placeholder="Search products..."
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="divider" />

              <div>
                <h3 className="heading-xs mb-2.5">Categories</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      !params.category
                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                    }`}
                  >
                    {!params.category && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                    )}
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('category', cat.slug || cat.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm capitalize transition-all ${
                        String(cat.slug || cat.id) === params.category
                          ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                      }`}
                    >
                      {String(cat.slug || cat.id) === params.category && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      )}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider" />

              <div>
                <h3 className="heading-xs mb-2.5">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={params.minPrice}
                    onChange={(e) => updateParam('minPrice', e.target.value)}
                    className="input-field input-sm w-full"
                    min="0"
                  />
                  <span className="text-surface-300 shrink-0 text-sm">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={params.maxPrice}
                    onChange={(e) => updateParam('maxPrice', e.target.value)}
                    className="input-field input-sm w-full"
                    min="0"
                  />
                </div>
              </div>

              <div className="divider" />

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  params.isOrganic === 'true' ? 'bg-primary-600' : 'bg-surface-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={params.isOrganic === 'true'}
                    onChange={(e) => updateParam('isOrganic', e.target.checked ? 'true' : '')}
                    className="sr-only peer"
                  />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    params.isOrganic === 'true' ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`} />
                </div>
                <span className="flex items-center gap-1.5 text-sm font-medium text-surface-700 group-hover:text-primary-600 transition-colors">
                  <Leaf className="h-4 w-4 text-primary-600" /> Organic Only
                </span>
              </label>

              {hasActiveFilters && (
                <div className="divider" />
              )}

              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="toolbar mb-6">
            <div className="toolbar-left">
              <p className="text-sm text-surface-500">
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-surface-400">
                    <Loader size="sm" /> Loading products...
                  </span>
                ) : (
                  <><span className="font-semibold text-surface-900">{products.totalElements || 0}</span> <span className="text-surface-400">products found</span></>
                )}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-ghost btn-sm text-red-600 hover:bg-red-50 lg:hidden">
                  <X className="mr-1 h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="toolbar-right">
              <button onClick={() => setMobileFilters(true)} className="btn-secondary text-sm lg:hidden">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
              </button>

              <div className="relative">
                <select
                  value={params.sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="input-field pr-9 appearance-none cursor-pointer text-sm min-w-[160px] bg-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              </div>

              <div className="hidden items-center rounded-lg border border-surface-300 bg-white p-0.5 sm:flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-2 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-2 transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-surface-400 hover:text-surface-600'
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.content?.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-200 bg-gradient-to-b from-white to-surface-50 py-24 animate-fade-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-100 mb-5">
                <Package className="h-10 w-10 text-surface-300" />
              </div>
              <h3 className="text-xl font-bold text-surface-900">No products found</h3>
              <p className="mt-1.5 text-sm text-surface-500 max-w-sm text-center">We couldn't find any products matching your criteria. Try adjusting your search or filters.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-primary mt-6 gap-2">
                  <RotateCcw className="h-4 w-4" /> Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'list'
                ? 'grid-cols-1'
                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {products.content.map((product) => (
                <ProductCard key={product.id} product={product} onToggleWishlist={handleToggleWishlist} />
              ))}
            </div>
          )}

          {products.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                page={products.pageNumber || products.page || 0}
                totalPages={products.totalPages}
                totalElements={products.totalElements}
                size={params.size}
                onPageChange={(p) => updateParam('page', String(p))}
              />
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="modal-panel">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900">Filters</h2>
              <button onClick={() => setMobileFilters(false)} className="btn-icon h-8 w-8 text-surface-400 hover:text-surface-600 hover:bg-surface-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-surface-900 mb-2.5">Search</h3>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={params.search}
                    onChange={(e) => updateParam('search', e.target.value)}
                    placeholder="Search products..."
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="divider" />

              <div>
                <h3 className="text-sm font-semibold text-surface-900 mb-2.5">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      !params.category ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('category', cat.slug || cat.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                        String(cat.slug || cat.id) === params.category ? 'bg-primary-600 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider" />

              <div>
                <h3 className="text-sm font-semibold text-surface-900 mb-2.5">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={params.minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} className="input-field input-sm" min="0" />
                  <span className="text-surface-300 shrink-0">—</span>
                  <input type="number" placeholder="Max" value={params.maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} className="input-field input-sm" min="0" />
                </div>
              </div>

              <div className="divider" />

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  params.isOrganic === 'true' ? 'bg-primary-600' : 'bg-surface-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={params.isOrganic === 'true'}
                    onChange={(e) => updateParam('isOrganic', e.target.checked ? 'true' : '')}
                    className="sr-only peer"
                  />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    params.isOrganic === 'true' ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`} />
                </div>
                <span className="flex items-center gap-1.5 text-sm font-medium text-surface-700">
                  <Leaf className="h-4 w-4 text-primary-600" /> Organic Only
                </span>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setMobileFilters(false)} className="btn-primary flex-1 py-3 shadow-button">
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary flex-1 py-3">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
