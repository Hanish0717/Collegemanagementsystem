import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { authorizeRoles } from '../../middleware/roleMiddleware.js';
import { listHostelAttendance, markHostelAttendance, getHostelAttendanceStats } from '../../controllers/hostel/attendanceController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super-admin', 'hostel-warden'));

router.get('/', listHostelAttendance);
router.post('/mark', markHostelAttendance);
router.get('/stats', getHostelAttendanceStats);

export default router;
