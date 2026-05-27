/**
 * Transport Fee Model
 * 
 * Manages transport-related fee records, payments, and dues for allocated students.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const transportFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    allocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportAllocation',
      required: [true, 'Allocation reference is required'],
      index: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      index: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total fee amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      min: 0,
      default: 0,
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
      enum: ['pending', 'partial', 'paid', 'overdue', 'waived'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank-transfer', 'online'],
    },
    transactionId: { type: String, trim: true },
    receiptNumber: { type: String, unique: true, sparse: true, trim: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'transport_fees', // custom collection name matching the prompt
  }
);

transportFeeSchema.plugin(baseSchemaPlugin);

transportFeeSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

transportFeeSchema.pre('save', function (next) {
  this.remainingAmount = this.totalAmount - (this.paidAmount || 0);
  if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
    this.remainingAmount = 0;
    if (!this.paidDate) this.paidDate = new Date();
  } else if (new Date(this.dueDate) < new Date() && this.remainingAmount > 0) {
    this.paymentStatus = 'overdue';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  }
  next();
});

const TransportFee = mongoose.model('TransportFee', transportFeeSchema);
export default TransportFee;
