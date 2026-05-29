import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import studentModuleRoutes from './routes/studentModuleRoutes.js';
import facultyModuleRoutes from './routes/facultyModuleRoutes.js';
import parentModuleRoutes from './routes/parentModuleRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "College ERP Backend API is running.",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
  });
});
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/student-module', studentModuleRoutes);
app.use('/api/faculty-module', facultyModuleRoutes);
app.use('/api/parent-module', parentModuleRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
