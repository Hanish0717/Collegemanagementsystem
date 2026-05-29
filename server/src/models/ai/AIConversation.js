/**
 * AI Conversation Model
 * 
 * Tracks AI assistant chat sessions per user.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'New Conversation',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    context: {
      type: String,
      enum: ['general', 'academic', 'library', 'fees', 'placement', 'hostel', 'transport'],
      default: 'general',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
    },
    metadata: {
      model: { type: String, trim: true },
      tokensUsed: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'aiconversations',
  }
);

// ─── Plugins ─────────────────────────────────────────────
aiConversationSchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
aiConversationSchema.index({ user: 1, status: 1, updatedAt: -1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

export default AIConversation;
