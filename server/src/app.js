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
import facultyAttendanceRoutes from './routes/facultyAttendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import studentModuleRoutes from './routes/studentModuleRoutes.js';
import facultyModuleRoutes from './routes/facultyModuleRoutes.js';
import parentModuleRoutes from './routes/parentModuleRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { supabase } from './config/supabase.js';
import transportRoutes from './routes/transportRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import examRoutes from './routes/examRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import reportRoutes from './routes/hostel/reportRoutes.js';
import exportRoutes from './routes/hostel/exportRoutes.js';
import hostelFeeRoutes from './routes/hostel/feeRoutes.js';
import blockRoutes from './routes/hostel/blockRoutes.js';
import roomRoutes from './routes/hostel/roomRoutes.js';
import allocationRoutes from './routes/hostel/allocationRoutes.js';
import messRoutes from './routes/hostel/messRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import hostelComplaintRoutes from './routes/hostel/complaintRoutes.js';
import hostelAttendanceRoutes from './routes/hostel/attendanceRoutes.js';
import visitorRoutes from './routes/hostel/visitorRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import hodRoutes from './routes/hodRoutes.js';

dotenv.config();

const app = express();

// Robust CORS middleware supporting dynamic localhost and 127.0.0.1 development ports
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Dynamic CORS reflection in development to support localhost, 127.0.0.1, LAN IP, and mobile testing
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (!origin) return callback(null, true);

    // Check if origin is a local network IP address (e.g., http://192.168.x.x, http://10.x.x.x, http://172.x.x.x)
    const isLocalNetworkIp = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      isLocalNetworkIp
    ) {
      return callback(null, true);
    }

    console.warn(`CORS block: Request from origin ${origin} was rejected.`);
    return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
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

app.get('/api/inspect-db-agent', async (req, res) => {
  try {
    const { data: facultyList } = await supabase.from('faculty').select('*');
    res.json({ success: true, facultyList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/faculty-attendance', facultyAttendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/student-module', studentModuleRoutes);
app.use('/api/faculty-module', facultyModuleRoutes);
app.use('/api/parent-module', parentModuleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/hostel/hostels', async (req, res) => {
  try {
    const { data, error } = await supabase.from('hostels').select('*');
    if (error) throw error;
    res.json({ success: true, hostels: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/hostel/reports', reportRoutes);
app.use('/api/hostel/exports', exportRoutes);
app.use('/api/hostel/fees', hostelFeeRoutes);
app.use('/api/hostel/blocks', blockRoutes);
app.use('/api/hostel/rooms', roomRoutes);
app.use('/api/hostel/allocations', allocationRoutes);
app.use('/api/hostel/mess', messRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hostel/complaints', hostelComplaintRoutes);
app.use('/api/hostel/attendance', hostelAttendanceRoutes);
app.use('/api/hostel/visitors', visitorRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/hod', hodRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
