import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['PDF', 'Video', 'Document'],
        message: 'Type must be PDF, Video, or Document',
      },
      required: [true, 'Material type is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
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
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;
