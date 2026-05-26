import express from 'express';
import { 
  register, 
  login,
  googleAuth,
  getMe, 
  sendOtp, 
  verifyOtp, 
  forgotPassword, 
  resetPassword, 
  sendMobileOtp, 
  verifyMobileOtp 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

// Email OTP Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Mobile OTP Routes
router.post('/send-mobile-otp', sendMobileOtp);
router.post('/verify-mobile-otp', verifyMobileOtp);

// Test route to verify role authorization middleware
router.get('/admin-test', protect, authorizeRoles('admin', 'super-admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin/Super-Admin' });
});

export default router;
