/**
 * Hostel Block Model
 * 
 * Represents blocks/wings within a hostel building.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelBlockSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: [true, 'Hostel reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Block name is required'],
      trim: true,
      maxlength: 50,
    },
    code: { type: String, trim: true, uppercase: true },
    totalFloors: { type: Number, required: true, min: 1, default: 3 },
    totalRooms: { type: Number, min: 0, default: 0 },
    totalBeds: { type: Number, min: 0, default: 0 },
    occupiedBeds: { type: Number, min: 0, default: 0 },
    blockWarden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    facilities: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['active', 'maintenance', 'closed'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hostelBlockSchema.plugin(baseSchemaPlugin);
hostelBlockSchema.index({ hostel: 1, name: 1 }, { unique: true });

hostelBlockSchema.virtual('availableBeds').get(function () {
  return this.totalBeds - this.occupiedBeds;
});

const HostelBlock = mongoose.model('HostelBlock', hostelBlockSchema);
export default HostelBlock;
