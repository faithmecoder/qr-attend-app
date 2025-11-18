// backend/server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import lecturerRoutes from "./routes/lecturerRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* -----------------------------------------------------
   TRUST PROXY (REQUIRED FOR RENDER + SECURE COOKIES)
------------------------------------------------------ */
app.set("trust proxy", 1);

/* -----------------------------------------------------
   MIDDLEWARE
------------------------------------------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -----------------------------------------------------
   FIXED CORS — Supports Android Chrome + iPhone Safari
------------------------------------------------------ */
const allowedOrigins = [
  process.env.FRONTEND_URL,  // Vercel
  "http://localhost:5173",   // Local dev
  null                       // Mobile Chrome / WebView
];

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // 🌍 Mobile Chrome / Apps often send no origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback(new Error("CORS error: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight for all routes
app.options("*", cors());

/* -----------------------------------------------------
   ROUTES
------------------------------------------------------ */
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer/classes", classRoutes);
app.use("/api/lecturer/sessions", sessionRoutes);
app.use("/api/student/attendance", attendanceRoutes);

/* -----------------------------------------------------
   HEALTH CHECK
------------------------------------------------------ */
app.get("/", (req, res) => {
  res.json({
    status: "QR Attendance Backend Running",
    origin: req.headers.origin || null,
    forwardedFor: req.headers["x-forwarded-for"] || null,
    cookie: req.headers.cookie || "none",
  });
});

/* -----------------------------------------------------
   GLOBAL ERROR HANDLER
------------------------------------------------------ */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({ message: err.message || "Server Error" });
});

/* -----------------------------------------------------
   START SERVER
------------------------------------------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
