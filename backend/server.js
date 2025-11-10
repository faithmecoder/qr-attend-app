import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'https://qr-attend-app-u66d.vercel.app',
  'https://qr-attend-app-u66d-git-main-faithmecoders-projects.vercel.app/',
  'http://localhost:5173',
  'https://qr-attend-app-u66d-50q8go3mw-faithmecoders-projects.vercel.app/'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || 
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)) {  // ✅ allow all Vercel subdomains
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
};


app.use(cors(corsOptions));
// --- End of CORS Configuration ---

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

app.set('trust proxy', 1);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/student', studentRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('QR-Attend API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));