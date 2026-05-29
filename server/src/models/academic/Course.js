/**
 * Course Model
 * 
 * Represents degree programs offered by departments.
 * e.g., B.Tech Computer Science, M.Tech Data Science, MBA
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [150, 'Course name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Course code cannot exceed 20 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    degreeType: {
      type: String,
      required: [true, 'Degree type is required'],
      enum: ['diploma', 'bachelors', 'masters', 'phd', 'certificate'],
      default: 'bachelors',
    },
    duration: {
      years: {
        type: Number,
        required: [true, 'Duration in years is required'],
        min: [1, 'Duration must be at least 1 year'],
        max: [6, 'Duration cannot exceed 6 years'],
        default: 4,
      },
      totalSemesters: {
        type: Number,
        required: [true, 'Total semesters required'],
        min: [1, 'Must have at least 1 semester'],
        max: [12, 'Cannot exceed 12 semesters'],
        default: 8,
      },
    },
    totalCredits: {
      type: Number,
      min: [0, 'Credits cannot be negative'],
      default: 0,
    },
    eligibility: {
      type: String,
      trim: true,
      maxlength: [500, 'Eligibility cannot exceed 500 characters'],
    },
    totalSeats: {
      type: Number,
      min: [0, 'Seats cannot be negative'],
      default: 60,
    },
    fees: {
      perSemester: { type: Number, min: 0, default: 0 },
      perYear: { type: Number, min: 0, default: 0 },
    },
    syllabus: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
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
courseSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
courseSchema.index({ department: 1, status: 1 });
courseSchema.index({ degreeType: 1 });
courseSchema.index({ name: 'text', code: 'text' });

// ─── Virtuals ────────────────────────────────────────────
courseSchema.virtual('semesters', {
  ref: 'Semester',
  localField: '_id',
  foreignField: 'course',
});

courseSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'course',
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
