// backend/controllers/studentController.js
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import generateAndSetToken from "../utils/generateToken.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import ClassModel from "../models/Class.js";

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;
    if (!name || !email || !password || !studentId)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Student exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newStudent = new Student({ name, email, password: hashed, studentId });
    await newStudent.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("registerStudent error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateAndSetToken(res, student._id, "student");

    const safeStudent = { _id: student._id, name: student.name, email: student.email, role: student.role, studentId: student.studentId };
    res.status(200).json({ student: safeStudent });
  } catch (err) {
    console.error("loginStudent error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const logoutStudent = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ message: "Logged out" });
};

// Optional: student views their own attendance
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;
    const records = await AttendanceRecord.find({ studentId }).populate("sessionId").populate("studentId", "name studentId");
    res.status(200).json(records);
  } catch (err) {
    console.error("getStudentAttendance error:", err);
    res.status(500).json({ message: err.message });
  }
};
