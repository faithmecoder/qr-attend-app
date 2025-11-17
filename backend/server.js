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
   IMPORTANT: TRUST PROXY FOR RENDER DEPLOYMENT
   Ensures Secure cookies work with HTTPS load balancer
-------------------------------------------- */
app.set("trust proxy", 1);

// Body + cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------
   CORS CONFIGURATION
-------------------------------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,  // Production frontend (Vercel)
  "http://localhost:5173",   // Local Vite dev server
];

// Log allowed origins for debugging
console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
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

// Enable preflight for all routes
app.options("*", cors());

/* -------------------------------------------
   ROUTES
-------------------------------------------- */
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer/classes", classRoutes);
app.use("/api/lecturer/sessions", sessionRoutes);
app.use("/api/student/attendance", attendanceRoutes);

// Health route
app.get("/", (req, res) => {
  res.send("QR Attendance Backend Running");
});

/* -------------------------------------------
   ERROR HANDLER
-------------------------------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

/* -------------------------------------------
   SERVER START
-------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
