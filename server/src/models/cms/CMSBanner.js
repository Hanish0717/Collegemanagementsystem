/**
 * CMS Banner Model
 * 
 * Manages hero banners and promotional sliders for the landing page.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const cmsBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image is required'],
      trim: true,
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      enum: ['hero', 'sidebar', 'footer', 'popup'],
      default: 'hero',
    },
    order: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'scheduled'],
      default: 'active',
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
cmsBannerSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
cmsBannerSchema.index({ position: 1, order: 1, status: 1 });

const CMSBanner = mongoose.model('CMSBanner', cmsBannerSchema);

export default CMSBanner;
