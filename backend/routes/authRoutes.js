import express from 'express';
import Lecturer from '../models/Lecturer.js';
import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// @desc    Register a new lecturer
// @route   POST /api/auth/register-lecturer
router.post('/register-lecturer', async (req, res) => {
  const { lecturerId, name, email, password } = req.body;
  try {
    const userExists = await Lecturer.findOne({ $or: [{ email }, { lecturerId }] });
    if (userExists) {
      return res.status(400).json({ message: 'Lecturer already exists' });
    }
    const lecturer = await Lecturer.create({
      lecturerId,
      name,
      email,
      passwordHash: password, // Hashing is handled by pre-save hook
    });
    res.status(201).json({
      _id: lecturer._id,
      name: lecturer.name,
      email: lecturer.email,
      role: 'lecturer',
      token: generateToken(res, lecturer._id, 'lecturer'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new student
// @route   POST /api/auth/register-student
router.post('/register-student', async (req, res) => {
  const { studentId, name, email, password } = req.body;
  try {
    const userExists = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }
    const student = await Student.create({
      studentId,
      name,
      email,
      passwordHash: password, // Hashing is handled by pre-save hook
    });
    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: 'student',
      token: generateToken(res, student._id, 'student'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login user (Lecturer or Student)
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await Lecturer.findOne({ email });
    let role = 'lecturer';

    if (!user) {
      user = await Student.findOne({ email });
      role = 'student';
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        token: generateToken(res, user._id, role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;