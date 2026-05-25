import Book from '../models/Book.js';
import IssuedBook from '../models/IssuedBook.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';

// Helper: Update overdue status for all active issues
const updateOverdueIssues = async () => {
  const now = new Date();
  await IssuedBook.updateMany(
    {
      status: { $in: ['issued'] },
      dueDate: { $lt: now },
      returnDate: null,
    },
    { $set: { status: 'overdue' } }
  );
};

/**
 * @desc   Add a new book
 * @route  POST /api/library/books
 */
export const addBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, publisher, edition, totalCopies, language, shelfNumber, description } = req.body;
    if (!title || !author || !category || !isbn || !totalCopies) {
      const err = new Error('Missing required fields');
      err.statusCode = 400;
      return next(err);
    }
    const existing = await Book.findOne({ isbn });
    if (existing) {
      const err = new Error('ISBN already exists');
      err.statusCode = 400;
      return next(err);
    }
    const book = await Book.create({
      title,
      author,
      category,
      isbn,
      publisher,
      edition,
      totalCopies,
      language,
      shelfNumber,
      description,
    });
    res.status(201).json({ success: true, message: 'Book added', data: book });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all books with filters & pagination
 */
export const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, author, category, availability } = req.query;
    const query = { isActive: true };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      query.availableCopies = { $lte: 0 };
    }
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const total = await Book.countDocuments(query);
    const books = await Book.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Books fetched',
      data: { books, pagination: { total, page: pageNum, limit: limitNum } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a single book by ID
 */
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, isActive: true });
    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ success: true, message: 'Book fetched', data: book });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a book
 */
export const updateBook = async (req, res, next) => {
  try {
    const update = { ...req.body };
    // If totalCopies is modified, ensure availableCopies <= totalCopies
    if (update.totalCopies !== undefined) {
      const book = await Book.findById(req.params.id);
      if (!book) {
        const err = new Error('Book not found');
        err.statusCode = 404;
        return next(err);
      }
      if (book.availableCopies > update.totalCopies) {
        const err = new Error('Cannot reduce totalCopies below current availableCopies');
        err.statusCode = 400;
        return next(err);
      }
    }
    const book = await Book.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ success: true, message: 'Book updated', data: book });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Soft delete a book (set isActive false)
 */
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ success: true, message: 'Book deactivated', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Issue a book to a student
 */
export const issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId, dueDate } = req.body;
    if (!studentId || !bookId || !dueDate) {
      const err = new Error('studentId, bookId and dueDate are required');
      err.statusCode = 400;
      return next(err);
    }
    // Validate student
    const student = await Student.findOne({ _id: studentId, isActive: true });
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      return next(err);
    }
    // Validate book
    const book = await Book.findOne({ _id: bookId, isActive: true });
    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }
    if (book.availableCopies <= 0) {
      const err = new Error('No copies available for this book');
      err.statusCode = 400;
      return next(err);
    }
    // Prevent duplicate active issue
    const existingIssue = await IssuedBook.findOne({
      student: studentId,
      book: bookId,
      status: { $in: ['issued', 'overdue'] },
    });
    if (existingIssue) {
      const err = new Error('Student already has an active issue for this book');
      err.statusCode = 400;
      return next(err);
    }
    // Create issue record
    const issued = await IssuedBook.create({
      student: studentId,
      book: bookId,
      dueDate,
    });
    // Decrement available copies
    book.availableCopies -= 1;
    await book.save();
    res.status(201).json({ success: true, message: 'Book issued', data: issued });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Return a book (by issue ID)
 */
export const returnBook = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const issue = await IssuedBook.findById(issueId).populate('book');
    if (!issue) {
      const err = new Error('Issue record not found');
      err.statusCode = 404;
      return next(err);
    }
    if (issue.status === 'returned') {
      const err = new Error('Book already returned');
      err.statusCode = 400;
      return next(err);
    }
    const now = new Date();
    let fine = 0;
    if (now > issue.dueDate) {
      const daysLate = Math.ceil((now - issue.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysLate * 10; // $10 per day
    }
    issue.returnDate = now;
    issue.fineAmount = fine;
    issue.status = 'returned';
    await issue.save();
    // Increment book copies
    const book = await Book.findById(issue.book._id);
    book.availableCopies += 1;
    await book.save();
    res.status(200).json({ success: true, message: 'Book returned', data: issue });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get issued books (with filters)
 */
export const getIssuedBooks = async (req, res, next) => {
  try {
    await updateOverdueIssues();
    const { status, studentId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (studentId) query.student = studentId;
    const issues = await IssuedBook.find(query)
      .populate('student', 'fullName rollNumber department')
      .populate('book', 'title author')
      .sort({ issueDate: -1 });
    res.status(200).json({ success: true, message: 'Issued books fetched', data: issues });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Generate library report
 */
export const getLibraryReport = async (req, res, next) => {
  try {
    await updateOverdueIssues();
    // Total books
    const totalBooks = await Book.countDocuments({ isActive: true });
    // Total issued (including overdue)
    const totalIssued = await IssuedBook.countDocuments({ status: { $in: ['issued', 'overdue'] } });
    // Overdue count
    const overdueCount = await IssuedBook.countDocuments({ status: 'overdue' });
    // Total fines collected (sum of fineAmount where status is returned)
    const finesAgg = await IssuedBook.aggregate([
      { $match: { status: 'returned' } },
      { $group: { _id: null, totalFines: { $sum: '$fineAmount' } } },
    ]);
    const totalFines = finesAgg[0] ? finesAgg[0].totalFines : 0;
    // Category analytics (books per category)
    const categoryAgg = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    // Most issued books (top 5 by issue count)
    const mostIssuedAgg = await IssuedBook.aggregate([
      { $group: { _id: '$book', issueCount: { $sum: 1 } } },
      { $sort: { issueCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookInfo',
        },
      },
      { $unwind: '$bookInfo' },
      {
        $project: {
          _id: 0,
          bookId: '$_id',
          title: '$bookInfo.title',
          author: '$bookInfo.author',
          issueCount: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      message: 'Library report generated',
      data: {
        totals: { totalBooks, totalIssued, overdueCount, totalFines },
        categoryAnalytics: categoryAgg,
        mostIssuedBooks: mostIssuedAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};
