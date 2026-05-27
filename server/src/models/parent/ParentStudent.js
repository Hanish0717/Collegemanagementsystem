/**
 * Parent-Student Junction Model
 * 
 * Many-to-many: A parent can have multiple children,
 * and a student can have multiple parent/guardian records.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const parentStudentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      enum: ['father', 'mother', 'guardian', 'uncle', 'aunt', 'grandparent', 'sibling', 'other'],
      default: 'father',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    canViewResults: {
      type: Boolean,
      default: true,
    },
    canViewAttendance: {
      type: Boolean,
      default: true,
    },
    canViewFees: {
      type: Boolean,
      default: true,
    },
    canCommunicate: {
      type: Boolean,
      default: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
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
parentStudentSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
parentStudentSchema.index({ parent: 1, student: 1 }, { unique: true });
parentStudentSchema.index({ student: 1, isActive: 1 });
parentStudentSchema.index({ parent: 1, isPrimary: 1 });

// ─── Statics ─────────────────────────────────────────────
parentStudentSchema.statics.getChildrenForParent = function (parentId) {
  return this.find({ parent: parentId, isActive: true })
    .populate('student', 'fullName rollNumber department semester')
    .lean();
};

parentStudentSchema.statics.getParentsForStudent = function (studentId) {
  return this.find({ student: studentId, isActive: true })
    .populate('parent', 'fullName email phoneNumber relationship')
    .lean();
};

const ParentStudent = mongoose.model('ParentStudent', parentStudentSchema);

export default ParentStudent;
