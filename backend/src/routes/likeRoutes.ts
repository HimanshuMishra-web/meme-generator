import express from 'express';
import * as likeController from '../controllers/likeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils';

const router = express.Router();

// POST /api/likes/like - Like a meme (requires auth)
router.post('/like', authMiddleware, asyncHandler(likeController.likeMeme));

// POST /api/likes/unlike - Unlike a meme (requires auth)
router.post('/unlike', authMiddleware, asyncHandler(likeController.unlikeMeme));

// GET /api/likes/:memeType/:memeId/status - Get like status for a meme (optional auth)
router.get('/:memeType/:memeId/status', (req, res, next) => {
  // Optional auth - if token is provided, verify it, but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
}, asyncHandler(likeController.getLikeStatus));

// GET /api/likes/trending - Get trending memes (public endpoint)
router.get('/trending', asyncHandler(likeController.getTrendingMemes));

export default router; 