/**
 * Faculty Salary Model
 * 
 * Monthly salary records with structure, deductions, and payment tracking.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const facultySalarySchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    employeeId: { type: String, trim: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020, max: 2050 },

    // ─── Earnings ─────────────────────────────────────
    earnings: {
      basicPay: { type: Number, min: 0, default: 0 },
      hra: { type: Number, min: 0, default: 0 },
      da: { type: Number, min: 0, default: 0 },
      specialAllowance: { type: Number, min: 0, default: 0 },
      conveyanceAllowance: { type: Number, min: 0, default: 0 },
      medicalAllowance: { type: Number, min: 0, default: 0 },
      otherAllowances: { type: Number, min: 0, default: 0 },
      overtime: { type: Number, min: 0, default: 0 },
      bonus: { type: Number, min: 0, default: 0 },
    },

    // ─── Deductions ───────────────────────────────────
    deductions: {
      pf: { type: Number, min: 0, default: 0 },
      esi: { type: Number, min: 0, default: 0 },
      tds: { type: Number, min: 0, default: 0 },
      professionalTax: { type: Number, min: 0, default: 0 },
      loanRecovery: { type: Number, min: 0, default: 0 },
      otherDeductions: { type: Number, min: 0, default: 0 },
      leaveDeduction: { type: Number, min: 0, default: 0 },
    },

    // ─── Totals ───────────────────────────────────────
    grossEarnings: { type: Number, min: 0, default: 0 },
    totalDeductions: { type: Number, min: 0, default: 0 },
    netPay: { type: Number, min: 0, default: 0 },

    // ─── Leave Details ────────────────────────────────
    workingDays: { type: Number, min: 0, default: 0 },
    daysPresent: { type: Number, min: 0, default: 0 },
    daysAbsent: { type: Number, min: 0, default: 0 },
    leavesTaken: { type: Number, min: 0, default: 0 },

    // ─── Payment ──────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'processed', 'paid', 'hold', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['bank-transfer', 'cheque', 'cash', 'upi'],
      default: 'bank-transfer',
    },
    transactionId: { type: String, trim: true },
    payslipNumber: { type: String, unique: true, sparse: true, trim: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

facultySalarySchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
facultySalarySchema.index({ faculty: 1, month: 1, year: 1 }, { unique: true });
facultySalarySchema.index({ department: 1, month: 1, year: 1 });
facultySalarySchema.index({ paymentStatus: 1 });

// ─── Pre-save: Auto-calculate totals ────────────────────
facultySalarySchema.pre('save', function (next) {
  const e = this.earnings;
  this.grossEarnings = (e.basicPay || 0) + (e.hra || 0) + (e.da || 0) +
    (e.specialAllowance || 0) + (e.conveyanceAllowance || 0) +
    (e.medicalAllowance || 0) + (e.otherAllowances || 0) +
    (e.overtime || 0) + (e.bonus || 0);

  const d = this.deductions;
  this.totalDeductions = (d.pf || 0) + (d.esi || 0) + (d.tds || 0) +
    (d.professionalTax || 0) + (d.loanRecovery || 0) +
    (d.otherDeductions || 0) + (d.leaveDeduction || 0);

  this.netPay = this.grossEarnings - this.totalDeductions;
  next();
});

const FacultySalary = mongoose.model('FacultySalary', facultySalarySchema);

export default FacultySalary;
