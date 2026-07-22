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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_12345_college_management');

      // Find user and attach to request
      let user = null;

      const isUUID = typeof decoded.id === 'string' &&
        /^[0-9a-zA-Z]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decoded.id);

      if (isUUID) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', decoded.id)
          .single();

        if (data && !error) {
          user = {
            ...data,
            _id: data.id,
            isActive: data.is_active,
            isVerified: data.is_verified,
            fullName: data.full_name,
            phoneNumber: data.phone_number,
            childEmail: data.child_email,
            toObject: function () { return this; }
          };
        }
      }

      // Fallback for synthetic / demo accounts if not in DB
      if (!user) {
        const DEMO_FALLBACK_USERS = [
          { id: '11111111-1111-1111-1111-111111111111', name: 'Super Admin', full_name: 'Super Admin', email: 'superadmin@college.com', role: 'super-admin' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Admin', full_name: 'Admin', email: 'admin@college.com', role: 'admin' },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Faculty', full_name: 'Dr. John Smith', email: 'faculty@college.com', role: 'faculty' },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Student', full_name: 'Student Demo', email: 'student@college.com', role: 'student' },
          { id: '55555555-5555-5555-5555-555555555555', name: 'Parent', full_name: 'Parent Demo', email: 'parent@college.com', role: 'parent', child_email: 'student@college.com' },
          { id: '66666666-6666-6666-6666-666666666666', name: 'Librarian', full_name: 'Librarian Demo', email: 'librarian@college.com', role: 'librarian' },
          { id: '77777777-7777-7777-7777-777777777777', name: 'Placement Officer', full_name: 'Placement Officer Demo', email: 'placement@college.com', role: 'placement-officer' },
          { id: '88888888-8888-8888-8888-888888888888', name: 'Hostel Warden', full_name: 'Hostel Warden Demo', email: 'warden@college.com', role: 'hostel-warden' },
          { id: '99999999-9999-9999-9999-999999999999', name: 'Transport Manager', full_name: 'Transport Manager Demo', email: 'transport@college.com', role: 'transport-manager' },
          { id: 'e1111111-1111-1111-1111-111111111111', name: 'Exam Cell Officer', full_name: 'Exam Cell Office', email: 'examcell@college.com', role: 'exam-cell' },
          { id: 'de111111-1111-1111-1111-111111111111', name: 'Dean Academics', full_name: 'Dean Academics Office', email: 'dean@college.com', role: 'dean' },
          { id: 'ac111111-1111-1111-1111-111111111111', name: 'Accounts Manager', full_name: 'Accounts Office', email: 'accounts@college.com', role: 'accounts' },
          { id: 'pr111111-1111-1111-1111-111111111111', name: 'Principal', full_name: 'Principal Office', email: 'principal@college.com', role: 'principal' },
          { id: 'c5e11111-1111-1111-1111-111111111111', name: 'HOD CSE', full_name: 'Dr. Anjali Mehra', email: 'hod.cse@college.com', role: 'hod', department: 'CSE' },
          { id: 'a1011111-1111-1111-1111-111111111111', name: 'HOD AIML', full_name: 'Dr. HOD AIML', email: 'hod.aiml@college.com', role: 'hod', department: 'AIML' },
          { id: 'ece11111-1111-1111-1111-111111111111', name: 'HOD ECE', full_name: 'Dr. Ramesh Kumar', email: 'hod.ece@college.com', role: 'hod', department: 'ECE' },
          { id: 'eee11111-1111-1111-1111-111111111111', name: 'HOD EEE', full_name: 'Dr. Suresh Varma', email: 'hod.eee@college.com', role: 'hod', department: 'EEE' },
          { id: '4ec11111-1111-1111-1111-111111111111', name: 'HOD MECH', full_name: 'Dr. Vikram Rathore', email: 'hod.mech@college.com', role: 'hod', department: 'MECH' },
          { id: 'c1b11111-1111-1111-1111-111111111111', name: 'HOD CIVIL', full_name: 'Dr. Rajesh Gupta', email: 'hod.civil@college.com', role: 'hod', department: 'CIVIL' },
          { id: '17111111-1111-1111-1111-111111111111', name: 'HOD IT', full_name: 'Dr. Neha Sharma', email: 'hod.it@college.com', role: 'hod', department: 'IT' },
          { id: 'd0000000-0000-0000-0000-000000000000', name: 'HOD CSE', full_name: 'HOD CSE Dept', email: 'hod@college.com', role: 'hod', department: 'CSE' },
          { id: 'co111111-1111-1111-1111-111111111111', name: 'Alumni Coordinator', full_name: 'Alumni Coordinator', email: 'alumni.coordinator@college.com', role: 'alumni-coordinator' },
          { id: 'al111111-1111-1111-1111-111111111111', name: 'Alumni', full_name: 'Alumni Member', email: 'alumni@college.com', role: 'alumni' },
          { id: 's1111111-1111-1111-1111-111111111111', name: 'Student Demo', full_name: 'Student Demo', email: 'student1@college.com', role: 'student' },
          { id: 'f1111111-1111-1111-1111-111111111111', name: 'Faculty Demo', full_name: 'Faculty Demo', email: 'faculty1@college.com', role: 'faculty' },
          { id: 'p1111111-1111-1111-1111-111111111111', name: 'Parent Demo', full_name: 'Parent Demo', email: 'parent1@college.com', role: 'parent' }
        ];

        const matchedDemo = DEMO_FALLBACK_USERS.find(u => u.id === decoded.id);
        if (matchedDemo) {
          user = {
            ...matchedDemo,
            _id: matchedDemo.id,
            fullName: matchedDemo.full_name,
            is_verified: true,
            is_active: true,
            isActive: true,
            isVerified: true,
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
