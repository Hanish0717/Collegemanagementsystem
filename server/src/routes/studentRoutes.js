import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  verifyStudent,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validateStudentInput } from '../validations/studentValidation.js';

const router = express.Router();

// Secure student routes with role authorization
router.use(protect);

router
  .route('/')
  .get(authorizeRoles('admin', 'super-admin', 'librarian', 'transport-manager', 'placement-officer', 'hostel-warden'), getStudents)
  .post(authorizeRoles('admin', 'super-admin', 'transport-manager'), validateRequest(validateStudentInput), createStudent);

router
  .route('/verify')
  .post(verifyStudent);

router
  .route('/:id')
  .get(authorizeRoles('admin', 'super-admin', 'librarian', 'transport-manager', 'placement-officer', 'hostel-warden'), getStudentById)
  .put(authorizeRoles('admin', 'super-admin', 'transport-manager'), updateStudent)
  .delete(authorizeRoles('admin', 'super-admin', 'transport-manager'), deleteStudent);

export default router;
