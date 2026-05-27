/**
 * Parent Model
 * 
 * Parent/Guardian profile linked to User model.
 * Supports multiple children, emergency contacts, and communication preferences.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const parentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
    },
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian', 'Uncle', 'Aunt', 'Grandparent', 'Other'],
      default: 'Father',
    },

    // ─── Professional ─────────────────────────────────
    occupation: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    annualIncome: {
      type: Number,
      min: [0, 'Annual income cannot be negative'],
    },
    workPhone: {
      type: String,
      trim: true,
    },

    // ─── Identification ───────────────────────────────
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    // ─── Address ──────────────────────────────────────
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },

    // ─── Legacy embedded students (backward compat) ──
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }],

    // ─── Emergency Contact ────────────────────────────
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    secondaryEmergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true },
    },

    // ─── Preferences ──────────────────────────────────
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      pushNotification: { type: Boolean, default: true },
    },
    preferredLanguage: {
      type: String,
      default: 'English',
      trim: true,
    },

    // ─── Media ────────────────────────────────────────
    profileImage: {
      type: String,
      trim: true,
    },

    // ─── Status ───────────────────────────────────────
    lastLoginAt: {
      type: Date,
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
parentSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
parentSchema.index({ fullName: 'text', email: 'text' });
parentSchema.index({ phoneNumber: 1 });

// ─── Virtuals ────────────────────────────────────────────
parentSchema.virtual('childAssignments', {
  ref: 'ParentStudent',
  localField: '_id',
  foreignField: 'parent',
});

parentSchema.virtual('notifications', {
  ref: 'ParentNotification',
  localField: '_id',
  foreignField: 'parent',
});

parentSchema.virtual('meetings', {
  ref: 'ParentMeeting',
  localField: '_id',
  foreignField: 'parent',
});

const Parent = mongoose.model('Parent', parentSchema);

export default Parent;
