/**
 * Parent Meeting Model
 * 
 * Parent-teacher meeting scheduling and tracking.
 * Supports PTM events and individual consultation requests.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const parentMeetingSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Meeting type is required'],
      enum: ['ptm', 'consultation', 'disciplinary', 'academic-review', 'fee-discussion', 'general', 'emergency'],
      default: 'ptm',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: /^\d{2}:\d{2}$/,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: /^\d{2}:\d{2}$/,
    },
    duration: {
      type: Number,
      min: 5,
      default: 30,
    },
    venue: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['in-person', 'online', 'phone'],
      default: 'in-person',
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['requested', 'scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'],
      default: 'requested',
      index: true,
    },
    requestedBy: {
      type: String,
      enum: ['parent', 'faculty', 'admin'],
      default: 'parent',
    },
    agenda: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    outcome: {
      type: String,
      trim: true,
      maxlength: [1000, 'Outcome cannot exceed 1000 characters'],
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
parentMeetingSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
parentMeetingSchema.index({ parent: 1, scheduledDate: -1 });
parentMeetingSchema.index({ faculty: 1, scheduledDate: 1 });
parentMeetingSchema.index({ student: 1, status: 1 });
parentMeetingSchema.index({ scheduledDate: 1, status: 1 });

// ─── Statics ─────────────────────────────────────────────
parentMeetingSchema.statics.getUpcoming = function (parentId) {
  return this.find({
    parent: parentId,
    scheduledDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] },
  }).populate('faculty', 'fullName').populate('student', 'fullName rollNumber').sort({ scheduledDate: 1 }).lean();
};

const ParentMeeting = mongoose.model('ParentMeeting', parentMeetingSchema);

export default ParentMeeting;
