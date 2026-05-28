/**
 * User Model — Authentication & Identity
 * 
 * Central user identity for the entire system.
 * All role-specific profiles (Student, Faculty, Parent) reference back to this model.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w.-]+@[\w.-]+\.\w{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: [
          'super-admin',
          'admin',
          'faculty',
          'student',
          'parent',
          'librarian',
          'placement-officer',
          'hostel-warden',
          'transport-manager',
        ],
        message: 'Invalid role specified',
      },
      default: 'student',
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
userSchema.plugin(baseSchemaPlugin, { audit: false });

// ─── Indexes ─────────────────────────────────────────────
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ fullName: 'text', email: 'text' });

// ─── Virtuals ────────────────────────────────────────────
userSchema.virtual('roles', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'user',
});

// ─── Pre-save: Hash password ─────────────────────────────
userSchema.pre('save', async function (next) {
  if (this.name && !this.fullName) this.fullName = this.name;
  if (this.fullName && !this.name) this.name = this.fullName;
  if (this.mobile && !this.phoneNumber) this.phoneNumber = this.mobile;
  if (this.phoneNumber && !this.mobile) this.mobile = this.phoneNumber;

  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Instance Methods ────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
