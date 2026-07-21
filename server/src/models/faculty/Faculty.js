/**
 * Faculty Model
 * 
 * Comprehensive faculty profile linked to User, Department, and Subject models.
 * Referenced by Attendance, Schedule, Salary, and Placement modules.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const facultySchema = new mongoose.Schema(
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
      required: [true, 'Faculty name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
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
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    nationality: {
      type: String,
      trim: true,
      default: 'Indian',
    },

    // ─── Department & Designation ──────────────────────
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    departmentName: {
      type: String,
      trim: true,
    },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      }
    ],
    assignedSections: [
      {
        type: String,
        trim: true,
        uppercase: true,
      }
    ],
    assignedStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      }
    ],
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: [
        'Principal',
        'Vice Principal',
        'Dean',
        'HOD',
        'Professor',
        'Associate Professor',
        'Assistant Professor',
        'Guest Faculty',
        'Lab Assistant',
        'Librarian',
        'Hostel Warden',
        'Transport Manager',
        'Office Staff',
        'Accounts',
        'Exam Cell',
        'System Administrator',
        'Senior Lecturer',
        'Lecturer',
        'Lab Instructor',
        'Teaching Assistant',
        'Visiting Faculty',
      ],
    },
    employeeCategory: {
      type: String,
      enum: ['Teaching', 'Non-Teaching'],
      default: 'Teaching',
    },
    facultyType: {
      type: String,
      enum: ['Faculty', 'HOD', 'Dean', 'Principal', 'Vice Principal', 'Non-Teaching'],
      default: 'Faculty',
    },
    deanResponsibilities: [
      {
        type: String,
        enum: [
          'Academics',
          'Examination',
          'Student Affairs',
          'Research',
          'IQAC',
          'IMA',
          'Training & Placements',
        ],
      },
    ],
    assignedPrograms: [
      {
        type: String,
        trim: true,
      },
    ],
    assignedSemesters: [
      {
        type: String,
        trim: true,
      },
    ],
    employeeStatus: {
      type: String,
      enum: ['Active', 'On Leave', 'Transferred', 'Promoted', 'Suspended', 'Resigned', 'Retired', 'Relieved', 'Archived'],
      default: 'Active',
    },
    reportsTo: {
      userId: { type: String, trim: true },
      name: { type: String, trim: true },
      designation: { type: String, trim: true },
    },
    permissionProfile: {
      type: String,
      default: 'Faculty Template',
    },
    lifecycleHistory: [
      {
        date: { type: Date, default: Date.now },
        previousStatus: { type: String },
        newStatus: { type: String },
        previousDesignation: { type: String },
        newDesignation: { type: String },
        changedBy: { type: String },
        reason: { type: String },
      },
    ],
    isActing: {
      type: Boolean,
      default: false,
    },
    designationStartDate: {
      type: Date,
    },
    designationEndDate: {
      type: Date,
    },
    secondaryDepartments: [
      {
        type: String,
        trim: true,
      },
    ],
    advisorSections: [
      {
        type: String,
        trim: true,
      },
    ],
    delegatedTo: {
      userId: { type: String, trim: true },
      name: { type: String, trim: true },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    employmentType: {
      type: String,
      enum: ['permanent', 'contract', 'visiting', 'temporary', 'part-time'],
      default: 'permanent',
    },

    // ─── Qualifications ───────────────────────────────
    qualification: {
      type: String,
      trim: true,
    },
    highestDegree: {
      type: String,
      enum: ['PhD', 'M.Tech', 'M.Sc', 'MBA', 'M.A', 'B.Tech', 'B.Sc', 'B.A', 'Other'],
    },
    specialization: {
      type: String,
      trim: true,
    },
    researchInterests: [{
      type: String,
      trim: true,
    }],
    publications: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ─── Experience ───────────────────────────────────
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    previousExperience: [{
      institution: { type: String, trim: true },
      designation: { type: String, trim: true },
      years: { type: Number, min: 0 },
      from: { type: Date },
      to: { type: Date },
    }],

    // ─── Dates ────────────────────────────────────────
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    confirmationDate: {
      type: Date,
    },
    retirementDate: {
      type: Date,
    },
    relievingDate: {
      type: Date,
    },

    // ─── Current Subject Assignments ──────────────────
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    }],

    // ─── Address ──────────────────────────────────────
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },
    permanentAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },

    // ─── Emergency ────────────────────────────────────
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },

    // ─── Bank Details ─────────────────────────────────
    bankDetails: {
      accountNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      branch: { type: String, trim: true },
    },

    // ─── Salary Reference ─────────────────────────────
    salary: {
      basic: { type: Number, min: 0, default: 0 },
      allowances: { type: Number, min: 0, default: 0 },
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    // ─── Media ────────────────────────────────────────
    profileImage: {
      type: String,
      trim: true,
    },

    // ─── Status ───────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'on-leave', 'sabbatical', 'resigned', 'retired', 'terminated', 'suspended'],
      default: 'active',
      index: true,
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
facultySchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
facultySchema.index({ department: 1, status: 1 });
facultySchema.index({ designation: 1 });
facultySchema.index({ employmentType: 1 });
facultySchema.index({ fullName: 'text', employeeId: 'text', email: 'text', specialization: 'text' });

// ─── Virtuals ────────────────────────────────────────────
facultySchema.virtual('totalSalary').get(function () {
  return (this.salary?.basic || 0) + (this.salary?.allowances || 0);
});

facultySchema.virtual('schedules', {
  ref: 'FacultySchedule',
  localField: '_id',
  foreignField: 'faculty',
});

facultySchema.virtual('salaryRecords', {
  ref: 'FacultySalary',
  localField: '_id',
  foreignField: 'faculty',
});

facultySchema.virtual('attendanceRecords', {
  ref: 'FacultyAttendance',
  localField: '_id',
  foreignField: 'faculty',
});

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
