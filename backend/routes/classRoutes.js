//classRoutes.js
import express from "express";
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create class
router.post("/", protect, createClass);

// Get all classes
router.get("/", protect, getAllClasses);

// Fetch single class
router.get("/:id", protect, getClassById);

// Update class
router.put("/:id", protect, updateClass);

// Delete class
router.delete("/:id", protect, deleteClass);

export default router;
