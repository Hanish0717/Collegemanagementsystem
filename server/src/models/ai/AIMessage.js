/**
 * AI Message Model
 * 
 * Individual messages within an AI conversation.
 * Supports both user and assistant messages with metadata.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: [true, 'Conversation reference is required'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['user', 'assistant', 'system'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    metadata: {
      tokensUsed: { type: Number },
      model: { type: String, trim: true },
      latencyMs: { type: Number },
      sources: [
        {
          type: { type: String, trim: true },
          reference: { type: String, trim: true },
        },
      ],
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'aimessages',
  }
);

// ─── Plugins ─────────────────────────────────────────────
aiMessageSchema.plugin(baseSchemaPlugin, { audit: false });

// ─── Indexes ─────────────────────────────────────────────
aiMessageSchema.index({ conversation: 1, createdAt: 1 });

const AIMessage = mongoose.model('AIMessage', aiMessageSchema);

export default AIMessage;
