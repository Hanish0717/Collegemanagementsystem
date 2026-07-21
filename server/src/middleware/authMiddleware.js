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

      // Query user from database by ID
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .maybeSingle();

      if (data && !error) {
        user = {
          ...data,
          _id: data.id,
          isActive: data.is_active ?? true,
          isVerified: data.is_verified ?? true,
          fullName: data.full_name || data.name || 'User',
          phoneNumber: data.phone_number || null,
          childEmail: data.child_email || null,
          toObject: function () { return this; }
        };
      }

      // Fallback for synthetic / demo accounts if not in DB
      if (!user) {
        if (decoded.id === 'de111111-1111-1111-1111-111111111111' || (typeof decoded.id === 'string' && decoded.id.includes('dean'))) {
          user = {
            id: decoded.id,
            _id: decoded.id,
            name: 'Dean Executive',
            full_name: 'Dean Executive',
            email: 'dean@college.com',
            role: 'dean',
            is_verified: true,
            is_active: true,
            isActive: true,
            isVerified: true,
            fullName: 'Dean Executive',
            toObject: function () { return this; }
          };
        } else if (typeof decoded.id === 'string' && decoded.id.startsWith('exec-')) {
          const roleFromId = decoded.id.replace('exec-', '').replace('-uuid', '');
          user = {
            id: decoded.id,
            _id: decoded.id,
            name: 'Executive User',
            full_name: 'Executive User',
            email: `${roleFromId}@college.com`,
            role: roleFromId,
            is_verified: true,
            is_active: true,
            isActive: true,
            isVerified: true,
            fullName: 'Executive User',
            toObject: function () { return this; }
          };
        }
      }

      if (!user) {
        const error = new Error('Not authorized, user not found');
        error.statusCode = 401;
        return next(error);
      }

      if (user.isActive === false || user.is_active === false) {
        const error = new Error('Not authorized, user account is inactive');
        error.statusCode = 401;
        return next(error);
      }

      req.user = user;
      next();
    } catch (error) {
      let message = 'Not authorized, invalid token';
      if (error.name === 'TokenExpiredError') {
        message = 'Not authorized, token has expired';
      }
      const err = new Error(message);
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

