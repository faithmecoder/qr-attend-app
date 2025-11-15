// backend/controllers/attendanceController.js
import AttendanceRecord from "../models/AttendanceRecord.js";
import Session from "../models/Session.js";
import calculateDistance from "../utils/calculateDistance.js";

/**
 * markAttendance - student-only endpoint
 * Body: { qrCodeValue, latitude, longitude }
 */
export const markAttendance = async (req, res) => {
  const { qrCodeValue, latitude, longitude } = req.body;
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
  const deviceId = req.headers["user-agent"] || "unknown";
  const student = req.user;

  try {
    const session = await Session.findOne({ qrCodeValue, isActive: true }).populate("classId");
    if (!session) return res.status(404).json({ message: "Active session not found" });

    if (new Date() > new Date(session.expirationTime)) {
      session.isActive = false;
      await session.save();
      return res.status(410).json({ message: "Session expired" });
    }

    if (session.geofenceEnabled) {
      if (!latitude || !longitude) return res.status(400).json({ message: "Location required for geofenced session" });

      const distance = calculateDistance(latitude, longitude, session.latitude, session.longitude);
      if (distance > session.geofenceRadius) {
        await AttendanceRecord.create({
          sessionId: session._id,
          studentId: student._id,
          ipAddress,
          deviceId,
          isProxy: true,
        });
        return res.status(403).json({ message: "Outside allowed area (geofence)" });
      }
    }

    const existing = await AttendanceRecord.findOne({
      sessionId: session._id,
      $or: [{ studentId: student._id }, { ipAddress }],
      isProxy: false,
    });

    if (existing) return res.status(403).json({ message: "Already marked" });

    const newRecord = await AttendanceRecord.create({
      sessionId: session._id,
      studentId: student._id,
      ipAddress,
      deviceId,
      isProxy: false,
    });

    res.status(201).json({ message: "Attendance marked", record: newRecord });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};
