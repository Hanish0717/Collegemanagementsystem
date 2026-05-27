/**
 * AI Feedback Model
 * 
 * Stores user ratings, tags, and reviews for AI responses.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const aiFeedbackSchema = new mongoose.Schema(
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
      required: [true, 'Conversation reference is required'],
      index: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIMessage',
      required: [true, 'Message reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: { type: String, trim: true, maxlength: 1000 },
    categories: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    collection: 'aifeedbacks',
  }
);

aiFeedbackSchema.plugin(baseSchemaPlugin);

const AIFeedback = mongoose.model('AIFeedback', aiFeedbackSchema);
export default AIFeedback;
