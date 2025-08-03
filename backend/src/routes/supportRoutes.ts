import express from 'express';
import { 
  createSupport, 
  getAllSupport, 
  getUserSupport,
  getSupportById, 
  updateSupport, 
  deleteSupport, 
  getSupportStats 
} from '../controllers/supportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// User routes (require authentication)
router.post('/', authMiddleware, createSupport);
router.get('/my-tickets', authMiddleware, getUserSupport);
router.get('/my-tickets/:id', authMiddleware, getSupportById);

// Admin routes (require authentication and permissions)
router.get('/', authMiddleware, getAllSupport);
router.get('/stats', authMiddleware, getSupportStats);
router.get('/:id', authMiddleware, getSupportById);
router.put('/:id', authMiddleware, updateSupport);
router.delete('/:id', authMiddleware, deleteSupport);

export default router; 