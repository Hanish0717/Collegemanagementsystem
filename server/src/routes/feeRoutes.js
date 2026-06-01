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

// Management routes restricted strictly to Admin and Super-Admin roles
router.use(authorizeRoles('admin', 'super-admin'));

router
  .route('/')
  .post(createFee)
  .get(getFees);

router.get('/report', getFeesReport);
router.post('/remind', sendFeeReminder);

router.post('/pay/:id', payFee);

router
  .route('/:id')
  .put(updateFee)
  .delete(deleteFee);

export default router;
