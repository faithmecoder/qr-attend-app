import asyncHandler from 'express-async-handler';
import Lecturer from '../models/Lecturer.js';
import Class from '../models/Class.js';
import Session from '../models/Session.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import generateToken from '../utils/generateToken.js';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// @desc    Register a new lecturer
// @route   POST /api/lecturer/register
// @access  Public
const registerLecturer = asyncHandler(async (req, res) => {
  const { name, email, password, lecturerId } = req.body;

  const lecturerExists = await Lecturer.findOne({ email });

  if (lecturerExists) {
    res.status(400);
    throw new Error('Lecturer already exists');
  }

  const lecturer = await Lecturer.create({
    name,
    email,
    password,
    lecturerId,
  });

  if (lecturer) {
    generateToken(res, lecturer._id, 'lecturer');
    res.status(201).json({
      _id: lecturer._id,
      name: lecturer.name,
      email: lecturer.email,
      lecturerId: lecturer.lecturerId,
      role: 'lecturer',
    });
  } else {
    res.status(400);
    throw new Error('Invalid lecturer data');
  }
});

// @desc    Auth lecturer & get token
// @route   POST /api/lecturer/login
// @access  Public
const loginLecturer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const lecturer = await Lecturer.findOne({ email });

  if (lecturer && (await lecturer.matchPassword(password))) {
    generateToken(res, lecturer._id, 'lecturer');
    res.status(200).json({
      _id: lecturer._id,
      name: lecturer.name,
      email: lecturer.email,
      lecturerId: lecturer.lecturerId,
      role: 'lecturer',
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get lecturer profile
// @route   GET /api/lecturer/profile
// @access  Private/Lecturer
const getLecturerProfile = asyncHandler(async (req, res) => {
  const lecturer = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    lecturerId: req.user.lecturerId,
    role: 'lecturer',
  };
  res.status(200).json(lecturer);
});

// @desc    Create a new class
// @route   POST /api/lecturer/classes
// @access  Private/Lecturer
const createClass = asyncHandler(async (req, res) => {
  const { classId, className, geofenceEnabled, latitude, longitude, geofenceRadius } = req.body;

  const classExists = await Class.findOne({ classId });
  if (classExists) {
    res.status(400);
    throw new Error('Class ID already exists');
  }

  const classData = {
    classId,
    className,
    lecturerId: req.user._id,
    geofenceEnabled,
    geofenceRadius: geofenceEnabled ? geofenceRadius : null,
    latitude: geofenceEnabled ? latitude : null,
    longitude: geofenceEnabled ? longitude : null,
  };

  const newClass = await Class.create(classData);
  res.status(201).json(newClass);
});

// @desc    Get classes for a lecturer
// @route   GET /api/lecturer/classes
// @access  Private/Lecturer
const getLecturerClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ lecturerId: req.user._id });
  res.status(200).json(classes);
});

// @desc    Start a new class session
// @route   POST /api/lecturer/sessions/start
// @access  Private/Lecturer
const startClassSession = asyncHandler(async (req, res) => {
  const { classId } = req.body;
  const lecturerId = req.user._id;

  const classInstance = await Class.findById(classId);

  if (!classInstance || classInstance.lecturerId.toString() !== lecturerId.toString()) {
    res.status(401);
    throw new Error('Class not found or you are not authorized');
  }

  let session = await Session.findOne({
    classId,
    expirationTime: { $gt: new Date() }
  });

  if (session) {
    return res.status(200).json(session);
  }

  session = new Session({
    classId,
    lecturerId,
    qrCodeValue: uuidv4(),
    expirationTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  const createdSession = await session.save();
  res.status(201).json(createdSession);
});

// @desc    Get attendance for a session
// @route   GET /api/lecturer/sessions/:sessionId/attendance
// @access  Private/Lecturer
const getSessionAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const attendance = await AttendanceRecord.find({ sessionId }).populate(
    'studentId',
    'name studentId'
  );

  res.status(200).json(attendance);
});

// Export all functions
export {
  registerLecturer,
  loginLecturer,
  getLecturerProfile,
  createClass,
  getLecturerClasses,
  startClassSession,
  getSessionAttendance,
  reloadClassSession
};
// Export all functions
// @desc    Reload an active session's QR code and timer
// @route   POST /api/lecturer/sessions/reload
// @access  Private/Lecturer
const reloadClassSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const lecturerId = req.user._id;

  const session = await Session.findById(sessionId);

  if (!session) {
    res.status(404);
    throw new Error('Session not found.');
  }

  // Verify the session belongs to this lecturer
  const classInstance = await Class.findById(session.classId);
  if (classInstance.lecturerId.toString() !== lecturerId.toString()) {
    res.status(401);
    throw new Error('Not authorized to reload this session.');
  }

  // Generate new values
  session.qrCodeValue = uuidv4();
  session.expirationTime = new Date(Date.now() + 5 * 60 * 1000); // New 5-min timer
  session.isAccepting = true; // Ensure it's accepting

  const updatedSession = await session.save();

  res.status(200).json(updatedSession);
});
