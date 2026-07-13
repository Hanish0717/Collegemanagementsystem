import express from 'express';
import { 
  register, 
  login,
  googleAuth,
  getMe, 
  updateProfile,
  sendOtp, 
  verifyOtp, 
  forgotPassword, 
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validateRegisterInput, validateLoginInput } from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', validateRequest(validateRegisterInput), register);
router.post('/login', validateRequest(validateLoginInput), login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Email OTP Routes (primary authentication)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Password Reset Routes (email-based)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Test route to verify role authorization middleware
router.get('/admin-test', protect, authorizeRoles('admin', 'super-admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin/Super-Admin' });
});

export default router;
