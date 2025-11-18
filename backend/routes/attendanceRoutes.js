// backend/routes/attendanceRoutes.js
import express from "express";
import { markAttendance } from "../controllers/attendanceController.js";
import { protect, studentAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Student marks attendance
 * POST /api/attendance
 */
router.post("/", protect, studentAuth, markAttendance);

export default router;
