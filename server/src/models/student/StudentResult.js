/**
 * Student Result Model
 * 
 * Tracks academic results per student per subject per semester.
 * Supports internal marks, external marks, GPA calculation.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const studentResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
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
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester reference is required'],
      index: true,
    },
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: 1,
      max: 12,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },

    // ─── Marks ─────────────────────────────────────────
    internalMarks: {
      obtained: {
        type: Number,
        min: [0, 'Marks cannot be negative'],
        default: 0,
      },
      maximum: {
        type: Number,
        min: [0, 'Max marks cannot be negative'],
        default: 40,
      },
    },
    externalMarks: {
      obtained: {
        type: Number,
        min: [0, 'Marks cannot be negative'],
        default: 0,
      },
      maximum: {
        type: Number,
        min: [0, 'Max marks cannot be negative'],
        default: 60,
      },
    },
    practicalMarks: {
      obtained: {
        type: Number,
        min: 0,
        default: 0,
      },
      maximum: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    totalMarks: {
      obtained: { type: Number, default: 0 },
      maximum: { type: Number, default: 100 },
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ─── Grading ───────────────────────────────────────
    credits: {
      type: Number,
      min: 0,
      default: 0,
    },
    gradePoint: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB', 'I'],
      default: 'I',
    },
    creditPoints: {
      type: Number,
      default: 0,
    },

    // ─── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'published', 'withheld', 'revaluation', 'supplementary'],
      default: 'pending',
      index: true,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
studentResultSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
studentResultSchema.index(
  { student: 1, subject: 1, semester: 1, attemptNumber: 1 },
  { unique: true }
);
studentResultSchema.index({ student: 1, semesterNumber: 1 });
studentResultSchema.index({ department: 1, semesterNumber: 1, status: 1 });
studentResultSchema.index({ student: 1, isPassed: 1 });

// ─── Pre-save: Auto-calculate totals, grade, GPA ────────
studentResultSchema.pre('save', function (next) {
  // Calculate totals
  const internal = this.internalMarks.obtained || 0;
  const external = this.externalMarks.obtained || 0;
  const practical = this.practicalMarks.obtained || 0;

  const maxInternal = this.internalMarks.maximum || 0;
  const maxExternal = this.externalMarks.maximum || 0;
  const maxPractical = this.practicalMarks.maximum || 0;

  this.totalMarks.obtained = internal + external + practical;
  this.totalMarks.maximum = maxInternal + maxExternal + maxPractical;

  // Calculate percentage
  if (this.totalMarks.maximum > 0) {
    this.percentage = Math.round((this.totalMarks.obtained / this.totalMarks.maximum) * 100 * 100) / 100;
  }

  // Auto-grade
  const pct = this.percentage;
  if (pct >= 90) { this.grade = 'O'; this.gradePoint = 10; }
  else if (pct >= 80) { this.grade = 'A+'; this.gradePoint = 9; }
  else if (pct >= 70) { this.grade = 'A'; this.gradePoint = 8; }
  else if (pct >= 60) { this.grade = 'B+'; this.gradePoint = 7; }
  else if (pct >= 50) { this.grade = 'B'; this.gradePoint = 6; }
  else if (pct >= 40) { this.grade = 'C'; this.gradePoint = 5; }
  else if (pct >= 30) { this.grade = 'D'; this.gradePoint = 4; }
  else { this.grade = 'F'; this.gradePoint = 0; }

  // Pass/Fail
  this.isPassed = this.percentage >= 40 && this.grade !== 'F';

  // Credit points
  this.creditPoints = this.gradePoint * (this.credits || 0);

  next();
});

// ─── Statics ─────────────────────────────────────────────
studentResultSchema.statics.calculateSGPA = async function (studentId, semesterId) {
  const results = await this.find({ student: studentId, semester: semesterId, status: 'published' });
  if (!results.length) return 0;

  let totalCreditPoints = 0;
  let totalCredits = 0;
  for (const r of results) {
    totalCreditPoints += r.creditPoints || 0;
    totalCredits += r.credits || 0;
  }
  return totalCredits > 0 ? Math.round((totalCreditPoints / totalCredits) * 100) / 100 : 0;
};

studentResultSchema.statics.calculateCGPA = async function (studentId) {
  const results = await this.find({ student: studentId, status: 'published', isPassed: true });
  if (!results.length) return 0;

  let totalCreditPoints = 0;
  let totalCredits = 0;
  for (const r of results) {
    totalCreditPoints += r.creditPoints || 0;
    totalCredits += r.credits || 0;
  }
  return totalCredits > 0 ? Math.round((totalCreditPoints / totalCredits) * 100) / 100 : 0;
};

const StudentResult = mongoose.model('StudentResult', studentResultSchema);

export default StudentResult;
