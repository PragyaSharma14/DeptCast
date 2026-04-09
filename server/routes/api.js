import express from "express";
import projectRoutes from './project.routes.js';
import videoRoutes from './video.routes.js';
import authRoutes from './auth.routes.js';
import orgRoutes from './org.routes.js';
import departmentRoutes from './department.routes.js';
import sectorRoutes from './sector.routes.js';
import { requireAuth, requireTenant, requireRole } from '../middleware/auth.js';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply general API rate limiting
router.use(apiLimiter);

// Auth routes (stricter limit)
router.use('/auth', authLimiter, authRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use('/orgs', orgRoutes);
router.use('/departments', departmentRoutes);
router.use('/sectors', sectorRoutes);

// Protect existing routes with RBAC (Creator/Admin only for modifying projects)
// GETs are allowed for viewers, POST/PUT/DELETE would require 'member' or 'admin'
router.use('/projects', requireAuth, requireTenant, projectRoutes);
router.use('/videos', requireAuth, requireTenant, videoRoutes);

export default router;
