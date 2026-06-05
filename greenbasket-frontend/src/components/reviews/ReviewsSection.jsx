import { useState, useEffect } from 'react'
import { Star, MessageSquare, CheckCircle, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewApi } from '@/api/reviews'
import { orderApi } from '@/api/orders'
import { StarRating } from './StarRating'
import { ReviewForm } from './ReviewForm'
import { ReviewList } from './ReviewList'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

export function ReviewsSection({ productId, compact = false }) {
  const { isAuthenticated, hasRole } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0 })
  const [loading, setLoading] = useState(true)
  const [deliveredOrders, setDeliveredOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const isCustomer = isAuthenticated && hasRole(ROLES.CUSTOMER)

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewApi.getProductReviews(productId),
        reviewApi.getReviewStats(productId),
      ])
      setReviews(reviewsRes.data?.data || [])
      const s = statsRes.data?.data || { averageRating: 0, reviewCount: 0 }
      setStats(s)
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveredOrders = async () => {
    if (!isCustomer) return
    try {
      const { data } = await orderApi.getAll({ status: 'DELIVERED', page: 0, size: 50 })
      const orders = data.data?.content || data.data || []
      const eligible = orders.filter((order) =>
        order.items?.some((item) => item.productId === productId || item.product?.id === productId)
      )
      setDeliveredOrders(eligible)
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  useEffect(() => {
    if (isCustomer) {
      fetchDeliveredOrders()
    }
  }, [isCustomer, productId])

  const checkHasReviewed = async () => {
    try {
      const { data } = await reviewApi.getMyReviews({ page: 0, size: 100 })
      const myReviews = data.data?.content || []
      setHasReviewed(myReviews.some((r) => r.productId === productId))
    } catch {
      // non-critical
    }
  }

  useEffect(() => {
    if (isCustomer) {
      checkHasReviewed()
    }
  }, [isCustomer, productId])

  const handleSubmitReview = async (formData) => {
    const orderId = selectedOrder || formData.orderId
    if (!orderId && !editingReview) {
      toast.error('Please select an order to review')
      return
    }

    if (editingReview) {
      try {
        await reviewApi.delete(editingReview.id)
        await reviewApi.create({ ...formData, orderId: editingReview.orderId || orderId })
        toast.success('Review updated successfully!')
      } catch (err) {
        toast.error(err.message || 'Failed to update review')
        return
      }
    } else {
      await reviewApi.create({ ...formData, orderId })
      toast.success('Review submitted successfully!')
    }

    setShowForm(false)
    setSelectedOrder(null)
    setEditingReview(null)
    setHasReviewed(true)
    fetchReviews()
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setSelectedOrder(review.orderId)
    setShowForm(true)
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return
    try {
      await reviewApi.delete(reviewId)
      toast.success('Review deleted')
      fetchReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleHide = async (reviewId) => {
    try {
      await reviewApi.hide(reviewId)
      toast.success('Review hidden')
      fetchReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleShow = async (reviewId) => {
    try {
      await reviewApi.show(reviewId)
      toast.success('Review visible')
      fetchReviews()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setSelectedOrder(null)
    setEditingReview(null)
  }

  const canReview = isCustomer && deliveredOrders.length > 0 && !hasReviewed && !editingReview

  return (
    <div className="mt-14 animate-fade-in">
      <div className={compact ? '' : 'border-t border-surface-200 pt-10'}>
        {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 shadow-sm">
              <Star className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900">Customer Reviews</h2>
              {stats.reviewCount > 0 ? (
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="flex items-center gap-1">
                    <StarRating value={Math.round(stats.averageRating)} size="sm" interactive={false} />
                    <span className="text-sm font-semibold text-surface-900">{stats.averageRating}</span>
                  </div>
                  <span className="text-sm text-surface-400">({stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <p className="text-sm text-surface-400 mt-1">No reviews yet</p>
              )}
            </div>
          </div>

          {canReview && !showForm && (
            <button
              onClick={() => {
                if (deliveredOrders.length === 1) {
                  setSelectedOrder(deliveredOrders[0].id)
                }
                setShowForm(true)
              }}
              className="btn-primary inline-flex items-center gap-2 shadow-button"
            >
              <MessageSquare className="h-4 w-4" /> Write a Review
            </button>
          )}
        </div>
        )}

        {showForm && (
          <div className="mb-8 rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50/60 to-white p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                {editingReview ? <Pencil className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              </div>
              <h3 className="text-base font-semibold text-surface-900">
                {editingReview ? 'Edit Your Review' : 'Write Your Review'}
              </h3>
            </div>

            {!editingReview && deliveredOrders.length > 1 && !selectedOrder && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Select the order you're reviewing for
                </label>
                <select
                  value={selectedOrder || ''}
                  onChange={(e) => setSelectedOrder(Number(e.target.value))}
                  className="input-field"
                >
                  <option value="">Choose an order...</option>
                  {deliveredOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} — {new Date(order.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ReviewForm
              productId={productId}
              orderId={editingReview ? editingReview.orderId : (selectedOrder || deliveredOrders[0]?.id)}
              onSubmit={handleSubmitReview}
              onCancel={cancelForm}
              existingReview={editingReview}
            />
          </div>
        )}

        {hasReviewed && !showForm && !editingReview && reviews.some((r) => r.customer?.id === user?.id) && (
          <div className="mb-6 flex items-center justify-between gap-2 rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">You have reviewed this product</span>
            </div>
            <button
              onClick={() => handleEdit(reviews.find((r) => r.customer?.id === user?.id))}
              className="btn-ghost text-xs font-semibold px-3 py-1.5"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
            </button>
          </div>
        )}

        <ReviewList
          reviews={reviews}
          onDelete={handleDelete}
          onHide={handleHide}
          onShow={handleShow}
          onEdit={handleEdit}
          loading={loading}
          stats={stats}
        />
      </div>
    </div>
  )
}
