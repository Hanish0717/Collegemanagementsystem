/**
 * Faculty-Subject Junction Model
 * 
 * Many-to-many: Faculty assigned to teach specific subjects.
 * Tracks semester-wise subject assignments with load details.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const facultySubjectSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
      index: true,
    },
    subjectName: {
      type: String,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
    teachingType: {
      type: String,
      enum: ['theory', 'practical', 'tutorial', 'project', 'seminar'],
      default: 'theory',
    },
    weeklyHours: {
      type: Number,
      min: 0,
      default: 3,
    },
    totalHoursAssigned: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalHoursCompleted: {
      type: Number,
      min: 0,
      default: 0,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
facultySubjectSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
facultySubjectSchema.index(
  { faculty: 1, subject: 1, semester: 1, section: 1, academicYear: 1 },
  { unique: true }
);
facultySubjectSchema.index({ department: 1, semester: 1, academicYear: 1 });
facultySubjectSchema.index({ faculty: 1, academicYear: 1, isActive: 1 });

// ─── Statics ─────────────────────────────────────────────
facultySubjectSchema.statics.getSubjectsForFaculty = function (facultyId, academicYearId) {
  const query = { faculty: facultyId, isActive: true };
  if (academicYearId) query.academicYear = academicYearId;
  return this.find(query).populate('subject', 'name code credits').lean();
};

facultySubjectSchema.statics.getTeachingLoad = async function (facultyId, academicYearId) {
  const assignments = await this.find({ faculty: facultyId, academicYear: academicYearId, isActive: true });
  return assignments.reduce((sum, a) => sum + (a.weeklyHours || 0), 0);
};

const FacultySubject = mongoose.model('FacultySubject', facultySubjectSchema);

export default FacultySubject;
