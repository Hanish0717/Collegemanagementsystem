import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import {
  setupSchema,
  listMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  listResidents,
  addResident,
  updateResident,
  removeResident,
  submitFeedback,
  listFeedback,
  listFees,
  createFee,
  payFee,
  dailyMealReport,
  monthlyRevenueReport,
  feeCollectionReport,
  feedbackReport,
  exportDailyMealReport,
  exportMonthlyRevenueReport,
  exportFeeCollectionReport,
  exportFeedbackReport,
} from '../../controllers/hostel/messController.js';

const router = express.Router();

// Public read endpoints
router.get('/menus', protect, listMenus);
router.get('/menus/week', protect, listMenus);
router.get('/feedback', protect, listFeedback);

// Admin endpoints
router.post('/setup', protect, authorizeRoles('admin', 'super-admin'), setupSchema);
router.post('/menus', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), createMenu);
router.put('/menus/:id', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), updateMenu);
router.delete('/menus/:id', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), deleteMenu);

router.get('/residents', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), listResidents);
router.post('/residents', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), addResident);
router.put('/residents/:id', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), updateResident);
router.delete('/residents/:id', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), removeResident);

// Feedback and fees (residents can submit feedback and view their fees)
router.post('/feedback', protect, submitFeedback);
router.get('/fees', protect, listFees);
router.post('/fees', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), createFee);
router.post('/fees/:id/pay', protect, payFee);

// Reports
router.get('/reports/daily', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), dailyMealReport);
router.get('/reports/monthly', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), monthlyRevenueReport);
router.get('/reports/fees', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), feeCollectionReport);
router.get('/reports/feedback', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), feedbackReport);

// Exports
router.get('/reports/daily/export', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), exportDailyMealReport);
router.get('/reports/monthly/export', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), exportMonthlyRevenueReport);
router.get('/reports/fees/export', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), exportFeeCollectionReport);
router.get('/reports/feedback/export', protect, authorizeRoles('admin', 'hostel-warden', 'super-admin'), exportFeedbackReport);

export default router;
