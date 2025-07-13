import express from 'express';
import * as permissionController from '../controllers/permissionController';
import { asyncHandler } from '../utils';
import { authMiddleware, requireSuperAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Define permission routes with super admin protection
router.get('/', authMiddleware, requireSuperAdmin, asyncHandler(permissionController.getAllPermissions));
router.get('/:id', authMiddleware, requireSuperAdmin, asyncHandler(permissionController.getPermissionById));
router.post('/', authMiddleware, requireSuperAdmin, asyncHandler(permissionController.createPermission));
router.put('/:id', authMiddleware, requireSuperAdmin, asyncHandler(permissionController.updatePermission));
router.delete('/:id', authMiddleware, requireSuperAdmin, asyncHandler(permissionController.deletePermission));

export { router as permissionRoutes }; 