// backend/routes/studentRoutes.js
import express from "express";
import { registerStudent, loginStudent } from "../controllers/studentController.js";
import { protect, studentAuth } from "../middleware/authMiddleware.js";
import { markAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

// Register a new student
router.post("/register", registerStudent);

// Login student
router.post("/login", loginStudent);

// Student marks attendance
router.post("/attendance", protect, studentAuth, markAttendance);

export default router;
