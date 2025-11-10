import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  classId: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
  
  
  geofenceEnabled: { type: Boolean, default: true },
  latitude: { type: Number, required: false }, 
  longitude: { type: Number, required: false }, 
  geofenceRadius: { type: Number, required: false, default: 100 } 
  

}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
export default Class;