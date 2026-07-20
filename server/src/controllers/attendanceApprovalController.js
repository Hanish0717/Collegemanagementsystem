import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/sendEmail.js';
import { generateMonthlyAttendanceEmailTemplate } from '../utils/emailTemplates.js';
import { getHodDetails, getClassTeacher } from '../services/attendanceNotificationService.js';

// Helper to get faculty info for a logged in user
async function getFacultyInfo(userId) {
  const { data } = await supabase
    .from('faculty')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

// Helper to get HOD's department code
async function getHodDepartment(user) {
  const name = user.full_name || user.name;
  const { data } = await supabase
    .from('departments')
    .select('code')
    .eq('head_of_department', name)
    .maybeSingle();
  
  if (data) return data.code;
  
  // Fallback: check if the HOD name contains a code like "CSE"
  if (String(name).toUpperCase().includes('CSE')) return 'CSE';
  if (String(name).toUpperCase().includes('ECE')) return 'ECE';
  if (String(name).toUpperCase().includes('MECH')) return 'MECH';
  if (String(name).toUpperCase().includes('EEE')) return 'EEE';
  if (String(name).toUpperCase().includes('CIVIL')) return 'CIVIL';
  if (String(name).toUpperCase().includes('IT')) return 'IT';
  
  return null;
}

// @desc    Get all students with attendance metrics
// @route   GET /api/attendance/students
// @access  Private
export const getStudentsWithAttendance = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = supabase.from('students').select('*').eq('is_active', true);

    if (userRole === 'faculty') {
      const faculty = await getFacultyInfo(req.user.id || req.user._id);
      if (faculty) {
        query = query.eq('department', faculty.department);
      }
    } else if (userRole === 'hod') {
      const deptCode = await getHodDepartment(req.user);
      if (deptCode) {
        query = query.eq('department', deptCode);
      }
    }

    const { data: students, error } = await query;
    if (error) throw error;

    // Fetch all attendance to calculate subject-wise details
    const { data: allAttendance } = await supabase.from('attendance').select('*');

    const result = [];
    for (const student of (students || [])) {
      const studentAttendance = allAttendance
        ? allAttendance.filter(a => a.student === student.id || a.student === student._id)
        : [];

      // Calculate subject wise percentages
      const subjectMap = {};
      studentAttendance.forEach(a => {
        const sub = a.subject || 'Core Academics';
        if (!subjectMap[sub]) {
          subjectMap[sub] = { total: 0, attended: 0 };
        }
        subjectMap[sub].total++;
        if (['present', 'late', 'excused'].includes(String(a.status).toLowerCase())) {
          subjectMap[sub].attended++;
        }
      });

      const shortAttendanceSubjects = [];
      for (const [subName, stats] of Object.entries(subjectMap)) {
        const pct = Math.round((stats.attended / stats.total) * 100 * 10) / 10;
        if (pct < 75.0) {
          shortAttendanceSubjects.push({
            subject: subName,
            percentage: pct,
            teacher: 'Subject Faculty'
          });
        }
      }

      // Slabs and suggestions
      const overall = student.attendance_percentage || 100.0;
      let status = 'Excellent';
      let recommendation = 'Appreciation';
      let suggestedRecipients = ['Student'];

      if (overall < 65) {
        status = 'Detention Risk';
        recommendation = 'Detention Alert';
        suggestedRecipients = ['Student', 'Parent', 'HOD', 'Teacher'];
      } else if (overall < 75) {
        status = 'Critical';
        recommendation = 'Critical Warning';
        suggestedRecipients = ['Student', 'Parent'];
      } else if (overall < 80) {
        status = 'Warning';
        recommendation = 'Friendly Reminder';
        suggestedRecipients = ['Student'];
      } else if (overall < 90) {
        status = 'Good';
        recommendation = 'No Action';
        suggestedRecipients = [];
      }

      result.push({
        ...student,
        overall_attendance: overall,
        short_attendance_subjects: shortAttendanceSubjects,
        status,
        recommendation,
        suggested_recipients: suggestedRecipients
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended students below 75%
// @route   GET /api/attendance/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = supabase.from('students').select('*').eq('is_active', true);

    if (userRole === 'faculty') {
      const faculty = await getFacultyInfo(req.user.id || req.user._id);
      if (faculty) {
        query = query.eq('department', faculty.department);
      }
    } else if (userRole === 'hod') {
      const deptCode = await getHodDepartment(req.user);
      if (deptCode) {
        query = query.eq('department', deptCode);
      }
    }

    const { data: students, error } = await query;
    if (error) throw error;

    // Filter only those below 75% overall
    const filtered = (students || []).filter(s => (s.attendance_percentage || 100.0) < 75.0);

    const result = filtered.map(s => {
      const overall = s.attendance_percentage || 100.0;
      let status = 'Critical';
      let recommendation = 'Critical Warning';
      let suggestedRecipients = ['Student', 'Parent'];

      if (overall < 65) {
        status = 'Detention Risk';
        recommendation = 'Detention Alert';
        suggestedRecipients = ['Student', 'Parent', 'HOD', 'Teacher'];
      } else if (overall < 75) {
        status = 'Critical';
        recommendation = 'Critical Warning';
        suggestedRecipients = ['Student', 'Parent'];
      }

      return {
        ...s,
        overall_attendance: overall,
        status,
        recommendation,
        suggested_recipients: suggestedRecipients,
        short_attendance_subjects: []
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get College settings
// @route   GET /api/attendance/settings
// @access  Private
export const getSettings = async (req, res, next) => {
  try {
    const { data: setting } = await supabase
      .from('college_settings')
      .select('*')
      .eq('key', 'attendance_approval_enabled')
      .maybeSingle();

    res.status(200).json({
      success: true,
      enabled: setting ? setting.value === 'true' : false
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update College settings
// @route   POST /api/attendance/settings
// @access  Private (Admin / HOD only)
export const updateSettings = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    
    // Save to settings table
    const { error } = await supabase
      .from('college_settings')
      .update({ value: enabled ? 'true' : 'false', updated_at: new Date().toISOString() })
      .eq('key', 'attendance_approval_enabled');

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `HOD Attendance approvals ${enabled ? 'enabled' : 'disabled'} successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Email templates
// @route   GET /api/attendance/templates
// @access  Private
export const getTemplates = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('attendance_notification_templates')
      .select('*');
    if (error) throw error;

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Email template
// @route   PUT /api/attendance/template/:id
// @access  Private
export const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, body } = req.body;

    const { error } = await supabase
      .from('attendance_notification_templates')
      .update({ subject, body, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Template updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit notification request
// @route   POST /api/attendance/notification/request
// @access  Private (Teacher only)
export const submitRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Only faculty can create warning alerts' });
    }

    const {
      student_id,
      student_ids,
      selected_recipients,
      message_type,
      custom_message,
      subject,
      message,
      attachments
    } = req.body;

    if ((!student_id && (!student_ids || student_ids.length === 0)) || !selected_recipients || !message_type) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const faculty = await getFacultyInfo(req.user.id || req.user._id);
    const teacherName = faculty?.full_name || req.user.full_name || req.user.name;

    let targetStudentIds = [];
    if (student_ids && Array.isArray(student_ids)) {
      targetStudentIds = student_ids;
    } else if (student_id) {
      targetStudentIds = [student_id];
    }

    // Fetch student details
    const { data: students, error: studErr } = await supabase
      .from('students')
      .select('*')
      .in('id', targetStudentIds);

    if (studErr) throw studErr;
    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'No student profiles found' });
    }

    // Compile student JSONB list
    const studentListJson = students.map(s => ({
      student_id: s.id,
      student_name: s.full_name,
      roll_number: s.roll_number,
      department: s.department,
      attendance_percentage: s.attendance_percentage,
      student_email: s.email,
      parent_email: s.parent_email
    }));

    const primaryStudent = students[0];

    const requestId = `REQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest = {
      id: requestId,
      teacher_id: req.user.id || req.user._id,
      teacher_name: teacherName,
      student_id: primaryStudent.id,
      student_name: primaryStudent.full_name,
      roll_number: primaryStudent.roll_number,
      department: primaryStudent.department,
      attendance_percentage: primaryStudent.attendance_percentage,
      selected_recipients: typeof selected_recipients === 'string' ? selected_recipients : JSON.stringify(selected_recipients),
      message_type,
      custom_message: custom_message || '',
      subject: subject || '',
      message: message || '',
      attachments: typeof attachments === 'string' ? attachments : JSON.stringify(attachments || []),
      ip_address: req.ip || req.connection?.remoteAddress || '',
      status: 'Pending HOD Approval',
      student_ids: JSON.stringify(studentListJson),
      created_at: new Date().toISOString()
    };

    const { error: insErr } = await supabase
      .from('attendance_notification_requests')
      .insert([newRequest]);

    if (insErr) throw insErr;

    res.status(201).json({
      success: true,
      message: 'Request submitted for HOD approval.',
      data: newRequest
    });

  } catch (error) {
    next(error);
  }
};


// Internal function to handle actual email sending and logs saving
async function executeEmailDispatch(request) {
  try {
    const studentId = request.student_id;
    const { data: student } = await supabase.from('students').select('*').eq('id', studentId).maybeSingle();
    if (!student) return;

    const recipients = typeof request.selected_recipients === 'string' 
      ? JSON.parse(request.selected_recipients)
      : (request.selected_recipients || []);

    const emailTargets = [];
    if (recipients.includes('Student')) emailTargets.push({ role: 'Student', email: student.email });
    if (recipients.includes('Parent')) emailTargets.push({ role: 'Parent', email: student.parent_email });
    
    const hod = await getHodDetails(student.department);
    if (recipients.includes('HOD') && hod) emailTargets.push({ role: 'HOD', email: hod.email });

    const teacher = await getClassTeacher(student.department, student.section);
    if (recipients.includes('Teacher') && teacher) emailTargets.push({ role: 'Teacher', email: teacher.email });

    let emailSubject = request.subject;
    let emailBody = request.message || request.custom_message;

    // Fallback template loading if subject/body is empty
    if (!emailSubject || !emailBody) {
      const { data: template } = await supabase
        .from('attendance_notification_templates')
        .select('*')
        .eq('name', request.message_type)
        .maybeSingle();

      if (template) {
        emailSubject = template.subject;
        emailBody = template.body;
      } else {
        emailSubject = `Attendance Notification Alert`;
        emailBody = `Dear {student_name}, Your attendance is currently at {attendance_percentage}%.`;
      }
    }

    // Placeholders replacement
    const resolvedSubject = emailSubject.replace(/{student_name}/g, student.full_name)
      .replace(/{roll_number}/g, student.roll_number)
      .replace(/{attendance_percentage}/g, String(student.attendance_percentage));

    const resolvedBody = emailBody.replace(/{student_name}/g, student.full_name)
      .replace(/{roll_number}/g, student.roll_number)
      .replace(/{attendance_percentage}/g, String(student.attendance_percentage))
      .replace(/\n/g, '<br/>');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="color: #4f46e5; border-bottom: 2px solid #eeebff; padding-bottom: 10px;">${resolvedSubject}</h3>
        <p>${resolvedBody}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #666;">This message was generated by ${request.teacher_name || 'Class Teacher'} via the College Management System.</p>
      </div>
    `;

    for (const target of emailTargets) {
      if (!target.email) continue;
      let status = 'Sent';
      let errDetails = null;

      try {
        await sendEmail({
          to: target.email,
          subject: resolvedSubject,
          html: htmlBody
        });
      } catch (err) {
        status = 'Failed';
        errDetails = err.message || String(err);
      }

      // Write dispatch log
      await supabase
        .from('attendance_notification_logs')
        .insert([{
          request_id: request.id,
          recipient_role: target.role,
          email_address: target.email,
          delivery_status: status,
          failed_reason: errDetails,
          created_at: new Date().toISOString()
        }]);
    }

    // Write to history
    await supabase
      .from('attendance_notification_history')
      .insert([{
        id: request.id,
        student_id: student.id,
        student_name: student.full_name,
        roll_number: student.roll_number,
        department: student.department,
        teacher_id: request.teacher_id,
        teacher_name: request.teacher_name,
        attendance_percentage: student.attendance_percentage,
        selected_recipients: request.selected_recipients,
        notification_type: request.message_type,
        subject: resolvedSubject,
        message: resolvedBody,
        status: 'Sent',
        created_at: request.created_at,
        sent_at: new Date().toISOString(),
        approved_by: request.approved_by,
        approved_at: request.approved_at,
        ip_address: request.ip_address
      }]);

    // Update status in requests
    await supabase
      .from('attendance_notification_requests')
      .update({ status: 'Sent', sent_at: new Date().toISOString() })
      .eq('id', request.id);

  } catch (error) {
    console.error("Error executing email dispatches:", error);
  }
}

// @desc    Teacher sends approved email warning notifications
// @route   POST /api/attendance/notification/send
// @access  Private (Teacher only)
export const sendApprovedNotification = async (req, res, next) => {
  try {
    const { id, recipients, customSubject, customBody, studentIds } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing request ID' });
    }

    const { data: request } = await supabase
      .from('attendance_notification_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Notification warning is not approved yet' });
    }

    // Determine target students
    let students = [];
    if (request.student_ids) {
      try {
        students = typeof request.student_ids === 'string' 
          ? JSON.parse(request.student_ids) 
          : request.student_ids;
      } catch (e) {
        students = [];
      }
    }
    
    // Fallback to old single student columns if student_ids is empty
    if (!students || students.length === 0) {
      if (request.student_id) {
        const { data: std } = await supabase
          .from('students')
          .select('*')
          .eq('id', request.student_id)
          .maybeSingle();
        if (std) {
          students = [{
            student_id: std.id,
            student_name: std.full_name,
            roll_number: std.roll_number,
            department: std.department,
            attendance_percentage: std.attendance_percentage,
            student_email: std.email,
            parent_email: std.parent_email
          }];
        }
      }
    }

    // Filter by studentIds if provided (teacher unchecked some)
    if (studentIds && Array.isArray(studentIds)) {
      students = students.filter(s => studentIds.includes(s.student_id));
    }

    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No students selected for notification dispatch' });
    }

    const chosenRecipients = recipients || ['Student'];

    // Send emails for each student
    for (const std of students) {
      const attendance = std.attendance_percentage;
      
      // Determine Subject and Body
      let resolvedSubject = '';
      let resolvedBody = '';

      if (customSubject && customBody) {
        resolvedSubject = customSubject
          .replace(/\{\{StudentName\}\}/g, std.student_name)
          .replace(/\{\{AttendancePercentage\}\}/g, String(attendance))
          .replace(/\{student_name\}/g, std.student_name)
          .replace(/\{attendance_percentage\}/g, String(attendance));
          
        resolvedBody = customBody
          .replace(/\{\{StudentName\}\}/g, std.student_name)
          .replace(/\{\{AttendancePercentage\}\}/g, String(attendance))
          .replace(/\{student_name\}/g, std.student_name)
          .replace(/\{attendance_percentage\}/g, String(attendance));
      } else {
        // Smart Template resolver
        if (attendance >= 75) {
          resolvedSubject = 'Friendly Reminder: Attendance Update';
          resolvedBody = `Dear ${std.student_name},\n\nYour current attendance is ${attendance}%.\n\nThis is a friendly reminder to maintain your regular attendance.\n\nPlease attend all upcoming classes regularly.\n\nRegards,\nCollege Management System`;
        } else if (attendance >= 65) {
          resolvedSubject = 'Attendance Warning';
          resolvedBody = `Dear ${std.student_name},\n\nYour current attendance is ${attendance}%.\n\nThis is below the required attendance criteria.\n\nPlease attend all upcoming classes regularly.\n\nCurrent Attendance: ${attendance}%\nRequired Attendance: 75%\n\nKindly contact your class teacher if you have any concerns.\n\nRegards,\nCollege Management System`;
        } else {
          resolvedSubject = 'Critical Attendance Warning';
          resolvedBody = `Dear ${std.student_name},\n\nYour current attendance is ${attendance}%.\n\nThis is critically low and you are at risk of detention.\n\nPlease attend all upcoming classes regularly to avoid academic consequences.\n\nCurrent Attendance: ${attendance}%\nRequired Attendance: 75%\n\nRegards,\nCollege Management System`;
        }
      }

      // parent customization
      let parentResolvedSubject = '';
      let parentResolvedBody = '';

      if (customSubject && customBody) {
        parentResolvedSubject = customSubject
          .replace(/\{\{StudentName\}\}/g, std.student_name)
          .replace(/\{\{AttendancePercentage\}\}/g, String(attendance))
          .replace(/\{student_name\}/g, std.student_name)
          .replace(/\{attendance_percentage\}/g, String(attendance));
          
        parentResolvedBody = customBody
          .replace(/\{\{StudentName\}\}/g, std.student_name)
          .replace(/\{\{AttendancePercentage\}\}/g, String(attendance))
          .replace(/\{student_name\}/g, std.student_name)
          .replace(/\{attendance_percentage\}/g, String(attendance));
      } else {
        if (attendance >= 75) {
          parentResolvedSubject = 'Friendly Reminder: Attendance Update for Your Child';
          parentResolvedBody = `Dear Parent,\n\nThis is to inform you that your child ${std.student_name} currently has ${attendance}% attendance.\n\nPlease ensure your child continues to attend classes regularly.\n\nRegards,\nCollege Management System`;
        } else if (attendance >= 65) {
          parentResolvedSubject = 'Attendance Alert for Your Child';
          parentResolvedBody = `Dear Parent,\n\nThis is to inform you that your child ${std.student_name} currently has ${attendance}% attendance.\n\nThe attendance is below the required college criteria.\n\nPlease ensure your child attends classes regularly to avoid academic consequences.\n\nRegards,\nCollege Management System`;
        } else {
          parentResolvedSubject = 'Critical Attendance Alert for Your Child';
          parentResolvedBody = `Dear Parent,\n\nThis is to notify you that your child ${std.student_name} currently has ${attendance}% attendance, which is critically low.\n\nYour child is at risk of detention from semester examinations.\n\nPlease contact the department immediately.\n\nRegards,\nCollege Management System`;
        }
      }

      // Email dispatch
      const targets = [];
      if (chosenRecipients.includes('Student') && std.student_email) {
        targets.push({ role: 'Student', email: std.student_email, subject: resolvedSubject, body: resolvedBody });
      }
      if (chosenRecipients.includes('Parent') && std.parent_email) {
        targets.push({ role: 'Parent', email: std.parent_email, subject: parentResolvedSubject, body: parentResolvedBody });
      }

      for (const target of targets) {
        let status = 'Delivered';
        let errDetails = null;

        try {
          const htmlBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #4f46e5; border-bottom: 2px solid #eeebff; padding-bottom: 10px;">${target.subject}</h3>
              <p>${target.body.replace(/\n/g, '<br/>')}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 11px; color: #666;">This message was generated by ${request.teacher_name || 'Class Teacher'} via the College Management System.</p>
            </div>
          `;
          await sendEmail({
            to: target.email,
            subject: target.subject,
            html: htmlBody
          });
        } catch (err) {
          status = 'Failed';
          errDetails = err.message || String(err);
        }

        // Write to log
        await supabase
          .from('attendance_notification_logs')
          .insert([{
            request_id: request.id,
            recipient_role: target.role,
            email_address: target.email,
            delivery_status: status,
            failed_reason: errDetails,
            created_at: new Date().toISOString()
          }]);
      }

      // Write to history
      await supabase
        .from('attendance_notification_history')
        .insert([{
          id: `HIST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          student_id: std.student_id,
          student_name: std.student_name,
          roll_number: std.roll_number,
          department: std.department,
          teacher_id: request.teacher_id,
          teacher_name: request.teacher_name,
          attendance_percentage: attendance,
          selected_recipients: JSON.stringify(chosenRecipients),
          notification_type: attendance >= 75 ? 'Friendly Reminder' : (attendance >= 65 ? 'Attendance Warning' : 'Critical Attendance Warning'),
          subject: resolvedSubject,
          message: resolvedBody,
          status: 'Sent',
          created_at: request.created_at,
          sent_at: new Date().toISOString(),
          approved_by: request.approved_by,
          approved_at: request.approved_at,
          ip_address: req.ip || req.connection?.remoteAddress || ''
        }]);
    }

    // Update status in requests
    await supabase
      .from('attendance_notification_requests')
      .update({ status: 'Sent', sent_at: new Date().toISOString() })
      .eq('id', request.id);

    res.status(200).json({
      success: true,
      message: 'Notification emails sent successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent warning history
// @route   GET /api/attendance/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const { requests } = req.query;

    if (userRole === 'hod' || requests === 'true') {
      let query = supabase
        .from('attendance_notification_requests')
        .select('*')
        .neq('status', 'Pending HOD Approval');

      if (userRole === 'hod') {
        const deptCode = await getHodDepartment(req.user);
        if (deptCode) {
          query = query.eq('department', deptCode);
        }
      } else {
        query = query.eq('teacher_id', req.user.id || req.user._id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    let query = supabase.from('attendance_notification_history').select('*');

    if (userRole === 'faculty') {
      query = query.eq('teacher_id', req.user.id || req.user._id);
    } else if (userRole === 'hod') {
      const deptCode = await getHodDepartment(req.user);
      if (deptCode) {
        query = query.eq('department', deptCode);
      }
    }

    const { data, error } = await query.order('sent_at', { ascending: false });
    if (error) throw error;

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending approvals for HOD
// @route   GET /api/attendance/pending
// @access  Private (HOD / Admin only)
export const getPending = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = supabase
      .from('attendance_notification_requests')
      .select('*')
      .in('status', ['Pending HOD Approval', 'Returned for Changes']);

    if (userRole === 'hod') {
      const deptCode = await getHodDepartment(req.user);
      if (deptCode) {
        query = query.eq('department', deptCode);
      }
    } else {
      // Teachers can see their pending or returned requests
      query = query.eq('teacher_id', req.user.id || req.user._id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve request
// @route   PUT /api/attendance/approve/:id
// @access  Private (HOD / Admin only)
export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const approverName = req.user.full_name || req.user.name || 'HOD';

    const { data: request } = await supabase
      .from('attendance_notification_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const { error } = await supabase
      .from('attendance_notification_requests')
      .update({
        status: 'Approved',
        approved_by: approverName,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // Send in-app notification to the teacher
    const notifId = `N-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase
      .from('faculty_notifications')
      .insert([{
        id: notifId,
        faculty_id: request.teacher_id,
        title: 'Your attendance notification request has been approved. You can now send attendance notifications.',
        type: 'System',
        priority: 'High',
        time: 'Just now',
        unread: true,
        created_at: new Date().toISOString()
      }]);

    res.status(200).json({ success: true, message: 'Request approved successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject request
// @route   PUT /api/attendance/reject/:id
// @access  Private (HOD / Admin only)
export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks, status = 'Rejected' } = req.body;

    const { data: request } = await supabase
      .from('attendance_notification_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const { error } = await supabase
      .from('attendance_notification_requests')
      .update({
        status: status,
        remarks: remarks || 'Requires revision'
      })
      .eq('id', id);

    if (error) throw error;

    // Send in-app notification to the teacher
    const notifId = `N-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const actionLabel = status === 'Returned for Changes' ? 'returned for changes' : 'rejected';
    await supabase
      .from('faculty_notifications')
      .insert([{
        id: notifId,
        faculty_id: request.teacher_id,
        title: `Your attendance notification request has been ${actionLabel} by HOD. Remarks: ${remarks || 'none'}`,
        type: 'System',
        priority: 'High',
        time: 'Just now',
        unread: true,
        created_at: new Date().toISOString()
      }]);

    res.status(200).json({ success: true, message: 'Request changes submitted.' });
  } catch (error) {
    next(error);
  }
};

