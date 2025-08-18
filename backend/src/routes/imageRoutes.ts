import express from 'express';
import { generateImage, saveToCollection, memeUpload, getMyMemes, getCommunityMemes, getUserPublicMemes, updateGeneratedImagePrivacy, updateMemePrivacy, getMemeById } from '../controllers/imageController';
import { asyncHandler } from '../utils';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/images/generate
router.post('/generate', authMiddleware, asyncHandler(generateImage));
// POST /api/images/save-to-collection
router.post('/save-to-collection', authMiddleware, memeUpload.single('image'), asyncHandler(saveToCollection));
// GET /api/images/my-memes
router.get('/my-memes', authMiddleware, asyncHandler(getMyMemes));
// GET /api/images/community-memes
router.get('/community-memes', asyncHandler(getCommunityMemes));
// GET /api/images/user/:userId/public-memes
router.get('/user/:userId/public-memes', asyncHandler(getUserPublicMemes));
// GET /api/images/meme/:id - Get a single meme by ID
router.get('/meme/:id', asyncHandler(getMemeById));
// PUT /api/images/generated/:id/privacy
router.put('/generated/:id/privacy', authMiddleware, asyncHandler(updateGeneratedImagePrivacy));
// PUT /api/images/meme/:id/privacy
router.put('/meme/:id/privacy', authMiddleware, asyncHandler(updateMemePrivacy));

export { router as imageRoutes }; 