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

/* Trust proxy for Render/Heroku so secure cookies work behind load balancer */
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* CORS configuration */
const allowedOrigins = [
  process.env.FRONTEND_URL, // production frontend
  "http://localhost:5173",  // local Vite dev
];

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
  if (!origin) return callback(null, true); // allow mobile apps & curl

  if (
    allowedOrigins.includes(origin) ||
    origin.startsWith(process.env.FRONTEND_URL)
  ) {
    return callback(null, true);
  }

  console.log("❌ Blocked by CORS:", origin);
  return callback(new Error("CORS error: origin not allowed"));
},
 credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// enable preflight requests
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

app.get("/api/check-origin", (req, res) => {
  res.json({
    originReceived: req.headers.origin || null,
    userAgent: req.headers["user-agent"],
    forwardedFor: req.headers["x-forwarded-for"],
    cookie: req.headers.cookie || "none",
    message: "Origin check OK",
  });
});

/* ROUTES */
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/student", studentRoutes);          // e.g. GET /api/student/attendance
app.use("/api/lecturer/classes", classRoutes);
app.use("/api/lecturer/sessions", sessionRoutes);
app.use("/api/student/attendance", attendanceRoutes);    // POST /api/attendance (mark attendance)

/* Health */
app.get("/", (req, res) => {
  res.send("QR Attendance Backend Running");
});

/* Error handler */
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

/* Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
