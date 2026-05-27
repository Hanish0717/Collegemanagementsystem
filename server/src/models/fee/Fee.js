/**
 * Fee Model
 * 
 * Tracks individual fee records for students.
 * Auto-calculates remaining amount and payment status.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
      index: true,
    },
    // Denormalized for quick display
    academicYearName: {
      type: String,
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
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
    },
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
      enum: {
        values: ['tuition', 'hostel', 'transport', 'examination', 'library', 'laboratory', 'miscellaneous'],
        message: 'Invalid fee type',
      },
      index: true,
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
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    fine: {
      type: Number,
      default: 0,
      min: [0, 'Fine cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'partial', 'paid', 'overdue', 'waived'],
        message: 'Invalid payment status',
      },
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'card', 'upi', 'bank-transfer', 'cheque', 'online'],
        message: 'Invalid payment method',
      },
    },
    transactionId: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
feeSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
feeSchema.index({ student: 1, academicYear: 1, feeType: 1 });
feeSchema.index({ paymentStatus: 1, dueDate: 1 });

// ─── Pre-save: Auto-calculate status ────────────────────
feeSchema.pre('save', function (next) {
  // Apply discount
  const effectiveTotal = this.totalAmount - this.discount + this.fine;

  // Cap paid amount
  if (this.paidAmount > effectiveTotal) {
    this.paidAmount = effectiveTotal;
  }

  this.remainingAmount = effectiveTotal - this.paidAmount;

  if (this.paidAmount >= effectiveTotal) {
    this.paymentStatus = 'paid';
    this.remainingAmount = 0;
    if (!this.paidDate) this.paidDate = new Date();
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
