import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student user reference is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required (e.g., A, B+, C)'],
      trim: true,
      uppercase: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester identifier is required (e.g., Sem 5)'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);

export default Result;
