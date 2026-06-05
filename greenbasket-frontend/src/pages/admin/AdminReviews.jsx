import { useState, useEffect } from 'react'
import { Star, MessageSquare, EyeOff, Eye, Trash2, Search, ChevronDown, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewApi } from '@/api/reviews'
import { Pagination } from '@/components/common/Pagination'
import { StarRating } from '@/components/reviews/StarRating'
import { formatDate, formatDateTime } from '@/utils/helpers'

const FILTER_TABS = [
  { key: '', label: 'All Reviews' },
  { key: 'visible', label: 'Visible' },
  { key: 'hidden', label: 'Hidden' },
]

export function AdminReviews() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)

  const fetchReviews = () => {
    setLoading(true)
    const params = { page, size: 15, sort: 'createdAt,desc' }
    if (filter === 'visible') params.isVisible = true
    else if (filter === 'hidden') params.isVisible = false
    if (search) params.search = search
    reviewApi.adminGetAll(params)
      .then(({ data: res }) => setData(res.data || res))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [page, filter])

  const handleSearch = () => {
    setPage(0)
    fetchReviews()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return
    try {
      await reviewApi.delete(id)
      toast.success('Review deleted')
      fetchReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleHide = async (id) => {
    try {
      await reviewApi.hide(id)
      toast.success('Review hidden')
      fetchReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleShow = async (id) => {
    try {
      await reviewApi.show(id)
      toast.success('Review visible')
      fetchReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const items = data.content || []
  const totalCount = data.totalElements || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-surface-900">Reviews Management</h2>
          <p className="text-sm text-surface-500 mt-0.5">{totalCount} total reviews</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setFilter(t.key); setPage(0) }}
              className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                filter === t.key
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by product or customer..."
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="skeleton animate-shimmer h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton animate-shimmer h-4 w-48" />
                  <div className="skeleton animate-shimmer h-3 w-32" />
                  <div className="skeleton animate-shimmer h-3 w-full" />
                </div>
                <div className="skeleton animate-shimmer h-8 w-20 rounded-lg shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 bg-white py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 mb-3">
            <MessageSquare className="h-8 w-8 text-surface-300" />
          </div>
          <h3 className="text-base font-semibold text-surface-900">No reviews found</h3>
          <p className="text-sm text-surface-500 mt-1">
            {search ? 'Try a different search term' : 'No reviews match this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((review) => {
            const initials = review.customer?.fullName
              ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
            return (
              <div
                key={review.id}
                className={`card overflow-hidden transition-all hover:shadow-card-hover ${
                  !review.isVisible ? 'border-red-200 bg-red-50/30' : ''
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset ${
                      ['bg-primary-100 text-primary-700 ring-primary-200', 'bg-amber-100 text-amber-700 ring-amber-200', 'bg-blue-100 text-blue-700 ring-blue-200'][review.id % 3]
                    }`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-surface-900">
                              {review.customer?.fullName || 'Anonymous'}
                            </p>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                              <ShieldCheck className="h-2.5 w-2.5" /> Verified
                            </span>
                            {!review.isVisible && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                                <EyeOff className="h-2.5 w-2.5" /> Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating value={review.rating} size="sm" interactive={false} />
                            <span className="text-xs text-surface-400">{formatDate(review.createdAt, 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <div className="sm:ml-auto flex items-center gap-1.5 shrink-0">
                          {review.isVisible ? (
                            <button onClick={() => handleHide(review.id)} className="btn-icon text-surface-400 hover:text-amber-600 hover:bg-amber-50" title="Hide">
                              <EyeOff className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => handleShow(review.id)} className="btn-icon text-surface-400 hover:text-emerald-600 hover:bg-emerald-50" title="Show">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(review.id)} className="btn-icon text-surface-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-surface-600 bg-surface-50 rounded-lg p-3 border border-surface-100 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      {review.productName && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-surface-500">
                          <Star className="h-3 w-3" /> Product: <span className="font-semibold text-surface-700">{review.productName}</span>
                          {review.productId && <span className="text-surface-400">(ID: {review.productId})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {data.totalPages > 1 && (
            <Pagination
              page={data.pageNumber || data.page || 0}
              totalPages={data.totalPages}
              totalElements={totalCount}
              size={15}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
