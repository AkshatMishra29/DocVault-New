import mongoose from 'mongoose';

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

export const Deadline = mongoose.model('Deadline', DeadlineSchema);

