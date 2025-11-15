// backend/controllers/sessionController.js
import crypto from "crypto";
import Session from "../models/Session.js";
import ClassModel from "../models/Class.js";
import AttendanceRecord from "../models/AttendanceRecord.js";

/**
 * startSession
 * Payload: { classId, geofenceEnabled, latitude, longitude, geofenceRadius }
 * Creates a session with a QR code value and expiration (5 minutes)
 */
export const startSession = async (req, res) => {
  try {
    const { classId, geofenceEnabled, latitude, longitude, geofenceRadius } = req.body;

    // verify class exists
    const cls = await ClassModel.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const qrCodeValue = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const newSession = await Session.create({
      classId,
      qrCodeValue,
      expirationTime,
      isActive: true,
      geofenceEnabled: !!geofenceEnabled,
      latitude: geofenceEnabled ? latitude : null,
      longitude: geofenceEnabled ? longitude : null,
      geofenceRadius: geofenceEnabled ? geofenceRadius : null,
    });

    res.status(201).json(newSession);
  } catch (err) {
    console.error("startSession error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * reloadSession
 * Payload: { sessionId }
 * Generates new qrCodeValue and extends expiration
 */
export const reloadSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // new QR and new expiration
    const qrCodeValue = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    session.qrCodeValue = qrCodeValue;
    session.expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    session.isActive = true;

    await session.save();

    res.status(200).json(session);
  } catch (err) {
    console.error("reloadSession error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * getSessionAttendance
 * GET /api/lecturer/sessions/:id/attendance
 */
export const getSessionAttendance = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const records = await AttendanceRecord.find({ sessionId })
      .populate("studentId", "name studentId")
      .sort({ createdAt: 1 });

    res.status(200).json(records);
  } catch (err) {
    console.error("getSessionAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};
