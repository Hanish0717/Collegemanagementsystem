/**
 * Interview Result Model
 * 
 * Tracks interview performance of students per placement round.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const interviewResultSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentApplication',
      required: [true, 'Student application reference is required'],
      index: true,
    },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DriveRound',
      required: [true, 'Drive round reference is required'],
      index: true,
    },
    score: { type: Number, min: 0 },
    result: {
      type: String,
      enum: ['passed', 'failed', 'pending', 'absent'],
      default: 'pending',
      index: true,
    },
    remarks: { type: String, trim: true, maxlength: 1000 },
    interviewerName: { type: String, trim: true },
    evaluatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'interviewresults',
  }
);

interviewResultSchema.plugin(baseSchemaPlugin);
interviewResultSchema.index({ application: 1, round: 1 }, { unique: true });

const InterviewResult = mongoose.model('InterviewResult', interviewResultSchema);
export default InterviewResult;
