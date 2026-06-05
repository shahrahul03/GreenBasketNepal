import { useState, useEffect } from 'react'
import { Star, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { StarRating } from './StarRating'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'

export function ReviewForm({ productId, orderId, onSubmit, onCancel, existingReview }) {
  const { isAuthenticated, hasRole } = useAuth()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [submitting, setSubmitting] = useState(false)

  const isCustomer = isAuthenticated && hasRole(ROLES.CUSTOMER)
  if (!isCustomer) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating < 1) {
      toast.error('Please select a rating')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ rating, comment, productId, orderId })
      setRating(0)
      setComment('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-surface-700 mb-2">Your Rating</p>
        <div className="inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-surface-200">
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-sm font-medium text-surface-600">
              {rating >= 4.5 ? 'Excellent!' : rating >= 3.5 ? 'Great' : rating >= 2.5 ? 'Good' : rating >= 1.5 ? 'Average' : 'Poor'}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5">
          Your Review <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="input-field resize-none min-h-[100px]"
          placeholder="Share your experience with this product... What did you like or dislike?"
          maxLength={2000}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-surface-400">Share details about your experience</p>
          <p className={`text-xs ${comment.length > 1900 ? 'text-amber-600 font-medium' : 'text-surface-400'}`}>
            {comment.length}/2000
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting || rating < 1}
          className="btn-primary px-6 py-2.5 shadow-button"
        >
          {submitting ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {existingReview ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary px-6">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
