import express from 'express';
import {
  getParentStudentData,
  getParentLeaveRequests,
  createParentLeaveRequest,
} from '../controllers/parentModuleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('parent', 'admin', 'super-admin'));

router.get('/student-data', getParentStudentData);
router.route('/leave')
  .get(getParentLeaveRequests)
  .post(createParentLeaveRequest);

export default router;
