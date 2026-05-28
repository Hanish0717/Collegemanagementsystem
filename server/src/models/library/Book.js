/**
 * Book Model
 * 
 * Library catalog with ISBN, inventory, author refs, and condition tracking.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    // Legacy string author (backward compat)
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    // New: linked author references
    authors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookAuthor',
    }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCategory',
      index: true,
    },
    categoryName: { type: String, trim: true },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    isbn13: { type: String, trim: true, sparse: true },
    publisher: { type: String, trim: true },
    edition: { type: String, trim: true },
    publicationYear: { type: Number },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Total copies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
    },
    damagedCopies: { type: Number, min: 0, default: 0 },
    lostCopies: { type: Number, min: 0, default: 0 },
    language: { type: String, trim: true, default: 'English' },
    pages: { type: Number, min: 1 },
    price: { type: Number, min: 0, default: 0 },
    shelfNumber: { type: String, trim: true },
    rackNumber: { type: String, trim: true },
    rowNumber: { type: String, trim: true },
    barcode: { type: String, unique: true, sparse: true, trim: true },
    coverImage: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    tags: [{ type: String, trim: true }],
    subjects: [{ type: String, trim: true }],
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'worn', 'damaged'],
      default: 'good',
    },
    acquisitionDate: { type: Date },
    acquisitionSource: {
      type: String,
      enum: ['purchase', 'donation', 'exchange', 'government', 'other'],
      default: 'purchase',
    },
    isReferenceOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bookSchema.plugin(baseSchemaPlugin);

bookSchema.index({ title: 'text', author: 'text', isbn: 'text', tags: 'text' });
bookSchema.index({ category: 1, isActive: 1 });
bookSchema.index({ availableCopies: 1 });
bookSchema.index({ shelfNumber: 1, rackNumber: 1 });

bookSchema.pre('save', function (next) {
  if (this.isNew && this.availableCopies === undefined) {
    this.availableCopies = this.totalCopies;
  }
  if (this.availableCopies > this.totalCopies) {
    return next(new Error('Available copies cannot exceed total copies'));
  }
  next();
});

bookSchema.virtual('issuedCopies').get(function () {
  return this.totalCopies - this.availableCopies - (this.damagedCopies || 0) - (this.lostCopies || 0);
});

bookSchema.virtual('issues', {
  ref: 'IssuedBook', localField: '_id', foreignField: 'book',
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
