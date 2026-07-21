import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// All 28 faculty members used by the frontend facultyProfileService
const FACULTY_STATIC_DB = [
  { employeeId: 'FACCSE1',           email: 'faculty.cse.1@college.com',           name: 'Kambhampati Harish',   department: 'CSE',           role: 'faculty' },
  { employeeId: 'FACCSE2',           email: 'faculty.cse.2@college.com',           name: 'Thota Sujatha',        department: 'CSE',           role: 'faculty' },
  { employeeId: 'FACCSE3',           email: 'faculty.cse.3@college.com',           name: 'Mallidi Ramesh',       department: 'CSE',           role: 'faculty' },
  { employeeId: 'FACAIML1',          email: 'faculty.aiml.1@college.com',          name: 'Kondapalli Bhargav',   department: 'AIML',          role: 'faculty' },
  { employeeId: 'FACAIML2',          email: 'faculty.aiml.2@college.com',          name: 'Siripurapu Divya',     department: 'AIML',          role: 'faculty' },
  { employeeId: 'FACAIML3',          email: 'faculty.aiml.3@college.com',          name: 'Varre Ajay',           department: 'AIML',          role: 'faculty' },
  { employeeId: 'FACAIDS1',          email: 'faculty.aids.1@college.com',          name: 'Cherukuri Hari',       department: 'AIDS',          role: 'faculty' },
  { employeeId: 'FACAIDS2',          email: 'faculty.aids.2@college.com',          name: 'Pilla Lakshmi',        department: 'AIDS',          role: 'faculty' },
  { employeeId: 'FACAIDS3',          email: 'faculty.aids.3@college.com',          name: 'Gonugunta Ravi',       department: 'AIDS',          role: 'faculty' },
  { employeeId: 'FACAIDS4',          email: 'faculty.aids.4@college.com',          name: 'Maddula Kavitha',      department: 'AIDS',          role: 'faculty' },
  { employeeId: 'FACCYBERSECURITY1', email: 'faculty.cybersecurity.1@college.com', name: 'Ravipati Prathyush',   department: 'CYBERSECURITY', role: 'faculty' },
  { employeeId: 'FACCYBERSECURITY2', email: 'faculty.cybersecurity.2@college.com', name: 'Busireddy Mounika',    department: 'CYBERSECURITY', role: 'faculty' },
  { employeeId: 'FACCYBERSECURITY3', email: 'faculty.cybersecurity.3@college.com', name: 'Kakarla Srinivas',     department: 'CYBERSECURITY', role: 'faculty' },
  { employeeId: 'FACECE1',           email: 'faculty.ece.1@college.com',           name: 'Nallamothu Prasad',    department: 'ECE',           role: 'faculty' },
  { employeeId: 'FACECE2',           email: 'faculty.ece.2@college.com',           name: 'Gangineni Hema',       department: 'ECE',           role: 'faculty' },
  { employeeId: 'FACECE3',           email: 'faculty.ece.3@college.com',           name: 'Dasari Kishore',       department: 'ECE',           role: 'faculty' },
  { employeeId: 'FACEEE1',           email: 'faculty.eee.1@college.com',           name: 'Boddu Sai',            department: 'EEE',           role: 'faculty' },
  { employeeId: 'FACEEE2',           email: 'faculty.eee.2@college.com',           name: 'Gudapati Anitha',      department: 'EEE',           role: 'faculty' },
  { employeeId: 'FACEEE3',           email: 'faculty.eee.3@college.com',           name: 'Korada Uday',          department: 'EEE',           role: 'faculty' },
  { employeeId: 'FACIT1',            email: 'faculty.it.1@college.com',            name: 'Gudipati Nikhil',      department: 'IT',            role: 'faculty' },
  { employeeId: 'FACIT2',            email: 'faculty.it.2@college.com',            name: 'Sripada Deepthi',      department: 'IT',            role: 'faculty' },
  { employeeId: 'FACIT3',            email: 'faculty.it.3@college.com',            name: 'Yandrapati Suresh',    department: 'IT',            role: 'faculty' },
  { employeeId: 'FACMECH1',          email: 'faculty.mech.1@college.com',          name: 'Kamineni Prasad',      department: 'MECH',          role: 'faculty' },
  { employeeId: 'FACMECH2',          email: 'faculty.mech.2@college.com',          name: 'Sirikonda Sunita',     department: 'MECH',          role: 'faculty' },
  { employeeId: 'FACMECH3',          email: 'faculty.mech.3@college.com',          name: 'Pattnaik Gopal',       department: 'MECH',          role: 'faculty' },
  { employeeId: 'FACCIVIL1',         email: 'faculty.civil.1@college.com',         name: 'Gottipati Venkatesh',  department: 'CIVIL',         role: 'faculty' },
  { employeeId: 'FACCIVIL2',         email: 'faculty.civil.2@college.com',         name: 'Bathula Jyothi',       department: 'CIVIL',         role: 'faculty' },
  { employeeId: 'FACCIVIL3',         email: 'faculty.civil.3@college.com',         name: 'Nuthalapati Raju',     department: 'CIVIL',         role: 'faculty' },
  { employeeId: 'FACCSEHOD',         email: 'faculty.hod.cse@college.com',         name: 'Dr. S. Suresh',        department: 'CSE',           role: 'faculty' },
];

export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    // ── Faculty Synthetic Token ──────────────────────────────────────────────
    // The frontend issues tokens in the pattern: faculty_token_<EMPLOYEEID>
    // These are NOT signed JWTs. We verify them against our static faculty list
    // and build a synthetic req.user without calling jwt.verify().
    if (token && token.startsWith('faculty_token_')) {
      const empId = token.replace('faculty_token_', '');
      const facultyRecord = FACULTY_STATIC_DB.find(f => f.employeeId === empId);

      if (!facultyRecord) {
        const error = new Error('Not authorized, invalid faculty token');
        error.statusCode = 401;
        return next(error);
      }

      // Build req.user compatible with all controllers
      req.user = {
        id: facultyRecord.employeeId,
        _id: facultyRecord.employeeId,
        full_name: facultyRecord.name,
        fullName: facultyRecord.name,
        email: facultyRecord.email,
        role: 'faculty',
        role_name: 'faculty',
        department: facultyRecord.department,
        is_active: true,
        isActive: true,
        is_verified: true,
        isVerified: true,
        toObject: function () { return this; },
      };
      return next();
    }

    // ── Standard JWT Token ───────────────────────────────────────────────────
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    return;
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    return next(error);
  }
};
