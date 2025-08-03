import express from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats,
  getUserContactEnquiries
} from '../controllers/contactController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Public route for creating contact enquiries
router.post('/', createContact);

// User routes (require authentication)
router.get('/my-enquiries', authMiddleware, getUserContactEnquiries);

// Admin routes (require authentication and permissions)
router.get('/', authMiddleware, getAllContacts);
router.get('/stats', authMiddleware, getContactStats);
router.get('/:id', authMiddleware, getContactById);
router.put('/:id', authMiddleware, updateContact);
router.delete('/:id', authMiddleware, deleteContact);

export default router; 