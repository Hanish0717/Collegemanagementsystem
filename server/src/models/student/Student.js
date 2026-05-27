/**
 * Student Model
 * 
 * Comprehensive student profile linked to User, Department, Course, and Semester.
 * Referenced by Attendance, Fee, Result, Library, Hostel, Transport, and Placement.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // ─── Identification ────────────────────────────────
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\d{10,15}$/, 'Please provide a valid phone number'],
    },

    // ─── Personal Info ─────────────────────────────────
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    nationality: {
      type: String,
      trim: true,
      default: 'Indian',
    },
    religion: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['general', 'obc', 'sc', 'st', 'ews', 'other'],
    },

    // ─── Academic ──────────────────────────────────────
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    departmentName: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    courseName: {
      type: String,
      trim: true,
    },
    currentSemester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      enum: {
        values: [1, 2, 3, 4, 5, 6],
        message: 'Year must be between 1 and 6',
      },
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      enum: {
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        message: 'Semester must be between 1 and 12',
      },
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
    },
    batch: {
      type: String,
      trim: true,
    },

    // ─── Admission ─────────────────────────────────────
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    admissionType: {
      type: String,
      enum: ['regular', 'lateral', 'management', 'scholarship', 'sports', 'nri'],
      default: 'regular',
    },

    // ─── Address ───────────────────────────────────────
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },
    permanentAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },

    // ─── Parent / Guardian ─────────────────────────────
    parentName: {
      type: String,
      required: [true, 'Parent or guardian name is required'],
      trim: true,
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent contact number is required'],
      trim: true,
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    parentRelation: {
      type: String,
      enum: ['father', 'mother', 'guardian', 'other'],
      default: 'father',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    motherName: {
      type: String,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },

    // ─── Emergency Contact ─────────────────────────────
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
      address: { type: String, trim: true },
    },

    // ─── Academics Tracking ────────────────────────────
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be less than 0'],
      max: [10, 'CGPA cannot exceed 10'],
      default: 0,
    },
    totalBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    activeBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      min: [0, 'Attendance cannot be less than 0'],
      max: [100, 'Attendance cannot exceed 100'],
      default: 100,
    },

    // ─── Media ─────────────────────────────────────────
    profileImage: {
      type: String,
      trim: true,
    },

    // ─── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'dropped', 'suspended', 'rusticated', 'transferred'],
      default: 'active',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
studentSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
studentSchema.index({ department: 1, year: 1, semester: 1, section: 1 });
studentSchema.index({ department: 1, status: 1 });
studentSchema.index({ course: 1, semester: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ fullName: 'text', rollNumber: 'text', email: 'text', admissionNumber: 'text' });

// ─── Virtuals ────────────────────────────────────────────
studentSchema.virtual('fees', {
  ref: 'Fee',
  localField: '_id',
  foreignField: 'student',
});

studentSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'student',
});

studentSchema.virtual('results', {
  ref: 'StudentResult',
  localField: '_id',
  foreignField: 'student',
});

studentSchema.virtual('documents', {
  ref: 'StudentDocument',
  localField: '_id',
  foreignField: 'student',
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
