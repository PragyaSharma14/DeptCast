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

    // Create the User, Organization, and Membership in a transaction?
    // prisma supports this, but let's do sequentially to keep logic similar
    
    let user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    const org = await prisma.organization.create({
      data: {
        name: `${name}'s Workspace`
      }
    });

    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: 'admin'
      }
    });

    user = await prisma.user.update({
      where: { id: user.id },
      data: { currentOrganizationId: org.id }
    });

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
