import { supabase } from '../../config/supabase.js';
import { dispatchNotification } from '../../services/notificationService.js';

export const listComplaints = async (req, res) => {
  try {
    const { search, category, priority, status } = req.query;

    let query = supabase
      .from('hostel_complaints')
      .select(`
        id, student_id, category, title, description, priority, status, assigned_to, created_at,
        students ( full_name, roll_number )
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let records = (data || []).map((row) => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.students?.full_name || 'Unknown Student',
      roomNumber: '-', // Room number is dynamically looked up if needed, or placeholder
      category: row.category,
      title: row.title,
      description: row.description,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      createdAt: row.created_at
    }));

    if (search) {
      const q = String(search).toLowerCase();
      records = records.filter(r => r.title.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q));
    }
    if (category && category !== 'All Categories') {
      records = records.filter(r => r.category === category);
    }
    if (priority && priority !== 'All Priority') {
      records = records.filter(r => r.priority === priority);
    }
    if (status && status !== 'All Status') {
      records = records.filter(r => r.status === status);
    }

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints', error: error.message });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('hostel_complaints').insert([payload]).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create complaint', error: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: oldComplaint, error: fetchErr } = await supabase
      .from('hostel_complaints')
      .select('student_id, title')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    const { data, error } = await supabase
      .from('hostel_complaints')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Asynchronously dispatch notification to student
    if (oldComplaint && oldComplaint.student_id) {
      try {
        const { data: student } = await supabase
          .from('students')
          .select('full_name, email, parent_email, user_id')
          .eq('id', oldComplaint.student_id)
          .maybeSingle();

        if (student) {
          dispatchNotification({
            userId: student.user_id,
            studentId: oldComplaint.student_id,
            email: student.email,
            parentEmail: student.parent_email,
            type: 'Hostel',
            title: `Complaint Ticket Status Updated: ${status}`,
            message: `Dear ${student.full_name}, the status of your complaint ticket "${oldComplaint.title}" has been updated to "${status}".`,
            priority: 'Medium'
          });
        }
      } catch (notifErr) {
        console.error('Failed to send complaint update notification:', notifErr);
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update complaint status', error: error.message });
  }
};
