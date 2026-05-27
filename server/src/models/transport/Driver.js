/**
 * Driver Model
 * 
 * Represents transport drivers and assistants in the college fleet.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const driverSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
      maxlength: 100,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    assignedBus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      index: true,
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['active', 'on-leave', 'suspended', 'resigned'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

driverSchema.plugin(baseSchemaPlugin);
driverSchema.index({ fullName: 'text', licenseNumber: 'text' });

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
