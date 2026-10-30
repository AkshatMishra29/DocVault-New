import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  category: { type: String, required: true }, // Vehicle, Home Appliances, Electronics, Real Estate
  estimatedValue: { type: String },
  status: { type: String, default: 'Active' },
  purchaseDate: { type: String },
  warrantyExpiry: { type: String },
  insuranceExpiry: { type: String },
  nextService: { type: String },
  icon: { type: String, default: 'FileText' },
  linkedDocumentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  createdAt: { type: Date, default: Date.now },
});

export const Asset = mongoose.model('Asset', AssetSchema);

