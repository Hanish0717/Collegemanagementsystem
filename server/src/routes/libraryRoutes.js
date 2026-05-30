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
  getEBooks,
  addEBook,
  updateEBook,
  deleteEBook,
  downloadEBook,
  getLibraryNotifications,
  addLibraryNotification,
  markNotificationRead,
  archiveNotification,
  getLibrarySettings,
  updateLibrarySettings,
} from '../controllers/libraryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public book queries (any authenticated user can view)
router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.get('/ebooks', getEBooks);
router.post('/ebooks/:id/download', downloadEBook);

// Issued books list - accessible to librarian/admin/super-admin/student/parent
router.get('/issued', authorizeRoles('librarian', 'admin', 'super-admin', 'student', 'parent'), getIssuedBooks);

// Book management - librarian/admin/super-admin only
router.use(authorizeRoles('librarian', 'admin', 'super-admin'));
router.post('/books', addBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);
router.post('/ebooks', addEBook);
router.put('/ebooks/:id', updateEBook);
router.delete('/ebooks/:id', deleteEBook);

// Issue/Return - librarian or admin
router.post('/issue', authorizeRoles('librarian', 'admin'), issueBook);
router.post('/return/:issueId', authorizeRoles('librarian', 'admin'), returnBook);

// Reporting - librarian/admin/super-admin
router.get('/report', getLibraryReport);

// Notifications & Settings - librarian/admin/super-admin
router.get('/notifications', getLibraryNotifications);
router.post('/notifications', addLibraryNotification);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/:id/archive', archiveNotification);
router.get('/settings', getLibrarySettings);
router.put('/settings', updateLibrarySettings);

export default router;
