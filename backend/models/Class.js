import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  classId: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  geofenceRadius: { type: Number, required: true, default: 100 } // Radius in meters
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
export default Class;