/**
 * Student Document Model
 * 
 * Manages student documents and certificates.
 * Supports verification workflows and document tracking.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const studentDocumentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: [
        'aadhaar',
        'pan',
        'passport',
        'birth-certificate',
        'ssc-marksheet',
        'hsc-marksheet',
        'transfer-certificate',
        'migration-certificate',
        'caste-certificate',
        'income-certificate',
        'domicile',
        'medical-certificate',
        'photograph',
        'signature',
        'bonafide',
        'provisional-certificate',
        'degree-certificate',
        'recommendation-letter',
        'noc',
        'other',
      ],
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    documentNumber: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    issuedBy: {
      type: String,
      trim: true,
    },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'expired'],
        default: 'pending',
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: {
        type: Date,
      },
      remarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Remarks cannot exceed 500 characters'],
      },
    },
    isMandatory: {
      type: Boolean,
      default: false,
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
studentDocumentSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
studentDocumentSchema.index({ student: 1, type: 1 });
studentDocumentSchema.index({ 'verification.status': 1 });
studentDocumentSchema.index({ student: 1, isMandatory: 1 });

const StudentDocument = mongoose.model('StudentDocument', studentDocumentSchema);

export default StudentDocument;
