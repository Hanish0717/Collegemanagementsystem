import crypto from 'crypto';

export function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOTPHash(plain, hashed) {
  return hashOTP(plain) === hashed;
}
