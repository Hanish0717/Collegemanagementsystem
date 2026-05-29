/**
 * Event Model
 * 
 * Manages institutional and departmental events.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 3000,
    },
    category: {
      type: String,
      required: true,
      enum: ['academic', 'cultural', 'sports', 'placement', 'technical', 'workshop', 'seminar', 'other'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    organizer: { type: String, trim: true },
    bannerImage: { type: String, trim: true },
    registrationRequired: { type: Boolean, default: false },
    registrationLink: { type: String, trim: true },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    seoMetadata: {
      title: { type: String, trim: true },
      description: { type: String, trim: true, maxlength: 500 },
      keywords: [{ type: String, trim: true }],
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'events',
  }
);

eventSchema.plugin(baseSchemaPlugin);
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ title: 'text', description: 'text' });

const Event = mongoose.model('Event', eventSchema);
export default Event;
