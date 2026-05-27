import User from '../models/auth/User.js';
import { generateToken } from '../services/authService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Validate fields
    if (!fullName || !email || !password) {
      const error = new Error('Please fill in all required fields (fullName, email, password)');
      error.statusCode = 400;
      return next(error);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('User already exists with this email');
      error.statusCode = 400;
      return next(error);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      phoneNumber,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Convert to object to make sure password is not returned
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      return next(error);
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error('Account is deactivated. Please contact administration.');
      error.statusCode = 401;
      return next(error);
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Format response without password
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
