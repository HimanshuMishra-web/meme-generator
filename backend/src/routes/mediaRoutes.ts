import express from 'express';
import multer from 'multer';
import { uploadMedia } from '../controllers/mediaController';
import { authMiddleware } from '../middleware/authMiddleware';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Inline requireAdmin middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Admins only.' });
    return;
  }
  next();
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req: Request, file: any, cb: (error: Error | null, destination: string) => void) {
    cb(null, path.join(__dirname, '../../assets/media'));
  },
  filename: function (req: Request, file: any, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/media/upload (admin only)
router.post('/upload', authMiddleware, requireAdmin, upload.single('file'), (req, res) => {
  void uploadMedia(req, res);
});

export default router; 