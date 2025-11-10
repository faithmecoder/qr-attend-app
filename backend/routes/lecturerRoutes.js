import express from 'express';
import { protect, isLecturer } from '../middleware/authMiddleware.js';
import {
  registerLecturer,
  loginLecturer,
  getLecturerProfile,
  createClass,
  getLecturerClasses,
  startClassSession,
  getSessionAttendance,
  reloadClassSession // ◄◄◄ IMPORT NEW FUNCTION
} from '../controllers/lecturerController.js';

const router = express.Router();

router.post('/register', registerLecturer);
router.post('/login', loginLecturer);
router.get('/profile', protect, isLecturer, getLecturerProfile);

router.route('/classes')
  .post(protect, isLecturer, createClass)
  .get(protect, isLecturer, getLecturerClasses);

router.post('/sessions/start', protect, isLecturer, startClassSession);
router.post('/sessions/reload', protect, isLecturer, reloadClassSession); // ◄◄◄ ADD NEW ROUTE
router.get('/sessions/:sessionId/attendance', protect, isLecturer, getSessionAttendance);

export default router;