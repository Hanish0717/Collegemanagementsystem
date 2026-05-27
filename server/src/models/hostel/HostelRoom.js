/**
 * Hostel Room Model
 * 
 * Represents individual rooms within a hostel.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelRoomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Hostel reference is required'],
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor cannot be negative'],
    },
    type: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      default: 'double',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    occupants: {
      type: Number,
      default: 0,
      min: [0, 'Occupants cannot be negative'],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['available', 'occupied', 'full', 'maintenance', 'reserved'],
      default: 'available',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
hostelRoomSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
hostelRoomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });
hostelRoomSchema.index({ hostel: 1, status: 1 });

// ─── Pre-save: Update status ─────────────────────────────
hostelRoomSchema.pre('save', function (next) {
  if (this.occupants >= this.capacity) {
    this.status = 'full';
  } else if (this.occupants > 0) {
    this.status = 'occupied';
  } else if (this.status !== 'maintenance' && this.status !== 'reserved') {
    this.status = 'available';
  }
  next();
});

const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);

export default HostelRoom;
