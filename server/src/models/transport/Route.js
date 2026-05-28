/**
 * Route Model
 * 
 * Represents bus routes with stops sequence, assigned bus and driver.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const routeStopSchema = new mongoose.Schema(
  {
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: true,
    },
    arrivalTime: {
      type: String, // "HH:MM" format
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      unique: true,
      trim: true,
    },
    routeNumber: {
      type: String,
      required: [true, 'Route number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    startPoint: {
      type: String,
      required: [true, 'Start point is required'],
      trim: true,
    },
    endPoint: {
      type: String,
      required: [true, 'End point is required'],
      trim: true,
    },
    stops: [routeStopSchema],
    distance: {
      type: Number,
      min: [0, 'Distance cannot be negative'],
    },
    estimatedTime: {
      type: String, // e.g. "45 mins"
      trim: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

routeSchema.plugin(baseSchemaPlugin);
routeSchema.index({ name: 'text', routeNumber: 'text' });

const Route = mongoose.model('Route', routeSchema);
export default Route;
