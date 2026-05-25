import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Test route to verify role authorization middleware
router.get('/admin-test', protect, authorizeRoles('admin', 'super-admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin/Super-Admin' });
});

export default router;
