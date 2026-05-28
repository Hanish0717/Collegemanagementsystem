import Fee from '../models/fee/Fee.js';
import Student from '../models/student/Student.js';
import mongoose from 'mongoose';

// Helper: Dynamically flag any pending/partial fees whose due date has passed as overdue
const updateOverdueFees = async () => {
  try {
    const currentDate = new Date();
    await Fee.updateMany(
      {
        paymentStatus: { $in: ['pending', 'partial'] },
        dueDate: { $lt: currentDate },
      },
      {
        $set: { paymentStatus: 'overdue' },
      }
    );
  } catch (error) {
    console.error('Error updating overdue fees:', error);
  }
};

// @desc    Create a new fee record for a student
// @route   POST /api/fees
// @access  Private (admin, super-admin)
export const createFee = async (req, res, next) => {
  try {
    const { student, academicYear, semester, feeType, totalAmount, dueDate, remarks } = req.body;

    if (!student || !academicYear || !semester || !feeType || totalAmount === undefined || !dueDate) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    if (totalAmount < 0) {
      const error = new Error('Total amount cannot be negative');
      error.statusCode = 400;
      return next(error);
    }

    const studentRecord = await Student.findOne({ _id: student, isActive: true });
    if (!studentRecord) {
      const error = new Error('Student not found or inactive');
      error.statusCode = 404;
      return next(error);
    }

    const fee = await Fee.create({
      student,
      academicYear,
      semester,
      feeType,
      totalAmount,
      dueDate,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: fee,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const err = new Error(Object.values(error.errors).map((val) => val.message).join(', '));
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Get all fee records with pagination, filters, and student search
// @route   GET /api/fees
// @access  Private (admin, super-admin)
export const getFees = async (req, res, next) => {
  try {
    await updateOverdueFees();

    const {
      search,
      department,
      status,
      feeType,
      semester,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by student details (name, roll, or department)
    if (search || department) {
      const studentMatch = { isActive: true };
      if (department) studentMatch.department = department;
      if (search) {
        studentMatch.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const students = await Student.find(studentMatch).select('_id');
      query.student = { $in: students.map((s) => s._id) };
    }

    // Direct filters
    if (status) query.paymentStatus = status;
    if (feeType) query.feeType = feeType;
    if (semester) query.semester = Number(semester);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const totalFees = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student', 'fullName rollNumber department semester section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalFees / limitNum);

    res.status(200).json({
      success: true,
      message: 'Fees retrieved successfully',
      data: {
        fees,
        pagination: {
          totalFees,
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

// @desc    Get all fees for a specific student
// @route   GET /api/fees/student/:studentId
// @access  Private (admin, super-admin, student, parent)
export const getStudentFees = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      const error = new Error('Invalid student ID format');
      error.statusCode = 400;
      return next(error);
    }

    const studentRecord = await Student.findOne({ _id: studentId, isActive: true });
    if (!studentRecord) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Self-access guard: Students and parents can only view their own fee profile
    if (['student', 'parent'].includes(req.user.role)) {
      if (req.user.email !== studentRecord.email) {
        const error = new Error('You are not authorized to view this fee record');
        error.statusCode = 403;
        return next(error);
      }
    }

    await updateOverdueFees();

    const fees = await Fee.find({ student: studentId }).sort({ dueDate: 1 });

    const totalDue = fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalRemaining = fees.reduce((sum, f) => sum + f.remainingAmount, 0);
    const overdueCount = fees.filter((f) => f.paymentStatus === 'overdue').length;

    res.status(200).json({
      success: true,
      message: 'Student fees retrieved successfully',
      data: {
        summary: {
          totalDue,
          totalPaid,
          totalRemaining,
          overdueCount,
        },
        fees,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee record details
// @route   PUT /api/fees/:id
// @access  Private (admin, super-admin)
export const updateFee = async (req, res, next) => {
  try {
    const { totalAmount, paidAmount, dueDate } = req.body;

    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      const error = new Error('Fee record not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validation
    const nextTotal = totalAmount !== undefined ? totalAmount : fee.totalAmount;
    const nextPaid = paidAmount !== undefined ? paidAmount : fee.paidAmount;

    if (nextTotal < 0 || nextPaid < 0) {
      const error = new Error('Amounts cannot be negative');
      error.statusCode = 400;
      return next(error);
    }

    if (nextPaid > nextTotal) {
      const error = new Error('Paid amount cannot exceed total amount');
      error.statusCode = 400;
      return next(error);
    }

    // Apply updates manually to trigger pre-save hook properly
    Object.keys(req.body).forEach((key) => {
      fee[key] = req.body[key];
    });

    const updatedFee = await fee.save();

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: updatedFee,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid fee ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (admin, super-admin)
export const deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      const error = new Error('Fee record not found');
      error.statusCode = 404;
      return next(error);
    }

    await Fee.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully',
      data: null,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid fee ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Submit payment for a fee
// @route   POST /api/fees/pay/:id
// @access  Private (admin, super-admin)
export const payFee = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId, remarks } = req.body;

    if (!amount || !paymentMethod) {
      const error = new Error('Payment amount and method are required');
      error.statusCode = 400;
      return next(error);
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      const error = new Error('Invalid payment amount');
      error.statusCode = 400;
      return next(error);
    }

    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      const error = new Error('Fee record not found');
      error.statusCode = 404;
      return next(error);
    }

    if (fee.paidAmount + payAmount > fee.totalAmount) {
      const error = new Error('Payment amount exceeds remaining due amount');
      error.statusCode = 400;
      return next(error);
    }

    // Apply payment transaction details
    fee.paidAmount += payAmount;
    fee.paymentMethod = paymentMethod;
    if (transactionId) fee.transactionId = transactionId;
    if (remarks) fee.remarks = remarks;

    const updatedFee = await fee.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: updatedFee,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      const err = new Error('Invalid fee ID format');
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

// @desc    Get comprehensive revenue and collections report
// @route   GET /api/fees/report
// @access  Private (admin, super-admin)
export const getFeesReport = async (req, res, next) => {
  try {
    await updateOverdueFees();

    const { department, semester, academicYear } = req.query;

    const query = {};
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = Number(semester);

    if (department) {
      const students = await Student.find({ department, isActive: true }).select('_id');
      query.student = { $in: students.map((s) => s._id) };
    }

    const fees = await Fee.find(query).populate('student', 'department');

    const totalRevenue = fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const collectedFees = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const pendingFees = fees.reduce((sum, f) => sum + f.remainingAmount, 0);
    const overdueFees = fees
      .filter((f) => f.paymentStatus === 'overdue')
      .reduce((sum, f) => sum + f.remainingAmount, 0);

    // Department-wise collection details
    const deptStats = {};
    fees.forEach((fee) => {
      const dept = fee.student?.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, collected: 0, pending: 0 };
      }
      deptStats[dept].total += fee.totalAmount;
      deptStats[dept].collected += fee.paidAmount;
      deptStats[dept].pending += fee.remainingAmount;
    });

    const departmentWise = Object.keys(deptStats).map((dept) => ({
      department: dept,
      ...deptStats[dept],
    }));

    // Fee type collection analytics
    const typeStats = {};
    fees.forEach((fee) => {
      const type = fee.feeType;
      if (!typeStats[type]) {
        typeStats[type] = { total: 0, collected: 0, pending: 0 };
      }
      typeStats[type].total += fee.totalAmount;
      typeStats[type].collected += fee.paidAmount;
      typeStats[type].pending += fee.remainingAmount;
    });

    const feeTypeWise = Object.keys(typeStats).map((type) => ({
      feeType: type,
      ...typeStats[type],
    }));

    res.status(200).json({
      success: true,
      message: 'Fees report generated successfully',
      data: {
        totals: {
          totalRevenue,
          collectedFees,
          pendingFees,
          overdueFees,
        },
        departmentWise,
        feeTypeWise,
      },
    });
  } catch (error) {
    next(error);
  }
};
