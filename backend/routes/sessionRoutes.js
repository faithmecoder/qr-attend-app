// backend/routes/sessionRoutes.js
import express from "express";
import { startSession, reloadSession, getSessionAttendance } from "../controllers/sessionController.js";
import { protect, lecturerAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Start a session (lecturer)
router.post("/start", protect, lecturerAuth, startSession);

// Reload a session (lecturer)
router.post("/reload", protect, lecturerAuth, reloadSession);

// Get session attendance (lecturer view)
router.get("/:id/attendance", protect, lecturerAuth, getSessionAttendance);

export default router;
