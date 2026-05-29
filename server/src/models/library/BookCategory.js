/**
 * Book Category Model
 * 
 * Categorizes books in the library for organized browsing and search.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const bookCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCategory',
      default: null,
    },
    shelfPrefix: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Plugins ─────────────────────────────────────────────
bookCategorySchema.plugin(baseSchemaPlugin);

// ─── Indexes ─────────────────────────────────────────────
bookCategorySchema.index({ name: 'text' });

const BookCategory = mongoose.model('BookCategory', bookCategorySchema);

export default BookCategory;
