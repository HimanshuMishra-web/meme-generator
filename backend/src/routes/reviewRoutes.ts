import express from 'express';
import * as reviewController from '../controllers/reviewController';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils';

const router = express.Router();

// POST /api/reviews - Add a review (requires auth)
router.post('/', authMiddleware, asyncHandler(reviewController.addReview));

// GET /api/reviews/:memeType/:memeId - Get reviews for a meme (public)
router.get('/:memeType/:memeId', asyncHandler(reviewController.getMemeReviews));

// PUT /api/reviews/:reviewId - Update a review (requires auth, own review only)
router.put('/:reviewId', authMiddleware, asyncHandler(reviewController.updateReview));

// DELETE /api/reviews/:reviewId - Delete a review (requires auth, own review only)
router.delete('/:reviewId', authMiddleware, asyncHandler(reviewController.deleteReview));

// GET /api/reviews/:memeType/:memeId/stats - Get review stats for a meme (public)
router.get('/:memeType/:memeId/stats', asyncHandler(reviewController.getMemeReviewStats));

export default router; 