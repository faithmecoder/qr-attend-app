import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Class from '../models/Class.js';
import Session from '../models/Session.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import { lecturerAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new class
// @route   POST /api/lecturer/classes
router.post('/classes', lecturerAuth, async (req, res) => {
  const { classId, className, latitude, longitude, geofenceRadius } = req.body;
  try {
    const newClass = new Class({
      classId,
      className,
      latitude,
      longitude,
      geofenceRadius,
      lecturerId: req.user._id,
    });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all classes for the logged-in lecturer
// @route   GET /api/lecturer/classes
router.get('/classes', lecturerAuth, async (req, res) => {
  try {
    const classes = await Class.find({ lecturerId: req.user._id });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Start a new attendance session
// @route   POST /api/lecturer/sessions/start
router.post('/sessions/start', lecturerAuth, async (req, res) => {
  const { classId } = req.body;
  
  // Set expiration time (e.g., 5 minutes from now)
  const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
  const qrCodeValue = uuidv4(); // Unique string for this session

  try {
    const newSession = new Session({
      classId,
      lecturerId: req.user._id,
      qrCodeValue,
      expirationTime,
      isActive: true,
    });
    const savedSession = await newSession.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get attendance records for a session
// @route   GET /api/lecturer/sessions/:sessionId/attendance
router.get('/sessions/:sessionId/attendance', lecturerAuth, async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ sessionId: req.params.sessionId })
      .populate('studentId', 'name studentId'); // Get student name and ID
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;