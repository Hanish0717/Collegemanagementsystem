import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },
    dateOfBirth: {
      type: Date,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required'],
      enum: {
        values: [1, 2, 3, 4],
        message: 'Year must be 1, 2, 3, or 4',
      },
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
    address: {
      type: String,
      trim: true,
    },
    parentName: {
      type: String,
      required: [true, 'Parent or guardian name is required'],
      trim: true,
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent contact number is required'],
      trim: true,
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be less than 0'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    attendancePercentage: {
      type: Number,
      min: [0, 'Attendance cannot be less than 0'],
      max: [100, 'Attendance cannot exceed 100'],
      default: 100,
    },
    profileImage: {
      type: String,
      trim: true,
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

const Student = mongoose.model('Student', studentSchema);

export default Student;
