import { supabase } from '../../config/supabase.js';

/**
 * List hostel visitors
 * GET /api/hostel/visitors
 */
export const listVisitors = async (req, res) => {
  try {
    const { search, status } = req.query;

    // 1. Fetch visitors
    const { data: visitors, error } = await supabase
      .from('hostel_visitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Fetch related students and rooms in parallel to manually resolve relationships
    // (This guarantees compatibility with local Database Mock Mode where joins are not auto-resolved)
    const { data: students } = await supabase.from('students').select('id, full_name, roll_number');
    const { data: rooms } = await supabase.from('hostel_rooms').select('id, room_number');

    const studentMap = new Map((students || []).map(s => [s.id, s]));
    const roomMap = new Map((rooms || []).map(r => [r.id, r]));

    let records = (visitors || []).map(row => {
      const student = studentMap.get(row.student_id) || {};
      const room = roomMap.get(row.room_id) || {};

      return {
        id: row.id,
        visitorName: row.visitor_name,
        visitorPhone: row.visitor_phone,
        relationship: row.relationship || 'Guardian',
        purpose: row.purpose || 'Family Visit',
        studentId: row.student_id,
        studentName: student.full_name || 'Unknown Student',
        roomId: row.room_id,
        roomNumber: room.room_number || '-',
        checkInTime: row.check_in_time,
        checkOutTime: row.check_out_time,
        status: row.status === 'In' ? 'Inside' : 'Checked Out'
      };
    });

    // Apply filters
    if (search) {
      const q = String(search).toLowerCase();
      records = records.filter(r => 
        r.visitorName.toLowerCase().includes(q) || 
        r.studentName.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All Status') {
      records = records.filter(r => r.status === status);
    }

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('listVisitors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visitors', error: error.message });
  }
};

/**
 * Register a new visitor check-in
 * POST /api/hostel/visitors
 */
export const createVisitor = async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase
      .from('hostel_visitors')
      .insert([{
        hostel_id: payload.hostel_id || payload.hostelId,
        student_id: payload.student_id || payload.studentId,
        room_id: payload.room_id || payload.roomId,
        visitor_name: payload.visitor_name || payload.visitorName,
        visitor_phone: payload.visitor_phone || payload.visitorPhone,
        relationship: payload.relationship || 'Guardian',
        purpose: payload.purpose || 'Family Visit',
        id_type: payload.id_type || payload.idType || 'Aadhaar Card',
        id_number: payload.id_number || payload.idNumber || '',
        check_in_time: payload.check_in_time || new Date().toISOString(),
        status: payload.status || 'In',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('createVisitor error:', error);
    res.status(500).json({ success: false, message: 'Failed to register visitor', error: error.message });
  }
};

/**
 * Check out a visitor
 * PUT /api/hostel/visitors/:id/checkout
 */
export const checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('hostel_visitors')
      .update({
        status: 'Out',
        check_out_time: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('checkOutVisitor error:', error);
    res.status(500).json({ success: false, message: 'Failed to checkout visitor', error: error.message });
  }
};
