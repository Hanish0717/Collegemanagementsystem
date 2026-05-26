import User from '../models/User.js';
import OTP from '../models/OTP.js';
import PasswordReset from '../models/PasswordReset.js';
import { generateToken } from '../services/authService.js';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';
import { generateOTPTemplate, generatePasswordResetTemplate } from '../utils/emailTemplates.js';
import { hashOTP, verifyOTPHash } from '../utils/otpUtils.js';
import { OTP_EXPIRY_MINUTES, OTP_RESEND_COOLDOWN_SECONDS, OTP_MAX_ATTEMPTS, OTP_BLOCK_TIME_MINUTES } from '../../config.js';

import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !mobile || !password) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        const error = new Error('An account with this email already exists. Please sign in instead.');
        error.statusCode = 400;
        return next(error);
      }
      // If not verified, we can let them update their password/details and generate a new OTP
      userExists.name = name;
      userExists.fullName = name;
      userExists.mobile = mobile;
      userExists.phoneNumber = mobile;
      userExists.password = password;
      userExists.role = role || 'student';
      await userExists.save();
    } else {
      // Create user (inactive/unverified)
      await User.create({
        name,
        fullName: name,
        email,
        mobile,
        phoneNumber: mobile,
        password,
        role: role || 'student',
        isVerified: false,
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Store OTP in DB
    await OTP.create({
      email,
      otp,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Verify your College Management System Account',
      html: generateOTPTemplate(otp, 'Email Verification'),
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the OTP.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token (Email + Password — direct login, no OTP)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    if (!user.isVerified) {
      const error = new Error('Please verify your email address first. Check your inbox for the OTP.');
      error.statusCode = 401;
      return next(error);
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated. Please contact administration.');
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    // Direct login — no OTP required after signup verification
    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    if (error.message && error.message.includes('buffering timed out')) {
      error.message = 'Database is temporarily unavailable. Please try again in a few seconds.';
      error.statusCode = 503;
    }
    next(error);
  }
};

// @desc    Sign in / Sign up with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const { googleUserInfo, role } = req.body;

    if (!googleUserInfo || !googleUserInfo.sub || !googleUserInfo.email) {
      const error = new Error('Invalid Google user info');
      error.statusCode = 400;
      return next(error);
    }

    const { sub: googleId, email, name } = googleUserInfo;

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
      if (!user.isActive) {
        const error = new Error('Account is deactivated. Please contact administration.');
        error.statusCode = 401;
        return next(error);
      }
    } else {
      // Create new user via Google — auto-verified
      user = await User.create({
        name,
        fullName: name,
        email,
        googleId,
        role: role || 'student',
        isVerified: true,
        isActive: true,
      });
    }

    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Email OTP
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const otpType = type || 'email_verification';
    const lastOtp = await OTP.findOne({ email, type: otpType }).sort({ createdAt: -1 });

    if (lastOtp) {
      const cooldown = OTP_RESEND_COOLDOWN_SECONDS * 1000;
      const timeElapsed = Date.now() - lastOtp.createdAt.getTime();
      if (timeElapsed < cooldown) {
        return res.status(429).json({ message: `Please wait ${Math.ceil((cooldown - timeElapsed) / 1000)}s before requesting another OTP` });
      }
    }

    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    await OTP.create({
      email,
      otp: hashedOtp,
      type: otpType,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000),
      attempts: 0,
      blockedUntil: null,
    });

    await sendEmail({
      to: email,
      subject: 'Your OTP Code',
      html: generateOTPTemplate(otp, otpType),
    });

    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, type } = req.body;
    const otpRecord = await OTP.findOne({ email, type: type || 'email_verification' }).sort({ createdAt: -1 });
    // Check block status
    if (otpRecord && otpRecord.blockedUntil && otpRecord.blockedUntil > new Date()) {
      return res.status(429).json({ message: 'Too many invalid attempts. Try again later.' });
    }

    // Validate OTP
    const isValid = otpRecord && (await verifyOTPHash(otp, otpRecord.otp)) && otpRecord.expiresAt >= new Date();
    if (!isValid) {
      // Increment attempts
      if (otpRecord) {
        otpRecord.attempts += 1;
        if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
          otpRecord.blockedUntil = new Date(Date.now() + OTP_BLOCK_TIME_MINUTES * 60000);
        }
        await otpRecord.save();
      }
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid – clean up
    await OTP.deleteOne({ _id: otpRecord._id });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isVerified = true;
    await user.save();
    const token = generateToken(user._id);
    const userResponse = {
      id: user._id,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role,
    };
    return res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Verified',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't leak whether the email exists for security reasons
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link was sent.' });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    console.log(`\n\n========================================`);
    console.log(`🔐 PASSWORD RESET OTP FOR ${email}:`);
    console.log(`${otp}`);
    console.log(`========================================\n\n`);

    await sendEmail({
      to: email,
      subject: 'Password Reset OTP Code',
      html: generateOTPTemplate(otp, 'Password Reset'),
    });

    res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    
    if (!email || !otp || !password) {
      const error = new Error('Please provide email, OTP, and new password');
      error.statusCode = 400;
      return next(error);
    }

    const validReset = await OTP.findOne({
      email,
      otp,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!validReset) {
      const error = new Error('Invalid or expired OTP');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    user.password = password;
    await user.save();
    
    await OTP.deleteMany({ email, type: 'password_reset' });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Mobile OTP
// @route   POST /api/auth/send-mobile-otp
// @access  Public
export const sendMobileOtp = async (req, res, next) => {
  try {
    const { mobile, type } = req.body;
    if (!mobile) {
      const error = new Error('Please provide a mobile number');
      error.statusCode = 400;
      return next(error);
    }

    const otpType = type || 'login_otp';
    const user = await User.findOne({ $or: [{ mobile: mobile }, { phoneNumber: mobile }] });

    if (otpType === 'login_otp' && !user) {
      const error = new Error('Mobile number not registered. Please register first.');
      error.statusCode = 404;
      return next(error);
    }

    const otp = generateOTP();
    await OTP.create({
      mobile,
      otp,
      type: otpType,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await sendSMS(mobile, otp);

    res.status(200).json({ success: true, message: 'OTP sent to mobile successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Mobile OTP
// @route   POST /api/auth/verify-mobile-otp
// @access  Public
export const verifyMobileOtp = async (req, res, next) => {
  try {
    const { mobile, otp, type } = req.body;
    if (!mobile || !otp) {
      const error = new Error('Please provide mobile number and OTP');
      error.statusCode = 400;
      return next(error);
    }

    const otpType = type || 'login_otp';
    const validOtp = await OTP.findOne({
      mobile,
      otp,
      type: otpType,
      expiresAt: { $gt: new Date() },
    });

    if (!validOtp) {
      const error = new Error('Invalid or expired OTP');
      error.statusCode = 400;
      return next(error);
    }

    await OTP.deleteOne({ _id: validOtp._id });

    if (otpType === 'login_otp') {
      const user = await User.findOne({ $or: [{ mobile: mobile }, { phoneNumber: mobile }] });
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }
      
      if (!user.isActive) {
        const error = new Error('Account is deactivated');
        error.statusCode = 401;
        return next(error);
      }
      
      const token = generateToken(user._id);
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse,
      });
    }

    // For mobile_verification
    res.status(200).json({ success: true, message: 'Mobile number verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const userResponse = req.user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};
