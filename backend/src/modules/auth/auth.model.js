import mongoose from 'mongoose';

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

export const User = mongoose.model('User', UserSchema);

