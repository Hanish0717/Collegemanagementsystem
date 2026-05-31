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

const router = express.Router();

// Secure student routes with role authorization
router.use(protect);

router
  .route('/')
  .get(authorizeRoles('admin', 'super-admin', 'librarian', 'transport-manager'), getStudents)
  .post(authorizeRoles('admin', 'super-admin', 'transport-manager'), createStudent);

router
  .route('/verify')
  .post(verifyStudent);

router
  .route('/:id')
  .get(authorizeRoles('admin', 'super-admin', 'librarian', 'transport-manager'), getStudentById)
  .put(authorizeRoles('admin', 'super-admin', 'transport-manager'), updateStudent)
  .delete(authorizeRoles('admin', 'super-admin', 'transport-manager'), deleteStudent);

export default router;
