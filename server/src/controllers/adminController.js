import User from '../models/auth/User.js';
import Faculty from '../models/faculty/Faculty.js';
import Student from '../models/student/Student.js';
import Department from '../models/academic/Department.js';
import Admin from '../models/admin/Admin.js';
import mongoose from 'mongoose';

// @desc    Get all faculty members
// @route   GET /api/admin/faculty
// @access  Private (admin)
export const getFaculty = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        filter.department = adminProfile.department;
      }
    }

    const facultyList = await Faculty.find(filter)
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code')
      .populate('assignedStudentIds', 'fullName rollNumber section')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: facultyList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new faculty member
// @route   POST /api/admin/faculty
// @access  Private (admin)
export const createFaculty = async (req, res, next) => {
  let createdUser = null;
  try {
    const {
      fullName,
      email,
      employeeId,
      department,
      designation,
      experience,
      gender,
      phoneNumber
    } = req.body;

    if (!fullName || !email || !employeeId || !department || !designation) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      throw error;
    }

    // Verify department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      const error = new Error('Invalid department selection');
      error.statusCode = 400;
      throw error;
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        if (adminProfile.department.toString() !== department.toString()) {
          const error = new Error('Access denied: You can only register faculty in your assigned department');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    // Check duplicate email or employeeId
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const existingFaculty = await Faculty.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId: employeeId.toUpperCase() }]
    });

    if (existingFaculty) {
      const error = new Error('Faculty with this email or employee ID already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create User record
    createdUser = await User.create({
      name: fullName,
      fullName,
      email: email.toLowerCase(),
      role: 'faculty',
      password: 'password123',
      isVerified: true,
      isActive: true,
    });

    // Create Faculty profile
    const facultyMember = await Faculty.create({
      user: createdUser._id,
      fullName,
      email: email.toLowerCase(),
      employeeId: employeeId.toUpperCase(),
      department,
      designation,
      experience: experience ? Number(experience) : 0,
      gender,
      phoneNumber,
      isActive: true,
    });

    const populatedFaculty = await Faculty.findById(facultyMember._id)
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: populatedFaculty,
    });
  } catch (error) {
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id);
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

    const facultyMember = await Faculty.findById(req.params.id);
    if (!facultyMember) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        if (facultyMember.department && facultyMember.department.toString() !== adminProfile.department.toString()) {
          const error = new Error('Access denied: You can only update faculty in your assigned department');
          error.statusCode = 403;
          return next(error);
        }
      }
    }

    if (department !== undefined) {
      facultyMember.department = department;
    }
    if (designation !== undefined) {
      facultyMember.designation = designation;
    }
    if (experience !== undefined) {
      facultyMember.experience = Number(experience);
    }
    if (status !== undefined) {
      facultyMember.status = status;
    }
    if (isActive !== undefined) {
      facultyMember.isActive = isActive;
      await User.findByIdAndUpdate(facultyMember.user, { isActive });
    }

    await facultyMember.save();

    const populatedFaculty = await Faculty.findById(facultyMember._id)
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code');

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: populatedFaculty,
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
    const facultyMember = await Faculty.findById(req.params.id);
    if (!facultyMember) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id });
      if (adminProfile && adminProfile.department) {
        if (facultyMember.department && facultyMember.department.toString() !== adminProfile.department.toString()) {
          const error = new Error('Access denied: You can only delete faculty in your assigned department');
          error.statusCode = 403;
          return next(error);
        }
      }
    }

    facultyMember.isActive = false;
    await facultyMember.save();

    await User.findByIdAndUpdate(facultyMember.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Faculty soft-deleted successfully',
      data: facultyMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign sections/subjects to Faculty (with auto student linking)
// @route   POST /api/admin/assignments
// @access  Private (admin)
export const assignFaculty = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { facultyId, assignedSections, assignedSubjects } = req.body;

    if (!facultyId || !Array.isArray(assignedSections) || !Array.isArray(assignedSubjects)) {
      const error = new Error('Faculty ID, sections (array) and subjects (array) are required');
      error.statusCode = 400;
      throw error;
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      const error = new Error('Invalid Faculty ID format');
      error.statusCode = 400;
      throw error;
    }

    const facultyMember = await Faculty.findById(facultyId).session(session);
    if (!facultyMember) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify Admin department restriction
    if (req.user && req.user.role === 'admin') {
      const adminProfile = await Admin.findOne({ user: req.user._id }).session(session);
      if (adminProfile && adminProfile.department) {
        if (facultyMember.department && facultyMember.department.toString() !== adminProfile.department.toString()) {
          const error = new Error('Access denied: You can only assign faculty in your assigned department');
          error.statusCode = 403;
          throw error;
        }
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

    // Sanitize subjects: validate ObjectIds
    const sanitizedSubjects = assignedSubjects.filter((subId) =>
      mongoose.Types.ObjectId.isValid(subId)
    );

    // Save current assigned sections/subjects
    facultyMember.assignedSections = sanitizedSections;
    facultyMember.assignedSubjects = sanitizedSubjects;

    // --- Dynamic Relational Linking ---
    // 1. Find all students belonging to the faculty's department AND in the newly assigned sections
    const matchingStudents = await Student.find({
      department: facultyMember.department,
      section: { $in: sanitizedSections },
      isActive: true,
    }).session(session);

    const matchingStudentIds = matchingStudents.map((s) => s._id);

    // Save assigned student IDs to Faculty profile
    facultyMember.assignedStudentIds = matchingStudentIds;
    await facultyMember.save({ session });

    // 2. Add Faculty to matching students' lists and set facultyAdvisor if none set
    for (const student of matchingStudents) {
      let updated = false;

      // Add to assignedFacultyIds if not present
      if (!student.assignedFacultyIds.includes(facultyMember._id)) {
        student.assignedFacultyIds.push(facultyMember._id);
        updated = true;
      }

      // Set as advisor if none is set
      if (!student.facultyAdvisor) {
        student.facultyAdvisor = facultyMember._id;
        updated = true;
      }

      if (updated) {
        await student.save({ session });
      }
    }

    // 3. Clean up old student links: students who have this faculty linked but are NOT in the new sections/department
    const oldLinkedStudents = await Student.find({
      assignedFacultyIds: facultyMember._id,
      _id: { $not: { $in: matchingStudentIds } },
    }).session(session);

    for (const student of oldLinkedStudents) {
      student.assignedFacultyIds = student.assignedFacultyIds.filter(
        (id) => id.toString() !== facultyMember._id.toString()
      );

      if (student.facultyAdvisor && student.facultyAdvisor.toString() === facultyMember._id.toString()) {
        // Fallback advisor: set to another faculty in the same list, or null
        student.facultyAdvisor = student.assignedFacultyIds.length > 0 ? student.assignedFacultyIds[0] : null;
      }

      await student.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Populate updated faculty member to return
    const updatedFaculty = await Faculty.findById(facultyMember._id)
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code')
      .populate('assignedStudentIds', 'fullName rollNumber section');

    res.status(200).json({
      success: true,
      message: 'Faculty assignments updated and students auto-linked successfully',
      data: updatedFaculty,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
