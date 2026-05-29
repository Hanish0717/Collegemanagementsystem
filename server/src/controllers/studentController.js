import Student from '../models/student/Student.js';
import Admin from '../models/admin/Admin.js';
import User from '../models/auth/User.js';
import mongoose from 'mongoose';
import Parent from '../models/parent/Parent.js';
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

    // Build query object
    const query = { isActive: true };

    // Check if the user is a department-specific Admin
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        query.department = adminProfile.department;
      } else if (department) {
        query.department = department;
      }
    } else if (department) {
      query.department = department;
    }

    // Search by fullName or rollNumber
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (section) query.section = section;

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries
    const totalStudents = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('department')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalStudents / limitNum);

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students,
        pagination: {
          totalStudents,
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
    const student = await Student.findOne({ _id: req.params.id, isActive: true }).populate('department');

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        if (student.department && student.department.toString() !== adminProfile.department.toString()) {
          const error = new Error('Access denied: Student belongs to another department');
          error.statusCode = 403;
          return next(error);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: student,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid student ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (admin, super-admin)
export const createStudent = async (req, res, next) => {
  let createdUser = null;
  let createdParentUser = null;
  const session = await mongoose.startSession();
  session.startTransaction();

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
      parentRelation,
      cgpa,
      attendancePercentage,
      profileImage,
    } = req.body;

    if (!fullName || !rollNumber || !email || !department || !year || !semester || !section || !parentName || !parentPhone) {
      throw new Error('Please fill in all required fields');
    }

    // Check duplicate student
    const duplicate = await Student.findOne({ $or: [{ rollNumber }, { email }] }).session(session);
    if (duplicate) throw new Error('Student already exists');

    // Create User record for student
    const user = await User.create([{
      name: fullName,
      email: email.toLowerCase().trim(),
      role: 'student',
      password: 'password123',
    }], { session });
    createdUser = user[0];

    // Handle Parent
    let parentDoc = await Parent.findOne({ phoneNumber: parentPhone }).session(session);
    if (!parentDoc) {
      const parentUser = await User.create([
        {
          name: parentName,
          email: parentEmail ? parentEmail.toLowerCase().trim() : `parent_${parentPhone}@school.com`,
          role: 'parent',
          password: 'password123',
        },
      ], { session });
      createdParentUser = parentUser[0];
      parentDoc = await Parent.create(
        {
          user: createdParentUser._id,
          fullName: parentName,
          email: parentEmail ? parentEmail.toLowerCase().trim() : undefined,
          phoneNumber: parentPhone,
          relationship: parentRelation || 'Father',
        },
        { session }
      );
    }

    // Create Student
    const student = await Student.create([{
      user: createdUser._id,
      fullName,
      rollNumber,
      email: email.toLowerCase().trim(),
      department,
      year,
      semester,
      section,
      parent: parentDoc.user,
      parentEmail: parentEmail ? parentEmail.toLowerCase().trim() : undefined,
      parentRelation: parentRelation,
      phoneNumber,
      gender,
      dateOfBirth,
      address,
      cgpa,
      attendancePercentage,
      profileImage,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: student[0] });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (admin, super-admin)
export const updateStudent = async (req, res, next) => {
  try {
    const { rollNumber, email } = req.body;

    // Find student first
    const student = await Student.findOne({ _id: req.params.id, isActive: true });
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        if (student.department && student.department.toString() !== adminProfile.department.toString()) {
          const error = new Error('Access denied: You can only update students in your assigned department');
          error.statusCode = 403;
          return next(error);
        }
      }
    }

    // Check for duplicate rollNumber or email if they are changed
    if (rollNumber || email) {
      const queryOr = [];
      if (rollNumber && rollNumber.toUpperCase().trim() !== student.rollNumber) {
        queryOr.push({ rollNumber: rollNumber.toUpperCase().trim() });
      }
      if (email && email.toLowerCase().trim() !== student.email) {
        queryOr.push({ email: email.toLowerCase().trim() });
      }

      if (queryOr.length > 0) {
        const duplicate = await Student.findOne({
          _id: { $ne: req.params.id },
          $or: queryOr,
        });

        if (duplicate) {
          const isRollNumberDup = rollNumber && duplicate.rollNumber === rollNumber.toUpperCase().trim();
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

    // Update fields
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('department');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid student ID format');
      err.statusCode = 400;
      return next(err);
    }
    if (error.name === 'ValidationError') {
      const err = new Error(Object.values(error.errors).map((val) => val.message).join(', '));
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Soft delete a student
// @route   DELETE /api/students/:id
// @access  Private (admin, super-admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, isActive: true });
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        if (student.department && student.department.toString() !== adminProfile.department.toString()) {
          const error = new Error('Access denied: You can only delete students in your assigned department');
          error.statusCode = 403;
          return next(error);
        }
      }
    }

    // Soft delete
    student.isActive = false;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student soft-deleted successfully',
      data: student,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid student ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};
