import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Send } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id: string
  profiles?: { display_name: string | null } | null
}

interface ReviewSectionProps {
  productId: string
  reviews: Review[]
  onReviewAdded: () => void
}

export function ReviewSection({ reviews, onReviewAdded }: ReviewSectionProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const hasReviewed = user ? reviews.some((r) => r.user_id === user.id) : false

  // Calculate statistics
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0
  
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      // Stub: In real implementation, insert into supabase
      // const { error } = await supabase.from('reviews').insert({
      //   user_id: user.id,
      //   product_id: productId,
      //   rating,
      //   comment: comment || null,
      // })
      
      // Simulate success
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      alert('Review submitted!')
      setRating(5)
      setComment('')
      onReviewAdded()
    } catch (error) {
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Left - Average rating */}
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl font-bold text-primary neon-text">
            {avgRating.toFixed(1)}
          </span>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={16}
                  className={i <= Math.round(avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Right - Bar chart */}
        <div className="flex-1 w-full sm:w-auto space-y-1">
          {starCounts.map(({ star, count }) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{star}</span>
                <Star size={10} className="text-muted-foreground" />
                <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review form */}
      {user && !hasReviewed && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-4"
          onSubmit={handleSubmit}
        >
          <h3 className="font-display font-semibold text-foreground">Write a Review</h3>
          
          {/* Star rating */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                className="hover:scale-110 transition-transform"
              >
                <Star
                  size={24}
                  className={i <= (hoverRating || rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                />
              </button>
            ))}
          </div>

          {/* Comment textarea */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            maxLength={500}
            className="w-full min-h-[100px] resize-none pl-4 pr-4 py-3 rounded-lg bg-muted/50 border border-glass-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
          <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg neon-glow hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </motion.form>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first!
          </p>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-sm">
                    {(review.profiles?.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground">
                    {review.profiles?.display_name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {/* Star row */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                  />
                ))}
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
