/**
 * Department Model
 * 
 * Represents academic departments in the college.
 * Referenced by Student, Faculty, Subject, and other models.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    establishedYear: {
      type: Number,
      min: [1900, 'Year must be after 1900'],
    },
    totalSeats: {
      type: Number,
      min: [0, 'Total seats cannot be negative'],
      default: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
departmentSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
departmentSchema.index({ name: 'text', code: 'text' });

const Department = mongoose.model('Department', departmentSchema);

export default Department;
