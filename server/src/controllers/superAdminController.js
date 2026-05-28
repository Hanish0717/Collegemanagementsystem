import User from '../models/auth/User.js';
import StudentDocument from '../models/student/StudentDocument.js';
import Fee from '../models/fee/Fee.js';
import Admin from '../models/admin/Admin.js';
import mongoose from 'mongoose';

export const getSuperAdminStats = async (req, res, next) => {
  try {
    // 1. Total Students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // 2. Total Faculty
    const totalFaculty = await User.countDocuments({ role: 'faculty' });

    // 3. Total Admins (admin + super-admin)
    const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'super-admin'] } });

    // 4. Active Users
    const activeUsers = await User.countDocuments({ isActive: true });

    // 5. Pending Approvals (Student Documents with status 'pending')
    const pendingApprovals = await StudentDocument.countDocuments({ 'verification.status': 'pending' });

    // 6. Total Revenue (Sum of paidAmount from all fee records)
    const feeResult = await Fee.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$paidAmount' },
        },
      },
    ]);
    const totalRevenue = feeResult.length > 0 ? feeResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalAdmins,
        activeUsers,
        pendingApprovals,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins
// @route   GET /api/super-admin/admins
// @access  Private (super-admin)
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find()
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new admin
// @route   POST /api/super-admin/admins
// @access  Private (super-admin)
export const createAdmin = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { fullName, email, employeeId, department } = req.body;

    if (!fullName || !email || !employeeId) {
      const error = new Error('Full name, email and employee ID are required');
      error.statusCode = 400;
      throw error;
    }

    // Check if user or admin already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId: employeeId.toUpperCase() }]
    }).session(session);

    if (existingAdmin) {
      const error = new Error('Admin with this email or employee ID already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create User record first
    const user = await User.create(
      [
        {
          name: fullName,
          fullName,
          email: email.toLowerCase(),
          role: 'admin',
          password: 'password123',
          isVerified: true,
          isActive: true,
        }
      ],
      { session }
    );

    // Create Admin profile record
    const admin = await Admin.create(
      [
        {
          user: user[0]._id,
          fullName,
          email: email.toLowerCase(),
          employeeId: employeeId.toUpperCase(),
          department: department || null,
          isActive: true,
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate and return the newly created admin
    const populatedAdmin = await Admin.findById(admin[0]._id)
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: populatedAdmin,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Update admin
// @route   PUT /api/super-admin/admins/:id
// @access  Private (super-admin)
export const updateAdmin = async (req, res, next) => {
  try {
    const { department, isActive } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      return next(error);
    }

    if (department !== undefined) {
      admin.department = department || null;
    }

    if (isActive !== undefined) {
      admin.isActive = isActive;
      // Also update isActive on the user account
      await User.findByIdAndUpdate(admin.user, { isActive });
    }

    await admin.save();

    const populatedAdmin = await Admin.findById(admin._id)
      .populate('user', 'isActive lastLoginAt')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: populatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete admin (soft delete)
// @route   DELETE /api/super-admin/admins/:id
// @access  Private (super-admin)
export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      return next(error);
    }

    // Soft delete Admin profile
    admin.isActive = false;
    await admin.save();

    // Soft delete User account
    await User.findByIdAndUpdate(admin.user, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Admin soft-deleted successfully',
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};
