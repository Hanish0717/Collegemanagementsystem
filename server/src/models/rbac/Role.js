/**
 * Role Model
 * 
 * Defines system roles with hierarchy levels and metadata.
 * Supports dynamic role creation beyond the default set.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    level: {
      type: Number,
      required: [true, 'Hierarchy level is required'],
      min: [0, 'Level cannot be negative'],
      max: [100, 'Level cannot exceed 100'],
      default: 50,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      trim: true,
      default: '#6B7280',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
roleSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
roleSchema.index({ level: 1 });
roleSchema.index({ name: 'text' });

// ─── Pre-validate: Auto-generate slug ───────────────────
roleSchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// ─── Statics ─────────────────────────────────────────────
roleSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

roleSchema.statics.getSystemRoles = function () {
  return this.find({ isSystem: true, isActive: true }).sort({ level: 1 });
};

const Role = mongoose.model('Role', roleSchema);

export default Role;
