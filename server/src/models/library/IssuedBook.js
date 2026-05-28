/**
 * Issued Book Model
 * 
 * Tracks book issue/return transactions.
 * Links students/users to books with due dates and fine calculation.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const issuedBookSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower reference is required'],
      index: true,
    },
    borrowerType: {
      type: String,
      enum: ['student', 'faculty', 'staff'],
      default: 'student',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Issuer reference is required'],
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
    returnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue', 'lost', 'damaged'],
      default: 'issued',
      index: true,
    },
    renewCount: {
      type: Number,
      default: 0,
      max: [3, 'Maximum 3 renewals allowed'],
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: [0, 'Fine amount cannot be negative'],
    },
    finePerDay: {
      type: Number,
      default: 5, // Rs. 5 per day late fee
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, 'Remarks cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
issuedBookSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
issuedBookSchema.index({ borrower: 1, status: 1 });
issuedBookSchema.index({ dueDate: 1, status: 1 });
issuedBookSchema.index({ book: 1, borrower: 1, status: 1 });

// ─── Virtuals ────────────────────────────────────────────
issuedBookSchema.virtual('isOverdue').get(function () {
  if (this.status === 'returned') return false;
  return new Date() > new Date(this.dueDate);
});

issuedBookSchema.virtual('daysOverdue').get(function () {
  if (this.status === 'returned' || new Date() <= new Date(this.dueDate)) return 0;
  const diff = new Date() - new Date(this.dueDate);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const IssuedBook = mongoose.model('IssuedBook', issuedBookSchema);

export default IssuedBook;
