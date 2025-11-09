import express from 'express';
import Session from '../models/Session.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import calculateDistance from '../utils/calculateDistance.js';
import { studentAuth } from '../middleware/authMiddleware.js'; // ◄◄◄ IMPORT MIDDLEWARE

const router = express.Router();

// @desc    Mark attendance
// @route   POST /api/student/attendance/mark
// ▼▼▼ ADD studentAuth MIDDLEWARE HERE ▼▼▼
router.post('/attendance/mark', studentAuth, async (req, res) => {
  // Notice: 'studentId' is GONE from req.body
  const { qrCodeValue, latitude, longitude } = req.body;
  const ipAddress = req.ip;
  const deviceId = req.headers['user-agent'] || 'unknown';

  // Get the logged-in student from the token (provided by studentAuth)
  const student = req.user; // ◄◄◄ GET STUDENT FROM TOKEN

  if (!qrCodeValue || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Find the student - NO LONGER NEEDED, we have them from req.user
    
    // 2. Find the active session
    const session = await Session.findOne({ qrCodeValue, isActive: true })
                                 .populate('classId');
    
    // 3. Session Validity Check
    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found or is inactive.' });
    }

    // 4. Expiration Time Check
    if (new Date() > new Date(session.expirationTime)) {
      session.isActive = false;
      await session.save();
      return res.status(410).json({ message: 'Attendance session has expired.' });
    }

    const classData = session.classId;

    // 5. Geolocation (Geofencing) Validation
    const distance = calculateDistance(
      latitude,
      longitude,
      classData.latitude,
      classData.longitude
    );

    if (distance > classData.geofenceRadius) {
      // Log the failed attempt but reject it
      await AttendanceRecord.create({
        sessionId: session._id,
        studentId: student._id, // ◄◄◄ Use student._id from token
        ipAddress,
        deviceId,
        isProxy: true,
      });
      return res.status(403).json({ 
        message: `Attendance failed: You appear to be outside the classroom area. (Distance: ${Math.round(distance)}m)` 
      });
    }

    // 6. Device & IP Limiting
    const existingRecord = await AttendanceRecord.findOne({
      sessionId: session._id,
      $or: [
        { studentId: student._id }, // ◄◄◄ Use student._id from token
        { ipAddress: ipAddress },
      ],
      isProxy: false
    });

    if (existingRecord) {
      let message = 'Attendance failed: ';
      if (existingRecord.studentId.equals(student._id)) {
        message += 'You have already been marked for this session.';
      } else if (existingRecord.ipAddress === ipAddress) {
        message += 'This device or network has already been used for this session.';
      }
      return res.status(403).json({ message });
    }

    // 7. SUCCESS: Log attendance.
    const newRecord = await AttendanceRecord.create({
      sessionId: session._id,
      studentId: student._id, // ◄◄◄ Use student._id from token
      ipAddress,
      deviceId,
      isProxy: false,
    });

    res.status(201).json({ 
      message: `Attendance marked successfully for ${student.name}!`, // ◄◄◄ Use student.name from token
      record: newRecord 
    });

  } catch (error) {
    console.error('Attendance marking error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

export default router;