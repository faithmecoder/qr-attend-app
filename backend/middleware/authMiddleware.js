import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Lecturer from '../models/Lecturer.js';

// Middleware to protect routes (check for valid token)
const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt; // Read the cookie

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user based on the role in the token
      if (decoded.role === 'student') {
        req.user = await Student.findById(decoded.userId).select('-password');
      } else if (decoded.role === 'lecturer') {
        req.user = await Lecturer.findById(decoded.userId).select('-password');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to check if the user is a lecturer
const isLecturer = (req, res, next) => {
  if (req.user && req.user.role === 'lecturer') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a lecturer');
  }
};

// ▼▼▼ NEW FUNCTION ▼▼▼
// Middleware to check if the user is a student
const studentAuth = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a student');
  }
};
// ▲▲▲ END OF NEW FUNCTION ▲▲▲

// Export all functions
export { 
  protect, 
  isLecturer, 
  studentAuth // ◄◄◄ MAKE SURE NEW FUNCTION IS EXPORTED
};