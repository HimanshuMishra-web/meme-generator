import express from 'express';
import * as authController from '../controllers/authController';
import { asyncHandler } from '../utils';

const router = express.Router();

// Example: login route
router.post('/login', asyncHandler(authController.login));
router.post('/signup', asyncHandler(authController.signup));
router.post('/logout', asyncHandler(authController.logout));
router.post('/forget-password', asyncHandler(authController.forgetPassword));

// Add other auth routes as needed, e.g., register, logout, refresh, etc.

export { router as authRoutes }; 