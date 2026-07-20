import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/sendEmail.js';
import { generateMonthlyAttendanceEmailTemplate } from '../utils/emailTemplates.js';

/**
 * Helper to find HOD details for a department
 */
export async function getHodDetails(departmentCode) {
  try {
    const { data: dept } = await supabase
      .from('departments')
      .select('head_of_department')
      .eq('code', departmentCode)
      .maybeSingle();

    if (dept && dept.head_of_department) {
      // Find the user email of this HOD
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'hod')
        .maybeSingle();
      
      return {
        name: dept.head_of_department,
        email: user?.email || 'hod@college.com'
      };
    }
  } catch (err) {
    console.error('Error fetching HOD details:', err);
  }
  return { name: 'Dr. Anjali Mehra', email: 'hod@college.com' };
}

/**
 * Helper to find Class Teacher for a student based on department & section
 */
export async function getClassTeacher(departmentCode, section) {
  try {
    const { data: facultyList } = await supabase
      .from('faculty')
      .select('*')
      .eq('department', departmentCode);

    if (facultyList && facultyList.length > 0) {
      // Try matching by assigned section
      for (const f of facultyList) {
        let sections = [];
        try {
          sections = typeof f.assigned_sections === 'string' 
            ? JSON.parse(f.assigned_sections) 
            : (f.assigned_sections || []);
        } catch (e) {}

        if (sections.includes(section)) {
          return { name: f.full_name, email: f.email };
        }
      }
      // Fallback to the first faculty in department
      return { name: facultyList[0].full_name, email: facultyList[0].email };
    }
  } catch (err) {
    console.error('Error fetching Class Teacher details:', err);
  }
  return { name: 'Dr. John Smith', email: 'faculty@college.com' };
}

/**
 * Helper to find Faculty teaching a specific subject
 */
export async function findFacultyForSubject(subjectName, departmentCode) {
  try {
    const { data: facultyList } = await supabase
      .from('faculty')
      .select('*')
      .eq('department', departmentCode);

    if (facultyList && facultyList.length > 0) {
      for (const f of facultyList) {
        let subjects = [];
        try {
          subjects = typeof f.assigned_subjects === 'string'
            ? JSON.parse(f.assigned_subjects)
            : (f.assigned_subjects || []);
        } catch (e) {}

        if (subjects.includes(subjectName)) {
          return f.full_name;
        }
      }
      return facultyList[0].full_name;
    }
  } catch (err) {
    console.error('Error finding faculty for subject:', err);
  }
  return 'Dr. John Smith';
}

/**
 * STEP 1 calculation scheduler execution.
 * Calculates attendance, finds students < 75%, and records them in the database below_75_students table.
 * NO emails are sent.
 */
export const runMonthlyAttendanceNotifications = async () => {
  console.log("⚙️ Starting Monthly Attendance Audit Calculation...");
  const results = {
    totalChecked: 0,
    below75Count: 0,
    success: true
  };

  try {
    // 1. Fetch all active students
    const { data: students, error: studentErr } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (studentErr) throw studentErr;
    if (!students || students.length === 0) {
      console.log("ℹ️ No active students found to process.");
      return results;
    }

    results.totalChecked = students.length;

    // 2. Fetch all attendance records to calculate subject-wise/overall percentages
    const { data: allAttendance, error: attErr } = await supabase
      .from('attendance')
      .select('*');

    if (attErr) throw attErr;

    // 3. Clear previous below_75_students list
    // In mock query builder or live supabase, we can delete all rows
    const { error: deleteErr } = await supabase
      .from('below_75_students')
      .delete()
      .neq('id', 'placeholder-nonexistent'); // standard way to delete all rows

    if (deleteErr) {
      console.warn("Warning clearing below_75_students table:", deleteErr);
    }

    const below75List = [];

    // Process each student
    for (const student of students) {
      // Filter attendance records for this student
      const studentAttendance = allAttendance 
        ? allAttendance.filter(a => a.student === student.id || a.student === student._id) 
        : [];
      
      // Calculate overall percentage
      let overallPercentage = student.attendance_percentage || 100.0;
      if (studentAttendance.length > 0) {
        const attended = studentAttendance.filter(a => 
          ['present', 'late', 'excused'].includes(a.status.toLowerCase())
        ).length;
        overallPercentage = Math.round((attended / studentAttendance.length) * 100 * 10) / 10;
      }

      // We only log students whose overall attendance is below 75%
      if (overallPercentage >= 75.0) {
        continue;
      }

      // Compile low attendance subjects (<75%)
      const subjectMap = {};
      studentAttendance.forEach(a => {
        const sub = a.subject || 'General';
        if (!subjectMap[sub]) {
          subjectMap[sub] = { total: 0, attended: 0 };
        }
        subjectMap[sub].total++;
        if (['present', 'late', 'excused'].includes(a.status.toLowerCase())) {
          subjectMap[sub].attended++;
        }
      });

      const lowAttendanceSubjects = [];
      for (const [subName, stats] of Object.entries(subjectMap)) {
        const pct = Math.round((stats.attended / stats.total) * 100 * 10) / 10;
        if (pct < 75.0) {
          const teacherName = await findFacultyForSubject(subName, student.department);
          lowAttendanceSubjects.push({
            subject: subName,
            percentage: pct,
            teacher: teacherName
          });
        }
      }

      // Fallback subject detail if no records exist (seeding/mocking default)
      if (lowAttendanceSubjects.length === 0) {
        const teacherName = await findFacultyForSubject('Data Structures', student.department);
        lowAttendanceSubjects.push({
          subject: 'Core Academics',
          percentage: overallPercentage,
          teacher: teacherName
        });
      }

      // Save student record
      const below75Record = {
        id: `B75-${student.id}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        student_id: student.id,
        student_name: student.full_name,
        roll_number: student.roll_number,
        department: student.department,
        year: student.year || 1,
        semester: student.semester || 1,
        section: student.section || 'A',
        attendance_percentage: overallPercentage,
        short_attendance_subjects: JSON.stringify(lowAttendanceSubjects),
        parent_name: student.parent_name || 'Guardian',
        parent_email: student.parent_email || 'parent@college.com',
        created_at: new Date().toISOString()
      };

      const { error: insertErr } = await supabase
        .from('below_75_students')
        .insert([below75Record]);

      if (insertErr) {
        console.error(`Error inserting below_75 record for student ${student.full_name}:`, insertErr);
      } else {
        results.below75Count++;
        below75List.push(below75Record);
      }
    }

    console.log(`✅ Completed monthly audit. Logged ${results.below75Count} students below 75%.`);
    return results;

  } catch (err) {
    console.error("Critical error in monthly audit calculation:", err);
    results.success = false;
    return results;
  }
};

/**
 * Dispatch Emails for an Approved Request
 */
export async function sendApprovedNotificationEmails({ requestId, recipients, messageType, customMessage }) {
  try {
    // 1. Fetch the request details
    const { data: request, error: reqErr } = await supabase
      .from('attendance_notification_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (reqErr || !request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // 2. Fetch the student details to verify current contacts
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', request.student_id)
      .maybeSingle();

    if (!student) {
      throw new Error(`Student not found: ${request.student_id}`);
    }

    const overallPercentage = Number(request.attendance_percentage);
    const lowAttendanceSubjects = typeof request.short_attendance_subjects === 'string'
      ? JSON.parse(request.short_attendance_subjects)
      : (request.short_attendance_subjects || []);

    const hodDetails = await getHodDetails(request.department);
    const teacherDetails = await getClassTeacher(request.department, student.section || 'A');

    // 3. Resolve destination email addresses for selected combination
    const emailTargets = [];
    if (recipients.includes('Student')) {
      emailTargets.push({ role: 'Student', email: student.email });
    }
    if (recipients.includes('Parent')) {
      emailTargets.push({ role: 'Parent', email: student.parent_email || 'parent@college.com' });
    }
    if (recipients.includes('HOD')) {
      emailTargets.push({ role: 'HOD', email: hodDetails.email });
    }
    if (recipients.includes('Teacher')) {
      emailTargets.push({ role: 'Faculty', email: teacherDetails.email });
    }

    // 4. Generate Email body
    let emailHtml = '';
    const resolvedMessageType = messageType || request.message_type || 'Warning';

    if (resolvedMessageType === 'Custom Message') {
      const msg = customMessage || request.custom_message || 'Please maintain overall attendance above 75% to avoid detention.';
      emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #4f46e5;">Monthly Attendance Warning Notice</h2>
          <p>Dear Stakeholder,</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 15px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; line-height: 1.6;">${msg}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; font-weight: bold;">Student Name:</td><td>${student.full_name}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; font-weight: bold;">Roll Number:</td><td>${student.roll_number}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 6px 0; font-weight: bold;">Overall Attendance:</td><td style="color: #ef4444; font-weight: bold;">${overallPercentage}%</td></tr>
          </table>
          <p style="font-size: 11px; color: #64748b; margin-top: 20px;">This is a system generated email sent on behalf of ${request.teacher_name || 'Class Teacher'}.</p>
        </div>
      `;
    } else {
      // Standard slabs template
      emailHtml = generateMonthlyAttendanceEmailTemplate({
        student: student,
        attendancePercentage: overallPercentage,
        slab: resolvedMessageType,
        lowAttendanceSubjects: lowAttendanceSubjects,
        classTeacher: teacherDetails.name,
        hod: hodDetails.name,
        collegeName: 'Campusly Institute of Technology'
      });
    }

    // 5. Send out Emails and log to database
    let totalEmailsSent = 0;
    let errors = [];

    for (const target of emailTargets) {
      if (!target.email) continue;
      
      let status = 'Sent';
      let errorDetails = null;

      try {
        const info = await sendEmail({
          to: target.email,
          subject: `Monthly Attendance Warning (${resolvedMessageType}) - ${student.full_name}`,
          html: emailHtml
        });

        if (!info) {
          status = 'Failed';
          errorDetails = 'SMTP dispatch failed (returned null)';
          errors.push(`${target.role}: SMTP null`);
        } else {
          totalEmailsSent++;
        }
      } catch (err) {
        status = 'Failed';
        errorDetails = err.message || String(err);
        errors.push(`${target.role}: ${errorDetails}`);
      }

      // Log in the legacy attendance_notifications table for historical records
      await supabase
        .from('attendance_notifications')
        .insert([{
          student_id: request.student_id,
          student_name: request.student_name,
          roll_number: request.roll_number,
          department: request.department,
          attendance_percentage: overallPercentage,
          notification_type: resolvedMessageType,
          recipient_role: target.role,
          recipient_email: target.email,
          status,
          error_details: errorDetails
        }]);
    }

    // 6. Update the request status
    const status = totalEmailsSent > 0 ? 'Sent' : 'Failed';
    const remarks = errors.length > 0 ? `Failed dispatches: ${errors.join(', ')}` : null;

    const { error: updateErr } = await supabase
      .from('attendance_notification_requests')
      .update({
        status,
        remarks: remarks || request.remarks,
        selected_recipients: typeof recipients === 'string' ? recipients : JSON.stringify(recipients),
        message_type: resolvedMessageType,
        custom_message: customMessage || request.custom_message,
        sent_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateErr) throw updateErr;

    return {
      success: true,
      sentCount: totalEmailsSent,
      status
    };

  } catch (err) {
    console.error("Error in dispatching approved warnings:", err);
    throw err;
  }
}
