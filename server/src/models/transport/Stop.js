/**
 * Stop Model
 * 
 * Represents pickup/drop stops for college transport.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stop name is required'],
      unique: true,
      trim: true,
      maxlength: 150,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    landmark: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    monthlyFare: {
      type: Number,
      required: [true, 'Monthly fare is required'],
      min: 0,
      default: 1000,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

stopSchema.plugin(baseSchemaPlugin);
stopSchema.index({ name: 'text', code: 'text' });

stopSchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.code) {
    this.code = this.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  }
  next();
});

const Stop = mongoose.model('Stop', stopSchema);
export default Stop;
