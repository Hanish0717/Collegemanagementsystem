import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g. 2025-2026)'],
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
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
      enum: {
        values: ['tuition', 'hostel', 'transport', 'examination', 'library', 'miscellaneous'],
        message: "Fee type must be 'tuition', 'hostel', 'transport', 'examination', 'library', or 'miscellaneous'",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'partial', 'paid', 'overdue'],
        message: "Payment status must be 'pending', 'partial', 'paid', or 'overdue'",
      },
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'upi', 'bank-transfer'],
        message: "Payment method must be 'cash', 'card', 'upi', or 'bank-transfer'",
      },
    },
    transactionId: {
      type: String,
      trim: true,
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

// Pre-save hook to calculate remainingAmount and paymentStatus automatically
feeSchema.pre('save', function (next) {
  // Ensure paidAmount does not exceed totalAmount
  if (this.paidAmount > this.totalAmount) {
    this.paidAmount = this.totalAmount;
  }

  this.remainingAmount = this.totalAmount - this.paidAmount;

  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
    this.remainingAmount = 0;
  } else if (new Date(this.dueDate) < new Date() && this.remainingAmount > 0) {
    this.paymentStatus = 'overdue';
  } else if (this.paidAmount > 0 && this.remainingAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'pending';
  }
  next();
});

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;
