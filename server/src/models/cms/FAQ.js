/**
 * FAQ Model
 * 
 * Manages Frequently Asked Questions on the landing page.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'FAQ question is required'],
      trim: true,
      maxlength: 300,
    },
    answer: {
      type: String,
      required: [true, 'FAQ answer is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: ['admissions', 'academics', 'hostel', 'library', 'transport', 'general', 'placements'],
      default: 'general',
      index: true,
    },
    orderNumber: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'faqs',
  }
);

faqSchema.plugin(baseSchemaPlugin);
faqSchema.index({ category: 1, orderNumber: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;
