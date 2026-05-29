/**
 * Academic Year Model
 * 
 * Represents academic year periods (e.g. 2025-2026).
 * Used across fee, attendance, and student promotion workflows.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Academic year name is required (e.g. 2025-2026)'],
      unique: true,
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Format must be YYYY-YYYY (e.g. 2025-2026)'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isCurrent: {
      type: Boolean,
      default: false,
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
academicYearSchema.plugin(baseSchemaPlugin);

// ─── Validation ──────────────────────────────────────────
academicYearSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// ─── Static Methods ──────────────────────────────────────
academicYearSchema.statics.getCurrent = function () {
  return this.findOne({ isCurrent: true });
};

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

export default AcademicYear;
