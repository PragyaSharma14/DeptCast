import express from 'express';
import { requireAuth, requireTenant, requireRole } from '../middleware/auth.js';
import { 
  getOrgDetails, 
  getMyOrgs, 
  createOrg, 
  updateOrg,
  getOrgMembers, 
  inviteUser, 
  updateMemberRole, 
  removeMember 
} from '../controllers/org.controller.js';
import { inviteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Require user authentication for all org routes
router.use(requireAuth);

// Base org operations
router.get('/', getMyOrgs);
router.post('/', createOrg);

// Tenant-specific operations (require target x-organization-id to match membership)
router.get('/:id', requireTenant, getOrgDetails);
router.patch('/:id', requireTenant, requireRole(['admin']), updateOrg);
router.get('/:id/members', requireTenant, requireRole(['admin', 'member']), getOrgMembers);

// Admin only operations
router.post('/:id/invites', requireTenant, requireRole(['admin']), inviteLimiter, inviteUser);
router.patch('/:id/members/:memberId', requireTenant, requireRole(['admin']), updateMemberRole);
router.delete('/:id/members/:memberId', requireTenant, requireRole(['admin']), removeMember);

export default router;
