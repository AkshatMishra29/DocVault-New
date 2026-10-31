import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Insurance', 'Appliances', 'Identity', 'Property', 'Medical', 'Other'],
    default: 'Other'
  },
  format: { type: String, default: 'PDF' },
  mimetype: { type: String },
  fileData: { type: String }, // Base64 encoded file data
  sizeBytes: { type: Number },
  fileSizeFormatted: { type: String },
  storagePath: { type: String, default: 'mongodb' },
  downloadUrl: { type: String },
  extractedText: { type: String, default: '' },
  summary: { type: String },
  keyDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  tags: [{ type: String }],
  isFavorite: { type: Boolean, default: false },
  expiryDate: { type: String }, // YYYY-MM-DD
  isExpiringSoon: { type: Boolean, default: false },
  embedding: [{ type: Number }], // Hugging Face 384-dim vector
  createdAt: { type: Date, default: Date.now },
});

export const Document = mongoose.model('Document', DocumentSchema);

