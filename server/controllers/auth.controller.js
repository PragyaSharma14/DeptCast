import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [user, org] = await prisma.$transaction(async (tx) => {
      let newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash
        }
      });

      const newOrg = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`
        }
      });

      await tx.membership.create({
        data: {
          userId: newUser.id,
          organizationId: newOrg.id,
          role: 'admin'
        }
      });

      newUser = await tx.user.update({
        where: { id: newUser.id },
        data: { currentOrganizationId: newOrg.id }
      });
      
      return [newUser, newOrg];
    });

    console.log(`[AUDIT] User registered: ${email} (User ID: ${user.id}, Org ID: ${org.id})`);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      currentOrganizationId: org.id,
      token: generateToken(user.id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration', details: err.message, stack: err.stack });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      console.log(`[AUDIT] User logged in: ${email}`);
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        currentOrganizationId: user.currentOrganizationId,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const acceptInvite = async (req, res) => {
  const { token, email, name, password } = req.body;
  try {
    const invitations = await prisma.invitation.findMany({ where: { email } });
    if (invitations.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }
    
    let validInvitation = null;
    for (const inv of invitations) {
      if (await bcrypt.compare(token, inv.tokenHash)) {
         validInvitation = inv;
         break;
      }
    }

    if (!validInvitation || validInvitation.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired invitation token' });
    }
    
    const [user] = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email } });
      if (!user) {
        if (!password || !name) throw new Error("Name and password required for new user");
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        user = await tx.user.create({ data: { name, email, passwordHash, currentOrganizationId: validInvitation.organizationId } });
      } else {
        user = await tx.user.update({ where: { id: user.id }, data: { currentOrganizationId: validInvitation.organizationId }});
      }

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: validInvitation.organizationId,
          role: validInvitation.role
        }
      });
      
      await tx.invitation.delete({ where: { id: validInvitation.id } });
      return [user];
    });

    console.log(`[AUDIT] Invitation accepted: ${email} for Org ID: ${validInvitation.organizationId}`);

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        currentOrganizationId: user.currentOrganizationId,
        token: generateToken(user.id)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error accepting invite' });
  }
};
