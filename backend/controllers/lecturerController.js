// backend/controllers/lecturerController.js
import Lecturer from "../models/Lecturer.js";
import bcrypt from "bcryptjs";
import generateAndSetToken from "../utils/generateToken.js";

export const registerLecturer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await Lecturer.findOne({ email });
    if (existing) return res.status(400).json({ message: "Lecturer exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newLecturer = new Lecturer({ name, email, password: hashed });
    await newLecturer.save();

    res.status(201).json({ message: "Lecturer registered successfully" });
  } catch (err) {
    console.error("registerLecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginLecturer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const lecturer = await Lecturer.findOne({ email });
    if (!lecturer) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, lecturer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateAndSetToken(res, lecturer._id, "lecturer");

    // Return lecturer data (without password)
    const safeLecturer = { _id: lecturer._id, name: lecturer.name, email: lecturer.email, role: lecturer.role };
    res.status(200).json({ lecturer: safeLecturer });
  } catch (err) {
    console.error("loginLecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const logoutLecturer = async (req, res) => {
  // Clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ message: "Logged out" });
};
