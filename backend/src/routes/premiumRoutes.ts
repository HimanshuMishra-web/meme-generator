import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getPlatformSettings,
  updatePlatformSettings,
  setPremiumMeme,
  getPremiumMemes,
  purchasePremiumMeme,
  getPurchasedMemes,
  getCreatorEarnings
} from '../controllers/premiumController';

const router = express.Router();

// Public routes
router.get('/settings', getPlatformSettings);
router.get('/memes', getPremiumMemes);

// Protected routes
router.use(authMiddleware);

// Platform settings (super admin only)
router.put('/settings', updatePlatformSettings as express.RequestHandler);

// Premium meme management
router.put('/meme/premium', setPremiumMeme as express.RequestHandler);
router.post('/meme/purchase', purchasePremiumMeme as express.RequestHandler);
router.get('/purchased', getPurchasedMemes as express.RequestHandler);
router.get('/earnings', getCreatorEarnings as express.RequestHandler);

export default router; 