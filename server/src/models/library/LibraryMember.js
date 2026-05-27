/**
 * Library Member Model
 * 
 * Library membership records for students, faculty, and staff.
 * Tracks membership validity, borrowing limits, and activity.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const libraryMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    membershipId: {
      type: String,
      required: [true, 'Membership ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    memberType: {
      type: String,
      required: [true, 'Member type is required'],
      enum: ['student', 'faculty', 'staff', 'researcher', 'external'],
      default: 'student',
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phoneNumber: { type: String, trim: true },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    maxBooksAllowed: { type: Number, min: 1, default: 5 },
    maxDaysAllowed: { type: Number, min: 1, default: 14 },
    currentBooksIssued: { type: Number, min: 0, default: 0 },
    totalBooksIssued: { type: Number, min: 0, default: 0 },
    totalFinesPending: { type: Number, min: 0, default: 0 },
    totalFinesPaid: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired', 'blacklisted', 'cancelled'],
      default: 'active',
      index: true,
    },
    suspensionReason: { type: String, trim: true },
    suspendedUntil: { type: Date },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    barcode: { type: String, unique: true, sparse: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

libraryMemberSchema.plugin(baseSchemaPlugin);

libraryMemberSchema.index({ memberType: 1, status: 1 });
libraryMemberSchema.index({ fullName: 'text', membershipId: 'text' });
libraryMemberSchema.index({ validTo: 1 }, { sparse: true });

libraryMemberSchema.statics.canBorrow = async function (userId) {
  const member = await this.findOne({ user: userId, status: 'active' });
  if (!member) return { allowed: false, reason: 'No active membership' };
  if (member.currentBooksIssued >= member.maxBooksAllowed) {
    return { allowed: false, reason: 'Maximum book limit reached' };
  }
  if (member.totalFinesPending > 0) {
    return { allowed: false, reason: 'Unpaid fines exist' };
  }
  if (member.validTo && new Date() > member.validTo) {
    return { allowed: false, reason: 'Membership expired' };
  }
  return { allowed: true, member };
};

const LibraryMember = mongoose.model('LibraryMember', libraryMemberSchema);

export default LibraryMember;
