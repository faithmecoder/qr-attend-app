// backend/controllers/lecturerController.js
import Lecturer from "../models/Lecturer.js";
import bcrypt from "bcryptjs";
import generateAndSetToken from "../utils/generateToken.js";

const debugLogRequest = (req, tag = "") => {
  console.log(`\n--- DEBUG ${tag} ---`);
  console.log("origin:", req.headers.origin || null);
  console.log("referer:", req.headers.referer || null);
  console.log("user-agent:", req.headers["user-agent"] || null);
  console.log("body:", req.body);
  console.log("cookies:", req.cookies || {});
  console.log("--- END DEBUG ---\n");
};

export const registerLecturer = async (req, res) => {
  try {
    debugLogRequest(req, "registerLecturer");

    const { name, email, password, lecturerId } = req.body;
    if (!name || !email || !password || !lecturerId)
      return res.status(400).json({ message: "Missing fields" });

    const existingEmail = await Lecturer.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already registered" });

    const existingId = await Lecturer.findOne({ lecturerId });
    if (existingId) return res.status(400).json({ message: "Lecturer ID already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newLecturer = new Lecturer({
      name,
      email,
      password: hashed,
      lecturerId,
    });

    await newLecturer.save();
    res.status(201).json({ message: "Lecturer registered successfully" });
  } catch (err) {
    console.error("registerLecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginLecturer = async (req, res) => {
  try {
    debugLogRequest(req, "loginLecturer");

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const lecturer = await Lecturer.findOne({ email });
    if (!lecturer) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, lecturer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateAndSetToken(res, lecturer._id, "lecturer");

    const safeLecturer = { _id: lecturer._id, name: lecturer.name, email: lecturer.email, lecturerId: lecturer.lecturerId, role: "lecturer" };
    res.status(200).json({ lecturer: safeLecturer });
  } catch (err) {
    console.error("loginLecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const logoutLecturer = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("logoutLecturer error:", err);
    res.status(500).json({ message: err.message });
  }
};
