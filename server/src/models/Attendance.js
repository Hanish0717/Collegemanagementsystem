import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      enum: {
        values: [1, 2, 3, 4, 5, 6, 7, 8],
        message: 'Semester must be between 1 and 8',
      },
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['present', 'absent', 'late'],
        message: "Status must be 'present', 'absent', or 'late'",
      },
      default: 'present',
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Normalize date to start of day UTC before validation/saving
attendanceSchema.pre('validate', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date = d;
  }
  next();
});

// Compound unique index to prevent duplicate attendance for the same student on the same date for the same subject
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
