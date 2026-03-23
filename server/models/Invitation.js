import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member',
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
