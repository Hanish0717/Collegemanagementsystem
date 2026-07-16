import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import {
  listAllocations,
  createAllocation,
  transferAllocation,
  updateAllocation,
  deleteAllocation,
  createResidentAllocation,
  updateResidentAllocation
} from '../../controllers/hostel/allocationController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super-admin', 'hostel-warden'));

router.get('/', listAllocations);
router.post('/', createAllocation);
router.post('/resident', createResidentAllocation);
router.put('/resident/:id', updateResidentAllocation);
router.put('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);
router.post('/:id/transfer', transferAllocation);

export default router;
