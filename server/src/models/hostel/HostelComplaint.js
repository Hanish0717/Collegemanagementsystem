/**
 * Hostel Complaint Model
 * 
 * Student complaints/requests for hostel maintenance and issues.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelComplaintSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom' },
    block: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelBlock' },
    complaintNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: ['plumbing', 'electrical', 'furniture', 'cleaning', 'pest-control', 'internet', 'food-quality', 'noise', 'security', 'roommate', 'maintenance', 'other'],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'in-progress', 'resolved', 'closed', 'rejected'],
      default: 'submitted',
      index: true,
    },
    images: [{ type: String, trim: true }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolution: { type: String, trim: true, maxlength: 1000 },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true, maxlength: 500 },
    },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    escalatedAt: { type: Date },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

hostelComplaintSchema.plugin(baseSchemaPlugin);
hostelComplaintSchema.index({ hostel: 1, status: 1 });
hostelComplaintSchema.index({ student: 1, status: 1 });
hostelComplaintSchema.index({ category: 1, priority: 1 });

hostelComplaintSchema.pre('validate', function (next) {
  if (!this.complaintNumber && this.isNew) {
    this.complaintNumber = `HC-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

const HostelComplaint = mongoose.model('HostelComplaint', hostelComplaintSchema);
export default HostelComplaint;
