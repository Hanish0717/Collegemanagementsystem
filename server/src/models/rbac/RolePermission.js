/**
 * Role-Permission Junction Model
 * 
 * Many-to-many relationship between Roles and Permissions.
 * Enables dynamic permission assignment to roles at runtime.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role reference is required'],
      index: true,
    },
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: [true, 'Permission reference is required'],
      index: true,
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    conditions: {
      ownOnly: { type: Boolean, default: false },
      departmentOnly: { type: Boolean, default: false },
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
rolePermissionSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });
rolePermissionSchema.index({ role: 1, isActive: 1 });

// ─── Statics ─────────────────────────────────────────────
rolePermissionSchema.statics.getPermissionsForRole = async function (roleId) {
  const entries = await this.find({ role: roleId, isActive: true })
    .populate('permission', 'slug module action name')
    .lean();
  return entries.map((e) => ({
    ...e.permission,
    conditions: e.conditions,
  }));
};

rolePermissionSchema.statics.assignPermission = async function (roleId, permissionId, grantedBy = null) {
  return this.findOneAndUpdate(
    { role: roleId, permission: permissionId },
    { role: roleId, permission: permissionId, grantedBy, grantedAt: new Date(), isActive: true },
    { upsert: true, new: true }
  );
};

rolePermissionSchema.statics.revokePermission = async function (roleId, permissionId) {
  return this.findOneAndUpdate(
    { role: roleId, permission: permissionId },
    { isActive: false },
    { new: true }
  );
};

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

export default RolePermission;
