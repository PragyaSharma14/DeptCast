import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only have one membership per org
membershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

export default mongoose.models.Membership || mongoose.model('Membership', membershipSchema);
