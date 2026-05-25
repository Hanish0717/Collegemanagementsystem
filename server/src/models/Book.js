import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Book category is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    edition: {
      type: String,
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Total copies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
    },
    language: {
      type: String,
      trim: true,
    },
    shelfNumber: {
      type: String,
      trim: true,
    },
    description: {
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

// Pre-save hook to initialize and validate available copies
bookSchema.pre('save', function (next) {
  if (this.isNew && this.availableCopies === undefined) {
    this.availableCopies = this.totalCopies;
  }

  if (this.availableCopies > this.totalCopies) {
    const error = new Error('Available copies cannot exceed total copies');
    return next(error);
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
