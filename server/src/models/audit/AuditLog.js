/**
 * Audit Log Model
 * 
 * Captures detailed transactional audit trails (who, what, when, before/after images).
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'AUTH_LOGIN', 'AUTH_LOGOUT', 'IMPORT', 'EXPORT'],
      index: true,
    },
    collectionName: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    preImage: {
      type: mongoose.Schema.Types.Mixed, // Snapshot of document before change
    },
    postImage: {
      type: mongoose.Schema.Types.Mixed, // Snapshot of document after change
    },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    errorMessage: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'auditlogs',
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
