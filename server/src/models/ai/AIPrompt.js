/**
 * AI Prompt Model
 * 
 * Manages system prompts and instruction templates for the AI assistant.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const aiPromptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Prompt template name is required'],
      unique: true,
      trim: true,
      maxlength: 100,
    },
    promptText: {
      type: String,
      required: [true, 'System prompt text is required'],
      trim: true,
    },
    variables: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: ['general', 'academic', 'library', 'fees', 'placement', 'hostel', 'transport'],
      default: 'general',
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'aiprompts',
  }
);

aiPromptSchema.plugin(baseSchemaPlugin);

const AIPrompt = mongoose.model('AIPrompt', aiPromptSchema);
export default AIPrompt;
