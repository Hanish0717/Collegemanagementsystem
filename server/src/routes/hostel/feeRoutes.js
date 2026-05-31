import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import {
  listFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  listResidentFees,
  assignFeeToResident,
  recordPayment,
  listFeePayments,
  getFeeDashboard,
  getFeeNotifications,
} from '../../controllers/hostel/feeController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super-admin', 'hostel-warden'));

router.get('/structures', listFeeStructures);
router.post('/structures', createFeeStructure);
router.put('/structures/:id', updateFeeStructure);
router.delete('/structures/:id', deleteFeeStructure);

router.get('/', listResidentFees);
router.get('/dashboard', getFeeDashboard);
router.get('/notifications', getFeeNotifications);
router.post('/assign/:allocationId', assignFeeToResident);
router.post('/:id/pay', recordPayment);
router.get('/:id/payments', listFeePayments);

export default router;
