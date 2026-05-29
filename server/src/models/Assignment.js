import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          default: null,
        },
        graded: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
