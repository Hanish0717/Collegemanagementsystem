import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Extract token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to request
      const user = await User.findById(decoded.id);

      if (!user) {
        const error = new Error('Not authorized, user not found');
        error.statusCode = 401;
        return next(error);
      }

      if (!user.isActive) {
        const error = new Error('Not authorized, user account is inactive');
        error.statusCode = 401;
        return next(error);
      }

      req.user = user;
      next();
    } catch (error) {
      const err = new Error('Not authorized, invalid token');
      err.statusCode = 401;
      return next(err);
    }
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    return next(error);
  }
};
