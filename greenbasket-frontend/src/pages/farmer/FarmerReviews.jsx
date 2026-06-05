import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MessageSquare, EyeOff, Eye, Package, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewApi } from '@/api/reviews'
import { Pagination } from '@/components/common/Pagination'
import { PageLoader } from '@/components/common/Loader'
import { StarRating } from '@/components/reviews/StarRating'
import { formatDate, formatCurrency } from '@/utils/helpers'

export function FarmerReviews() {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  const fetchReviews = () => {
    setLoading(true)
    reviewApi.getFarmerReviews({ page, size: 10, sort: 'createdAt,desc' })
      .then(({ data: res }) => setData(res.data || res))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [page])

  if (loading && !data.content.length) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="page-title text-lg font-semibold text-surface-900">Product Reviews</h2>
          <p className="page-subtitle text-sm text-surface-500 mt-1">{data.totalElements || 0} total reviews on your products</p>
        </div>
      </div>

      {data.content?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white py-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <MessageSquare className="h-8 w-8 text-amber-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-surface-900">No reviews yet</h3>
          <p className="mt-1 text-sm text-surface-500 max-w-sm text-center">
            Reviews from customers who purchase your products will appear here. 
            Deliver quality and watch your ratings grow!
          </p>
          <div className="mt-6 flex items-center gap-1 text-xs text-surface-400">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Great products earn great reviews</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.content.map((review) => (
            <div key={review.id} className={`card-hover overflow-hidden ${
              !review.isVisible ? 'border-red-200 bg-red-50/50' : ''
            }`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar-initials flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 ring-2 ring-white shadow-sm">
                        {review.customer?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-surface-900">{review.customer?.fullName || 'Anonymous'}</p>
                          {!review.isVisible && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              <EyeOff className="h-3 w-3" /> Hidden
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating value={review.rating} size="sm" interactive={false} />
                          <span className="text-xs text-surface-400">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <div className="bg-surface-50 rounded-lg p-3.5 border border-surface-100">
                        <p className="text-sm text-surface-700 leading-relaxed italic">"{review.comment}"</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <Link
                        to={`/products/${review.productName ? '?search=' + encodeURIComponent(review.productName) : ''}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-100 px-2.5 py-1.5 text-xs font-medium text-surface-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        <Package className="h-3.5 w-3.5" />
                        {review.productName || `Product #${review.productId}`}
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                      <span className="text-xl font-bold text-amber-600">{review.rating}</span>
                    </div>
                    <div className="flex gap-1">
                      {review.isVisible ? (
                        <button
                          onClick={async () => {
                            try {
                              await reviewApi.hide(review.id)
                              toast.success('Review hidden')
                              fetchReviews()
                            } catch (err) { toast.error(err.message) }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Hide review"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await reviewApi.show(review.id)
                              toast.success('Review visible')
                              fetchReviews()
                            } catch (err) { toast.error(err.message) }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Show review"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Pagination
            page={data.pageNumber || data.page || 0}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={10}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
