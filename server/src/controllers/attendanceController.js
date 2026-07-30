import { updateStudentAttendancePercentage } from '../services/attendanceService.js';
import { supabase } from '../config/supabase.js';

// @desc    Mark attendance for a student
// @route   POST /api/attendance/mark
// @access  Private (faculty, admin, super-admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { student, subject, date, status, department, semester, section, remarks } = req.body;

    if (!student || !subject || !date || !status || !department || !semester || !section) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    // Verify student exists
    const { data: studentRecord } = await supabase
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

    const dateStr = new Date(date).toISOString().split('T')[0];

    // Prevent duplicate attendance
    const { data: duplicate } = await supabase
      .from('attendance')
      .select('*')
      .eq('student', student)
      .eq('date', dateStr)
      .eq('subject', subject)
      .maybeSingle();

    if (duplicate) {
      const error = new Error('Attendance already marked for this student, subject, and date');
      error.statusCode = 400;
      return next(error);
    }

    // Create record
    const { data: record, error: createErr } = await supabase
      .from('attendance')
      .insert([{
        student,
        date: dateStr,
        status,
        subject,
        remarks
      }])
      .select()
      .single();

    if (createErr) throw createErr;

    // Recalculate percentage
    await updateStudentAttendancePercentage(student);

    const formatted = {
      ...record,
      _id: record.id
    };

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student attendance statistics (overall, subject-wise, monthly)
// @route   GET /api/attendance/student/:studentId
// @access  Private (student, parent, faculty, admin, super-admin)
export const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const { data: studentRecord } = await supabase
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

    // Fetch all records
    const { data: records } = await supabase
      .from('attendance')
      .select('*')
      .eq('student', studentId)
      .order('date', { ascending: false });

    const total = records ? records.length : 0;
    const presentCount = records ? records.filter((r) => r.status.toLowerCase() === 'present').length : 0;
    const lateCount = records ? records.filter((r) => r.status.toLowerCase() === 'late').length : 0;
    const excusedCount = records ? records.filter((r) => r.status.toLowerCase() === 'excused').length : 0;
    const absentCount = records ? records.filter((r) => r.status.toLowerCase() === 'absent').length : 0;

    const overallPercentage = total > 0 ? Math.round(((presentCount + lateCount + excusedCount) / total) * 100 * 10) / 10 : 100;

    // Subject-wise calculation
    const subjects = records ? [...new Set(records.map((r) => r.subject))] : [];
    const subjectWise = subjects.map((subj) => {
      const subjRecords = records.filter((r) => r.subject === subj);
      const sTotal = subjRecords.length;
      const sAttended = subjRecords.filter((r) => r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late' || r.status.toLowerCase() === 'excused').length;
      return {
        subject: subj,
        total: sTotal,
        present: subjRecords.filter((r) => r.status.toLowerCase() === 'present').length,
        late: subjRecords.filter((r) => r.status.toLowerCase() === 'late').length,
        absent: subjRecords.filter((r) => r.status.toLowerCase() === 'absent').length,
        excused: subjRecords.filter((r) => r.status.toLowerCase() === 'excused').length,
        percentage: sTotal > 0 ? Math.round((sAttended / sTotal) * 100 * 10) / 10 : 100,
      };
    });

    // Monthly calculation
    const monthlyStats = {};
    if (records) {
      records.forEach((record) => {
        const monthYear = new Date(record.date).toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyStats[monthYear]) {
          monthlyStats[monthYear] = { present: 0, absent: 0, late: 0, total: 0 };
        }
        const st = String(record.status).toLowerCase();
        if (monthlyStats[monthYear][st] !== undefined) {
          monthlyStats[monthYear][st]++;
        }
        monthlyStats[monthYear].total++;
      });
    }

    const monthly = Object.keys(monthlyStats).map((month) => ({
      month,
      ...monthlyStats[month],
      percentage: Math.round(((monthlyStats[month].present + monthlyStats[month].late) / monthlyStats[month].total) * 100 * 10) / 10,
    })).sort((a, b) => b.month.localeCompare(a.month));

    const formattedRecords = records ? records.map(r => ({
      ...r,
      _id: r.id,
      faculty: { fullName: "Faculty" }
    })) : [];

    const response = {
      success: true,
      message: 'Student attendance stats retrieved successfully',
      data: {
        overallPercentage,
        totals: { total, present: presentCount, absent: absentCount, late: lateCount },
        subjectWise,
        monthly,
        records: formattedRecords,
        stats: {
          percentage: overallPercentage,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          total: total
        }
      },
    };

    if (overallPercentage < 75) {
      response.lowAttendance = true;
      response.warning = 'Attendance below 75%';
    }

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get class attendance list
// @route   GET /api/attendance/class
// @access  Private (faculty, admin, super-admin)
export const getClassAttendance = async (req, res, next) => {
  try {
    let { department, semester, section, subject, date, period } = req.query;

    // Enforce faculty isolation: Force queries to use authenticated faculty's assigned department
    if (req.user && req.user.role === 'faculty' && req.user.department) {
      department = req.user.department;
    }

    let studentQuery = supabase
      .from('students')
      .select('id, full_name, roll_number, department, attendance_percentage')
      .eq('is_active', true);

    if (department) studentQuery = studentQuery.eq('department', department);
    if (semester) studentQuery = studentQuery.eq('semester', Number(semester));
    if (section) studentQuery = studentQuery.eq('section', section);

    const { data: matchedStudents } = await studentQuery;
    const studentIds = matchedStudents ? matchedStudents.map(s => s.id) : [];

    let attendanceQuery = supabase
      .from('attendance')
      .select('*')
      .in('student', studentIds);

    if (subject) attendanceQuery = attendanceQuery.eq('subject', subject);
    if (date) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      attendanceQuery = attendanceQuery.eq('date', dateStr);
    }
    if (period) {
      attendanceQuery = attendanceQuery.eq('period', Number(period));
    }

    const { data: records } = await attendanceQuery;

    const attendanceMap = {};
    if (records) {
      records.forEach(r => {
        attendanceMap[r.student] = r;
      });
    }

    const formatted = matchedStudents ? matchedStudents.map(s => {
      const attRecord = attendanceMap[s.id];
      return {
        _id: attRecord ? attRecord.id : undefined,
        id: attRecord ? attRecord.id : undefined,
        student: {
          _id: s.id,
          id: s.id,
          fullName: s.full_name,
          rollNumber: s.roll_number,
          department: s.department,
          attendancePercentage: s.attendance_percentage
        },
        status: attRecord ? attRecord.status : 'Present',
        remarks: attRecord ? (attRecord.remarks || '') : '',
        date: attRecord ? attRecord.date : (date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        subject: attRecord ? attRecord.subject : subject,
        period: attRecord ? attRecord.period : (period ? Number(period) : null),
        time: attRecord ? attRecord.time : (req.query.time || null),
        faculty: { fullName: "Faculty" }
      };
    }) : [];

    return res.status(200).json({
      success: true,
      message: 'Class attendance records retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (faculty, admin, super-admin)
export const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const { data: record } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!record) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;

    const { data: updatedRecord } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    await updateStudentAttendancePercentage(record.student);

    const formatted = {
      ...updatedRecord,
      _id: updatedRecord.id
    };

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (faculty, admin, super-admin)
export const deleteAttendance = async (req, res, next) => {
  try {
    const { data: record } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!record) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      return next(error);
    }

    await supabase
      .from('attendance')
      .delete()
      .eq('id', req.params.id);

    await updateStudentAttendancePercentage(record.student);

    return res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate general attendance report and flag low attendance
// @route   GET /api/attendance/report
// @access  Private (admin, super-admin)
export const getAttendanceReport = async (req, res, next) => {
  try {
    const { department, semester, section, subject, startDate, endDate } = req.query;

    let studentQuery = supabase
      .from('students')
      .select('id, full_name, roll_number, attendance_percentage')
      .eq('is_active', true);

    if (department) studentQuery = studentQuery.eq('department', department);
    if (semester) studentQuery = studentQuery.eq('semester', Number(semester));
    if (section) studentQuery = studentQuery.eq('section', section);

    const { data: matchedStudents } = await studentQuery;
    const studentIds = matchedStudents ? matchedStudents.map(s => s.id) : [];

    let attendanceQuery = supabase
      .from('attendance')
      .select('*')
      .in('student', studentIds);

    if (subject) attendanceQuery = attendanceQuery.eq('subject', subject);

    if (startDate || endDate) {
      if (startDate) {
        const startStr = new Date(startDate).toISOString().split('T')[0];
        attendanceQuery = attendanceQuery.gte('date', startStr);
      }
      if (endDate) {
        const endStr = new Date(endDate).toISOString().split('T')[0];
        attendanceQuery = attendanceQuery.lte('date', endStr);
      }
    }

    const { data: records } = await attendanceQuery;

    const total = records ? records.length : 0;
    const present = records ? records.filter((r) => r.status.toLowerCase() === 'present').length : 0;
    const absent = records ? records.filter((r) => r.status.toLowerCase() === 'absent').length : 0;
    const late = records ? records.filter((r) => r.status.toLowerCase() === 'late').length : 0;

    // Today's Stats
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todayRecords } = await supabase
      .from('attendance')
      .select('status')
      .in('student', studentIds)
      .eq('date', todayStr);

    const presentToday = todayRecords ? todayRecords.filter(r => r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late').length : 0;
    const absentToday = todayRecords ? todayRecords.filter(r => r.status.toLowerCase() === 'absent').length : 0;

    // Dynamic Daily Trends
    const { data: dateRows } = await supabase
      .from('attendance')
      .select('date')
      .in('student', studentIds)
      .order('date', { ascending: false });

    const uniqueDates = [...new Set(dateRows?.map(r => r.date) || [])]
      .slice(0, 6)
      .reverse();

    let trends = [];
    if (uniqueDates.length > 0) {
      const { data: trendRecords } = await supabase
        .from('attendance')
        .select('date, status')
        .in('student', studentIds)
        .in('date', uniqueDates);

      const trendsMap = {};
      uniqueDates.forEach(d => {
        trendsMap[d] = { present: 0, absent: 0 };
      });

      if (trendRecords) {
        trendRecords.forEach(r => {
          if (trendsMap[r.date]) {
            const st = String(r.status).toLowerCase();
            if (st === 'present' || st === 'late') {
              trendsMap[r.date].present++;
            } else if (st === 'absent') {
              trendsMap[r.date].absent++;
            }
          }
        });
      }

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      trends = uniqueDates.map(d => {
        const dateObj = new Date(d);
        const dayName = daysOfWeek[dateObj.getDay()];
        const stats = trendsMap[d];
        const dayTotal = stats.present + stats.absent;
        return {
          day: dayName,
          date: d,
          present: stats.present,
          absent: stats.absent,
          percentage: dayTotal > 0 ? Math.round((stats.present / dayTotal) * 100) : 100
        };
      });
    }

    // Dynamic department alerts
    const { data: allStudents } = await supabase
      .from('students')
      .select('department, attendance_percentage')
      .eq('is_active', true);

    const deptMetrics = {};
    if (allStudents) {
      allStudents.forEach(s => {
        const dept = s.department || 'Unknown';
        if (!deptMetrics[dept]) {
          deptMetrics[dept] = { total: 0, below75: 0 };
        }
        deptMetrics[dept].total++;
        if (Number(s.attendance_percentage || 100) < 75) {
          deptMetrics[dept].below75++;
        }
      });
    }

    const departmentAlerts = Object.keys(deptMetrics).map(dept => ({
      department: dept,
      studentsBelow75: deptMetrics[dept].below75,
      totalStudents: deptMetrics[dept].total
    }));

    // Calculate Overall Attendance Percentage by averaging current students' attendance_percentage
    const overallPercentage = matchedStudents && matchedStudents.length > 0
      ? Math.round((matchedStudents.reduce((acc, s) => acc + Number(s.attendance_percentage || 100), 0) / matchedStudents.length) * 10) / 10
      : 100;

    const lowAttendanceStudents = matchedStudents
      ? matchedStudents
        .filter((s) => Number(s.attendance_percentage || 100) < 75)
        .map(s => ({
          ...s,
          _id: s.id,
          fullName: s.full_name,
          rollNumber: s.roll_number,
          attendancePercentage: s.attendance_percentage
        }))
      : [];

    return res.status(200).json({
      success: true,
      message: 'Attendance report generated successfully',
      data: {
        totals: { total, present, absent, late },
        totalsToday: { present: presentToday, absent: absentToday },
        overallPercentage,
        lowAttendanceStudents,
        trends,
        departmentAlerts
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance via QR Code scanning
// @route   POST /api/attendance/scan-qr
// @access  Private (student)
export const markAttendanceViaQR = async (req, res, next) => {
  try {
    const { department, section, subject, date } = req.body;

    if (!department || !section) {
      const error = new Error('Department and Section are required to scan QR');
      error.statusCode = 400;
      return next(error);
    }

    // Find student profile matching logged in user's email
    const cleanEmail = req.user.email.toLowerCase().trim();
    const { data: studentRecord } = await supabase
      .from('students')
      .select('*')
      .ilike('email', cleanEmail)
      .eq('is_active', true)
      .maybeSingle();

    if (!studentRecord) {
      const error = new Error('Student profile not found for this user account');
      error.statusCode = 404;
      return next(error);
    }

    // Map department names to short code
    let deptCode = department;
    if (department.includes("Computer Science")) deptCode = "CSE";
    else if (department.includes("Artificial Intelligence & Machine Learning")) deptCode = "AIML";
    else if (department.includes("Data Science")) deptCode = "AIDS";
    else if (department.includes("Cybersecurity")) deptCode = "CYBERSECURITY";
    else if (department.includes("Information Technology")) deptCode = "IT";
    else if (department.includes("Electronics")) deptCode = "ECE";
    else if (department.includes("Electrical")) deptCode = "EEE";
    else if (department.includes("Mechanical")) deptCode = "MECH";
    else if (department.includes("Civil")) deptCode = "CIVIL";

    // Validate student department and section match
    if (studentRecord.department !== deptCode || studentRecord.section !== section) {
      const error = new Error(`You do not belong to this class session (${deptCode} - ${section})`);
      error.statusCode = 400;
      return next(error);
    }

    const dateStr = date || new Date().toISOString().split('T')[0];
    const finalSubject = subject || 'General Class';

    // Check if attendance already marked
    const { data: duplicate } = await supabase
      .from('attendance')
      .select('*')
      .eq('student', studentRecord.id)
      .eq('date', dateStr)
      .eq('subject', finalSubject)
      .maybeSingle();

    if (duplicate) {
      return res.status(200).json({
        success: true,
        message: 'Attendance already marked for this class today',
        data: duplicate
      });
    }

    // Insert attendance
    const { data: record, error: createErr } = await supabase
      .from('attendance')
      .insert([{
        student: studentRecord.id,
        date: dateStr,
        status: 'present',
        subject: finalSubject,
        remarks: 'Marked via QR Code Scan'
      }])
      .select()
      .single();

    if (createErr) throw createErr;

    // Recalculate percentage
    await updateStudentAttendancePercentage(studentRecord.id);

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully via QR Code Scan!',
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark attendance for a class
// @route   POST /api/attendance/bulk-mark
// @access  Private (faculty, admin, super-admin)
export const bulkMarkAttendance = async (req, res, next) => {
  try {
    let { subject, date, department, semester, section, period, time, records } = req.body;

    // Enforce faculty isolation: Force bulk marking to use authenticated faculty's assigned department
    if (req.user && req.user.role === 'faculty' && req.user.department) {
      department = req.user.department;
    }

    if (!subject || !date || !records || !Array.isArray(records)) {
      const error = new Error('Please fill in all required fields and provide records array');
      error.statusCode = 400;
      return next(error);
    }

    const dateStr = new Date(date).toISOString().split('T')[0];
    const results = [];

    for (const record of records) {
      const { studentId, status, remarks, attendanceId } = record;

      if (!studentId || !status) continue;

      const cleanStatus = status.toLowerCase();

      // Check if student exists
      const { data: studentRecord } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      if (!studentRecord) continue;

      let savedRecord;
      let existingRecord = null;

      if (attendanceId) {
        const { data } = await supabase
          .from('attendance')
          .select('*')
          .eq('id', attendanceId)
          .maybeSingle();
        existingRecord = data;
      } else {
        const query = supabase
          .from('attendance')
          .select('*')
          .eq('student', studentId)
          .eq('date', dateStr)
          .eq('subject', subject);
        
        if (period) {
          query.eq('period', Number(period));
        }

        const { data } = await query.maybeSingle();
        existingRecord = data;
      }

      if (existingRecord) {
        // Update existing record
        const { data, error: updateErr } = await supabase
          .from('attendance')
          .update({
            status: cleanStatus,
            remarks: remarks || '',
            time: time || existingRecord.time
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        savedRecord = data;
      } else {
        // Create new record
        const { data, error: createErr } = await supabase
          .from('attendance')
          .insert([{
            student: studentId,
            date: dateStr,
            status: cleanStatus,
            subject,
            period: period ? Number(period) : null,
            time: time || null,
            remarks: remarks || ''
          }])
          .select()
          .single();

        if (createErr) throw createErr;
        savedRecord = data;
      }

      // Recalculate percentage
      await updateStudentAttendancePercentage(studentId);

      results.push({
        ...savedRecord,
        _id: savedRecord.id
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk attendance saved successfully',
      data: results
    });
  } catch (error) {
    next(error);
  }
};
