import { supabase } from '../config/supabase.js';
import { dispatchNotification } from '../services/notificationService.js';

// @desc    Get faculty dashboard stats
// @route   GET /api/faculty-module/dashboard
// @access  Private (faculty)
export const getFacultyDashboard = async (req, res, next) => {
  try {
    // 1. Get students count
    const { count: studentsCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 2. Get study materials count
    const { count: materialsCount } = await supabase
      .from('study_materials')
      .select('*', { count: 'exact', head: true })
      .eq('faculty', req.user.id || req.user._id);

    // 3. Get pending leave requests
    const { data: leaveRequests } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', req.user.id || req.user._id);

    const pendingLeave = leaveRequests ? leaveRequests.filter(r => r.status === 'Pending').length : 0;

    const stats = [
      { label: "Students Under Mentorship", value: String(studentsCount || 0), change: "Active" },
      { label: "Study Materials Shared", value: String(materialsCount || 0), change: "All Subjects" },
      { label: "Pending Leave Requests", value: String(pendingLeave), change: "Awaiting approval" }
    ];

    // Fetch dynamic activities
    const activities = [];
    const { data: recentMaterials } = await supabase
      .from('study_materials')
      .select('*')
      .eq('faculty', req.user.id || req.user._id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (recentMaterials) {
      recentMaterials.forEach(m => {
        activities.push({
          actor: "You",
          action: "uploaded study material",
          target: m.title,
          time: "Recently",
          type: "Material"
        });
      });
    }


    if (activities.length === 0) {
      activities.push({
        actor: "You",
        action: "logged in to",
        target: "Faculty Portal",
        time: "Just now",
        type: "System"
      });
    }

    // Generate dynamic notifications
    const notifications = [];
    let notifId = 1;

    if (leaveRequests) {
      leaveRequests.forEach(l => {
        if (l.status === 'Pending') {
          notifications.push({
            id: `FN-${notifId++}`,
            title: `Leave request for ${l.days} day(s) is pending approval`,
            type: "Request",
            time: "Awaiting",
            unread: true
          });
        } else {
          notifications.push({
            id: `FN-${notifId++}`,
            title: `Your leave request has been ${l.status.toLowerCase()}`,
            type: "Alert",
            time: "Recent",
            unread: false
          });
        }
      });
    }


    // Calculate weekly attendance trend
    const attendanceStats = [];
    const { data: attRecords } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    if (attRecords && attRecords.length > 0) {
      const dateGroups = {};
      attRecords.forEach(r => {
        const d = r.date;
        if (!dateGroups[d]) dateGroups[d] = { present: 0, total: 0 };
        if (r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late') {
          dateGroups[d].present++;
        }
        dateGroups[d].total++;
      });

      const sortedDates = Object.keys(dateGroups).sort();
      sortedDates.forEach(d => {
        const pct = Math.round((dateGroups[d].present / dateGroups[d].total) * 100);
        const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
        attendanceStats.push({ day: dayName, percentage: pct });
      });
    }

    // 0. Get faculty profile
    const { data: facultyMember } = await supabase
      .from('faculty')
      .select('*')
      .eq('user_id', req.user.id || req.user._id)
      .maybeSingle();

    const profile = facultyMember ? {
      ...facultyMember,
      _id: facultyMember.id,
      fullName: facultyMember.full_name,
      employeeId: facultyMember.employee_id,
      email: facultyMember.email,
      phoneNumber: facultyMember.phone_number,
      department: facultyMember.department_name || facultyMember.department
    } : null;

    return res.status(200).json({
      success: true,
      data: {
        stats,
        activities,
        notifications,
        weeklyAttendance: attendanceStats,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty classes timetable
// @route   GET /api/faculty-module/classes
// @access  Private (faculty)
export const getFacultyClasses = async (req, res, next) => {
  try {
    const facultyName = req.user.fullName || req.user.name || '';
    
    const { data: slots } = await supabase
      .from('timetable')
      .select('*')
      .eq('faculty_name', facultyName);

    if (!slots || slots.length === 0) {
      const { data: allSlots } = await supabase
        .from('timetable')
        .select('*')
        .limit(5);

      return res.status(200).json({ success: true, data: allSlots || [] });
    }

    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments created by faculty
// @route   GET /api/faculty-module/assignments
// @access  Private (faculty)
export const getFacultyAssignments = async (req, res, next) => {
  try {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('faculty', req.user.id || req.user._id);

    if (!assignments) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Collect all student user IDs
    const studentIds = [];
    assignments.forEach(asg => {
      if (Array.isArray(asg.submissions)) {
        asg.submissions.forEach(sub => {
          if (sub.student) studentIds.push(sub.student);
        });
      }
    });

    // Fetch student details
    const studentMap = {};
    if (studentIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, name, full_name, email')
        .in('id', studentIds);

      if (users) {
        users.forEach(u => {
          studentMap[u.id] = { _id: u.id, fullName: u.full_name || u.name, email: u.email };
        });
      }
    }

    // Map back to assignments structure
    const list = assignments.map(asg => {
      const subs = Array.isArray(asg.submissions) ? asg.submissions.map(sub => ({
        ...sub,
        student: studentMap[sub.student] || { _id: sub.student, fullName: 'Unknown Student', email: '' }
      })) : [];

      return {
        ...asg,
        _id: asg.id,
        dueDate: asg.due_date,
        submissions: subs
      };
    });

    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment
// @route   POST /api/faculty-module/assignments
// @access  Private (faculty)
export const createFacultyAssignment = async (req, res, next) => {
  try {
    const { title, description, subject, dueDate, department, year, semester, section } = req.body;
    if (!title || !subject || !dueDate || !department || !year || !semester || !section) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    const { data: assignment, error: insertErr } = await supabase
      .from('assignments')
      .insert([{
        title,
        description,
        subject,
        due_date: new Date(dueDate).toISOString(),
        department,
        year: Number(year),
        semester: Number(semester),
        section,
        faculty: req.user.id || req.user._id,
        submissions: []
      }])
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    const formatted = {
      ...assignment,
      _id: assignment.id,
      dueDate: assignment.due_date
    };

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade student submission
// @route   POST /api/faculty-module/assignments/grade
// @access  Private (faculty)
export const gradeSubmission = async (req, res, next) => {
  try {
    const { assignmentId, studentId, score } = req.body;
    if (!assignmentId || !studentId || score === undefined) {
      const error = new Error('Please provide assignmentId, studentId, and score');
      error.statusCode = 400;
      return next(error);
    }

    const { data: assignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .maybeSingle();

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      return next(error);
    }

    const submissions = Array.isArray(assignment.submissions) ? [...assignment.submissions] : [];
    const subIndex = submissions.findIndex(
      s => String(s.student) === String(studentId)
    );

    if (subIndex === -1) {
      const error = new Error('Submission not found for this student');
      error.statusCode = 404;
      return next(error);
    }

    submissions[subIndex].score = Number(score);
    submissions[subIndex].graded = true;

    const { data: updatedAssignment } = await supabase
      .from('assignments')
      .update({ submissions })
      .eq('id', assignmentId)
      .select()
      .single();

    const formatted = {
      ...updatedAssignment,
      _id: updatedAssignment.id,
      dueDate: updatedAssignment.due_date
    };

    return res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study materials uploaded by faculty
// @route   GET /api/faculty-module/materials
// @access  Private (faculty)
export const getFacultyMaterials = async (req, res, next) => {
  try {
    const { data: list } = await supabase
      .from('study_materials')
      .select('*')
      .eq('faculty', req.user.id || req.user._id);

    if (!list) {
      return res.status(200).json({ success: true, data: [] });
    }

    const formatted = list.map(item => ({
      ...item,
      _id: item.id,
      fileUrl: item.file_url
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload study material
// @route   POST /api/faculty-module/materials
// @access  Private (faculty)
export const createFacultyMaterial = async (req, res, next) => {
  try {
    const { title, subject, type, fileUrl, department, year, semester } = req.body;
    if (!title || !subject || !type || !fileUrl || !department || !year || !semester) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    const { data: material, error: insertErr } = await supabase
      .from('study_materials')
      .insert([{
        title,
        subject,
        type,
        file_url: fileUrl,
        department,
        year: Number(year),
        semester: Number(semester),
        faculty: req.user.id || req.user._id
      }])
      .select()
      .single();

    if (insertErr || !material) {
      throw new Error(insertErr?.message || 'Failed to insert study material record');
    }

    const formatted = {
      ...material,
      _id: material.id,
      fileUrl: material.file_url
    };

    return res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload student results/marks
// @route   POST /api/faculty-module/marks
// @access  Private (faculty)
export const uploadStudentMarks = async (req, res, next) => {
  try {
    const { studentEmail, subject, credits, marks, grade, semester } = req.body;
    if (!studentEmail || !subject || !credits || marks === undefined || !grade || !semester) {
      const error = new Error('Please fill in all required fields');
      error.statusCode = 400;
      return next(error);
    }

    const { data: studentProfile } = await supabase
      .from('students')
      .select('*')
      .eq('email', studentEmail)
      .eq('is_active', true)
      .maybeSingle();

    if (!studentProfile) {
      const error = new Error('Student profile not found');
      error.statusCode = 404;
      return next(error);
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('*')
      .eq('email', studentEmail)
      .maybeSingle();

    if (!userRecord) {
      const error = new Error('Student user account not found');
      error.statusCode = 404;
      return next(error);
    }

    const { data: existingResult } = await supabase
      .from('results')
      .select('*')
      .eq('student', userRecord.id)
      .eq('subject', subject)
      .eq('semester', Number(semester))
      .maybeSingle();

    let result;

    if (existingResult) {
      const { data: updatedResult } = await supabase
        .from('results')
        .update({
          credits: Number(credits),
          marks: Number(marks),
          grade
        })
        .eq('id', existingResult.id)
        .select()
        .single();

      result = updatedResult;
    } else {
      const { data: insertedResult } = await supabase
        .from('results')
        .insert([{
          student: userRecord.id,
          subject,
          credits: Number(credits),
          marks: Number(marks),
          grade,
          semester: Number(semester)
        }])
        .select()
        .single();

      result = insertedResult;
    }

    const formatted = {
      ...result,
      _id: result.id
    };

    return res.status(200).json({
      success: true,
      message: 'Marks updated successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty leave requests
// @route   GET /api/faculty-module/leave
// @access  Private (faculty)
export const getFacultyLeaveRequests = async (req, res, next) => {
  try {
    const { data: requests } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', req.user.id || req.user._id);

    if (!requests) {
      return res.status(200).json({ success: true, data: [] });
    }

    const formatted = requests.map(item => ({
      ...item,
      _id: item.id,
      from: item.from_date,
      to: item.to_date,
      user: item.user_id
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty leave request
// @route   POST /api/faculty-module/leave
// @access  Private (faculty)
export const createFacultyLeaveRequest = async (req, res, next) => {
  try {
    const { type, from, to, days, reason } = req.body;
    if (!type || !from || !to || !days) {
      const error = new Error('Please provide type, from, to, and days');
      error.statusCode = 400;
      return next(error);
    }

    const { data: request } = await supabase
      .from('leave_requests')
      .insert([{
        user_id: req.user.id || req.user._id,
        type,
        from_date: from,
        to_date: to,
        days: Number(days),
        reason
      }])
      .select()
      .single();

    const formatted = {
      ...request,
      _id: request.id,
      from: request.from_date,
      to: request.to_date,
      user: request.user_id
    };

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student performance list
// @route   GET /api/faculty-module/performance
// @access  Private (faculty)
export const getStudentPerformance = async (req, res, next) => {
  try {
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (!students || students.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const performanceList = [];

    // Extract all unique non-empty student emails
    const studentEmails = [...new Set(students
      .map(s => s.email)
      .filter(email => typeof email === 'string' && email.trim() !== '')
      .map(email => email.toLowerCase().trim())
    )];

    const emailToUserMap = new Map();
    const studentResultsMap = new Map();

    if (studentEmails.length > 0) {
      // Fetch user records in one query
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .in('email', studentEmails);

      if (users && users.length > 0) {
        users.forEach(u => {
          if (u.email && u.id) {
            emailToUserMap.set(u.email.toLowerCase().trim(), u.id);
          }
        });

        // Collect all matching user IDs
        const userIds = Array.from(emailToUserMap.values());

        if (userIds.length > 0) {
          // Fetch results for all these users in one query
          const { data: results } = await supabase
            .from('results')
            .select('student, marks')
            .in('student', userIds);

          if (results && results.length > 0) {
            results.forEach(r => {
              if (r.student && r.marks !== undefined) {
                if (!studentResultsMap.has(r.student)) {
                  studentResultsMap.set(r.student, []);
                }
                studentResultsMap.get(r.student).push(Number(r.marks));
              }
            });
          }
        }
      }
    }

    for (const student of students) {
      const cleanEmail = student.email ? student.email.toLowerCase().trim() : '';
      const userId = emailToUserMap.get(cleanEmail);
      let avgMarks = 0;

      if (userId) {
        const marksList = studentResultsMap.get(userId);
        if (marksList && marksList.length > 0) {
          const sum = marksList.reduce((s, m) => s + m, 0);
          avgMarks = Math.round(sum / marksList.length);
        }
      }

      performanceList.push({
        student: student.full_name,
        overall: avgMarks || Math.round((Number(student.cgpa) || 3.7) * 25),
        attendance: Number(student.attendance_percentage) || 88,
        assignments: avgMarks ? Math.round(avgMarks * 0.98) : 85,
        quizzes: avgMarks ? Math.round(avgMarks * 0.94) : 82
      });
    }

    return res.status(200).json({ success: true, data: performanceList });
  } catch (error) {
    next(error);
  }
};

export const updateStudentLeaveRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      const error = new Error('Invalid status. Must be Approved or Rejected');
      error.statusCode = 400;
      return next(error);
    }

    // 1. Get the leave request
    const { data: request, error: fetchErr } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!request) {
      const error = new Error('Leave request not found');
      error.statusCode = 404;
      return next(error);
    }

    // 2. Update status
    const { data: updatedRequest, error: updateErr } = await supabase
      .from('leave_requests')
      .update({ status, remarks })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Find the student linked to user_id of the request
    const { data: userRecord } = await supabase
      .from('users')
      .select('*')
      .eq('id', request.user_id)
      .maybeSingle();

    if (userRecord && userRecord.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('email', userRecord.email)
        .maybeSingle();

      if (student) {
        dispatchNotification({
          userId: student.user_id,
          studentId: student.id,
          email: student.email,
          parentEmail: student.parent_email,
          type: 'Leave',
          title: `Leave Request ${status}`,
          message: `Dear ${student.full_name}, your leave request for ${request.days} day(s) starting from ${request.from_date} to ${request.to_date} has been ${status.toLowerCase()}. Remarks: ${remarks || 'None'}.`,
          priority: 'Medium'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Leave request status updated to ${status}`,
      data: {
        ...updatedRequest,
        _id: updatedRequest.id
      }
    });
  } catch (error) {
    next(error);
  }
};
