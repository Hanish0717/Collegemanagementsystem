import { supabase } from '../config/supabase.js';

// Helper to get student's profile by email
const getProfile = async (email) => {
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle();

  if (data) {
    return {
      ...data,
      _id: data.id,
      fullName: data.full_name,
      rollNumber: data.roll_number,
      phoneNumber: data.phone_number,
      dateOfBirth: data.date_of_birth,
      parentName: data.parent_name,
      parentPhone: data.parent_phone,
      parentEmail: data.parent_email,
      attendancePercentage: data.attendance_percentage,
      profileImage: data.profile_image,
      isActive: data.is_active
    };
  }
  return null;
};

// @desc    Get student dashboard stats
// @route   GET /api/student-module/dashboard
// @access  Private (student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.email);
    
    let cgpa = profile ? profile.cgpa : 3.5;
    let attendancePct = profile ? profile.attendancePercentage : 85;

    // Fetch actual database stats
    const { data: allCohortAsg } = await supabase
      .from('assignments')
      .select('*')
      .eq('department', profile?.department || 'CSE')
      .eq('year', Number(profile?.year || 1))
      .eq('semester', Number(profile?.semester || 1))
      .eq('section', profile?.section || 'A');

    const totalAssignments = allCohortAsg ? allCohortAsg.length : 0;

    let submittedCount = 0;
    if (allCohortAsg) {
      allCohortAsg.forEach(a => {
        if (Array.isArray(a.submissions)) {
          const found = a.submissions.some(s => String(s.student) === String(req.user.id || req.user._id));
          if (found) submittedCount++;
        }
      });
    }

    const pendingAssignments = totalAssignments - submittedCount;

    const { data: leaveRequests } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', req.user.id || req.user._id);

    const approvedLeaveDays = leaveRequests
      ? leaveRequests
          .filter(r => r.status === 'Approved')
          .reduce((sum, r) => sum + Number(r.days || 0), 0)
      : 0;

    const { data: feeRecords } = await supabase
      .from('fees')
      .select('*')
      .eq('student', profile?.id || profile?._id);

    const pendingFees = feeRecords
      ? feeRecords
          .filter(f => {
            const s = String(f.status).toLowerCase();
            return s === 'unpaid' || s === 'partially_paid' || s === 'partially-paid';
          })
          .reduce((sum, f) => sum + (Number(f.amount || 0) - Number(f.paid_amount || 0)), 0)
      : 0;

    const dashboardStats = [
      { label: "Overall Attendance", value: `${attendancePct}%`, change: "Current" },
      { label: "Current GPA", value: String(cgpa), change: "Latest Semester" },
      { label: "Pending Assignments", value: String(pendingAssignments), change: "To submit" },
      { label: "Leave Balance", value: `${15 - approvedLeaveDays} days`, change: "Available" },
      { label: "Fee Balance", value: `$${pendingFees}`, change: "Pending Payment" }
    ];

    // Fetch dynamic activities
    const activities = [];
    const { data: complaints } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', req.user.id || req.user._id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (complaints) {
      complaints.forEach(c => {
        activities.push({
          actor: 'You',
          action: `filed a complaint about`,
          target: c.title || c.subject,
          time: 'Recently',
          type: 'Complaint'
        });
      });
    }

    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', req.user.id || req.user._id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (leaves) {
      leaves.forEach(l => {
        activities.push({
          actor: 'You',
          action: `applied for`,
          target: l.type,
          time: 'Recently',
          type: 'Leave'
        });
      });
    }

    if (activities.length === 0) {
      activities.push(
        { actor: "You", action: "signed in to", target: "College System", time: "Just now", type: "System" }
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: dashboardStats,
        activities,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student timetable matching their cohort
// @route   GET /api/student-module/timetable
// @access  Private (student)
export const getStudentTimetable = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.email);
    const { data: slots } = await supabase
      .from('timetable')
      .select('*')
      .eq('department', profile?.department || 'CSE')
      .eq('year', Number(profile?.year || 1))
      .eq('semester', Number(profile?.semester || 1))
      .eq('section', profile?.section || 'A');

    return res.status(200).json({ success: true, data: slots || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student grades & marks
// @route   GET /api/student-module/results
// @access  Private (student)
export const getStudentResults = async (req, res, next) => {
  try {
    const { data: results } = await supabase
      .from('results')
      .select('*')
      .eq('student', req.user.id || req.user._id);

    if (!results) {
      return res.status(200).json({ success: true, data: [] });
    }

    const formatted = results.map(r => ({
      ...r,
      _id: r.id
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student assignments list and submission statuses
// @route   GET /api/student-module/assignments
// @access  Private (student)
export const getStudentAssignments = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.email);
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('department', profile?.department || 'CSE')
      .eq('year', Number(profile?.year || 1))
      .eq('semester', Number(profile?.semester || 1))
      .eq('section', profile?.section || 'A');

    if (!assignments) {
      return res.status(200).json({ success: true, data: [] });
    }

    const facultyIds = assignments.map(a => a.faculty).filter(Boolean);
    const facultyMap = {};

    if (facultyIds.length > 0) {
      const { data: faculties } = await supabase
        .from('users')
        .select('id, name, full_name')
        .in('id', facultyIds);

      if (faculties) {
        faculties.forEach(f => {
          facultyMap[f.id] = { _id: f.id, fullName: f.full_name || f.name };
        });
      }
    }

    const formattedList = assignments.map(a => {
      const submissions = Array.isArray(a.submissions) ? a.submissions : [];
      const submission = submissions.find(s => String(s.student) === String(req.user.id || req.user._id));
      return {
        _id: a.id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        dueDate: a.due_date,
        faculty: facultyMap[a.faculty] || null,
        status: submission ? (submission.graded ? 'Graded' : 'Submitted') : 'Pending',
        submitted: !!submission,
        submissionDetails: submission || null
      };
    });

    return res.status(200).json({ success: true, data: formattedList });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an assignment
// @route   POST /api/student-module/assignments/submit/:id
// @access  Private (student)
export const submitAssignment = async (req, res, next) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      const error = new Error('File URL is required');
      error.statusCode = 400;
      return next(error);
    }

    const { data: assignment } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      return next(error);
    }

    const submissions = Array.isArray(assignment.submissions) ? [...assignment.submissions] : [];
    const studentId = req.user.id || req.user._id;
    const existingIndex = submissions.findIndex(
      s => String(s.student) === String(studentId)
    );

    if (existingIndex > -1) {
      submissions[existingIndex].fileUrl = fileUrl;
      submissions[existingIndex].submittedAt = new Date().toISOString();
    } else {
      submissions.push({
        student: studentId,
        fileUrl,
        submittedAt: new Date().toISOString(),
        score: null,
        graded: false
      });
    }

    const { data: updatedAssignment } = await supabase
      .from('assignments')
      .update({ submissions })
      .eq('id', req.params.id)
      .select()
      .single();

    const formatted = {
      ...updatedAssignment,
      _id: updatedAssignment.id,
      dueDate: updatedAssignment.due_date
    };

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study materials
// @route   GET /api/student-module/materials
// @access  Private (student)
export const getStudentMaterials = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.email);
    const { data: materials } = await supabase
      .from('study_materials')
      .select('*')
      .eq('department', profile?.department || 'CSE')
      .eq('year', Number(profile?.year || 1))
      .eq('semester', Number(profile?.semester || 1));

    if (!materials) {
      return res.status(200).json({ success: true, data: [] });
    }

    const facultyIds = materials.map(m => m.faculty).filter(Boolean);
    const facultyMap = {};

    if (facultyIds.length > 0) {
      const { data: faculties } = await supabase
        .from('users')
        .select('id, name, full_name')
        .in('id', facultyIds);

      if (faculties) {
        faculties.forEach(f => {
          facultyMap[f.id] = { _id: f.id, fullName: f.full_name || f.name };
        });
      }
    }

    const formatted = materials.map(m => ({
      ...m,
      _id: m.id,
      fileUrl: m.file_url,
      faculty: facultyMap[m.faculty] || null
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave requests
// @route   GET /api/student-module/leave
// @access  Private (student)
export const getStudentLeaveRequests = async (req, res, next) => {
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

// @desc    Create a leave request
// @route   POST /api/student-module/leave
// @access  Private (student)
export const createStudentLeaveRequest = async (req, res, next) => {
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

// @desc    Get placements
// @route   GET /api/student-module/placements
// @access  Private (student)
export const getStudentPlacements = async (req, res, next) => {
  try {
    const { data: list } = await supabase
      .from('placements')
      .select('*');

    if (!list) {
      return res.status(200).json({ success: true, data: [] });
    }

    const formatted = list.map(p => {
      const studentId = req.user.id || req.user._id;
      const appliedStudents = Array.isArray(p.applied_students) ? p.applied_students : [];
      const app = appliedStudents.find(s => String(s.student) === String(studentId));
      return {
        _id: p.id,
        company: p.company,
        position: p.position,
        status: app ? app.status : 'Not Applied',
        appliedDate: app ? app.appliedDate || app.applied_date || '-' : '-'
      };
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints
// @route   GET /api/student-module/complaints
// @access  Private (student)
export const getStudentComplaints = async (req, res, next) => {
  try {
    const { data: list } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', req.user.id || req.user._id);

    if (!list) {
      return res.status(200).json({ success: true, data: [] });
    }

    const formatted = list.map(c => ({
      ...c,
      _id: c.id,
      subject: c.title,
      user: c.user_id
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Create complaint
// @route   POST /api/student-module/complaints
// @access  Private (student)
export const createStudentComplaint = async (req, res, next) => {
  try {
    const { category, subject, description } = req.body;
    if (!category || !subject || !description) {
      const error = new Error('Please provide category, subject, and description');
      error.statusCode = 400;
      return next(error);
    }

    const { data: complaint } = await supabase
      .from('complaints')
      .insert([{
        user_id: req.user.id || req.user._id,
        category,
        title: subject,
        description
      }])
      .select()
      .single();

    const formatted = {
      ...complaint,
      _id: complaint.id,
      subject: complaint.title,
      user: complaint.user_id
    };

    return res.status(201).json({
      success: true,
      message: 'Complaint filed successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};
