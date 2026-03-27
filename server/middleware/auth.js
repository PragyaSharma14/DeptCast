import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// Protect routes that require a logged-in user
export const requireAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await prisma.user.findUnique({
          where: { id: decoded.id }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      delete user.passwordHash;
      req.user = { ...user, _id: user.id }; // Add _id alias for compatibility
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Protect routes that require tenant isolation
export const requireTenant = async (req, res, next) => {
  // Never trust frontend header blindly.
  // The header dictates *which* org the user *wants* to act as.
  // Defaults to user's current trackable org if header missing.
  const requestedOrgId = req.headers['x-organization-id'] || req.user.currentOrganizationId?.toString();
  
  if (!requestedOrgId) {
    return res.status(400).json({ error: 'Organization context required' });
  }

  try {
    // Validate that the user actually belongs to this organization
    const membership = await prisma.membership.findFirst({ 
      where: {
          userId: req.user.id || req.user._id, 
          organizationId: requestedOrgId 
      },
      include: {
          organization: true
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied: You do not belong to this organization' });
    }

    // Attach verified tenant info to the request
    req.membership = membership;
    req.org = { ...membership.organization, _id: membership.organization.id };
    
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tenant verification failed' });
  }
};

// Protect routes based on explicit roles
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.membership || !allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({ 
        error: `Access denied: Requires one of [${allowedRoles.join(', ')}] role` 
      });
    }
    next();
  };
};
