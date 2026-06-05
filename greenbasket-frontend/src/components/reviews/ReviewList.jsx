import { Pencil, Trash2, EyeOff, Eye, MessageSquare, ShieldCheck } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { StarRating } from './StarRating'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

function ReviewSummary({ stats }) {
  const { averageRating = 0, reviewCount = 0, ratingDistribution } = stats
  const dist = ratingDistribution || {}
  const bars = [5, 4, 3, 2, 1].map((star) => {
    const count = dist[star] || 0
    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0
    return { star, count, pct }
  })

  if (reviewCount === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-4xl sm:text-5xl font-extrabold text-surface-900 leading-none">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-1.5">
            <StarRating value={Math.round(averageRating)} size="sm" interactive={false} />
          </div>
          <span className="text-xs text-surface-500 mt-1 font-medium">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          {bars.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-surface-600 w-4 text-right shrink-0">
                {star}
              </span>
              <div className="flex-1 h-2.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: star >= 4 ? '#059669' : star >= 3 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs text-surface-500 w-8 text-right shrink-0 font-medium">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ReviewList({ reviews, onDelete, onHide, onShow, onEdit, loading, stats }) {
  const { user, hasRole } = useAuth()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-3 w-16 skeleton rounded" />
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 w-4 skeleton rounded" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full skeleton rounded" />
                  <div className="h-3 w-3/4 skeleton rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-200 bg-gradient-to-b from-white to-surface-50 py-16 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 mb-4">
          <MessageSquare className="h-8 w-8 text-surface-300" />
        </div>
        <p className="text-base font-semibold text-surface-900">No reviews yet</p>
        <p className="text-sm text-surface-500 mt-1">Be the first to share your experience with this product</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {stats && <ReviewSummary stats={stats} />}

      {reviews.map((review) => {
        const isOwner = user?.id === review.customer?.id
        const isAdmin = hasRole(ROLES.ADMIN)

        const initials = review.customer?.fullName
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || '?'

        const bgColors = ['bg-primary-100 text-primary-700 ring-primary-200', 'bg-amber-100 text-amber-700 ring-amber-200', 'bg-blue-100 text-blue-700 ring-blue-200', 'bg-purple-100 text-purple-700 ring-purple-200', 'bg-rose-100 text-rose-700 ring-rose-200']
        const avatarColor = bgColors[review.id % bgColors.length]

        return (
          <div
            key={review.id}
            className={`card overflow-hidden transition-all duration-200 ${
              !review.isVisible ? 'border-red-200 bg-red-50/40' : 'hover:shadow-card-hover hover:-translate-y-0.5'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset ${avatarColor}`}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {review.customer?.fullName || 'Anonymous'}
                      </p>
                      {review.isVerifiedPurchase !== false && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                          <ShieldCheck className="h-2.5 w-2.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={review.rating} size="sm" interactive={false} />
                      <span className="text-xs text-surface-400">
                        Reviewed on {formatDate(review.createdAt, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isOwner && (
                    <button
                      onClick={() => onEdit?.(review)}
                      className="btn-icon h-8 w-8 text-surface-400 hover:text-blue-500 hover:bg-blue-50"
                      title="Edit review"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => onDelete?.(review.id)}
                      className="btn-icon h-8 w-8 text-surface-400 hover:text-red-500 hover:bg-red-50"
                      title="Delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isAdmin && review.isVisible && (
                    <button
                      onClick={() => onHide?.(review.id)}
                      className="btn-icon h-8 w-8 text-surface-400 hover:text-amber-600 hover:bg-amber-50"
                      title="Hide review"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isAdmin && !review.isVisible && (
                    <button
                      onClick={() => onShow?.(review.id)}
                      className="btn-icon h-8 w-8 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50"
                      title="Show review"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {review.comment && (
                <p className="mt-3 text-sm text-surface-600 leading-relaxed">{review.comment}</p>
              )}

              {!review.isVisible && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg px-2.5 py-1 w-fit">
                  <EyeOff className="h-3 w-3" /> Hidden
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
