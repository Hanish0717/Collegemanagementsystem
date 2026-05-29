import express from 'express';
import {
  getFacultyDashboard,
  getFacultyClasses,
  getFacultyAssignments,
  createFacultyAssignment,
  gradeSubmission,
  getFacultyMaterials,
  createFacultyMaterial,
  uploadStudentMarks,
  getFacultyLeaveRequests,
  createFacultyLeaveRequest,
  getStudentPerformance,
} from '../controllers/facultyModuleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('faculty', 'admin', 'super-admin'));

router.get('/dashboard', getFacultyDashboard);
router.get('/classes', getFacultyClasses);
router.get('/performance', getStudentPerformance);
router.route('/assignments')
  .get(getFacultyAssignments)
  .post(createFacultyAssignment);
router.post('/assignments/grade', gradeSubmission);
router.route('/materials')
  .get(getFacultyMaterials)
  .post(createFacultyMaterial);
router.post('/marks', uploadStudentMarks);
router.route('/leave')
  .get(getFacultyLeaveRequests)
  .post(createFacultyLeaveRequest);

export default router;
