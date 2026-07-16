import { supabase } from '../../config/supabase.js';

/**
 * List hostel attendance for a selected date
 * GET /api/hostel/attendance
 */
export const listHostelAttendance = async (req, res) => {
  try {
    const { date, blockId, roomId, search } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];

    // 1. Get all active allocations to determine residents
    let allocQuery = supabase
      .from('hostel_allocations')
      .select(`
        id, student_id, hostel_id, block_id, room_id, bed_number, status, academic_year,
        students ( id, full_name, roll_number, department, year, semester ),
        hostel_blocks ( id, name ),
        hostel_rooms ( id, room_number )
      `)
      .eq('status', 'Active');

    if (blockId && blockId !== 'All Blocks') allocQuery = allocQuery.eq('block_id', blockId);
    if (roomId && roomId !== 'All Rooms') allocQuery = allocQuery.eq('room_id', roomId);

    const { data: allocations, error: allocError } = await allocQuery;
    if (allocError) throw allocError;

    // 2. Get attendance records for the selected date
    let attQuery = supabase
      .from('hostel_attendance')
      .select('*')
      .eq('attendance_date', queryDate);

    const { data: attendanceRecords, error: attError } = await attQuery;
    if (attError) throw attError;

    // Create a map of student_id -> attendance record for quick lookup
    const attendanceMap = new Map();
    (attendanceRecords || []).forEach(rec => {
      attendanceMap.set(rec.student_id, rec);
    });

    // 3. Map residents with their attendance status
    let residents = (allocations || []).map(alloc => {
      const student = alloc.students || {};
      const block = alloc.hostel_blocks || {};
      const room = alloc.hostel_rooms || {};
      const attRecord = attendanceMap.get(alloc.student_id);

      return {
        id: alloc.id, // allocation id
        studentId: alloc.student_id,
        fullName: student.full_name || 'Unknown Student',
        rollNumber: student.roll_number || '-',
        department: student.department || '-',
        year: student.year || 1,
        semester: student.semester || 1,
        hostelId: alloc.hostel_id,
        blockId: alloc.block_id,
        blockName: block.name || '-',
        roomId: alloc.room_id,
        roomNumber: room.room_number || '-',
        bedNumber: alloc.bed_number,
        attendanceId: attRecord ? attRecord.id : null,
        status: attRecord ? attRecord.status : 'Present', // Default to Present if not marked
        remarks: attRecord ? (attRecord.remarks || '') : ''
      };
    });

    // Filter by search query (student name or roll number)
    if (search) {
      const q = String(search).toLowerCase();
      residents = residents.filter(r => 
        r.fullName.toLowerCase().includes(q) || 
        r.rollNumber.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: residents, date: queryDate });
  } catch (error) {
    console.error('listHostelAttendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hostel attendance', error: error.message });
  }
};

/**
 * Mark hostel attendance for a student
 * POST /api/hostel/attendance/mark
 */
export const markHostelAttendance = async (req, res) => {
  try {
    const { studentId, hostelId, roomId, date, status, remarks } = req.body;
    const queryDate = date || new Date().toISOString().split('T')[0];

    if (!studentId || !status) {
      return res.status(400).json({ success: false, message: 'Student ID and status are required' });
    }

    // Check if attendance record already exists for this student on this date
    const { data: existingRecord, error: checkError } = await supabase
      .from('hostel_attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('attendance_date', queryDate)
      .maybeSingle();

    if (checkError) throw checkError;

    let result;
    if (existingRecord) {
      // Update existing record
      const { data: updated, error: updateError } = await supabase
        .from('hostel_attendance')
        .update({ status, remarks, updated_at: new Date().toISOString() })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = updated;
    } else {
      // Insert new record
      const { data: inserted, error: insertError } = await supabase
        .from('hostel_attendance')
        .insert([{
          student_id: studentId,
          hostel_id: hostelId,
          room_id: roomId,
          attendance_date: queryDate,
          status,
          remarks,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      result = inserted;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('markHostelAttendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark hostel attendance', error: error.message });
  }
};

/**
 * Get attendance statistics for a selected date
 * GET /api/hostel/attendance/stats
 */
export const getHostelAttendanceStats = async (req, res) => {
  try {
    const { date, blockId } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];

    // 1. Get total active allocations count
    let allocQuery = supabase
      .from('hostel_allocations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Active');

    if (blockId && blockId !== 'All Blocks') allocQuery = allocQuery.eq('block_id', blockId);

    const { count: totalResidents, error: allocError } = await allocQuery;
    if (allocError) throw allocError;

    // 2. Get attendance records for the selected date
    let attQuery = supabase
      .from('hostel_attendance')
      .select('*')
      .eq('attendance_date', queryDate);

    if (blockId && blockId !== 'All Blocks') {
      // We need to filter attendance records by block. First, get list of student IDs in that block.
      const { data: blockStudents } = await supabase
        .from('hostel_allocations')
        .select('student_id')
        .eq('block_id', blockId)
        .eq('status', 'Active');
      
      const studentIds = (blockStudents || []).map(s => s.student_id);
      attQuery = attQuery.in('student_id', studentIds);
    }

    const { data: records, error: attError } = await attQuery;
    if (attError) throw attError;

    // Count states
    let absent = 0;
    let leave = 0;
    let present = 0;

    (records || []).forEach(r => {
      if (r.status === 'Absent') absent++;
      else if (r.status === 'On Leave') leave++;
      else present++;
    });

    // Any resident without a record is implicitly Present (or not marked, let's treat as Present for rate calculation)
    const markedCount = (records || []).length;
    const unmarked = Math.max(0, (totalResidents || 0) - markedCount);
    present += unmarked;

    const rate = totalResidents > 0 ? Math.round((present / totalResidents) * 100) : 100;

    res.json({
      success: true,
      data: {
        totalResidents: totalResidents || 0,
        present,
        absent,
        onLeave: leave,
        attendanceRate: rate,
        date: queryDate
      }
    });
  } catch (error) {
    console.error('getHostelAttendanceStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance stats', error: error.message });
  }
};
