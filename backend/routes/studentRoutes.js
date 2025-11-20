// backend/routes/studentsRoutes.js
import express from "express";
import {
  registerStudent,
  loginStudent,
  logoutStudent,
  getStudentAttendance,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/logout", logoutStudent);

router.get("/attendance", protect, getStudentAttendance);

export default router;
