/**
 * Book Fine Model
 * 
 * Fine records for late returns, damaged, or lost books.
 * Supports payment tracking and waiver workflows.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const bookFineSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryMember',
      required: [true, 'Member reference is required'],
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower reference is required'],
      index: true,
    },
    issuedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IssuedBook',
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    bookTitle: { type: String, trim: true },
    fineType: {
      type: String,
      required: [true, 'Fine type is required'],
      enum: ['late-return', 'damaged', 'lost', 'processing', 'other'],
      index: true,
    },
    fineAmount: {
      type: Number,
      required: [true, 'Fine amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paidAmount: { type: Number, min: 0, default: 0 },
    remainingAmount: { type: Number, min: 0, default: 0 },
    daysLate: { type: Number, min: 0, default: 0 },
    finePerDay: { type: Number, min: 0, default: 5 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'waived'],
      default: 'pending',
      index: true,
    },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'deducted'],
    },
    transactionId: { type: String, trim: true },
    receiptNumber: { type: String, unique: true, sparse: true, trim: true },
    waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    waiverReason: { type: String, trim: true, maxlength: 500 },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

bookFineSchema.plugin(baseSchemaPlugin);

bookFineSchema.index({ borrower: 1, paymentStatus: 1 });
bookFineSchema.index({ member: 1, paymentStatus: 1 });

bookFineSchema.pre('save', function (next) {
  this.remainingAmount = this.fineAmount - (this.paidAmount || 0);
  if (this.paidAmount >= this.fineAmount) {
    this.paymentStatus = 'paid';
    this.remainingAmount = 0;
    if (!this.paymentDate) this.paymentDate = new Date();
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  }
  next();
});

const BookFine = mongoose.model('BookFine', bookFineSchema);

export default BookFine;
