import express from 'express';
import multer from 'multer';
import path from 'path';
import * as userController from '../controllers/userController';
import { asyncHandler } from '../utils';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Configure multer storage for profile images
const storage = multer.diskStorage({
  destination: function (req: Request, file: any, cb: (error: Error | null, destination: string) => void) {
    cb(null, path.join(__dirname, '../../assets/media'));
  },
  filename: function (req: Request, file: any, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only image files
const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// PUT /api/users/me (update own profile)
router.put('/me', authMiddleware, (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Profile image size must be less than 5MB' });
        }
      } else if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: 'Only image files are allowed for profile images' });
      }
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }
    void userController.updateMyProfile(req, res);
  });
});
// GET /api/users/me (get own profile)
router.get('/me', authMiddleware, asyncHandler(userController.getMyProfile));
// Define user routes with super admin protection and error handling
router.get('/', authMiddleware, requireSuperAdmin, asyncHandler(userController.getAllUsers));
router.get('/:id', authMiddleware, requireSuperAdmin, asyncHandler(userController.getUserById));
router.post('/', authMiddleware, requireSuperAdmin, (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Profile image size must be less than 5MB' });
        }
      } else if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: 'Only image files are allowed for profile images' });
      }
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }
    void userController.createUser(req, res);
  });
});
router.put('/:id', authMiddleware, requireSuperAdmin, asyncHandler(userController.updateUser));
router.put('/:id/permissions', authMiddleware, requireSuperAdmin, asyncHandler(userController.updateUserPermissions));
router.delete('/:id', authMiddleware, requireSuperAdmin, asyncHandler(userController.deleteUser));

export { router as userRoutes }; 