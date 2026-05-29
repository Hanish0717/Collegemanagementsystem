/**
 * Drive Round Model
 * 
 * Represents individual stages of recruitment rounds (Aptitude, Tech, HR, etc.) within a drive.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const driveRoundSchema = new mongoose.Schema(
  {
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
      index: true,
    },
    roundNumber: {
      type: Number,
      required: [true, 'Round number is required'],
      min: 1,
    },
    name: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ['aptitude', 'technical', 'coding', 'gd', 'hr', 'other'],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    date: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'driverounds',
  }
);

driveRoundSchema.plugin(baseSchemaPlugin);
driveRoundSchema.index({ drive: 1, roundNumber: 1 }, { unique: true });

const DriveRound = mongoose.model('DriveRound', driveRoundSchema);
export default DriveRound;
