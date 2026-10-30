import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // VIEW, DOWNLOAD, UPLOAD, DELETE, SHARE
  documentTitle: { type: String },
  ipAddress: { type: String },
  device: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

