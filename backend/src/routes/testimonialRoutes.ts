import express from 'express';
import {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer setup for testimonial images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../assets/testimonial-images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create (super admin only)
router.post('/', authMiddleware, requireSuperAdmin, upload.single('profileImage'), createTestimonial);
// Retrieve all (public)
router.get('/', getTestimonials);
// Retrieve by id (public)
router.get('/:id', getTestimonialById);
// Update (super admin only)
router.put('/:id', authMiddleware, requireSuperAdmin, upload.single('profileImage'), updateTestimonial);
// Delete (super admin only)
router.delete('/:id', authMiddleware, requireSuperAdmin, deleteTestimonial);

export default router; 