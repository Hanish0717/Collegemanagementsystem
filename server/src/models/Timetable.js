import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: {
        values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        message: 'Day must be Monday, Tuesday, Wednesday, Thursday, or Friday',
      },
      required: [true, 'Day is required'],
    },
    time: {
      type: String,
      required: [true, 'Time slot is required (e.g., 09:00 AM)'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    facultyName: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
