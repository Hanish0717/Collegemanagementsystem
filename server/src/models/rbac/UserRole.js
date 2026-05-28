/**
 * User-Role Junction Model
 * 
 * Many-to-many relationship between Users and Roles.
 * Enables multiple roles per user with optional scope constraints.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const userRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role reference is required'],
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    scope: {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null,
      },
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
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
userRoleSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
userRoleSchema.index({ user: 1, role: 1 }, { unique: true });
userRoleSchema.index({ user: 1, isActive: 1 });
userRoleSchema.index({ user: 1, isPrimary: 1 });
userRoleSchema.index({ expiresAt: 1 }, { sparse: true });

// ─── Statics ─────────────────────────────────────────────
userRoleSchema.statics.getRolesForUser = async function (userId) {
  return this.find({ user: userId, isActive: true })
    .populate('role', 'name slug level color')
    .lean();
};

userRoleSchema.statics.getPrimaryRole = async function (userId) {
  const primary = await this.findOne({ user: userId, isPrimary: true, isActive: true })
    .populate('role', 'name slug level color')
    .lean();
  if (primary) return primary.role;

  // Fallback: highest level role
  const roles = await this.find({ user: userId, isActive: true })
    .populate('role', 'name slug level color')
    .sort({ 'role.level': 1 })
    .lean();
  return roles[0]?.role || null;
};

userRoleSchema.statics.assignRole = async function (userId, roleId, options = {}) {
  const { isPrimary = false, assignedBy = null, scope = {}, expiresAt = null } = options;

  // If setting as primary, unset other primaries
  if (isPrimary) {
    await this.updateMany(
      { user: userId, isPrimary: true },
      { isPrimary: false }
    );
  }

  return this.findOneAndUpdate(
    { user: userId, role: roleId },
    {
      user: userId,
      role: roleId,
      isPrimary,
      assignedBy,
      scope,
      expiresAt,
      assignedAt: new Date(),
      isActive: true,
    },
    { upsert: true, new: true }
  );
};

userRoleSchema.statics.revokeRole = async function (userId, roleId) {
  return this.findOneAndUpdate(
    { user: userId, role: roleId },
    { isActive: false, isPrimary: false },
    { new: true }
  );
};

userRoleSchema.statics.hasRole = async function (userId, roleSlug) {
  const entry = await this.findOne({ user: userId, isActive: true })
    .populate('role', 'slug');
  if (!entry) return false;

  // Need to check all roles
  const entries = await this.find({ user: userId, isActive: true })
    .populate('role', 'slug');
  return entries.some((e) => e.role?.slug === roleSlug);
};

const UserRole = mongoose.model('UserRole', userRoleSchema);

export default UserRole;
