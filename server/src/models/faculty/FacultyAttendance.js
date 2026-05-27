/**
 * Faculty Attendance Model
 * 
 * Daily attendance tracking for faculty members.
 * Supports check-in/check-out, leave types, and work hours.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const facultyAttendanceSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['present', 'absent', 'half-day', 'on-leave', 'work-from-home', 'on-duty', 'holiday'],
      default: 'present',
    },
    checkIn: {
      time: { type: Date },
      method: { type: String, enum: ['biometric', 'manual', 'app', 'card'], default: 'manual' },
    },
    checkOut: {
      time: { type: Date },
      method: { type: String, enum: ['biometric', 'manual', 'app', 'card'], default: 'manual' },
    },
    totalHoursWorked: { type: Number, min: 0, default: 0 },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'maternity', 'paternity', 'sabbatical', 'compensatory', 'unpaid'],
    },
    leaveReason: { type: String, trim: true, maxlength: 500 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classesScheduled: { type: Number, min: 0, default: 0 },
    classesTaken: { type: Number, min: 0, default: 0 },
    remarks: { type: String, trim: true, maxlength: 300 },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  },
  { timestamps: true }
);

facultyAttendanceSchema.plugin(baseSchemaPlugin);

facultyAttendanceSchema.index({ faculty: 1, date: 1 }, { unique: true });
facultyAttendanceSchema.index({ department: 1, date: 1 });
facultyAttendanceSchema.index({ faculty: 1, status: 1 });

facultyAttendanceSchema.pre('save', function (next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const diff = (this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60);
    this.totalHoursWorked = Math.round(diff * 100) / 100;
  }
  if (this.date) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

const FacultyAttendance = mongoose.model('FacultyAttendance', facultyAttendanceSchema);

export default FacultyAttendance;
