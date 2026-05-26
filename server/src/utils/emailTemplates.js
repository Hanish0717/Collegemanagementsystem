export const generateOTPTemplate = (otp, type = 'Email Verification') => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">College Management System</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">${type}</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 20px 0; color: #334155; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">Please use the following 6-digit One Time Password (OTP) to complete your ${type.toLowerCase()}.</p>
        
        <div style="background-color: #f1f5f9; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <span style="font-size: 42px; font-weight: 800; color: #0f172a; letter-spacing: 8px;">${otp}</span>
        </div>
        
        <p style="margin: 0 0 10px 0; color: #ef4444; font-size: 14px; font-weight: 600;">⚠️ This OTP will expire in 5 minutes.</p>
        <p style="margin: 0; color: #64748b; font-size: 14px;">If you did not request this OTP, please ignore this email and your account will remain secure.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generatePasswordResetTemplate = (resetUrl) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">College Management System</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 20px 0; color: #334155; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your account. Click the button below to choose a new password.</p>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);">Reset Password</a>
        </div>
        
        <p style="margin: 0 0 10px 0; color: #ef4444; font-size: 14px; font-weight: 600;">⚠️ This link will expire in 10 minutes.</p>
        <p style="margin: 0; color: #64748b; font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};
