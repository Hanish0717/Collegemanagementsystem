import { supabase } from '../config/supabase.js';

// Helper to format student object keys
const formatStudent = (s) => {
  if (!s) return null;
  return {
    ...s,
    _id: s.id,
    fullName: s.full_name,
    rollNumber: s.roll_number,
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
      limit = 10,
    } = req.query;

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

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
      cgpa,
      attendancePercentage,
      profileImage,
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
      !parentPhone
    ) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    // Check duplicate
    const { data: duplicate } = await supabase
      .from('students')
      .select('*')
      .or(`roll_number.eq.${rollNumber.toUpperCase().trim()},email.eq.${email.toLowerCase().trim()}`)
      .maybeSingle();

    if (duplicate) {
      const isRollNumberDup = duplicate.roll_number === rollNumber.toUpperCase().trim();
      const error = new Error(
        isRollNumberDup
          ? 'Student with this roll number already exists'
          : 'Student with this email already exists'
      );
      error.statusCode = 400;
      return next(error);
    }

    // Create student
    const { data: student, error: createErr } = await supabase
      .from('students')
      .insert([{
        full_name: fullName,
        roll_number: rollNumber.toUpperCase().trim(),
        email: email.toLowerCase().trim(),
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
        parent_email: parentEmail,
        cgpa: cgpa ? Number(cgpa) : null,
        attendance_percentage: attendancePercentage ? Number(attendancePercentage) : 100,
        profile_image: profileImage,
        is_active: true
      }])
      .select()
      .single();

    if (createErr) throw createErr;

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: formatStudent(student),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (admin, super-admin)
export const updateStudent = async (req, res, next) => {
  try {
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
