/**
 * Permission Group Model
 * 
 * Logical grouping of permissions for easier management.
 * e.g., "Student Management", "Library Management", "Financial Operations"
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const permissionGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Group slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    icon: {
      type: String,
      trim: true,
      default: '🔒',
    },
    order: {
      type: Number,
      default: 0,
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
permissionGroupSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
permissionGroupSchema.index({ order: 1 });

// ─── Pre-validate: Auto-generate slug ───────────────────
permissionGroupSchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// ─── Virtuals ────────────────────────────────────────────
permissionGroupSchema.virtual('permissions', {
  ref: 'Permission',
  localField: '_id',
  foreignField: 'group',
});

const PermissionGroup = mongoose.model('PermissionGroup', permissionGroupSchema);

export default PermissionGroup;
