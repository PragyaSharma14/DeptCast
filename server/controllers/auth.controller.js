import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Membership from '../models/Membership.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the User
    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Create default Organization for the user
    const org = await Organization.create({
      name: `${name}'s Workspace`
    });

    // Create default Membership (Admin)
    await Membership.create({
      userId: user._id,
      organizationId: org._id,
      role: 'admin'
    });

    // Set user's current trackable org
    user.currentOrganizationId = org._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentOrganizationId: org._id,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        currentOrganizationId: user.currentOrganizationId,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
