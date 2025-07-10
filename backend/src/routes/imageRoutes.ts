import express from 'express';
import { generateImage } from '../controllers/imageController';
import { asyncHandler } from '../utils';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/images/generate
router.post('/generate', authMiddleware, asyncHandler(generateImage));

export { router as imageRoutes }; 