/**
 * Hostel Visitor Model
 * 
 * Visitor log for hostel security and tracking.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelVisitorSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom' },
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
      maxlength: 100,
    },
    visitorPhone: {
      type: String,
      required: [true, 'Visitor phone is required'],
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      enum: ['parent', 'guardian', 'sibling', 'relative', 'friend', 'other'],
      default: 'parent',
    },
    visitorAddress: { type: String, trim: true },
    idType: {
      type: String,
      enum: ['aadhaar', 'pan', 'driving-license', 'voter-id', 'passport', 'other'],
    },
    idNumber: { type: String, trim: true },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
      maxlength: 300,
    },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date },
    expectedCheckOut: { type: Date },
    vehicleNumber: { type: String, trim: true, uppercase: true },
    numberOfVisitors: { type: Number, min: 1, default: 1 },
    belongingsNote: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out', 'overstayed', 'denied'],
      default: 'checked-in',
      index: true,
    },
    remarks: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

hostelVisitorSchema.plugin(baseSchemaPlugin);
hostelVisitorSchema.index({ hostel: 1, checkInTime: -1 });
hostelVisitorSchema.index({ student: 1, checkInTime: -1 });
hostelVisitorSchema.index({ visitorPhone: 1 });

const HostelVisitor = mongoose.model('HostelVisitor', hostelVisitorSchema);
export default HostelVisitor;
