/**
 * Gallery Model
 * 
 * Manages photo albums and visual gallery items on the website.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    caption: { type: String, trim: true },
  },
  { _id: false }
);

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery title is required'],
      trim: true,
      maxlength: 150,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: ['campus', 'sports', 'cultural', 'academics', 'laboratory', 'event', 'other'],
      index: true,
    },
    images: [galleryImageSchema],
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'galleries',
  }
);

gallerySchema.plugin(baseSchemaPlugin);
gallerySchema.index({ title: 'text', description: 'text' });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
