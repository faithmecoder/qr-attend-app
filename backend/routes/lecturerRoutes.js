
// lecturerRoutes.js
import express from "express";
import { registerLecturer, loginLecturer } from "../controllers/lecturerController.js";

const router = express.Router();

router.post("/register", registerLecturer);
router.post("/login", loginLecturer);

export default router;
