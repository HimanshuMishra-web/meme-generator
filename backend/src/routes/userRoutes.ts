import express from 'express';
import * as userController from '../controllers/userController';
import { asyncHandler } from '../utils';

const router = express.Router();

// Define user routes with error handling
router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));
router.post('/', asyncHandler(userController.createUser));
router.put('/:id', asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

export { router as userRoutes }; 