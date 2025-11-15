// backend/models/Class.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true },
    className: { type: String, required: true },
    geofenceEnabled: { type: Boolean, default: false }, // class-level default (optional)
    latitude: { type: Number },
    longitude: { type: Number },
    geofenceRadius: { type: Number },
    activeSession: {
      qrCodeValue: { type: String },
      expirationTime: { type: Date },
      geofenceEnabled: { type: Boolean },
      latitude: { type: Number },
      longitude: { type: Number },
      geofenceRadius: { type: Number },
    },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
export default Class;
