import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
  qrCodeValue: { type: String, required: true, unique: true },
  expirationTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
export default Session;