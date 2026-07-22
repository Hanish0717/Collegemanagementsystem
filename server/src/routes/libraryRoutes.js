import express from 'express';
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  deleteIssueRecord,
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
import {
  getIdCardStats,
  searchStudents,
  getStudentProfile,
  createIdCardRequest,
  approveRejectRequest,
  collectPayment,
  reprintCard,
  updateCardStatus,
  reportMissingCard,
  getHistory,
  getPaymentHistory,
  handoverCard,
} from '../controllers/idCardController.js';
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
router.delete('/issue/:issueId', authorizeRoles('librarian', 'admin'), deleteIssueRecord);

// Reporting - librarian/admin/super-admin
router.get('/report', getLibraryReport);

// Notifications & Settings - librarian/admin/super-admin
router.get('/notifications', getLibraryNotifications);
router.post('/notifications', addLibraryNotification);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/:id/archive', archiveNotification);
router.get('/settings', getLibrarySettings);
router.put('/settings', updateLibrarySettings);

// ID Card routes
router.get('/id-cards/stats', authorizeRoles('librarian', 'admin', 'super-admin'), getIdCardStats);
router.get('/id-cards/students', authorizeRoles('librarian', 'admin', 'super-admin'), searchStudents);
router.get('/id-cards/students/search', authorizeRoles('librarian', 'admin', 'super-admin'), searchStudents);
router.get('/id-cards/search', authorizeRoles('librarian', 'admin', 'super-admin'), searchStudents);
router.get('/id-cards/students/:studentId', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), getStudentProfile);
router.get('/id-cards/profile/:studentId', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), getStudentProfile);
router.get('/id-cards/student/:studentId', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), getStudentProfile);
router.post('/id-cards/requests', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), createIdCardRequest);
router.post('/id-cards/request', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), createIdCardRequest);
router.put('/id-cards/requests/:requestId/status', authorizeRoles('librarian', 'admin', 'super-admin'), approveRejectRequest);
router.post('/id-cards/request/approve-reject', authorizeRoles('librarian', 'admin', 'super-admin'), approveRejectRequest);
router.put('/id-cards/request/:requestId/status', authorizeRoles('librarian', 'admin', 'super-admin'), approveRejectRequest);
router.post('/id-cards/payments', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), collectPayment);
router.post('/id-cards/payment', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), collectPayment);
router.post('/id-cards/payment/collect', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), collectPayment);
router.post('/id-cards/reprint', authorizeRoles('librarian', 'admin', 'super-admin'), reprintCard);
router.post('/id-cards/:cardId/reprint', authorizeRoles('librarian', 'admin', 'super-admin'), reprintCard);
router.put('/id-cards/cards/:cardId/status', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), updateCardStatus);
router.post('/id-cards/status', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), updateCardStatus);
router.put('/id-cards/student/:studentId/status', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), updateCardStatus);
router.post('/id-cards/missing', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), reportMissingCard);
router.post('/id-cards/report-missing', authorizeRoles('librarian', 'admin', 'super-admin', 'student'), reportMissingCard);
router.get('/id-cards/history', authorizeRoles('librarian', 'admin', 'super-admin'), getHistory);
router.get('/id-cards/payments/history', authorizeRoles('librarian', 'admin', 'super-admin'), getPaymentHistory);
router.get('/id-cards/payment-history', authorizeRoles('librarian', 'admin', 'super-admin'), getPaymentHistory);
router.get('/id-cards/payments', authorizeRoles('librarian', 'admin', 'super-admin'), getPaymentHistory);
router.put('/id-cards/cards/:cardId/handover', authorizeRoles('librarian', 'admin', 'super-admin'), handoverCard);
router.post('/id-cards/handover/:cardId', authorizeRoles('librarian', 'admin', 'super-admin'), handoverCard);
router.post('/id-cards/:cardId/handover', authorizeRoles('librarian', 'admin', 'super-admin'), handoverCard);

export default router;
