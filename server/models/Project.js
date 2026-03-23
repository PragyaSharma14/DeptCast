import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
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
  intent: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true, // e.g., 'marketing', 'it', 'finance'
  },
  style: {
    type: String,
    required: true, // e.g., 'cinematic', 'corporate'
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'failed'],
    default: 'draft',
  },
  finalVideoUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
