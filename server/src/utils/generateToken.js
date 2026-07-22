import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345_college_management', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default generateToken;
