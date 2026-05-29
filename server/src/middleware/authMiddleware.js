import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

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
      let user = null;

      const isUUID = typeof decoded.id === 'string' &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decoded.id);

      if (isUUID) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', decoded.id)
          .single();

        if (data && !error) {
          // Add a helper method to match MongoDB user schema structure in controllers
          user = {
            ...data,
            _id: data.id,
            isActive: data.is_active,
            isVerified: data.is_verified,
            fullName: data.full_name,
            phoneNumber: data.phone_number,
            childEmail: data.child_email,
            // To ensure compatibility with req.user.toObject()
            toObject: function () { return this; }
          };
        }
      }

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

