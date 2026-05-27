/**
 * Selected Student Model
 * 
 * Represents students who successfully cleared all interview rounds and received placement offers.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const selectedStudentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentApplication',
      required: [true, 'Application reference is required'],
      index: true,
    },
    packageOffered: {
      type: Number, // in LPA or annual amount
      required: [true, 'Offered package is required'],
      min: 0,
    },
    offerLetterUrl: { type: String, trim: true },
    joiningDate: { type: Date },
    status: {
      type: String,
      enum: ['offered', 'accepted', 'rejected', 'joined'],
      default: 'offered',
      index: true,
    },
    remarks: { type: String, trim: true, maxlength: 1000 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'selectedstudents',
  }
);

selectedStudentSchema.plugin(baseSchemaPlugin);
selectedStudentSchema.index({ student: 1, drive: 1 }, { unique: true });

const SelectedStudent = mongoose.model('SelectedStudent', selectedStudentSchema);
export default SelectedStudent;
