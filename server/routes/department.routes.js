import express from 'express';
import { getDepartments, getTemplatesByDepartment } from '../controllers/department.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getDepartments);
router.get('/:deptId/templates', getTemplatesByDepartment);

export default router;
