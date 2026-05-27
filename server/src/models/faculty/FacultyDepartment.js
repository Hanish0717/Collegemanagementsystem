/**
 * Faculty-Department Junction Model
 * 
 * Many-to-many: Faculty can teach across multiple departments.
 * Tracks primary vs secondary department assignments.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const facultyDepartmentSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['primary', 'secondary', 'visiting', 'adjunct'],
      default: 'primary',
    },
    isHOD: {
      type: Boolean,
      default: false,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    relievedDate: {
      type: Date,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
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
facultyDepartmentSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
facultyDepartmentSchema.index({ faculty: 1, department: 1 }, { unique: true });
facultyDepartmentSchema.index({ department: 1, isActive: 1 });
facultyDepartmentSchema.index({ department: 1, isHOD: 1 });

// ─── Statics ─────────────────────────────────────────────
facultyDepartmentSchema.statics.getDepartmentsForFaculty = function (facultyId) {
  return this.find({ faculty: facultyId, isActive: true })
    .populate('department', 'name code')
    .lean();
};

facultyDepartmentSchema.statics.getFacultyForDepartment = function (departmentId) {
  return this.find({ department: departmentId, isActive: true })
    .populate('faculty', 'fullName employeeId designation')
    .lean();
};

const FacultyDepartment = mongoose.model('FacultyDepartment', facultyDepartmentSchema);

export default FacultyDepartment;
