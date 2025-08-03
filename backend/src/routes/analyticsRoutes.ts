import express from "express";
import { getAnalytics, getTopSellingMemes } from "../controllers/analyticsController";
import { authMiddleware, requireAdminOrSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Get analytics data with date filtering
router.get("/", authMiddleware, requireAdminOrSuperAdmin, getAnalytics);

// Get top selling memes and AI generated images
router.get("/top-selling", authMiddleware, requireAdminOrSuperAdmin, getTopSellingMemes);

export default router; 