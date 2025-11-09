import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  deviceId: { type: String }, // User-Agent string
  isProxy: { type: Boolean, default: false } // True if geofence failed
}, { timestamps: true });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
export default AttendanceRecord;