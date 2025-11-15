// backend/routes/studentRoutes.js
import express from "express";
import { registerStudent, loginStudent, logoutStudent, getStudentAttendance } from "../controllers/studentController.js";
import { protect, studentAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/logout", logoutStudent);

// optional: student can view own attendance history
router.get("/attendance", protect, studentAuth, getStudentAttendance);

export default router;
