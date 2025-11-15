// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Student from "../models/Student.js";
import Lecturer from "../models/Lecturer.js";

// Protect routes with Bearer token ONLY
export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // Read "Authorization: Bearer <token>"
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Token invalid or expired");
  }
});

// Student-only access
export const studentAuth = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "student") {
    res.status(403);
    throw new Error("Access denied: Students only");
  }

  const student = await Student.findById(req.user.id).select("-password");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  req.user = student;
  next();
});

// Lecturer-only access
export const lecturerAuth = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "lecturer") {
    res.status(403);
    throw new Error("Access denied: Lecturers only");
  }

  const lecturer = await Lecturer.findById(req.user.id).select("-password");
  if (!lecturer) {
    res.status(404);
    throw new Error("Lecturer not found");
  }

  req.user = lecturer;
  next();
});
