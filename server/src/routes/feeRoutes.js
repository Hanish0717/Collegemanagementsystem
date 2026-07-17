import express from 'express';
import {
  createFee,
  getFees,
  getStudentFees,
  updateFee,
  deleteFee,
  payFee,
  getFeesReport,
  sendFeeReminder,
} from '../controllers/feeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Enforce authentication globally on all fee routes
router.use(protect);

// Retrieve individual student fees (accessible by Student/Parent/Admin/Super-Admin)
router.get('/student/:studentId', getStudentFees);
router.post('/pay/:id', payFee);

// Management routes restricted to Admin, Super-Admin, and Transport-Manager roles
router.use(authorizeRoles('admin', 'super-admin', 'transport-manager'));

router
  .route('/')
  .post(createFee)
  .get(getFees);

router.get('/report', getFeesReport);
router.post('/remind', sendFeeReminder);

router
  .route('/:id')
  .put(updateFee)
  .delete(deleteFee);

export default router;
