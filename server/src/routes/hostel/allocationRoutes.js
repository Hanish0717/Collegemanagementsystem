import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import { createAllocation, transferAllocation, updateAllocation, deleteAllocation } from '../../controllers/hostel/allocationController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super-admin', 'hostel-warden'));

router.post('/', createAllocation);
router.put('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);
router.post('/:id/transfer', transferAllocation);

export default router;
