import { supabase } from '../config/supabase.js';
import { updateFacultyAttendancePercentage } from '../services/facultyAttendanceService.js';

// @desc    Get faculty members and their attendance status for a specific date/dept
// @route   GET /api/faculty-attendance/list
// @access  Private (admin, super-admin)
export const getFacultyAttendanceList = async (req, res, next) => {
  try {
    const { department, date } = req.query;

    const dateStr = date 
      ? new Date(date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    // 1. Fetch all active faculty members (optionally filtered by department)
    let facultyQuery = supabase
      .from('faculty')
      .select('id, full_name, employee_id, department, designation, attendance_percentage')
      .eq('is_active', true);

    if (department) {
      facultyQuery = facultyQuery.eq('department', department);
    }

    const { data: matchedFaculty, error: facErr } = await facultyQuery;
    if (facErr) throw facErr;

    const facultyIds = matchedFaculty ? matchedFaculty.map(f => f.id) : [];

    // 2. Fetch attendance records for these faculty members on the given date
    const { data: records, error: recErr } = await supabase
      .from('faculty_attendance')
      .select('*')
      .in('faculty', facultyIds)
      .eq('date', dateStr);
    
    if (recErr) throw recErr;

    const attendanceMap = {};
    if (records) {
      records.forEach(r => {
        attendanceMap[r.faculty] = r;
      });
    }

    // 3. Map together for response
    const formatted = matchedFaculty ? matchedFaculty.map(f => {
      const attRecord = attendanceMap[f.id];
      return {
        _id: attRecord ? attRecord.id : undefined,
        id: attRecord ? attRecord.id : undefined,
        faculty: {
          _id: f.id,
          id: f.id,
          fullName: f.full_name,
          employeeId: f.employee_id,
          department: f.department,
          designation: f.designation || 'Lecturer',
          attendancePercentage: f.attendance_percentage !== undefined ? f.attendance_percentage : 100
        },
        status: attRecord ? (attRecord.status.charAt(0).toUpperCase() + attRecord.status.slice(1)) : 'Present',
        remarks: attRecord ? (attRecord.remarks || '') : '',
        date: dateStr
      };
    }) : [];

    return res.status(200).json({
      success: true,
      message: 'Faculty attendance records retrieved successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark faculty attendance
// @route   POST /api/faculty-attendance/bulk-mark
// @access  Private (admin, super-admin)
export const bulkMarkFacultyAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      const error = new Error('Please provide date and records array');
      error.statusCode = 400;
      return next(error);
    }

    const dateStr = new Date(date).toISOString().split('T')[0];
    const results = [];

    for (const record of records) {
      const { facultyId, status, remarks, attendanceId } = record;

      if (!facultyId || !status) continue;

      const cleanStatus = status.toLowerCase();

      // Check if faculty exists
      const { data: facultyRecord } = await supabase
        .from('faculty')
        .select('*')
        .eq('id', facultyId)
        .maybeSingle();

      if (!facultyRecord) continue;

      let savedRecord;
      let existingRecord = null;

      if (attendanceId) {
        const { data } = await supabase
          .from('faculty_attendance')
          .select('*')
          .eq('id', attendanceId)
          .maybeSingle();
        existingRecord = data;
      } else {
        const { data } = await supabase
          .from('faculty_attendance')
          .select('*')
          .eq('faculty', facultyId)
          .eq('date', dateStr)
          .maybeSingle();
        existingRecord = data;
      }

      if (existingRecord) {
        // Update
        const { data, error: updateErr } = await supabase
          .from('faculty_attendance')
          .update({
            status: cleanStatus,
            remarks: remarks || ''
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        savedRecord = data;
      } else {
        // Create
        const { data, error: createErr } = await supabase
          .from('faculty_attendance')
          .insert([{
            faculty: facultyId,
            date: dateStr,
            status: cleanStatus,
            remarks: remarks || ''
          }])
          .select()
          .single();

        if (createErr) throw createErr;
        savedRecord = data;
      }

      // Update overall percentage
      await updateFacultyAttendancePercentage(facultyId);

      results.push({
        ...savedRecord,
        _id: savedRecord.id
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk faculty attendance saved successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history for a single faculty member
// @route   GET /api/faculty-attendance/faculty/:facultyId
// @access  Private (faculty, admin, super-admin)
export const getFacultyAttendanceHistory = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    // Check if faculty exists
    const { data: facultyRecord } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', facultyId)
      .maybeSingle();

    if (!facultyRecord) {
      const error = new Error('Faculty member not found');
      error.statusCode = 404;
      return next(error);
    }

    const { data: records, error: recErr } = await supabase
      .from('faculty_attendance')
      .select('*')
      .eq('faculty', facultyId)
      .order('date', { ascending: false });

    if (recErr) throw recErr;

    const formattedRecords = records ? records.map(r => ({
      ...r,
      _id: r.id,
    })) : [];

    return res.status(200).json({
      success: true,
      message: 'Faculty attendance history retrieved successfully',
      data: {
        records: formattedRecords
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single faculty attendance record
// @route   PUT /api/faculty-attendance/:id
// @access  Private (admin, super-admin)
export const updateFacultyAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const { data: record } = await supabase
      .from('faculty_attendance')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!record) {
      const error = new Error('Faculty attendance record not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;

    const { data: updatedRecord, error: updateErr } = await supabase
      .from('faculty_attendance')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await updateFacultyAttendancePercentage(record.faculty);

    const formatted = {
      ...updatedRecord,
      _id: updatedRecord.id
    };

    return res.status(200).json({
      success: true,
      message: 'Faculty attendance record updated successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single faculty attendance record
// @route   DELETE /api/faculty-attendance/:id
// @access  Private (admin, super-admin)
export const deleteFacultyAttendance = async (req, res, next) => {
  try {
    const { data: record } = await supabase
      .from('faculty_attendance')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!record) {
      const error = new Error('Faculty attendance record not found');
      error.statusCode = 404;
      return next(error);
    }

    const { error: delErr } = await supabase
      .from('faculty_attendance')
      .delete()
      .eq('id', req.params.id);

    if (delErr) throw delErr;

    await updateFacultyAttendancePercentage(record.faculty);

    return res.status(200).json({
      success: true,
      message: 'Faculty attendance record deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
