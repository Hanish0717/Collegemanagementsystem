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

export const generateStudentWelcomeTemplate = (student, password) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to College Management System</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Student Account Registration Completed</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${student.full_name},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">Congratulations! Your student account registration is now completed. Below are your account details and login credentials to access the portal:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500; width: 40%;">Full Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Roll Number</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.roll_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Admission Number</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.admission_number || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Department & Section</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.department} - Section ${student.section}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6366f1; font-weight: 600;">Login Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6366f1; font-weight: 600;">Password</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-family: monospace; font-size: 15px;">${password}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">You can log in at the system login page using your Login Email and Password.</p>
        <p style="margin: 0; color: #64748b; font-size: 13px;">Please change your password after logging in for the first time to ensure account security.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateParentWelcomeTemplate = (student, parentName) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to College Management System</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Parent Account Credentials Reference</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${parentName || 'Parent / Guardian'},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your child **${student.full_name}** has been registered in the College Management System. Your parent login credentials have been configured as follows:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500; width: 45%;">Student Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Student Roll Number</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.roll_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Student Admission Number</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.admission_number || 'N/A'}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600;">Parent Login Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${student.parent_email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600;">Student Admission ID<br/><span style="font-size: 11px; font-weight: normal; color: #94a3b8;">(Use as Login password/ID)</span></td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-family: monospace; font-size: 14px;">${student.admission_number || student.roll_number}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;"><strong>How to Sign In:</strong> Go to the system login page, choose **Parent** role, enter your **Parent Login Email** and the **Student Admission ID** (Admission Number or Roll Number) as the verification token. No password is required!</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateFacultyWelcomeTemplate = (faculty, password) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to College Management System</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Faculty Registration Completed</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear Dr./Mr./Ms. ${faculty.full_name},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your faculty account registration has been successfully verified. Your login credentials and assignment details are listed below:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500; width: 40%;">Full Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${faculty.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Employee ID</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${faculty.employee_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Designation</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${faculty.designation}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Department</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${faculty.department}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 600;">Login Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${faculty.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 600;">Password</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-family: monospace; font-size: 15px;">${password}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">You can log in at the system login page using your Login Email and Password.</p>
        <p style="margin: 0; color: #64748b; font-size: 13px;">Please change your password after logging in for the first time to ensure account security.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateAdminWelcomeTemplate = (admin, password) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to College Management System</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Administrator Registration Completed</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${admin.full_name},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your administrator account registration has been successfully verified. Your login credentials and assignment details are listed below:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500; width: 40%;">Full Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${admin.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Admin Employee ID</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${admin.employee_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Assigned Department</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${admin.department || 'All Departments'}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 600;">Login Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${admin.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 600;">Password</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-family: monospace; font-size: 15px;">${password}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">You can log in at the system login page using your Login Email and Password.</p>
        <p style="margin: 0; color: #64748b; font-size: 13px;">Please change your password after logging in for the first time to ensure account security.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

