import { supabase } from '../config/supabase.js';

// Helper: Format a fee row from Supabase back to the camelCase schema for frontend consumption
const formatFee = (f) => {
  if (!f) return null;
  const amt = Number(f.amount || 0);
  const paid = Number(f.paid_amount || 0);
  return {
    id: f.id,
    _id: f.id,
    student: f.student,
    academicYear: f.academic_year,
    semester: f.semester,
    feeType: f.fee_type,
    totalAmount: amt,
    paidAmount: paid,
    remainingAmount: amt - paid,
    dueDate: f.due_date,
    paymentStatus: f.status,
    paymentMethod: f.payment_method,
    transactionId: f.transaction_id,
    remarks: f.remarks,
    createdAt: f.created_at,
    updatedAt: f.created_at // fallback
  };
};

// Helper: Dynamically flag any pending/partial fees whose due date has passed as overdue
const updateOverdueFees = async () => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    await supabase
      .from('fees')
      .update({ status: 'overdue' })
      .in('status', ['pending', 'partial', 'Pending', 'Partial'])
      .lt('due_date', currentDate);
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

    // Verify student exists and is active
    const { data: studentRecord, error: studentErr } = await supabase
      .from('students')
      .select('*')
      .eq('id', student)
      .eq('is_active', true)
      .maybeSingle();

    if (!studentRecord) {
      const error = new Error('Student not found or inactive');
      error.statusCode = 404;
      return next(error);
    }

    // Determine initial status based on due date
    const formattedDueDate = new Date(dueDate).toISOString().split('T')[0];
    const status = new Date(formattedDueDate) < new Date() ? 'overdue' : 'pending';

    const { data: fee, error: createErr } = await supabase
      .from('fees')
      .insert([{
        student,
        academic_year: academicYear,
        semester: Number(semester),
        fee_type: feeType,
        amount: Number(totalAmount),
        paid_amount: 0,
        due_date: formattedDueDate,
        status,
        remarks
      }])
      .select()
      .single();

    if (createErr) throw createErr;

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: formatFee(fee),
    });
  } catch (error) {
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

    let studentIds = null;

    // Filter by student details (name, roll, or department)
    if (search || department) {
      let studentQuery = supabase.from('students').select('id').eq('is_active', true);
      if (department) studentQuery = studentQuery.eq('department', department);
      if (search) {
        studentQuery = studentQuery.or(`full_name.ilike.%${search}%,roll_number.ilike.%${search}%`);
      }
      const { data: students } = await studentQuery;
      studentIds = students ? students.map(s => s.id) : [];
    }

    let query = supabase
      .from('fees')
      .select('*, student:students(*)', { count: 'exact' });

    if (studentIds !== null) {
      query = query.in('student', studentIds);
    }

    if (status) query = query.eq('status', status);
    if (feeType) query = query.eq('fee_type', feeType);
    if (semester) query = query.eq('semester', Number(semester));

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: feesData, count: totalFees, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedFees = feesData ? feesData.map(f => {
      const formatted = formatFee(f);
      if (f.student) {
        formatted.student = {
          _id: f.student.id,
          id: f.student.id,
          fullName: f.student.full_name,
          rollNumber: f.student.roll_number,
          department: f.student.department,
          semester: f.student.semester,
          section: f.student.section
        };
      }
      return formatted;
    }) : [];

    const totalPages = Math.ceil((totalFees || 0) / limitNum);

    res.status(200).json({
      success: true,
      message: 'Fees retrieved successfully',
      data: {
        fees: formattedFees,
        pagination: {
          totalFees: totalFees || 0,
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

    const { data: studentRecord, error: studentErr } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('is_active', true)
      .maybeSingle();

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

    const { data: feesData, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student', studentId)
      .order('due_date', { ascending: true });

    if (error) throw error;

    const formattedFees = feesData ? feesData.map(formatFee) : [];

    const totalDue = formattedFees.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalPaid = formattedFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalRemaining = formattedFees.reduce((sum, f) => sum + f.remainingAmount, 0);
    const overdueCount = formattedFees.filter((f) => f.paymentStatus === 'overdue').length;

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
        fees: formattedFees,
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

    const { data: fee, error: fetchErr } = await supabase
      .from('fees')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!fee) {
      const error = new Error('Fee record not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validation
    const nextTotal = totalAmount !== undefined ? Number(totalAmount) : Number(fee.amount);
    const nextPaid = paidAmount !== undefined ? Number(paidAmount) : Number(fee.paid_amount);

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

    const remaining = nextTotal - nextPaid;
    let status = 'pending';
    if (nextPaid >= nextTotal) {
      status = 'paid';
    } else if (new Date(dueDate || fee.due_date) < new Date() && remaining > 0) {
      status = 'overdue';
    } else if (nextPaid > 0 && remaining > 0) {
      status = 'partial';
    }

    const updateData = {
      amount: nextTotal,
      paid_amount: nextPaid,
      status,
    };

    if (dueDate) updateData.due_date = new Date(dueDate).toISOString().split('T')[0];
    if (req.body.remarks !== undefined) updateData.remarks = req.body.remarks;
    if (req.body.academicYear !== undefined) updateData.academic_year = req.body.academicYear;
    if (req.body.semester !== undefined) updateData.semester = Number(req.body.semester);
    if (req.body.feeType !== undefined) updateData.fee_type = req.body.feeType;

    const { data: updatedFee, error: updateErr } = await supabase
      .from('fees')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: formatFee(updatedFee),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (admin, super-admin)
export const deleteFee = async (req, res, next) => {
  try {
    const { data: fee, error: fetchErr } = await supabase
      .from('fees')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!fee) {
      const error = new Error('Fee record not found');
      error.statusCode = 404;
      return next(error);
    }

    const { error: deleteErr } = await supabase
      .from('fees')
      .delete()
      .eq('id', req.params.id);

    if (deleteErr) throw deleteErr;

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully',
      data: null,
    });
  } catch (error) {
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

    const { data: fee, error: fetchErr } = await supabase
      .from('fees')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!fee) {
      const error = new Error('Fee record not found');
      error.statusCode = 404;
      return next(error);
    }

    const currentPaid = Number(fee.paid_amount || 0);
    const totalAmt = Number(fee.amount || 0);

    if (currentPaid + payAmount > totalAmt) {
      const error = new Error('Payment amount exceeds remaining due amount');
      error.statusCode = 400;
      return next(error);
    }

    const newPaidAmount = currentPaid + payAmount;
    const remaining = totalAmt - newPaidAmount;

    let status = 'pending';
    if (newPaidAmount >= totalAmt) {
      status = 'paid';
    } else if (new Date(fee.due_date) < new Date() && remaining > 0) {
      status = 'overdue';
    } else if (newPaidAmount > 0 && remaining > 0) {
      status = 'partial';
    }

    const updateData = {
      paid_amount: newPaidAmount,
      status,
      payment_method: paymentMethod,
      payment_date: new Date().toISOString().split('T')[0]
    };

    if (transactionId) updateData.transaction_id = transactionId;
    if (remarks) updateData.remarks = remarks;

    const { data: updatedFee, error: updateErr } = await supabase
      .from('fees')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: formatFee(updatedFee),
    });
  } catch (error) {
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

    let studentIds = null;
    if (department) {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('department', department)
        .eq('is_active', true);
      studentIds = students ? students.map(s => s.id) : [];
    }

    let query = supabase.from('fees').select('*, student:students(department)');

    if (academicYear) query = query.eq('academic_year', academicYear);
    if (semester) query = query.eq('semester', Number(semester));
    if (studentIds !== null) query = query.in('student', studentIds);

    const { data: feesData, error } = await query;
    if (error) throw error;

    const totalRevenue = feesData.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const collectedFees = feesData.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
    const pendingFees = feesData.reduce((sum, f) => sum + (Number(f.amount || 0) - Number(f.paid_amount || 0)), 0);
    const overdueFees = feesData
      .filter((f) => f.status === 'overdue')
      .reduce((sum, f) => sum + (Number(f.amount || 0) - Number(f.paid_amount || 0)), 0);

    // Department-wise collection details
    const deptStats = {};
    feesData.forEach((fee) => {
      const dept = fee.student?.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = { total: 0, collected: 0, pending: 0 };
      }
      const amt = Number(fee.amount || 0);
      const paid = Number(fee.paid_amount || 0);
      deptStats[dept].total += amt;
      deptStats[dept].collected += paid;
      deptStats[dept].pending += (amt - paid);
    });

    const departmentWise = Object.keys(deptStats).map((dept) => ({
      department: dept,
      ...deptStats[dept],
    }));

    // Fee type collection analytics
    const typeStats = {};
    feesData.forEach((fee) => {
      const type = fee.fee_type || 'miscellaneous';
      if (!typeStats[type]) {
        typeStats[type] = { total: 0, collected: 0, pending: 0 };
      }
      const amt = Number(fee.amount || 0);
      const paid = Number(fee.paid_amount || 0);
      typeStats[type].total += amt;
      typeStats[type].collected += paid;
      typeStats[type].pending += (amt - paid);
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
