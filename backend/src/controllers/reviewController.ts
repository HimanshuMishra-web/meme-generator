import { Request, Response } from 'express';
import Review from '../models/Review';
import Meme from '../models/Meme';
import GeneratedImage from '../models/GeneratedImage';
import User from '../models/User';

// Add a review to a meme
export const addReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { memeId, memeType, content, rating } = req.body;

    if (!memeId || !memeType || !content) {
      return res.status(400).json({ error: 'Meme ID, type, and content are required' });
    }

    if (!['Meme', 'GeneratedImage'].includes(memeType)) {
      return res.status(400).json({ error: 'Invalid meme type' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Review content too long (max 1000 characters)' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user's profile is public (only public users can review)
    const user = await User.findById(userId);
    if (!user?.isPublic) {
      return res.status(403).json({ error: 'Only users with public profiles can add reviews' });
    }

    // Check if meme exists and is public
    let meme: any;
    if (memeType === 'Meme') {
      meme = await Meme.findById(memeId).populate('user', 'isPublic');
    } else {
      meme = await GeneratedImage.findById(memeId).populate('user', 'isPublic');
    }
    
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }

    if (!meme.is_public) {
      return res.status(403).json({ error: 'Cannot review private memes' });
    }

    // Check if meme creator has public profile
    const memeUser = meme.user as any;
    if (!memeUser.isPublic) {
      return res.status(403).json({ error: 'Cannot review memes from private profiles' });
    }

    // Check if user already reviewed this meme
    const existingReview = await Review.findOne({ user: userId, meme: memeId, memeType });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this meme' });
    }

    // Create review
    const review = new Review({
      user: userId,
      meme: memeId,
      memeType,
      content,
      rating: rating || undefined
    });

    await review.save();

    // Populate user data for response
    await review.populate('user', 'username profileImage isPublic');

    res.status(201).json({
      message: 'Review added successfully',
      review
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add review' });
  }
};

// Get reviews for a meme
export const getMemeReviews = async (req: Request, res: Response) => {
  try {
    const { memeId, memeType } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!['Meme', 'GeneratedImage'].includes(memeType)) {
      return res.status(400).json({ error: 'Invalid meme type' });
    }

    // Get reviews with user data (only from public profiles)
    const reviews = await Review.find({ meme: memeId, memeType })
      .populate({
        path: 'user',
        select: 'username profileImage isPublic',
        match: { isPublic: true } // Only show reviews from public users
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out reviews where user population failed (private users)
    const validReviews = reviews.filter(review => review.user);

    // Get total count for pagination
    const totalReviews = await Review.aggregate([
      { $match: { meme: memeId, memeType } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.isPublic': true } },
      { $count: 'total' }
    ]);

    const total = totalReviews[0]?.total || 0;

    res.json({
      reviews: validReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get reviews' });
  }
};

// Update a review (user can only update their own)
export const updateReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { reviewId } = req.params;
    const { content, rating } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Review content too long (max 1000 characters)' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Find and update review (only if user owns it)
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { content, rating: rating || undefined },
      { new: true }
    ).populate('user', 'username profileImage isPublic');

    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    res.json({
      message: 'Review updated successfully',
      review
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update review' });
  }
};

// Delete a review (user can only delete their own)
export const deleteReview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { reviewId } = req.params;

    // Find and delete review (only if user owns it)
    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });

    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    res.json({ message: 'Review deleted successfully' });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete review' });
  }
};

// Get review stats for a meme
export const getMemeReviewStats = async (req: Request, res: Response) => {
  try {
    const { memeId, memeType } = req.params;

    if (!['Meme', 'GeneratedImage'].includes(memeType)) {
      return res.status(400).json({ error: 'Invalid meme type' });
    }

    // Get review statistics
    const stats = await Review.aggregate([
      { $match: { meme: memeId, memeType } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.isPublic': true } }, // Only count reviews from public users
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const result = stats[0] || { totalReviews: 0, averageRating: null, ratingDistribution: [] };

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach((rating: number) => {
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });

    res.json({
      totalReviews: result.totalReviews,
      averageRating: result.averageRating ? Number(result.averageRating.toFixed(2)) : null,
      ratingDistribution: distribution
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get review stats' });
  }
}; 