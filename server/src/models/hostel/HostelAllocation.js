/**
 * Hostel Allocation Model
 * 
 * Tracks student-to-room assignments in hostels.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Hostel reference is required'],
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelRoom',
      required: [true, 'Room reference is required'],
      index: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    vacatingDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'vacated', 'transferred', 'suspended'],
      default: 'active',
      index: true,
    },
    bedNumber: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
hostelAllocationSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
hostelAllocationSchema.index({ student: 1, academicYear: 1, status: 1 });
hostelAllocationSchema.index({ room: 1, status: 1 });

const HostelAllocation = mongoose.model('HostelAllocation', hostelAllocationSchema);

export default HostelAllocation;
