/**
 * Bus Model
 * 
 * Represents buses/vehicles in the college transport fleet.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus/Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleNumber: { // for backward compatibility
      type: String,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['bus', 'mini-bus', 'van', 'car'],
      default: 'bus',
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    capacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'cng', 'electric'],
      default: 'diesel',
    },
    insuranceExpiry: { type: Date },
    fitnessExpiry: { type: Date },
    pollutionExpiry: { type: Date },
    gpsDeviceNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'out-of-service', 'retired'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

busSchema.plugin(baseSchemaPlugin);

busSchema.pre('save', function (next) {
  if (!this.vehicleNumber) {
    this.vehicleNumber = this.busNumber;
  }
  next();
});

const Bus = mongoose.model('Bus', busSchema);
export default Bus;
