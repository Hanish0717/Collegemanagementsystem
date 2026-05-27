/**
 * Testimonial Model
 * 
 * Stores student, alumnus, faculty, or parent reviews and success stories.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: ['student', 'alumnus', 'parent', 'faculty', 'recruiter', 'visitor'],
      default: 'student',
      index: true,
    },
    companyOrBatch: {
      type: String, // e.g. "Google (2024 Batch)" or "Dept of Physics"
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: 1000,
    },
    photo: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isApproved: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'testimonials',
  }
);

testimonialSchema.plugin(baseSchemaPlugin);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
