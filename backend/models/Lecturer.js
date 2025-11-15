// backend/models/Lecturer.js
import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "lecturer", enum: ["lecturer", "student"] },
    geofencingEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Lecturer = mongoose.model("Lecturer", LecturerSchema);
export default Lecturer;
