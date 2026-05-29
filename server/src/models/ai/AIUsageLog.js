/**
 * AI Usage Log Model
 * 
 * Tracks model details, token consumption, latencies, and actions.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const aiUsageLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      index: true,
    },
    modelName: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true,
    },
    promptTokens: { type: Number, required: true, min: 0 },
    completionTokens: { type: Number, required: true, min: 0 },
    totalTokens: { type: Number, required: true, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    latencyMs: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    collection: 'aiusagelog',
  }
);

aiUsageLogSchema.plugin(baseSchemaPlugin);
aiUsageLogSchema.index({ createdAt: -1 });

const AIUsageLog = mongoose.model('AIUsageLog', aiUsageLogSchema);
export default AIUsageLog;
