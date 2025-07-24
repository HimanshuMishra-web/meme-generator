import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/axiosInstance';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import UserAvatar from './UserAvatar';
import { generateImageSource } from '../utils';

interface ReviewSectionProps {
  memeId: string;
  memeType: 'Meme' | 'GeneratedImage';
  className?: string;
}

interface Review {
  _id: string;
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
    isPublic: boolean;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
  ratingDistribution: { [key: number]: number };
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  memeId,
  memeType,
  className = ''
}) => {
  const { isAuthenticated, token, user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState<number | undefined>(undefined);

  // Get reviews
  const { data: reviewsData, isLoading: loadingReviews } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', memeType, memeId, page],
    queryFn: async () => await apiService.get<ReviewsResponse>(`/reviews/${memeType}/${memeId}?page=${page}&limit=5`)
  });

  // Get review stats
  const { data: reviewStats } = useQuery<ReviewStats>({
    queryKey: ['review-stats', memeType, memeId],
    queryFn: async () => await apiService.get<ReviewStats>(`/reviews/${memeType}/${memeId}/stats`)
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Please sign in to add reviews');
      }
      return await apiService.post('/reviews', {
        memeId,
        memeType,
        content: newReviewContent,
        rating: newReviewRating
      }, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', memeType, memeId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', memeType, memeId] });
      setNewReviewContent('');
      setNewReviewRating(undefined);
      setShowAddReview(false);
      toast.success('Review added successfully! 📝');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || error.message || 'Failed to add review';
      toast.error(message);
    }
  });

  const handleSubmitReview = () => {
    if (!newReviewContent.trim()) {
      toast.error('Please enter a review');
      return;
    }
    if (newReviewContent.length > 1000) {
      toast.error('Review is too long (max 1000 characters)');
      return;
    }
    addReviewMutation.mutate();
  };

  const StarRating = ({ rating, editable = false, onChange }: { 
    rating?: number; 
    editable?: boolean; 
    onChange?: (rating: number) => void;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onChange?.(star)}
          disabled={!editable}
          className={`text-lg transition-colors ${
            editable ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'
          } ${
            rating && star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ⭐
        </button>
      ))}
      {!editable && rating && (
        <span className="text-sm text-gray-500 ml-2">({rating}/5)</span>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
          {reviewStats && (
            <div className="flex items-center gap-4 mt-2">
              <span className="text-gray-600">{reviewStats.totalReviews} reviews</span>
              {reviewStats.averageRating && (
                <div className="flex items-center gap-2">
                  <StarRating rating={reviewStats.averageRating} />
                  <span className="text-sm text-gray-500">
                    Average: {reviewStats.averageRating}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {showAddReview ? 'Cancel' : 'Add Review'}
          </button>
        )}
      </div>

      {/* Add review form */}
      {showAddReview && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Add Your Review</h4>
          
          {/* Rating selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (optional)
            </label>
            <StarRating 
              rating={newReviewRating} 
              editable={true} 
              onChange={setNewReviewRating}
            />
          </div>

          {/* Review content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={newReviewContent}
              onChange={(e) => setNewReviewContent(e.target.value)}
              placeholder="Share your thoughts about this meme..."
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {newReviewContent.length}/1000 characters
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitReview}
              disabled={addReviewMutation.isPending || !newReviewContent.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setShowAddReview(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {loadingReviews ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-2">Loading reviews...</p>
          </div>
        ) : !reviewsData?.reviews.length ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            {reviewsData.reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    src={review.user.profileImage ? generateImageSource('/assets/media/' + review.user.profileImage) : ''}
                    alt={review.user.username}
                    size={40}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{review.user.username}</span>
                      {review.rating && <StarRating rating={review.rating} />}
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {reviewsData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {reviewsData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(reviewsData.pagination.totalPages, p + 1))}
                  disabled={page === reviewsData.pagination.totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 