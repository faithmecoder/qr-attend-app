import Student from "../models/Student.js";
import Attendance from "../models/AttendanceRecord.js";
import Session from "../models/Session.js";
import ClassModel from "../models/Class.js";
import generateToken from "../utils/generateToken.js";

// ===========================
// REGISTER STUDENT
// ===========================
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newStudent = await Student.create({
      name,
      email,
      password,
      studentId,
      role: "student",
    });

    res.status(201).json({
      message: "Student registered",
      student: {
        _id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        role: newStudent.role,
        studentId: newStudent.studentId,
      },
    });
  } catch (err) {
    console.error("Register student error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ===========================
// LOGIN STUDENT
// ===========================
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student || !(await student.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // issue cookie
    generateToken(res, student._id);

    res.json({
      message: "Login successful",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        studentId: student.studentId,
      },
    });
  } catch (err) {
    console.error("Login student error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ===========================
// LOGOUT STUDENT
// ===========================
export const logoutStudent = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "None",
    secure: true,
  });

  res.json({ message: "Logged out" });
};

// ===========================
// GET STUDENT ATTENDANCE
// ===========================
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    const records = await Attendance.find({ studentId })
      .populate({
        path: "sessionId",
        populate: {
          path: "classId",
          model: "Class",
        },
      })
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error("Get student attendance error:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};
