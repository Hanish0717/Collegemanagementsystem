/**
 * Student Application Model
 * 
 * Tracks student applications to placement drives.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const studentApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    resumeUrl: { type: String, trim: true },
    coverLetter: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'in-progress', 'selected', 'rejected', 'withdrawn'],
      default: 'applied',
      index: true,
    },
    remarks: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'studentapplications',
  }
);

studentApplicationSchema.plugin(baseSchemaPlugin);
studentApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });

const StudentApplication = mongoose.model('StudentApplication', studentApplicationSchema);
export default StudentApplication;
