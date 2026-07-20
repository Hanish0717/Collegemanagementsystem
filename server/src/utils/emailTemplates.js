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

export const generateAttendanceWarningTemplate = (studentName, percentage) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Attendance Warning</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Academic Performance Alert</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${studentName},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your attendance percentage has fallen below the mandatory institutional threshold of **75%**. Maintaining regular attendance is critical for academic eligibility and registration.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 14px; color: #991b1b; font-weight: 600; display: block; margin-bottom: 4px;">CURRENT ATTENDANCE</span>
          <span style="font-size: 36px; font-weight: 800; color: #b91c1c;">${percentage}%</span>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">Please coordinate with your course mentors and ensure attendance improves immediately. Failure to restore attendance to >= 75% may result in barment from upcoming examinations.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateFeeReminderTemplate = (studentName, feeType, dueDate, balance) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Fee Payment Reminder</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Pending Balance Invoice</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${studentName},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">This is an administrative reminder that your academic fee payment is due. Please review the details below:</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-weight: 500; width: 45%;">Fee Category</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${feeType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f; font-weight: 500;">Due Date</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #fef3c7; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #b45309; font-weight: 600;">Outstanding Amount</td>
              <td style="padding: 8px 0; color: #b45309; font-weight: 700; font-size: 16px;">₹${Number(balance).toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0; color: #64748b; font-size: 13px;">Please settle the dues at the student portal before the deadline to prevent service disruption or late penalty rates.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generatePlacementDriveTemplate = (studentName, company, role, date, deadline) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Recruitment Drive Alert</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">New Placement Opportunity Open</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${studentName},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">A new recruitment drive matches your eligibility profile. Register using the Placement portal before the deadline:</p>
        
        <div style="background-color: #f5f3ff; border: 1px solid #e0e7ff; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 500; width: 45%;">Company</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 500;">Role / Position</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${role}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4f46e5; font-weight: 500;">Drive Date</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e0e7ff; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #4338ca; font-weight: 600;">Registration Deadline</td>
              <td style="padding: 8px 0; color: #4338ca; font-weight: 700;">${new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0; color: #64748b; font-size: 13px;">Ensure your profile and resume details are up to date in the Placement Module before applying.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateLeaveStatusTemplate = (studentName, type, fromDate, toDate, status) => {
  const isApproved = status === 'Approved';
  const colorPrimary = isApproved ? '#10b981' : '#ef4444';
  const colorSecondary = isApproved ? '#047857' : '#b91c1c';
  
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, ${colorPrimary} 0%, ${colorSecondary} 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Leave Request ${status}</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Absence Status Reference</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${studentName},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">Your submitted leave request has been reviewed and **${status.toLowerCase()}** by your supervisor.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500; width: 45%;">Leave Category</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Duration</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${colorSecondary}; font-weight: 600;">Decision</td>
              <td style="padding: 8px 0; color: ${colorSecondary}; font-weight: 700; font-size: 15px;">${status}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateBookDueTemplate = (studentName, bookTitle, dueDate) => {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Book Return Reminder</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Library Borrowing Status</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${studentName},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">This is a friendly reminder that a borrowed library book is due for return tomorrow. Please review the details:</p>
        
        <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #1e40af; font-weight: 500; width: 45%;">Book Title</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${bookTitle}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #dbeafe; padding-top: 12px; margin-top: 12px;"></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #1d4ed8; font-weight: 600;">Due Date</td>
              <td style="padding: 8px 0; color: #1d4ed8; font-weight: 700;">${new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (Tomorrow)</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0; color: #64748b; font-size: 13px;">Please return or re-issue the book at the library circulation desk to avoid late borrowing fines.</p>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} College Management System. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const generateMonthlyAttendanceEmailTemplate = ({
  student,
  attendancePercentage,
  slab,
  lowAttendanceSubjects = [],
  classTeacher = "Class Teacher",
  hod = "Head of Department",
  collegeName = "College Management System Portal"
}) => {
  let gradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'; // Orange for Warning
  let badgeColor = '#d97706';
  let bannerText = 'Monthly Attendance Warning';
  let messageText = `Your attendance percentage has fallen below the mandatory institutional threshold of 75%. Maintaining regular attendance is critical for academic eligibility and examination registration.`;

  if (slab === 'Critical Warning') {
    gradient = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'; // Dark Orange/Red
    badgeColor = '#c2410c';
    bannerText = 'Critical Attendance Alert';
    messageText = `Your monthly attendance is critically low (below 75%). This email has been copied to your parents and class teacher. Immediate corrective action is required to avoid academic barment.`;
  } else if (slab === 'Detention Alert') {
    gradient = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'; // Red
    badgeColor = '#991b1b';
    bannerText = 'Detention / Eligibility Warning';
    messageText = `URGENT: Your attendance has fallen below 65%. You are at risk of detention and being debarred from the end-semester examinations. This has been escalated to your parents, class teacher, and HOD. Please report immediately.`;
  }

  const subjectsRows = lowAttendanceSubjects.map(sub => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 10px 8px; color: #334155; font-weight: 500; font-size: 13px;">${sub.subject}</td>
      <td style="padding: 10px 8px; color: #ef4444; font-weight: 700; font-size: 13px; text-align: center;">${sub.percentage}%</td>
      <td style="padding: 10px 8px; color: #475569; font-size: 13px;">${sub.teacher || 'Faculty'}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background: ${gradient}; padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">${bannerText}</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 15px;">Monthly Performance Audit</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">Dear ${student.full_name},</p>
        <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">${messageText}</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 40%;">Student Name</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${student.full_name} (${student.roll_number})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Department & Section</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${student.department} - Section ${student.section}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Semester / Year</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">Sem ${student.semester} / Year ${student.year}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px;"></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: ${badgeColor}; font-weight: 600;">Overall Attendance</td>
              <td style="padding: 6px 0; color: ${badgeColor}; font-weight: 800; font-size: 15px;">${attendancePercentage}%</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Required Threshold</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">75.00%</td>
            </tr>
          </table>
        </div>

        ${lowAttendanceSubjects.length > 0 ? `
          <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Low Attendance Subjects (< 75%):</h3>
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 10px 8px; font-size: 12px; font-weight: 600; color: #475569;">Subject</th>
                  <th style="padding: 10px 8px; font-size: 12px; font-weight: 600; color: #475569; text-align: center;">Attendance</th>
                  <th style="padding: 10px 8px; font-size: 12px; font-weight: 600; color: #475569;">Faculty</th>
                </tr>
              </thead>
              <tbody>
                ${subjectsRows}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
          <p style="margin: 0 0 4px 0;"><strong>Class Teacher:</strong> ${classTeacher}</p>
          <p style="margin: 0 0 4px 0;"><strong>Head of Department:</strong> ${hod}</p>
          <p style="margin: 0;"><strong>Institution:</strong> ${collegeName}</p>
        </div>
      </div>
      
      <div style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">© ${new Date().getFullYear()} ${collegeName}. All rights reserved.</p>
      </div>
    </div>
  `;
};



