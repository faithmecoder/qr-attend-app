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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// CORS - allow frontend and allow cookies
const FRONTEND = process.env.FRONTEND_URL || "https://qr-attend-app-u66d.vercel.app/";

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests WITHOUT an origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      // Allow frontend
      if (origin === FRONTEND) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(new Error("CORS error: origin not allowed"));
    },
    credentials: true,
  })
);


// Routes
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer/classes", classRoutes);
app.use("/api/lecturer/sessions", sessionRoutes);
app.use("/api/student/attendance", attendanceRoutes);

// health
app.get("/", (req, res) => {
  res.send("QR Attendance Backend Running");
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
