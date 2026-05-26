import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'mobile_verification', 'login_otp', 'password_reset', 'login_otp_email'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

// TTL index to automatically delete the OTP document after it expires
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
