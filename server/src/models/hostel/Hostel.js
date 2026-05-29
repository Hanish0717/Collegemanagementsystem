/**
 * Hostel Model
 * 
 * Represents hostels/dormitories in the college.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hostel name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Hostel name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Hostel code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, 'Hostel type is required'],
      enum: ['boys', 'girls', 'co-ed'],
    },
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    totalRooms: {
      type: Number,
      required: [true, 'Total rooms is required'],
      min: [1, 'Must have at least 1 room'],
    },
    totalBeds: {
      type: Number,
      required: [true, 'Total beds is required'],
      min: [1, 'Must have at least 1 bed'],
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, 'Occupied beds cannot be negative'],
    },
    address: {
      type: String,
      trim: true,
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    monthlyFee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    contactNumber: {
      type: String,
      trim: true,
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
hostelSchema.plugin(baseSchemaPlugin);

// ─── Virtuals ────────────────────────────────────────────
hostelSchema.virtual('availableBeds').get(function () {
  return this.totalBeds - this.occupiedBeds;
});

hostelSchema.virtual('occupancyRate').get(function () {
  if (this.totalBeds === 0) return 0;
  return ((this.occupiedBeds / this.totalBeds) * 100).toFixed(1);
});

hostelSchema.virtual('blocks', {
  ref: 'HostelBlock', localField: '_id', foreignField: 'hostel',
});

hostelSchema.virtual('rooms', {
  ref: 'HostelRoom', localField: '_id', foreignField: 'hostel',
});

hostelSchema.virtual('complaints', {
  ref: 'HostelComplaint', localField: '_id', foreignField: 'hostel',
});

const Hostel = mongoose.model('Hostel', hostelSchema);

export default Hostel;
