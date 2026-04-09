import express from 'express';
import { getSectors, getDepartmentsBySector } from '../controllers/sector.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getSectors);
router.get('/:sectorId/departments', getDepartmentsBySector);

export default router;
