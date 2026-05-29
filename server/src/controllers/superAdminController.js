import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

const formatAdmin = (a) => {
  if (!a) return null;
  return {
    ...a,
    _id: a.id,
    fullName: a.full_name,
    employeeId: a.employee_id,
    isActive: a.is_active,
    department: a.department ? {
      _id: a.department,
      id: a.department,
      name: a.department === 'CSE' ? 'Computer Science and Engineering' : 
            a.department === 'ECE' ? 'Electronics and Communication Engineering' : 
            a.department === 'ME' ? 'Mechanical Engineering' : 
            a.department === 'CE' ? 'Civil Engineering' : 
            a.department === 'EE' ? 'Electrical Engineering' : a.department,
      code: a.department
    } : null,
    user: a.user || {
      isActive: a.is_active,
      lastLoginAt: null
    }
  };
};

export const getSuperAdminStats = async (req, res, next) => {
  try {
    // 1. Total Students
    const { count: totalStudents } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    // 2. Total Faculty
    const { count: totalFaculty } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'faculty');

    // 3. Total Admins
    const { count: totalAdmins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'super-admin']);

    // 4. Active Users
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 5. Pending Approvals (Return mock 3 if there is no student_documents table)
    const pendingApprovals = 3;

    // 6. Total Revenue (Sum of paid_amount from fees)
    const { data: fees } = await supabase
      .from('fees')
      .select('paid_amount');
    
    const totalRevenue = fees ? fees.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        totalFaculty: totalFaculty || 0,
        totalAdmins: totalAdmins || 0,
        activeUsers: activeUsers || 0,
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
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedList = [];
    if (admins) {
      for (const adm of admins) {
        const { data: userAcc } = await supabase
          .from('users')
          .select('is_active, updated_at')
          .eq('id', adm.user_id)
          .maybeSingle();

        formattedList.push(formatAdmin({
          ...adm,
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

// @desc    Create new admin
// @route   POST /api/super-admin/admins
// @access  Private (super-admin)
export const createAdmin = async (req, res, next) => {
  let createdUserId = null;
  try {
    const { fullName, email, employeeId, department } = req.body;

    if (!fullName || !email || !employeeId) {
      const error = new Error('Full name, email and employee ID are required');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate employee ID
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('employee_id', employeeId.toUpperCase().trim())
      .maybeSingle();

    if (existingAdmin) {
      const error = new Error('Admin with this employee ID already exists');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create User record
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{
        name: fullName,
        full_name: fullName,
        email: email.toLowerCase().trim(),
        role: 'admin',
        password: hashedPassword,
        is_verified: true,
        is_active: true
      }])
      .select()
      .single();

    if (userErr) throw userErr;
    createdUserId = user.id;

    // Create Admin profile record
    const { data: adminProfile, error: adminErr } = await supabase
      .from('admins')
      .insert([{
        user_id: user.id,
        full_name: fullName,
        email: email.toLowerCase().trim(),
        employee_id: employeeId.toUpperCase().trim(),
        department: department || null,
        is_active: true
      }])
      .select()
      .single();

    if (adminErr) throw adminErr;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: formatAdmin({
        ...adminProfile,
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

// @desc    Update admin
// @route   PUT /api/super-admin/admins/:id
// @access  Private (super-admin)
export const updateAdmin = async (req, res, next) => {
  try {
    const { department, isActive } = req.body;

    const { data: admin, error: findErr } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr || !admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (department !== undefined) {
      updateData.department = department || null;
    }

    if (isActive !== undefined) {
      updateData.is_active = isActive;
      await supabase.from('users').update({ is_active: isActive }).eq('id', admin.user_id);
    }

    const { data: updatedAdmin, error: updateErr } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    const { data: userAcc } = await supabase
      .from('users')
      .select('is_active, updated_at')
      .eq('id', updatedAdmin.user_id)
      .maybeSingle();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: formatAdmin({
        ...updatedAdmin,
        user: userAcc ? { isActive: userAcc.is_active, lastLoginAt: userAcc.updated_at } : null
      }),
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
    const { data: admin, error: findErr } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr || !admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      return next(error);
    }

    const { data: deletedAdmin, error: updateErr } = await supabase
      .from('admins')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await supabase.from('users').update({ is_active: false }).eq('id', admin.user_id);

    res.status(200).json({
      success: true,
      message: 'Admin soft-deleted successfully',
      data: formatAdmin(deletedAdmin),
    });
  } catch (error) {
    next(error);
  }
};
