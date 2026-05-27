/**
 * Parent Notification Model
 * 
 * Notification system for parent communication.
 * Supports multiple channels: email, SMS, push, in-app.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const parentNotificationSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent reference is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: [
        'attendance',
        'fee-reminder',
        'fee-receipt',
        'result',
        'announcement',
        'meeting',
        'disciplinary',
        'event',
        'emergency',
        'general',
      ],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    channel: {
      type: String,
      enum: ['in-app', 'email', 'sms', 'whatsapp', 'push', 'all'],
      default: 'in-app',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
parentNotificationSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
parentNotificationSchema.index({ parent: 1, isRead: 1, createdAt: -1 });
parentNotificationSchema.index({ parent: 1, type: 1 });
parentNotificationSchema.index({ sentAt: -1 });
parentNotificationSchema.index({ expiresAt: 1 }, { sparse: true });

// ─── Statics ─────────────────────────────────────────────
parentNotificationSchema.statics.getUnreadCount = function (parentId) {
  return this.countDocuments({ parent: parentId, isRead: false });
};

parentNotificationSchema.statics.markAllRead = function (parentId) {
  return this.updateMany(
    { parent: parentId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const ParentNotification = mongoose.model('ParentNotification', parentNotificationSchema);

export default ParentNotification;
