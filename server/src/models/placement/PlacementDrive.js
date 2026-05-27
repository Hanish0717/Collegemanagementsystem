/**
 * Placement Drive Model
 * 
 * Represents company recruitment drives on campus.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    companyName: { // backward compatibility fallback
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: { type: String, trim: true, maxlength: 2000 },
    jobType: {
      type: String,
      enum: ['full-time', 'internship', 'part-time', 'contract'],
      default: 'full-time',
    },
    package: {
      minimum: { type: Number, min: 0 },
      maximum: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
    },
    eligibility: {
      departments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Department',
        },
      ],
      minCGPA: { type: Number, min: 0, max: 10, default: 0 },
      maxBacklogs: { type: Number, default: 0, min: 0 },
      batch: { type: Number },
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    lastDateToApply: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    venue: { type: String, trim: true },
    totalPositions: { type: Number, min: 1, default: 1 },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'placementdrives',
  }
);

placementDriveSchema.plugin(baseSchemaPlugin);

placementDriveSchema.index({ driveDate: 1, status: 1 });
placementDriveSchema.index({ jobTitle: 'text', companyName: 'text' });

placementDriveSchema.virtual('rounds', {
  ref: 'DriveRound', localField: '_id', foreignField: 'drive',
});

placementDriveSchema.virtual('applications', {
  ref: 'StudentApplication', localField: '_id', foreignField: 'drive',
});

placementDriveSchema.virtual('selections', {
  ref: 'SelectedStudent', localField: '_id', foreignField: 'drive',
});

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
export default PlacementDrive;
