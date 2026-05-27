/**
 * Vehicle Maintenance Model
 * 
 * Tracks services, repairs, and breakdown logs for the transport fleet.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const vehicleMaintenanceSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus reference is required'],
      index: true,
    },
    maintenanceType: {
      type: String,
      required: true,
      enum: ['routine-service', 'repair', 'breakdown', 'accident-repair', 'tire-replacement', 'fitness-check', 'other'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Maintenance description is required'],
      trim: true,
      maxlength: 1000,
    },
    cost: {
      type: Number,
      required: [true, 'Maintenance cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    odometerReading: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    mechanicDetails: {
      name: { type: String, trim: true },
      contact: { type: String, trim: true },
      workshopName: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    remarks: { type: String, trim: true, maxlength: 500 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'vehicle_maintenance', // custom collection name matching the prompt
  }
);

vehicleMaintenanceSchema.plugin(baseSchemaPlugin);

vehicleMaintenanceSchema.index({ bus: 1, startDate: -1 });

const VehicleMaintenance = mongoose.model('VehicleMaintenance', vehicleMaintenanceSchema);
export default VehicleMaintenance;
