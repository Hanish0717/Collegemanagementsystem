/**
 * CMS Announcement Model
 * 
 * Manages announcements and notices displayed on the college website/dashboard.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const cmsAnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['general', 'academic', 'examination', 'placement', 'event', 'holiday', 'urgent'],
      default: 'general',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    targetAudience: [
      {
        type: String,
        enum: [
          'all',
          'students',
          'faculty',
          'parents',
          'staff',
          'super-admin',
          'admin',
        ],
      },
    ],
    targetDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    attachments: [
      {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        type: { type: String, trim: true },
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'expired'],
      default: 'draft',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'announcements',
  }
);

// ─── Plugins ─────────────────────────────────────────────
cmsAnnouncementSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
cmsAnnouncementSchema.index({ status: 1, publishedAt: -1 });
cmsAnnouncementSchema.index({ category: 1, status: 1 });
cmsAnnouncementSchema.index({ expiresAt: 1 }); // For TTL-like cleanup queries
cmsAnnouncementSchema.index({ title: 'text', content: 'text' });

const CMSAnnouncement = mongoose.model('CMSAnnouncement', cmsAnnouncementSchema);

export default CMSAnnouncement;
