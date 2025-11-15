// backend/routes/sessionRoutes.js
import express from "express";
import { startSession, reloadSession, getSessionAttendance } from "../controllers/sessionController.js";
import { protect, lecturerAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, lecturerAuth, startSession);
router.post("/reload", protect, lecturerAuth, reloadSession);
router.get("/:id/attendance", protect, lecturerAuth, getSessionAttendance);

export default router;
