/**
 * CMS Page Model
 * 
 * Manages content pages for the landing/public-facing website.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    content: { type: String },
    image: { type: String, trim: true },
    order: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'html', 'gallery', 'cta'],
      default: 'text',
    },
  },
  { _id: true }
);

const cmsPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Page slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
    },
    sections: [sectionSchema],
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Meta description cannot exceed 300 characters'],
    },
    metaKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    featuredImage: {
      type: String,
      trim: true,
    },
    template: {
      type: String,
      enum: ['default', 'landing', 'about', 'contact', 'custom'],
      default: 'default',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
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
cmsPageSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
cmsPageSchema.index({ slug: 1, status: 1 });
cmsPageSchema.index({ title: 'text', content: 'text' });

// ─── Pre-save: Auto-generate slug ───────────────────────
cmsPageSchema.pre('validate', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const CMSPage = mongoose.model('CMSPage', cmsPageSchema);

export default CMSPage;
