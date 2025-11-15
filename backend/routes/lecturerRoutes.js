// backend/routes/lecturerRoutes.js
import express from "express";
import { registerLecturer, loginLecturer, logoutLecturer } from "../controllers/lecturerController.js";

const router = express.Router();

router.post("/register", registerLecturer);
router.post("/login", loginLecturer);
router.post("/logout", logoutLecturer);

export default router;
