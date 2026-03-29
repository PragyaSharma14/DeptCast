import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_key') {
  console.log(`[INIT] Resend initialized with key: ${process.env.RESEND_API_KEY.substring(0, 5)}...`);
} else {
  console.log(`[INIT] Resend initialized with MOCK key. Real emails will NOT be sent.`);
}

// Get current org details (uses requireTenant middleware, so req.org is populated)
export const getOrgDetails = async (req, res) => {
  // Map id to _id for frontend compatibility
  res.json({ organization: { ...req.org, _id: req.org.id } });
};

// Get all orgs the user is a member of
export const getMyOrgs = async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: { userId: req.user.id || req.user._id },
      include: { organization: true }
    });
    
    const orgs = memberships.map(m => ({
      ...m.organization,
      _id: m.organization.id,
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
    const org = await prisma.organization.create({ data: { name } });
    
    await prisma.membership.create({
      data: {
        userId: req.user.id || req.user._id,
        organizationId: org.id,
        role: 'admin'
      }
    });
    
    await prisma.user.update({
      where: { id: req.user.id || req.user._id },
      data: { currentOrganizationId: org.id }
    });
    
    // Ensure req.user has the updated ID for subsequent middleware if any
    req.user.currentOrganizationId = org.id;
    
    console.log(`[AUDIT] Organization created: ${name} (ID: ${org.id}) by User: ${req.user.id || req.user._id}`);
    
    res.status(201).json({ ...org, _id: org.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateOrg = async (req, res) => {
  const { name, logoUrl } = req.body;
  
  try {
    const updatedOrg = await prisma.organization.update({
      where: { id: req.org.id || req.org._id },
      data: { 
        ...(name && { name }),
        ...(logoUrl && { logoUrl })
      }
    });

    console.log(`[AUDIT] Organization updated: ${req.org.id || req.org._id} (Changes: ${name ? 'name ' : ''}${logoUrl ? 'logo' : ''})`);

    res.json({ ...updatedOrg, _id: updatedOrg.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating organization' });
  }
};

// Get all members of the tenant org
export const getOrgMembers = async (req, res) => {
  try {
    const members = await prisma.membership.findMany({
      where: { organizationId: req.org.id || req.org._id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const formattedMembers = members.map(m => ({
      ...m,
      _id: m.id,
      userId: {
        ...m.user,
        _id: m.user.id
      }
    }));

    res.json(formattedMembers);
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
    const member = await prisma.membership.findFirst({
      where: {
        id: memberId,
        organizationId: req.org.id || req.org._id
      }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const updatedMember = await prisma.membership.update({
      where: { id: member.id },
      data: { role }
    });
    
    console.log(`[AUDIT] Member role updated: Member ID ${memberId} in Org ${req.org.id || req.org._id} to Role: ${role}`);
    
    res.json({ ...updatedMember, _id: updatedMember.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove user from org (Admin only)
export const removeMember = async (req, res) => {
  const { memberId } = req.params;

  try {
    const membership = await prisma.membership.findFirst({
        where: { id: memberId, organizationId: req.org.id || req.org._id }
    });
    
    if(!membership) return res.status(404).json({ error: "Membership not found" });

    // Transaction to safely delete and cleanup
    await prisma.$transaction(async (tx) => {
        await tx.membership.delete({ where: { id: membership.id } });
        
        // If the user currently has this org set as active, clear it
        const user = await tx.user.findUnique({ where: { id: membership.userId } });
        if(user && user.currentOrganizationId === membership.organizationId) {
            await tx.user.update({
                where: { id: user.id },
                data: { currentOrganizationId: null }
            });
        }
    });
    
    console.log(`[AUDIT] User ${membership.userId} removed from Org ${membership.organizationId} by admin`);

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

    await prisma.invitation.create({
      data: {
        email,
        organizationId: req.org.id || req.org._id,
        role: role || 'member',
        tokenHash,
        expiresAt
      }
    });

    const inviteUrl = `http://localhost:5173/invite?token=${rawToken}&email=${email}`;

    let sentViaEmail = false;
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_key') {
      try {
        const { error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: `Invitation to join ${req.org.name}`,
          html: `
            <h2>You've been invited!</h2>
            <p>You have been invited to join the workspace <strong>${req.org.name}</strong> as a <strong>${role}</strong>.</p>
            <p><a href="${inviteUrl}" style="padding: 8px 16px; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Accept Invitation</a></p>
          `
        });
        
        if (error) {
          console.error("Resend Error Object:", error);
        } else {
          sentViaEmail = true;
        }
      } catch (err) {
        console.error("Resend Exception:", err);
      }
    } 
    
    if (!sentViaEmail) {
      console.log(`\n\n=== 📧 MOCK EMAIL LOG ===\n`);
      console.log(`To: ${email}`);
      console.log(`Workspace: ${req.org.name}`);
      console.log(`Role: ${role}`);
      console.log(`Join Link: ${inviteUrl}`);
      console.log(`\n=========================\n\n`);
    }

    res.status(201).json({ 
      message: 'Invite processed', 
      sentViaEmail,
      email 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
