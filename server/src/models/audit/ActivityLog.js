/**
 * Activity Log Model
 * 
 * Captures simpler user session logs, page visits, API request telemetry, and searches.
 */

import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true, // e.g. "VIEW_DASHBOARD", "SEARCH_BOOKS", "DOWNLOAD_PASS"
    },
    route: { type: String, trim: true },
    method: { type: String, uppercase: true, trim: true },
    durationMs: { type: Number },
    status: { type: Number, index: true }, // HTTP status code
    payloadSize: { type: Number },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'activitylogs',
  }
);

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
