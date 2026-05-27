/**
 * Permission Model
 * 
 * Individual atomic permissions like "students:create", "fees:read".
 * Grouped via PermissionGroup for organizational clarity.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Permission slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9:_-]+$/, 'Slug must be lowercase with colons, underscores, or hyphens'],
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      lowercase: true,
      enum: [
        'dashboard',
        'students',
        'faculty',
        'parents',
        'attendance',
        'fees',
        'library',
        'hostel',
        'transport',
        'placement',
        'cms',
        'ai-assistant',
        'settings',
        'reports',
        'users',
        'roles',
      ],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      lowercase: true,
      enum: ['create', 'read', 'update', 'delete', 'export', 'import', 'manage', 'approve'],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PermissionGroup',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    isSystem: {
      type: Boolean,
      default: false,
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
permissionSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
permissionSchema.index({ module: 1, action: 1 });
permissionSchema.index({ group: 1 });
permissionSchema.index({ name: 'text', description: 'text' });

// ─── Statics ─────────────────────────────────────────────
permissionSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

permissionSchema.statics.findByModule = function (module) {
  return this.find({ module, isActive: true }).sort({ action: 1 });
};

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
