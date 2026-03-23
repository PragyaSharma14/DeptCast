import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logoUrl: {
    type: String,
  },
  subscriptionStatus: {
    type: String,
    enum: ['trialing', 'active', 'past_due', 'canceled'],
    default: 'trialing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
