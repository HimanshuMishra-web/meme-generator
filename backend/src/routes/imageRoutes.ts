import express from 'express';
import { generateImage, saveToCollection, memeUpload } from '../controllers/imageController';
import { asyncHandler } from '../utils';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/images/generate
router.post('/generate', authMiddleware, asyncHandler(generateImage));
// POST /api/images/save-to-collection
router.post('/save-to-collection', authMiddleware, memeUpload.single('image'), asyncHandler(saveToCollection));

export { router as imageRoutes }; 