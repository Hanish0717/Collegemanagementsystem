/**
 * Book Author Model
 * 
 * Manages author catalog with biographical data.
 * Many-to-many with books via embedded refs on Book model.
 */

import mongoose from 'mongoose';
import baseSchemaPlugin from '../plugins/baseSchemaPlugin.js';

const bookAuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    email: { type: String, trim: true, lowercase: true },
    bio: { type: String, trim: true, maxlength: 2000 },
    nationality: { type: String, trim: true },
    birthYear: { type: Number },
    deathYear: { type: Number },
    website: { type: String, trim: true },
    photo: { type: String, trim: true },
    specialization: [{ type: String, trim: true }],
    totalBooks: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bookAuthorSchema.plugin(baseSchemaPlugin);

bookAuthorSchema.index({ name: 'text', specialization: 'text' });
bookAuthorSchema.index({ nationality: 1 });

bookAuthorSchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const BookAuthor = mongoose.model('BookAuthor', bookAuthorSchema);

export default BookAuthor;
