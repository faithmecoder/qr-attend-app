import jwt from 'jsonwebtoken';
import Lecturer from '../models/Lecturer.js';
import Student from '../models/Student.js';

const protect = (role = null) => async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (role === 'lecturer') {
        req.user = await Lecturer.findById(decoded.userId).select('-passwordHash');
      } else if (role === 'student') {
        req.user = await Student.findById(decoded.userId).select('-passwordHash');
      } else {
        // Generic protection, just get user ID
        req.user = { _id: decoded.userId, role: decoded.role };
      }

      if (!req.user || (role && decoded.role !== role)) {
         return res.status(401).json({ message: 'Not authorized, invalid role' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const lecturerAuth = protect('lecturer');
export const studentAuth = protect('student');
export const generalAuth = protect();