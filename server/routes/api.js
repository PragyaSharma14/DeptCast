import express from "express";
import projectRoutes from './project.routes.js';
import videoRoutes from './video.routes.js';
import authRoutes from './auth.routes.js';
import orgRoutes from './org.routes.js';
import departmentRoutes from './department.routes.js';
import sectorRoutes from './sector.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import { requireAuth, requireTenant, requireRole } from '../middleware/auth.js';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply general API rate limiting
router.use(apiLimiter);

// Auth routes (stricter limit)
router.use('/', authLimiter, authRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Test Veo 3.3 Lite via Postman
import { generateVideoVeoAsync } from '../services/veo.service.js';
router.post("/test-veo", async (req, res) => {
  try {
    const { prompt, duration = 5, resolution = "1920x1080" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Please provide a 'prompt' in the JSON body." });
    
    // Call the Vertex AI Veo Service
    const videoUrl = await generateVideoVeoAsync(prompt, duration, resolution);
    
    res.json({ status: "success", videoUrl });
  } catch (error) {
    console.error("Test Veo Error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

router.use('/orgs', orgRoutes);
router.use('/departments', departmentRoutes);
router.use('/sectors', sectorRoutes);
router.use('/dashboard', dashboardRoutes);

// Protect existing routes with RBAC (Creator/Admin only for modifying projects)
// GETs are allowed for viewers, POST/PUT/DELETE would require 'member' or 'admin'
router.use('/projects', requireAuth, requireTenant, projectRoutes);
router.use('/videos', requireAuth, requireTenant, videoRoutes);

export default router;
