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

/* -------------------------------------------
   TRUST PROXY (REQUIRED FOR RENDER & COOKIES)
-------------------------------------------- */
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------
   CORS CONFIGURATION
-------------------------------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,  // Vercel frontend
  "http://localhost:5173",   // Local dev
];

// Log allowed origins to debug
console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("CORS error: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------------------------------
   PRE-FLIGHT CORS FIX (IMPORTANT FOR CHROME)
-------------------------------------------- */
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* -------------------------------------------
   ROUTES
-------------------------------------------- */
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer/classes", classRoutes);
app.use("/api/lecturer/sessions", sessionRoutes);
app.use("/api/student/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.send("QR Attendance Backend Running");
});

/* -------------------------------------------
   ERROR HANDLER
-------------------------------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

/* -------------------------------------------
   START SERVER
-------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
