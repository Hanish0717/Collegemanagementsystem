import express from 'express';
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getIssuedBooks,
  getLibraryReport,
} from '../controllers/libraryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public book queries (any authenticated user can view)
router.get('/books', getBooks);
router.get('/books/:id', getBookById);

// Issued books list - accessible to librarian/admin/super-admin/student/parent
router.get('/issued', authorizeRoles('librarian', 'admin', 'super-admin', 'student', 'parent'), getIssuedBooks);

// Book management - librarian/admin/super-admin only
router.use(authorizeRoles('librarian', 'admin', 'super-admin'));
router.post('/books', addBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Issue/Return - librarian or admin
router.post('/issue', authorizeRoles('librarian', 'admin'), issueBook);
router.post('/return/:issueId', authorizeRoles('librarian', 'admin'), returnBook);

// Reporting - librarian/admin/super-admin
router.get('/report', getLibraryReport);

export default router;
