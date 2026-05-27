/**
 * Faculty Schedule Model
 * 
 * Class timetable with subject, room, and time slot assignments.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const facultyScheduleSchema = new mongoose.Schema(
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
    subjectName: { type: String, trim: true },
    subjectCode: { type: String, trim: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    semester: { type: Number, required: true, min: 1, max: 12 },
    section: { type: String, required: true, trim: true, uppercase: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },

    // ─── Time Slot ────────────────────────────────────
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    },
    period: {
      type: Number,
      required: [true, 'Period is required'],
      min: 1,
      max: 10,
    },
    startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    duration: { type: Number, min: 0, default: 60 },

    // ─── Room ─────────────────────────────────────────
    room: {
      number: { type: String, trim: true },
      building: { type: String, trim: true },
      floor: { type: Number, min: 0 },
      type: { type: String, enum: ['classroom', 'lab', 'seminar-hall', 'auditorium', 'online'], default: 'classroom' },
      capacity: { type: Number, min: 0 },
    },

    classType: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial', 'seminar', 'workshop', 'exam'],
      default: 'lecture',
    },
    isRecurring: { type: Boolean, default: true },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

facultyScheduleSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
facultyScheduleSchema.index(
  { faculty: 1, day: 1, period: 1, academicYear: 1 },
  { unique: true }
);
facultyScheduleSchema.index({ department: 1, semester: 1, section: 1, day: 1 });
facultyScheduleSchema.index({ 'room.number': 1, day: 1, period: 1 });

// ─── Statics ─────────────────────────────────────────────
facultyScheduleSchema.statics.getWeeklySchedule = function (facultyId, academicYearId) {
  return this.find({ faculty: facultyId, academicYear: academicYearId, isActive: true })
    .populate('subject', 'name code')
    .sort({ day: 1, period: 1 })
    .lean();
};

facultyScheduleSchema.statics.checkConflict = async function (facultyId, day, period, academicYearId) {
  return this.findOne({
    faculty: facultyId, day, period, academicYear: academicYearId, isActive: true,
  });
};

const FacultySchedule = mongoose.model('FacultySchedule', facultyScheduleSchema);

export default FacultySchedule;
