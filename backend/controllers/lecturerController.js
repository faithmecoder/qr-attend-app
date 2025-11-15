import Lecturer from "../models/Lecturer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ============================
// REGISTER LECTURER
// ============================
export const registerLecturer = async (req, res) => {
  try {
    const { name, email, password, geofence } = req.body;

    // Check if lecturer already exists
    const existing = await Lecturer.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Lecturer already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new lecturer with optional geofencing
    const newLecturer = new Lecturer({
      name,
      email,
      password: hashedPassword,
      role: "lecturer",
      geofence: geofence || null,  // <--- IMPORTANT FIX
    });

    await newLecturer.save();

    res.status(201).json({ message: "Lecturer registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// LOGIN LECTURER
// ============================
export const loginLecturer = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN REQUEST BODY:", req.body);



    const lecturer = await Lecturer.findOne({ email });
    console.log("LECTURER FROM DB:", lecturer);

    if (!lecturer)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, lecturer.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: lecturer._id, role: "lecturer" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Normalize output to match frontend
    res.json({
      token,
      user: {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        role: "lecturer",
        geofence: lecturer.geofence || null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
