import mongoose from 'mongoose';

const sceneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  sceneNumber: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending',
  },
  taskId: {
    type: String, // from Veo/RunwayML if polling is needed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Scene || mongoose.model('Scene', sceneSchema);
