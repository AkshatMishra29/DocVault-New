import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  pinHash: { type: String, required: true }, // 4-to-6 digit quick unlock PIN
  phone: { type: String },
  tier: { type: String, default: 'Vault Pro (Personal)' },
  biometricsEnabled: { type: Boolean, default: true },
  offlineAccessEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Document Schema
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
  summary: { type: String },
  keyDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  tags: [{ type: String }],
  isFavorite: { type: Boolean, default: false },
  expiryDate: { type: String }, // YYYY-MM-DD
  isExpiringSoon: { type: Boolean, default: false },
  embedding: [{ type: Number }], // Hugging Face 384-dim vector
  createdAt: { type: Date, default: Date.now },
});

// Asset Schema
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

// Deadline & Reminder Schema
const DeadlineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  daysLeft: { type: Number },
  severity: { type: String, enum: ['urgent', 'upcoming', 'normal'], default: 'upcoming' },
  linkedDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  action: { type: String },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // VIEW, DOWNLOAD, UPLOAD, DELETE, SHARE
  documentTitle: { type: String },
  ipAddress: { type: String },
  device: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);
export const Document = mongoose.model('Document', DocumentSchema);
export const Asset = mongoose.model('Asset', AssetSchema);
export const Deadline = mongoose.model('Deadline', DeadlineSchema);
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
