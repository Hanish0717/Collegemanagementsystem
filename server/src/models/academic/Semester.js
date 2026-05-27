/**
 * Semester Model
 * 
 * Represents individual semesters within a course.
 * Linked to academic year and course for tracking progression.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    number: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: [1, 'Semester number must be at least 1'],
      max: [12, 'Semester number cannot exceed 12'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 6,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    examStartDate: {
      type: Date,
    },
    examEndDate: {
      type: Date,
    },
    totalCredits: {
      type: Number,
      min: 0,
      default: 0,
    },
    minCreditsRequired: {
      type: Number,
      min: 0,
      default: 0,
    },
    registrationDeadline: {
      type: Date,
    },
    resultPublishDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'exam-period', 'completed', 'results-published'],
      default: 'upcoming',
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
semesterSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
semesterSchema.index({ course: 1, number: 1, academicYear: 1 }, { unique: true });
semesterSchema.index({ academicYear: 1, status: 1 });

// ─── Validation ──────────────────────────────────────────
semesterSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;
