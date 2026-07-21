import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import { generateOTPTemplate } from '../utils/emailTemplates.js';
import { hashOTP } from '../utils/otpUtils.js';
import { OTP_EXPIRY_MINUTES } from '../../config.js';
import { generateAdmissionNumber } from '../utils/admissionUtils.js';

const isUUID = (str) => typeof str === 'string' && /^[0-9a-zA-Z]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);


// Helper to format student object keys
const formatStudent = (s) => {
  if (!s) return null;
  return {
    ...s,
    _id: s.id,
    fullName: s.full_name,
    rollNumber: s.roll_number,
    admissionNumber: s.admission_number,
    phoneNumber: s.phone_number,
    dateOfBirth: s.date_of_birth,
    parentName: s.parent_name,
    parentPhone: s.parent_phone,
    parentEmail: s.parent_email,
    attendancePercentage: s.attendance_percentage,
    profileImage: s.profile_image,
    isActive: s.is_active
  };
};

// @desc    Get all active students with pagination, search, filter, and sorting
// @route   GET /api/students
// @access  Private (admin, super-admin)
export const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      department,
      year,
      semester,
      section,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 1000,
    } = req.query;

    let query = supabase
      .from('students')
      .select('*, users!inner(is_verified)', { count: 'exact' })
      .eq('is_active', true)
      .eq('users.is_verified', true);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,roll_number.ilike.%${search}%`);
    }

    if (department) query = query.eq('department', department);
    if (year) query = query.eq('year', Number(year));
    if (semester) query = query.eq('semester', Number(semester));
    if (section) query = query.eq('section', section);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const mapSortBy = (field) => {
      const maps = {
        'createdAt': 'created_at',
        'fullName': 'full_name',
        'rollNumber': 'roll_number',
        'attendancePercentage': 'attendance_percentage'
      };
      return maps[field] || field;
    };

    query = query.order(mapSortBy(sortBy), { ascending: sortOrder !== 'desc' });

    const { data: students, count: totalStudents, error } = await query;

    if (error) throw error;

    const formatted = students ? students.map(formatStudent) : [];
    const totalPages = Math.ceil((totalStudents || 0) / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: formatted,
        pagination: {
          totalStudents: totalStudents || 0,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private (admin, super-admin)
export const getStudentById = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      return next(error);
    }

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: formatStudent(student),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (admin, super-admin)
export const createStudent = async (req, res, next) => {
  let createdUserId = null;
  try {
    const {
      fullName,
      rollNumber,
      admissionNumber,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      department,
      year,
      semester,
      section,
      address,
      parentName,
      parentEmail,
      parentPhone,
      password,
      cgpa,
      attendancePercentage,
      profileImage,
      collegeFee,
    } = req.body;

    if (
      !fullName ||
      !rollNumber ||
      !email ||
      !department ||
      !year ||
      !semester ||
      !section ||
      !parentName ||
      !parentPhone ||
      !parentEmail ||
      !password
    ) {
      const error = new Error('Please fill in all required fields (including Parent Email and Password)');
      error.statusCode = 400;
      return next(error);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRollNumber = rollNumber.toUpperCase().trim();
    const cleanParentEmail = parentEmail.toLowerCase().trim();

    // 1. Check duplicate user in users table
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userExists) {
      const error = new Error('User account with this email already exists in system');
      error.statusCode = 400;
      return next(error);
    }

    // 2. Check duplicate in students profile
    const { data: duplicate } = await supabase
      .from('students')
      .select('*')
      .or(`roll_number.eq.${cleanRollNumber},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (duplicate) {
      const isRollNumberDup = duplicate.roll_number === cleanRollNumber;
      const error = new Error(
        isRollNumberDup
          ? 'Student with this roll number already exists'
          : 'Student with this email already exists'
      );
      error.statusCode = 400;
      return next(error);
    }

    // 3. Create user in users table (inactive/unverified)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{
        name: fullName,
        full_name: fullName,
        email: cleanEmail,
        password: hashedPassword,
        temp_password: password, // Store temporarily until OTP verified
        role: 'student',
        phone_number: phoneNumber || null,
        mobile: phoneNumber || null,
        is_verified: true, // Verified by default when created by Admin
        is_active: true
      }])
      .select()
      .single();

    if (userErr) throw userErr;
    createdUserId = user.id;

    // 4. Create Student profile
    let studentInserted = false;
    let student = null;
    let createErr = null;
    let retries = 3;

    while (retries > 0 && !studentInserted) {
      const generatedAdmissionNumber = await generateAdmissionNumber(department);
      
      const { data: insertedStudent, error: insertErr } = await supabase
        .from('students')
        .insert([{
          user_id: user.id,
          full_name: fullName,
          roll_number: cleanRollNumber,
          admission_number: generatedAdmissionNumber,
          email: cleanEmail,
          phone_number: phoneNumber,
          gender,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          department,
          year: Number(year),
          semester: Number(semester),
          section,
          address,
          parent_name: parentName,
          parent_phone: parentPhone,
          parent_email: cleanParentEmail,
          cgpa: cgpa ? Number(cgpa) : null,
          attendance_percentage: attendancePercentage ? Number(attendancePercentage) : 100,
          profile_image: profileImage,
          is_active: true
        }])
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === '23505' && insertErr.message?.includes('admission_number')) {
          console.warn(`Admission number duplicate collision. Retrying... (${retries} left)`);
          retries--;
          createErr = insertErr;
          continue;
        } else {
          createErr = insertErr;
          break;
        }
      } else {
        student = insertedStudent;
        studentInserted = true;
      }
    }

    if (createErr && !studentInserted) {
      await supabase.from('users').delete().eq('id', createdUserId);
      throw createErr;
    }

    // Create initial fee record if student creation was successful
    if (studentInserted && student) {
      const feeAmount = collegeFee !== undefined && collegeFee !== null ? Number(collegeFee) : 80000;
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;
      
      const { error: feeErr } = await supabase
        .from('fees')
        .insert([{
          student: student.id,
          amount: feeAmount,
          type: 'College Fee',
          due_date: `${currentYear}-12-31`,
          status: 'Unpaid',
          paid_amount: 0.00,
          academic_year: academicYear,
          semester: Number(semester) || 1
        }]);

      if (feeErr) {
        console.error('Error creating fee record for new student:', feeErr);
      }
    }

    // 5. Generate 6-digit OTP
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

    console.log("OTP for registered student " + cleanEmail + ": " + otp);

    // Send OTP via Email
    await sendEmail({
      to: cleanEmail,
      subject: 'Verify Your Student Account Registration',
      html: generateOTPTemplate(otp, 'Email Verification'),
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully. OTP sent to student email for verification.',
      data: formatStudent(student),
    });
  } catch (error) {
    if (createdUserId) {
      await supabase.from('users').delete().eq('id', createdUserId);
    }
    next(error);
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (admin, super-admin)
export const updateStudent = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      return next(error);
    }

    const { rollNumber, email } = req.body;

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    if (rollNumber || email) {
      const queryOr = [];
      if (rollNumber && rollNumber.toUpperCase().trim() !== student.roll_number) {
        queryOr.push(`roll_number.eq.${rollNumber.toUpperCase().trim()}`);
      }
      if (email && email.toLowerCase().trim() !== student.email) {
        queryOr.push(`email.eq.${email.toLowerCase().trim()}`);
      }

      if (queryOr.length > 0) {
        const { data: duplicate } = await supabase
          .from('students')
          .select('*')
          .neq('id', req.params.id)
          .or(queryOr.join(','))
          .maybeSingle();

        if (duplicate) {
          const isRollNumberDup = rollNumber && duplicate.roll_number === rollNumber.toUpperCase().trim();
          const error = new Error(
            isRollNumberDup
              ? 'Student with this roll number already exists'
              : 'Student with this email already exists'
          );
          error.statusCode = 400;
          return next(error);
        }
      }
    }

    const updateData = {};
    if (req.body.fullName) updateData.full_name = req.body.fullName;
    if (req.body.rollNumber) updateData.roll_number = req.body.rollNumber.toUpperCase().trim();
    if (req.body.email) updateData.email = req.body.email.toLowerCase().trim();
    if (req.body.phoneNumber) updateData.phone_number = req.body.phoneNumber;
    if (req.body.gender) updateData.gender = req.body.gender;
    if (req.body.dateOfBirth) updateData.date_of_birth = req.body.dateOfBirth;
    if (req.body.department) updateData.department = req.body.department;
    if (req.body.year) updateData.year = Number(req.body.year);
    if (req.body.semester) updateData.semester = Number(req.body.semester);
    if (req.body.section) updateData.section = req.body.section;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.parentName) updateData.parent_name = req.body.parentName;
    if (req.body.parentPhone) updateData.parent_phone = req.body.parentPhone;
    if (req.body.parentEmail) updateData.parent_email = req.body.parentEmail;
    if (req.body.cgpa !== undefined) updateData.cgpa = Number(req.body.cgpa);
    if (req.body.attendancePercentage !== undefined) updateData.attendance_percentage = Number(req.body.attendancePercentage);
    if (req.body.profileImage) updateData.profile_image = req.body.profileImage;

    const { data: updatedStudent, error: updateErr } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: formatStudent(updatedStudent),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a student
// @route   DELETE /api/students/:id
// @access  Private (admin, super-admin)
export const deleteStudent = async (req, res, next) => {
  try {
    if (!isUUID(req.params.id)) {
      const error = new Error('Invalid ID format');
      error.statusCode = 400;
      return next(error);
    }

    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    const { data: deletedStudent, error: deleteErr } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (deleteErr) throw deleteErr;

    return res.status(200).json({
      success: true,
      message: 'Student soft-deleted successfully',
      data: formatStudent(deletedStudent),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify student by roll number, name, and optional department
// @route   POST /api/students/verify
// @access  Private (any authenticated user)
export const verifyStudent = async (req, res, next) => {
  try {
    const { rollNumber, fullName, department } = req.body;

    if (!rollNumber && !fullName) {
      const error = new Error('Please provide either roll number or student name');
      error.statusCode = 400;
      return next(error);
    }

    let query = supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (rollNumber) {
      query = query.eq('roll_number', rollNumber.toUpperCase().trim());
    }

    if (fullName) {
      query = query.ilike('full_name', `%${fullName.trim()}%`);
    }

    if (department) {
      query = query.eq('department', department);
    }

    const { data: students, error: fetchErr } = await query;

    if (fetchErr) throw fetchErr;

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active student found matching these details.',
      });
    }

    // Return the first match if multiple found
    const student = students[0];

    return res.status(200).json({
      success: true,
      message: 'Student verified successfully. Data is correct and present in the database.',
      data: formatStudent(student),
    });
  } catch (error) {
    next(error);
  }
};
