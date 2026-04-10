import express from 'express';
import { getDashboardStats, getUpcomingSchedules, createSchedule } from '../controllers/dashboard.controller.js';
import { requireAuth, requireTenant } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.get('/stats', getDashboardStats);
router.get('/schedules', getUpcomingSchedules);
router.post('/schedules', createSchedule);

export default router;
