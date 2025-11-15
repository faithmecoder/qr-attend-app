// backend/models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    qrCodeValue: { type: String, required: true },
    expirationTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    geofenceEnabled: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    geofenceRadius: { type: Number },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
