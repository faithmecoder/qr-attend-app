// backend/controllers/studentController.js
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AttendanceRecord from "../models/AttendanceRecord.js";
import Class from "../models/Class.js";

// ----------------------
// REGISTER STUDENT
// ----------------------
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    const existing = await Student.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Student already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      studentId,
      role: "student",
    });

    await newStudent.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------
// LOGIN STUDENT
// ----------------------
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------
// STUDENT – VIEW OWN ATTENDANCE HISTORY
// (Optional: Used only if needed)
// ----------------------
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    const records = await AttendanceRecord.find({ studentId })
      .populate("sessionId")
      .populate("studentId", "name studentId");

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------
// STUDENT – VIEW ALL CLASSES (optional)
// ----------------------
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({});
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
