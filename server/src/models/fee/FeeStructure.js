/**
 * Fee Structure Model
 * 
 * Defines the fee template for a department/year combination.
 * Used to generate individual Fee records for students.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const feeItemSchema = new mongoose.Schema(
  {
    feeType: {
      type: String,
      required: true,
      enum: ['tuition', 'hostel', 'transport', 'examination', 'library', 'laboratory', 'miscellaneous'],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fee structure name is required'],
      trim: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Academic year is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    feeItems: [feeItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
feeStructureSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
feeStructureSchema.index({ academicYear: 1, department: 1, semester: 1 }, { unique: true });

// ─── Pre-save: Calculate total ───────────────────────────
feeStructureSchema.pre('save', function (next) {
  this.totalAmount = this.feeItems.reduce((sum, item) => sum + item.amount, 0);
  next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;
