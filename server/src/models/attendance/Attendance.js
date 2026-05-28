/**
 * Attendance Model
 * 
 * Tracks student attendance per subject per day.
 * Referenced by Student, Faculty, and Subject models.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true,
    },
    // Denormalized subject name for quick queries without populate
    subjectName: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      enum: {
        values: [1, 2, 3, 4, 5, 6, 7, 8],
        message: 'Semester must be between 1 and 8',
      },
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    period: {
      type: Number,
      min: [1, 'Period must be at least 1'],
      max: [10, 'Period cannot exceed 10'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['present', 'absent', 'late', 'excused'],
        message: "Status must be 'present', 'absent', 'late', or 'excused'",
      },
      default: 'present',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
attendanceSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
// Prevent duplicate attendance: same student, same date, same subject, same period
attendanceSchema.index(
  { student: 1, date: 1, subject: 1, period: 1 },
  { unique: true }
);
attendanceSchema.index({ department: 1, date: 1, semester: 1, section: 1 });
attendanceSchema.index({ student: 1, status: 1 });

// ─── Pre-validate: Normalize date ───────────────────────
attendanceSchema.pre('validate', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
