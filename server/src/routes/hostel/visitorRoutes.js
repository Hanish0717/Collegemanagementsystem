import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import { listVisitors, createVisitor, checkOutVisitor } from '../../controllers/hostel/visitorController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super-admin', 'hostel-warden'));

router.get('/', listVisitors);
router.post('/', createVisitor);
router.put('/:id/checkout', checkOutVisitor);

export default router;
