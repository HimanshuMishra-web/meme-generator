import express from 'express';
import multer from 'multer';
import { uploadMedia, getTemplates, deleteTemplate, getPublicTemplates, updateTemplateStatus } from '../controllers/mediaController';
import { authMiddleware, requireAdminOrSuperAdmin, requireSuperAdmin } from '../middleware/authMiddleware';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

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

// File filter to accept only image and video files
const fileFilter = (req: Request, file: any, cb: any) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /api/media/upload (admin or super admin only)
router.post('/upload', authMiddleware, requireAdminOrSuperAdmin, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size must be less than 5MB' });
        }
      } else if (err.message === 'Only image and video files are allowed') {
        return res.status(400).json({ message: 'Only image and video files are allowed' });
      }
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }
    void uploadMedia(req, res);
  });
});

// GET /api/media/templates (admin or super admin only)
router.get('/templates', authMiddleware, requireAdminOrSuperAdmin, (req, res) => {
  void getTemplates(req, res);
});

// DELETE /api/media/templates/:id (admin or super admin only)
router.delete('/templates/:id', authMiddleware, requireAdminOrSuperAdmin, (req, res) => {
  void deleteTemplate(req, res);
});

// PUT /api/media/templates/:id/status (super admin only)
router.put('/templates/:id/status', authMiddleware, requireSuperAdmin, (req, res) => {
  void updateTemplateStatus(req, res);
});

// GET /api/media/public/templates (public access)
router.get('/public/templates', (req, res) => {
  void getPublicTemplates(req, res);
});

export default router; 