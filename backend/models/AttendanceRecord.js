// backend/models/AttendanceRecord.js
import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    ipAddress: {
      type: String,
      required: true,
    },

    deviceId: {
      type: String,
      required: true, // user-agent
    },

    isProxy: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);

export default AttendanceRecord;
