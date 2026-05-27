/**
 * Transport Allocation Model
 * 
 * Assigns students to transport routes for a given academic period.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const transportAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route reference is required'],
      index: true,
    },
    pickupStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: [true, 'Pickup stop reference is required'],
      index: true,
    },
    dropStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
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
    expiryDate: {
      type: Date,
    },
    monthlyFare: {
      type: Number,
      min: [0, 'Fare cannot be negative'],
      default: 0,
    },
    passNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'suspended'],
      default: 'active',
      index: true,
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

transportAllocationSchema.plugin(baseSchemaPlugin);

transportAllocationSchema.index({ student: 1, academicYear: 1, status: 1 });
transportAllocationSchema.index({ route: 1, status: 1 });

const TransportAllocation = mongoose.model('TransportAllocation', transportAllocationSchema);
export default TransportAllocation;
