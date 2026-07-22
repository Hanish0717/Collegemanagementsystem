import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_college_management_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};
