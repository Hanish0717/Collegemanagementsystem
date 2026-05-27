/**
 * Subject Model
 * 
 * Represents subjects/courses offered by departments.
 * Referenced by attendance, faculty assignments, and timetable.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [150, 'Subject name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      enum: {
        values: [1, 2, 3, 4, 5, 6, 7, 8],
        message: 'Semester must be between 1 and 8',
      },
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6'],
    },
    type: {
      type: String,
      enum: {
        values: ['theory', 'practical', 'elective', 'project'],
        message: 'Type must be theory, practical, elective, or project',
      },
      default: 'theory',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: [0, 'Max marks cannot be negative'],
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
subjectSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
subjectSchema.index({ department: 1, semester: 1 });
subjectSchema.index({ name: 'text', code: 'text' });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
