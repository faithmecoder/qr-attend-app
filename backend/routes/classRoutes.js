// backend/routes/classRoutes.js
import express from "express";
import { createClass, getAllClasses, getClassById, updateClass, deleteClass } from "../controllers/classController.js";
import { protect, lecturerAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, lecturerAuth, createClass);
router.get("/", protect, lecturerAuth, getAllClasses);
router.get("/:id", protect, lecturerAuth, getClassById);
router.put("/:id", protect, lecturerAuth, updateClass);
router.delete("/:id", protect, lecturerAuth, deleteClass);

export default router;
