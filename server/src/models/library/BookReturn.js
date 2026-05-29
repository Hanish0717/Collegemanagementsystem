/**
 * Book Return Model
 * 
 * Detailed return records with condition tracking.
 * Linked to IssuedBook for complete issue→return workflow.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const bookReturnSchema = new mongoose.Schema(
  {
    issuedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IssuedBook',
      required: [true, 'Issued book reference is required'],
      index: true,
    },
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
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
      default: Date.now,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver reference is required'],
    },
    dueDate: { type: Date },
    daysLate: { type: Number, min: 0, default: 0 },
    conditionOnReturn: {
      type: String,
      enum: ['good', 'fair', 'damaged', 'heavily-damaged', 'lost'],
      default: 'good',
    },
    conditionNotes: { type: String, trim: true, maxlength: 500 },
    fineApplied: { type: Number, min: 0, default: 0 },
    damageCharge: { type: Number, min: 0, default: 0 },
    totalCharges: { type: Number, min: 0, default: 0 },
    isAccepted: { type: Boolean, default: true },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

bookReturnSchema.plugin(baseSchemaPlugin);

bookReturnSchema.index({ returnDate: -1 });
bookReturnSchema.index({ borrower: 1, returnDate: -1 });

bookReturnSchema.pre('save', function (next) {
  if (this.dueDate && this.returnDate) {
    const diff = this.returnDate - this.dueDate;
    this.daysLate = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }
  this.totalCharges = (this.fineApplied || 0) + (this.damageCharge || 0);
  next();
});

const BookReturn = mongoose.model('BookReturn', bookReturnSchema);

export default BookReturn;
