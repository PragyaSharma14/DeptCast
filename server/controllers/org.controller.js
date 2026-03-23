import Organization from '../models/Organization.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Get current org details (uses requireTenant middleware, so req.org is populated)
export const getOrgDetails = async (req, res) => {
  res.json({ organization: req.org });
};

// Get all orgs the user is a member of
export const getMyOrgs = async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.user._id }).populate('organizationId');
    const orgs = memberships.map(m => ({
      ...m.organizationId.toObject(),
      myRole: m.role
    }));
    res.json(orgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new org
export const createOrg = async (req, res) => {
  const { name } = req.body;
  try {
    const org = await Organization.create({ name });
    await Membership.create({
      userId: req.user._id,
      organizationId: org._id,
      role: 'admin'
    });
    
    req.user.currentOrganizationId = org._id;
    await req.user.save();
    
    res.status(201).json(org);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all members of the tenant org
export const getOrgMembers = async (req, res) => {
  try {
    const members = await Membership.find({ organizationId: req.org._id }).populate('userId', 'name email');
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Change user role (Admin only)
export const updateMemberRole = async (req, res) => {
  const { memberId } = req.params;
  const { role } = req.body;

  try {
    const member = await Membership.findOne({ _id: memberId, organizationId: req.org._id });
    if (!member) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    member.role = role;
    await member.save();
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove user from org (Admin only)
export const removeMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    await Membership.findOneAndDelete({ _id: memberId, organizationId: req.org._id });
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Invite User (Admin only)
export const inviteUser = async (req, res) => {
  const { email, role } = req.body;

  try {
    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(rawToken, salt);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24h expiration

    await Invitation.create({
      email,
      organizationId: req.org._id,
      role: role || 'member',
      tokenHash,
      expiresAt
    });

    // VERY IMPORTANT: MOCK EMAIL LOG FOR DEMO
    console.log(`\n\n=== 📧 EMAIL SENT TO ${email} ===\n`);
    console.log(`You have been invited to join ${req.org.name}.`);
    console.log(`Role: ${role}`);
    console.log(`Join Link: http://localhost:5173/invite?token=${rawToken}&email=${email}`);
    console.log(`\n===================================\n\n`);

    res.status(201).json({ message: 'Invite sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
