import crypto from 'crypto';

const generateOTP = () => {
  // Generate a secure 6‑digit OTP using crypto.randomInt
  return crypto.randomInt(100000, 1000000).toString();
};

export default generateOTP;
