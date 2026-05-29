/**
 * Hostel Fee Model
 * 
 * Tracks hostel-specific fees: room rent, mess, maintenance, etc.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const hostelFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    allocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelAllocation',
      index: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    feeType: {
      type: String,
      required: true,
      enum: ['room-rent', 'mess', 'maintenance', 'electricity', 'water', 'laundry', 'security-deposit', 'caution-deposit', 'other'],
      index: true,
    },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number, min: 2020 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, min: 0, default: 0 },
    remainingAmount: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    fine: { type: Number, min: 0, default: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'waived'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'bank-transfer', 'online'] },
    transactionId: { type: String, trim: true },
    receiptNumber: { type: String, unique: true, sparse: true, trim: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

hostelFeeSchema.plugin(baseSchemaPlugin);
hostelFeeSchema.index({ student: 1, feeType: 1, month: 1, year: 1 });
hostelFeeSchema.index({ hostel: 1, paymentStatus: 1 });

hostelFeeSchema.pre('save', function (next) {
  const effective = this.totalAmount - (this.discount || 0) + (this.fine || 0);
  this.remainingAmount = effective - (this.paidAmount || 0);
  if (this.paidAmount >= effective) {
    this.paymentStatus = 'paid'; this.remainingAmount = 0;
    if (!this.paidDate) this.paidDate = new Date();
  } else if (new Date(this.dueDate) < new Date() && this.remainingAmount > 0) {
    this.paymentStatus = 'overdue';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  }
  next();
});

const HostelFee = mongoose.model('HostelFee', hostelFeeSchema);
export default HostelFee;
