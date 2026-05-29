import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import { generateOTPTemplate } from '../utils/emailTemplates.js';
import { hashOTP } from '../utils/otpUtils.js';
import { OTP_EXPIRY_MINUTES } from '../../config.js';


const formatFaculty = (f) => {
  if (!f) return null;
  
  // Format department string into expected object
  const deptObj = f.department ? {
    _id: f.department,
    id: f.department,
    name: f.department === 'CSE' ? 'Computer Science and Engineering' : 
          f.department === 'ECE' ? 'Electronics and Communication Engineering' : 
          f.department === 'ME' ? 'Mechanical Engineering' : 
          f.department === 'CE' ? 'Civil Engineering' : 
          f.department === 'EE' ? 'Electrical Engineering' : f.department,
    code: f.department
  } : null;

  // Format subjects array
  const subjects = (Array.isArray(f.assigned_subjects) ? f.assigned_subjects : []).map(code => ({
    _id: code,
    id: code,
    name: code === 'CS301' ? 'Data Structures' : 
          code === 'CS401' ? 'Database Management Systems' : 
          code === 'CS501' ? 'Operating Systems' : 
          code === 'CS601' ? 'Computer Networks' : 
          code === 'CS701' ? 'Machine Learning' : 
          code === 'EC301' ? 'Digital Electronics' : code,
    code: code
  }));

  // Format student IDs array
  const studentIds = (Array.isArray(f.assigned_student_ids) ? f.assigned_student_ids : []).map(s => ({
    _id: s.id || s,
    id: s.id || s,
    fullName: s.full_name || 'Student',
    rollNumber: s.roll_number || '',
    section: s.section || ''
  }));

  return {
    ...f,
    _id: f.id,
    fullName: f.full_name,
    employeeId: f.employee_id,
    phoneNumber: f.phone_number,
    isActive: f.is_active,
    assignedSections: Array.isArray(f.assigned_sections) ? f.assigned_sections : [],
    assignedSubjects: subjects,
    assignedStudentIds: studentIds,
    department: deptObj,
    user: f.user || {
      isActive: f.is_active,
      lastLoginAt: null
    }
  };
};

// @desc    Get all faculty members
// @route   GET /api/admin/faculty
// @access  Private (admin)
export const getFaculty = async (req, res, next) => {
  try {
    let adminProfile = null;

    if (req.user && req.user.role === 'admin') {
      const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', req.user.id || req.user._id)
        .maybeSingle();
      adminProfile = profile;
    }

    let query = supabase
      .from('faculty')
      .select('*, users!inner(is_verified)')
      .eq('is_active', true)
      .eq('users.is_verified', true);

    if (adminProfile && adminProfile.department) {
      query = query.eq('department', adminProfile.department);
    }

    const { data: facultyList, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const formattedList = [];
    if (facultyList) {
      for (const fac of facultyList) {
        // Fetch matching user account status
        const { data: userAcc } = await supabase
          .from('users')
          .select('is_active, updated_at')
          .eq('id', fac.user_id)
          .maybeSingle();

        // Populate assigned students details if needed
        let populatedStudents = [];
        if (Array.isArray(fac.assigned_student_ids) && fac.assigned_student_ids.length > 0) {
          const { data: stds } = await supabase
            .from('students')
            .select('id, full_name, roll_number, section')
            .in('id', fac.assigned_student_ids);
          if (stds) populatedStudents = stds;
        }

        formattedList.push(formatFaculty({
          ...fac,
          assigned_student_ids: populatedStudents,
          user: userAcc ? { isActive: userAcc.is_active, lastLoginAt: userAcc.updated_at } : null
        }));
      }
    }

    res.status(200).json({
      success: true,
      data: formattedList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new faculty member
// @route   POST /api/admin/faculty
// @access  Private (admin)
export const createFaculty = async (req, res, next) => {
  let createdUserId = null;
  try {
    const {
      fullName,
      email,
      employeeId,
      department,
      designation,
      experience,
      gender,
      phoneNumber,
      password
    } = req.body;

    if (!fullName || !email || !employeeId || !department || !designation || !password) {
      const error = new Error('Please fill in all required fields (including Password)');
      error.statusCode = 400;
      throw error;
    }

    let adminProfile = null;
    if (req.user && req.user.role === 'admin') {
      const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', req.user.id || req.user._id)
        .maybeSingle();
      adminProfile = profile;
    }

    if (adminProfile && adminProfile.department) {
      if (adminProfile.department.toString() !== department.toString()) {
        const error = new Error('Access denied: You can only register faculty in your assigned department');
        error.statusCode = 403;
        throw error;
      }
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanEmployeeId = employeeId.toUpperCase().trim();

    // Check duplicate email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate employee ID in faculty table
    const { data: existingFaculty } = await supabase
      .from('faculty')
      .select('id')
      .eq('employee_id', cleanEmployeeId)
      .maybeSingle();

    if (existingFaculty) {
      const error = new Error('Faculty with this employee ID already exists');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in users table (inactive/unverified)
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{
        name: fullName,
        full_name: fullName,
        email: cleanEmail,
        role: 'faculty',
        password: hashedPassword,
        temp_password: password, // Store temporarily until OTP verified
        is_verified: false,
        is_active: true
      }])
      .select()
      .single();

    if (userErr) throw userErr;
    createdUserId = user.id;

    // Create Faculty profile
    const { data: facultyMember, error: facultyErr } = await supabase
      .from('faculty')
      .insert([{
        user_id: user.id,
        full_name: fullName,
        email: cleanEmail,
        employee_id: cleanEmployeeId,
        department,
        designation,
        experience: experience ? Number(experience) : 0,
        gender,
        phone_number: phoneNumber,
        is_active: true,
        status: 'Active'
      }])
      .select()
      .single();

    if (facultyErr) {
      await supabase.from('users').delete().eq('id', createdUserId);
      throw facultyErr;
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Ensure only one active OTP per email
    await supabase.from('otps').delete().eq('email', cleanEmail);

    // Store OTP in DB
    await supabase.from('otps').insert([{
      email: cleanEmail,
      otp: hashOTP(otp),
      type: 'email_verification',
      expires_at: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000).toISOString(),
      attempts: 0,
      blocked_until: null,
    }]);

    console.log("OTP for registered faculty " + cleanEmail + ": " + otp);

    // Send OTP via Email
    await sendEmail({
      to: cleanEmail,
      subject: 'Verify Your Faculty Account Registration',
      html: generateOTPTemplate(otp, 'Email Verification'),
    });

    res.status(201).json({
      success: true,
      message: 'Faculty registered successfully. OTP sent to faculty email for verification.',
      data: formatFaculty({
        ...facultyMember,
        user: { isActive: user.is_active, lastLoginAt: user.updated_at }
      }),
    });
  } catch (error) {
    if (createdUserId) {
      await supabase.from('users').delete().eq('id', createdUserId);
    }
    next(error);
  }
};

// @desc    Update a faculty member
// @route   PUT /api/admin/faculty/:id
// @access  Private (admin)
export const updateFaculty = async (req, res, next) => {
  try {
    const { department, designation, experience, status, isActive } = req.body;

    const { data: facultyMember, error: findErr } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr || !facultyMember) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      return next(error);
    }

    let adminProfile = null;
    if (req.user && req.user.role === 'admin') {
      const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', req.user.id || req.user._id)
        .maybeSingle();
      adminProfile = profile;
    }

    if (adminProfile && adminProfile.department) {
      if (facultyMember.department && facultyMember.department.toString() !== adminProfile.department.toString()) {
        const error = new Error('Access denied: You can only update faculty in your assigned department');
        error.statusCode = 403;
        return next(error);
      }
    }

    const updateData = {};
    if (department !== undefined) updateData.department = department;
    if (designation !== undefined) updateData.designation = designation;
    if (experience !== undefined) updateData.experience = Number(experience);
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) {
      updateData.is_active = isActive;
      await supabase.from('users').update({ is_active: isActive }).eq('id', facultyMember.user_id);
    }

    const { data: updatedFaculty, error: updateErr } = await supabase
      .from('faculty')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const { data: userAcc } = await supabase
      .from('users')
      .select('is_active, updated_at')
      .eq('id', updatedFaculty.user_id)
      .maybeSingle();

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: formatFaculty({
        ...updatedFaculty,
        user: userAcc ? { isActive: userAcc.is_active, lastLoginAt: userAcc.updated_at } : null
      }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a faculty member (soft delete)
// @route   DELETE /api/admin/faculty/:id
// @access  Private (admin)
export const deleteFaculty = async (req, res, next) => {
  try {
    const { data: facultyMember, error: findErr } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr || !facultyMember) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      return next(error);
    }

    let adminProfile = null;
    if (req.user && req.user.role === 'admin') {
      const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', req.user.id || req.user._id)
        .maybeSingle();
      adminProfile = profile;
    }

    if (adminProfile && adminProfile.department) {
      if (facultyMember.department && facultyMember.department.toString() !== adminProfile.department.toString()) {
        const error = new Error('Access denied: You can only delete faculty in your assigned department');
        error.statusCode = 403;
        return next(error);
      }
    }

    const { data: deletedFaculty, error: updateErr } = await supabase
      .from('faculty')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await supabase.from('users').update({ is_active: false }).eq('id', facultyMember.user_id);

    res.status(200).json({
      success: true,
      message: 'Faculty soft-deleted successfully',
      data: formatFaculty(deletedFaculty),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign sections/subjects to Faculty (with auto student linking)
// @route   POST /api/admin/assignments
// @access  Private (admin)
export const assignFaculty = async (req, res, next) => {
  try {
    const { facultyId, assignedSections, assignedSubjects } = req.body;

    if (!facultyId || !Array.isArray(assignedSections) || !Array.isArray(assignedSubjects)) {
      const error = new Error('Faculty ID, sections (array) and subjects (array) are required');
      error.statusCode = 400;
      throw error;
    }

    const { data: facultyMember, error: findErr } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', facultyId)
      .maybeSingle();

    if (findErr || !facultyMember) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      throw error;
    }

    let adminProfile = null;
    if (req.user && req.user.role === 'admin') {
      const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', req.user.id || req.user._id)
        .maybeSingle();
      adminProfile = profile;
    }

    if (adminProfile && adminProfile.department) {
      if (facultyMember.department && facultyMember.department.toString() !== adminProfile.department.toString()) {
        const error = new Error('Access denied: You can only assign faculty in your assigned department');
        error.statusCode = 403;
        throw error;
      }
    }

    // Sanitize sections: trim, uppercase, remove empty, remove duplicates
    const sanitizedSections = Array.from(
      new Set(
        assignedSections
          .map((s) => (typeof s === 'string' ? s.trim().toUpperCase() : ''))
          .filter((s) => s !== '')
      )
    );

    // Sanitize subjects
    const sanitizedSubjects = assignedSubjects.filter((s) => typeof s === 'string');

    // Find matching students in these sections and department
    let studentIds = [];
    if (sanitizedSections.length > 0) {
      const { data: matchingStudents } = await supabase
        .from('students')
        .select('id')
        .eq('department', facultyMember.department)
        .in('section', sanitizedSections)
        .eq('is_active', true);
      
      if (matchingStudents) {
        studentIds = matchingStudents.map(s => s.id);
      }
    }

    // Save assignments to Faculty profile
    const { data: updatedFaculty, error: updateErr } = await supabase
      .from('faculty')
      .update({
        assigned_sections: sanitizedSections,
        assigned_subjects: sanitizedSubjects,
        assigned_student_ids: studentIds
      })
      .eq('id', facultyId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const { data: userAcc } = await supabase
      .from('users')
      .select('is_active, updated_at')
      .eq('id', updatedFaculty.user_id)
      .maybeSingle();

    res.status(200).json({
      success: true,
      message: 'Faculty assignments updated and students auto-linked successfully',
      data: formatFaculty({
        ...updatedFaculty,
        user: userAcc ? { isActive: userAcc.is_active, lastLoginAt: userAcc.updated_at } : null
      }),
    });
  } catch (error) {
    next(error);
  }
};
