import { Request, Response } from 'express';
import Like from '../models/Like';
import Meme from '../models/Meme';
import GeneratedImage from '../models/GeneratedImage';
import User from '../models/User';

// Like a meme
export const likeMeme = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { memeId, memeType } = req.body;

    if (!memeId || !memeType) {
      return res.status(400).json({ error: 'Meme ID and type are required' });
    }

    if (!['Meme', 'GeneratedImage'].includes(memeType)) {
      return res.status(400).json({ error: 'Invalid meme type' });
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
      return res.status(403).json({ error: 'Cannot like private memes' });
    }

    // Check if meme creator has public profile
    const memeUser = meme.user as any;
    if (!memeUser.isPublic) {
      return res.status(403).json({ error: 'Cannot like memes from private profiles' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, meme: memeId, memeType });
    if (existingLike) {
      return res.status(400).json({ error: 'Meme already liked' });
    }

    // Create like
    const like = new Like({
      user: userId,
      meme: memeId,
      memeType
    });

    await like.save();

    // Get updated like count
    const likeCount = await Like.countDocuments({ meme: memeId, memeType });

    res.status(201).json({
      message: 'Meme liked successfully',
      liked: true,
      likeCount
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to like meme' });
  }
};

// Unlike a meme
export const unlikeMeme = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const { memeId, memeType } = req.body;

    if (!memeId || !memeType) {
      return res.status(400).json({ error: 'Meme ID and type are required' });
    }

    // Remove like
    const deletedLike = await Like.findOneAndDelete({ 
      user: userId, 
      meme: memeId, 
      memeType 
    });

    if (!deletedLike) {
      return res.status(400).json({ error: 'Meme not liked by user' });
    }

    // Get updated like count
    const likeCount = await Like.countDocuments({ meme: memeId, memeType });

    res.json({
      message: 'Meme unliked successfully',
      liked: false,
      likeCount
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to unlike meme' });
  }
};

// Get like status for a meme (for current user)
export const getLikeStatus = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { memeId, memeType } = req.params;

  try {
    // Get like count for everyone
    const likeCount = await Like.countDocuments({ meme: memeId, memeType });
    
    // Get like status for current user (if authenticated)
    let isLiked = false;
    if (userId) {
      const like = await Like.findOne({ user: userId, meme: memeId, memeType });
      isLiked = !!like;
    }

    res.json({
      likeCount,
      isLiked
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get like status' });
  }
};

// Get most liked memes (for trending)
export const getTrendingMemes = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const timeframe = req.query.timeframe as string || '7d'; // 1d, 7d, 30d, all

    // Calculate date filter based on timeframe
    let dateFilter: Date | null = null;
    if (timeframe !== 'all') {
      const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
    }

    // Build aggregation pipeline
    const matchFilter: any = {};
    if (dateFilter) {
      matchFilter.createdAt = { $gte: dateFilter };
    }

    // Get trending memes and generated images
    const [trendingMemes, trendingGeneratedImages] = await Promise.all([
      // Memes
      Like.aggregate([
        { $match: { memeType: 'Meme', ...matchFilter } },
        { $group: { _id: '$meme', likeCount: { $sum: 1 } } },
        { $sort: { likeCount: -1 } },
        { $limit: limit * 2 }, // Get more to ensure we have enough after filtering
        {
          $lookup: {
            from: 'memes',
            localField: '_id',
            foreignField: '_id',
            as: 'meme'
          }
        },
        { $unwind: '$meme' },
        { $match: { 'meme.is_public': true } },
        {
          $lookup: {
            from: 'users',
            localField: 'meme.user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $match: { 'user.isPublic': true } },
        {
          $project: {
            _id: '$meme._id',
            url: '$meme.url',
            title: '$meme.title',
            description: '$meme.description',
            createdAt: '$meme.createdAt',
            is_public: '$meme.is_public',
            user: {
              _id: '$user._id',
              username: '$user.username',
              profileImage: '$user.profileImage',
              isPublic: '$user.isPublic'
            },
            likeCount: 1,
            memeType: { $literal: 'Meme' }
          }
        }
      ]),
      
      // Generated Images
      Like.aggregate([
        { $match: { memeType: 'GeneratedImage', ...matchFilter } },
        { $group: { _id: '$meme', likeCount: { $sum: 1 } } },
        { $sort: { likeCount: -1 } },
        { $limit: limit * 2 },
        {
          $lookup: {
            from: 'generatedimages',
            localField: '_id',
            foreignField: '_id',
            as: 'meme'
          }
        },
        { $unwind: '$meme' },
        { $match: { 'meme.is_public': true } },
        {
          $lookup: {
            from: 'users',
            localField: 'meme.user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $match: { 'user.isPublic': true } },
        {
          $project: {
            _id: '$meme._id',
            url: '$meme.url',
            title: '$meme.title',
            description: '$meme.description',
            prompt: '$meme.prompt',
            style: '$meme.style',
            modelUsed: '$meme.modelUsed',
            createdAt: '$meme.createdAt',
            is_public: '$meme.is_public',
            user: {
              _id: '$user._id',
              username: '$user.username',
              profileImage: '$user.profileImage',
              isPublic: '$user.isPublic'
            },
            likeCount: 1,
            memeType: { $literal: 'GeneratedImage' }
          }
        }
      ])
    ]);

    // Combine and sort by like count
    const allTrending = [...trendingMemes, ...trendingGeneratedImages]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, limit);

    res.json({
      memes: allTrending,
      timeframe,
      total: allTrending.length
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get trending memes' });
  }
}; 