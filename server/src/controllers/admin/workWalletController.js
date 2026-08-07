import { supabase, executeTransaction, isMockMode, getMockDb } from '../config/supabase.js';

// @desc    Get all Work Wallet tasks & executive approvals
// @route   GET /api/admin/work-wallet
// @access  Private (admin/super-admin/principal)
export const getWorkWalletTasks = async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase
      .from('work_wallet_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: tasks || []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a new Work Wallet task
// @route   POST /api/admin/work-wallet
// @access  Private (admin/super-admin/principal)
export const createWorkWalletTask = async (req, res, next) => {
  try {
    const { title, category, assignee, priority, dueDate, description } = req.body;

    if (!title || !category || !assignee) {
      const error = new Error('Task title, category, and assignee are required.');
      error.statusCode = 400;
      throw error;
    }

    const taskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const assignedBy = req.user?.name || req.user?.full_name || 'Admin Office';
    const formattedDueDate = dueDate
      ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "Aug 05, 2026";

    const newTaskRow = {
      id: taskId,
      title,
      category,
      assignee,
      assigned_by: assignedBy,
      priority: priority || 'Medium',
      status: 'Pending',
      due_date: formattedDueDate,
      comments_count: 0,
      description: description || 'Assigned via Executive Work Wallet.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let resultTask = null;

    if (!isMockMode) {
      resultTask = await executeTransaction(async (client) => {
        const insertRes = await client.query(
          `INSERT INTO work_wallet_tasks 
           (id, title, category, assignee, assigned_by, priority, status, due_date, comments_count, description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [taskId, title, category, assignee, assignedBy, priority || 'Medium', 'Pending', formattedDueDate, 0, description || 'Assigned via Executive Work Wallet.']
        );

        // Record audit log
        await client.query(
          `INSERT INTO audit_logs (user_name, role, action, module, details) 
           VALUES ($1, $2, $3, $4, $5)`,
          [assignedBy, req.user?.role || 'admin', `Assigned task ${taskId}`, 'Work Wallet', JSON.stringify({ taskId, title, assignee })]
        );

        return insertRes.rows[0];
      });
    } else {
      const { data, error } = await supabase.from('work_wallet_tasks').insert([newTaskRow]).select().single();
      if (error) throw error;
      resultTask = data;
    }

    res.status(201).json({
      success: true,
      message: `Task ${taskId} assigned successfully to ${assignee}`,
      data: resultTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Work Wallet task status
// @route   PUT /api/admin/work-wallet/:id/status
// @access  Private (admin/super-admin/principal)
export const updateWorkWalletTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    if (!status) {
      const error = new Error('Task status is required');
      error.statusCode = 400;
      throw error;
    }

    let updatedTask = null;

    if (!isMockMode) {
      updatedTask = await executeTransaction(async (client) => {
        const updateRes = await client.query(
          `UPDATE work_wallet_tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
          [status, taskId]
        );

        if (updateRes.rows.length === 0) {
          const err = new Error('Task not found');
          err.statusCode = 404;
          throw err;
        }

        // Record audit log
        await client.query(
          `INSERT INTO audit_logs (user_name, role, action, module, details) 
           VALUES ($1, $2, $3, $4, $5)`,
          [req.user?.name || 'Admin', req.user?.role || 'admin', `Updated task status ${taskId} to ${status}`, 'Work Wallet', JSON.stringify({ taskId, status })]
        );

        return updateRes.rows[0];
      });
    } else {
      const { data, error } = await supabase
        .from('work_wallet_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      updatedTask = data;
    }

    res.status(200).json({
      success: true,
      message: `Task ${taskId} status updated to ${status}`,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};
