import mongoose from 'mongoose';

const issuedBookSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue'],
      default: 'issued',
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: [0, 'Fine amount cannot be negative'],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('IssuedBook', issuedBookSchema);
