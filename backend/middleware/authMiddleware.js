// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Student from "../models/Student.js";
import Lecturer from "../models/Lecturer.js";

/**
 * protect - read token from cookie 'token' first, fallback to Authorization header.
 * sets req.user = decoded payload { id, role }.
 */
export const protect = asyncHandler(async (req, res, next) => {
  // cookie parser must be used
  const cookieToken = req.cookies?.token;
  const headerToken =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

  const token = cookieToken || headerToken;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid");
  }
});

export const studentAuth = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    res.status(403);
    throw new Error("Access denied: students only");
  }
  const student = await Student.findById(req.user.id).select("-password");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  req.user = student;
  next();
});

export const lecturerAuth = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "lecturer") {
    res.status(403);
    throw new Error("Access denied: lecturers only");
  }
  const lecturer = await Lecturer.findById(req.user.id).select("-password");
  if (!lecturer) {
    res.status(404);
    throw new Error("Lecturer not found");
  }
  req.user = lecturer;
  next();
});
