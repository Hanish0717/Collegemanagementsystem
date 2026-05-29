import express from 'express';
import {
  getStudentDashboard,
  getStudentTimetable,
  getStudentResults,
  getStudentAssignments,
  submitAssignment,
  getStudentMaterials,
  getStudentLeaveRequests,
  createStudentLeaveRequest,
  getStudentPlacements,
  getStudentComplaints,
  createStudentComplaint,
} from '../controllers/studentModuleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student', 'admin', 'super-admin'));

router.get('/dashboard', getStudentDashboard);
router.get('/timetable', getStudentTimetable);
router.get('/results', getStudentResults);
router.get('/assignments', getStudentAssignments);
router.post('/assignments/submit/:id', submitAssignment);
router.get('/materials', getStudentMaterials);
router.route('/leave')
  .get(getStudentLeaveRequests)
  .post(createStudentLeaveRequest);
router.get('/placements', getStudentPlacements);
router.route('/complaints')
  .get(getStudentComplaints)
  .post(createStudentComplaint);

export default router;
