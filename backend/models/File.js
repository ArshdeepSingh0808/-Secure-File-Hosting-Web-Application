import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareId: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);