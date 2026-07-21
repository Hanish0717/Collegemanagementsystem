import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/sendEmail.js';
import { dispatchNotification } from '../services/notificationService.js';

// Helper to send notifications
async function sendNotification(table, notification) {
  try {
    await supabase.from(table).insert(notification);
  } catch (err) {
    console.error(`Failed to send notification to ${table}:`, err.message);
  }
}

function getDynamicStatus(exam) {
  if (exam.status === 'Results Published' || exam.status === 'Published') {
    return 'Results Published';
  }
  const todayStr = new Date().toISOString().split('T')[0];
  const startStr = typeof exam.start_date === 'string' ? exam.start_date.split('T')[0] : new Date(exam.start_date).toISOString().split('T')[0];
  const endStr = typeof exam.end_date === 'string' ? exam.end_date.split('T')[0] : new Date(exam.end_date).toISOString().split('T')[0];
  
  if (todayStr < startStr) {
    return 'Upcoming';
  } else if (todayStr >= startStr && todayStr <= endStr) {
    return 'Ongoing';
  } else {
    return exam.status === 'Results Pending' || exam.status === 'Completed' ? exam.status : 'Completed';
  }
}

/**
 * 1. Exam Dashboard Metrics
 */
export async function getExamStats(req, res, next) {
  try {
    const { data: exams, error } = await supabase.from('exams').select('status, start_date, end_date');
    if (error) throw error;

    const stats = {
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      resultsPublished: 0,
      pendingResults: 0
    };

    exams.forEach(e => {
      const status = getDynamicStatus(e).toLowerCase();
      if (status === 'upcoming') stats.upcoming++;
      else if (status === 'ongoing') stats.ongoing++;
      else if (status === 'completed') stats.completed++;
      else if (status === 'results pending' || status === 'pending results') stats.pendingResults++;
      else if (status === 'results published' || status === 'published') stats.resultsPublished++;
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get Exams List
 */
export async function getExams(req, res, next) {
  try {
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) throw error;

    const enrichedExams = exams.map(e => ({
      ...e,
      status: getDynamicStatus(e)
    }));

    res.json({ success: true, data: enrichedExams });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Exam
 */
export async function createExam(req, res, next) {
  try {
    const { name, type, department, year, semester, start_date, end_date } = req.body;
    
    if (!name || !type || !department || !year || !semester || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const { data: newExam, error } = await supabase
      .from('exams')
      .insert({
        name,
        type,
        department,
        year: parseInt(year),
        semester: parseInt(semester),
        start_date,
        end_date,
        status: 'Upcoming'
      })
      .select()
      .single();

    if (error) throw error;

    // Asynchronously notify students & parents
    (async () => {
      try {
        const { data: students } = await supabase
          .from('students')
          .select('id, user_id, email, parent_email, full_name')
          .eq('department', department)
          .eq('year', parseInt(year))
          .eq('semester', parseInt(semester));

        if (students && students.length > 0) {
          for (const s of students) {
            dispatchNotification({
              userId: s.user_id,
              studentId: s.id,
              email: s.email,
              parentEmail: s.parent_email,
              type: 'Academic',
              title: `New Exam Scheduled: ${name}`,
              message: `Dear ${s.full_name}, a new exam "${name}" (${type}) has been scheduled for your semester. Duration: ${start_date} to ${end_date}.`,
              priority: 'Medium'
            });
          }
        }
      } catch (err) {
        console.error('Failed to dispatch exam creation notifications:', err);
      }
    })();

    res.status(201).json({ success: true, data: newExam });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Exam status or info
 */
export async function updateExam(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedExam, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send notifications if results are published
    if (updates.status === 'Results Published') {
      // Find students in the department/year/semester of the exam
      const { data: students } = await supabase
        .from('students')
        .select('id, user_id, email, parent_email, full_name')
        .eq('department', updatedExam.department)
        .eq('year', updatedExam.year)
        .eq('semester', updatedExam.semester);

      if (students && students.length > 0) {
        // Dispatch notifications via the centralized system
        (async () => {
          console.log(`[Results Dispatcher] Sending ${students.length} student/parent notifications...`);
          for (const s of students) {
            dispatchNotification({
              userId: s.user_id,
              studentId: s.id,
              email: s.email,
              parentEmail: s.parent_email,
              type: 'Academic',
              title: `Semester Results Published: ${updatedExam.name}`,
              message: `Dear ${s.full_name}, your academic results for ${updatedExam.name} have been officially published. Please view them in your dashboard.`,
              priority: 'High'
            });
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        })();
      }

      // Notify Faculty in-app
      const fNotifId = 'FN-' + Math.random().toString(36).substr(2, 9);
      await sendNotification('faculty_notifications', {
        id: fNotifId,
        title: `Results published for ${updatedExam.name} (${updatedExam.department})`,
        type: 'Academic',
        priority: 'High',
        time: 'Just now',
        unread: true
      });

      // Get Faculty Emails to Notify via email
      const { data: facultyMembers } = await supabase
        .from('faculty')
        .select('email, full_name')
        .eq('department', updatedExam.department);

      if (facultyMembers && facultyMembers.length > 0) {
        const facultyEmailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">Exam Results Published</h2>
            <p style="color: #334155; font-size: 15px;">Dear Faculty Member,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">The examination results for <strong>${updatedExam.name}</strong> (${updatedExam.department} - Year ${updatedExam.year} / Sem ${updatedExam.semester}) have been published and locked for student/parent viewing.</p>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
              Invigilators and subject faculty can access the analytics and departmental summary statistics in the faculty portal.
            </p>
            <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 20px; margin-bottom: 0;">Academic Administration Office</p>
          </div>
        `;

        // Async faculty email dispatch in background
        (async () => {
          console.log(`[Results Faculty Email Dispatcher] Sending ${facultyMembers.length} faculty emails in background...`);
          for (const f of facultyMembers) {
            if (f.email) {
              sendEmail({
                to: f.email,
                subject: `Results Published: ${updatedExam.name}`,
                html: facultyEmailHtml
              }).catch(err => console.error(`[Background Results Faculty Email Error] Faculty: ${f.email}, error:`, err));
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        })();
      }

      // Notify Admin
      const aNotifId = 'AN-' + Math.random().toString(36).substr(2, 9);
      await sendNotification('admin_notifications', {
        id: aNotifId,
        title: `Results published for ${updatedExam.name}`,
        category: 'Academic',
        time: 'Just now',
        unread: true
      });
    }

    res.json({ success: true, data: updatedExam });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Exam
 */
export async function deleteExam(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Get Exam Timetable
 */
export async function getExamTimetable(req, res, next) {
  try {
    const { id: exam_id } = req.params;
    const { data: schedules, error } = await supabase
      .from('exam_timetables')
      .select('*')
      .eq('exam_id', exam_id)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
}

export async function saveExamTimetable(req, res, next) {
  try {
    const { id: exam_id } = req.params;
    const { schedules } = req.body; // array of: { subject, date, time, hall, duration }

    // First clear existing
    await supabase.from('exam_timetables').delete().eq('exam_id', exam_id);

    if (schedules && schedules.length > 0) {
      const inserts = schedules.map(s => ({
        exam_id,
        subject: s.subject,
        date: s.date,
        time: s.time,
        hall: s.hall,
        duration: s.duration
      }));

      const { error } = await supabase.from('exam_timetables').insert(inserts);
      if (error) throw error;
    }

    // Get Exam Details
    const { data: exam } = await supabase.from('exams').select('*').eq('id', exam_id).single();

    if (exam) {
      // Find students to notify
      const { data: students } = await supabase
        .from('students')
        .select('id, user_id, email, parent_email, full_name')
        .eq('department', exam.department)
        .eq('year', exam.year)
        .eq('semester', exam.semester);

      let scheduleRowsHtml = '';
      if (schedules && schedules.length > 0) {
        schedules.forEach(s => {
          const formattedDate = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
          scheduleRowsHtml += `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #1e293b;">${s.subject}</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #475569;">${formattedDate}</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #475569;">${s.time}</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #475569;">${s.hall}</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #475569;">${s.duration}</td>
            </tr>
          `;
        });
      }

      if (students && students.length > 0) {
        // Dispatch notifications via the centralized system
        (async () => {
          console.log(`[Timetable Dispatcher] Sending ${students.length} student/parent notifications...`);
          for (const s of students) {
            dispatchNotification({
              userId: s.user_id,
              studentId: s.id,
              email: s.email,
              parentEmail: s.parent_email,
              type: 'Academic',
              title: `Exam Timetable Published: ${exam.name}`,
              message: `Dear ${s.full_name}, the official exam timetable for ${exam.name} has been published. Please check the portal to view exam dates, times, and halls.`,
              priority: 'High'
            });
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        })();
      }

      // Notify Faculty via database
      const fNotifId = 'FN-' + Math.random().toString(36).substr(2, 9);
      await sendNotification('faculty_notifications', {
        id: fNotifId,
        title: `Exam schedule published for ${exam.department} - ${exam.name}`,
        type: 'Academic',
        priority: 'High',
        time: 'Just now',
        unread: true
      });

      // Get Faculty Emails to Notify via email
      const { data: facultyMembers } = await supabase
        .from('faculty')
        .select('email, full_name')
        .eq('department', exam.department);

      if (facultyMembers && facultyMembers.length > 0) {
        const facultyEmailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">Exam Timetable Published</h2>
            <p style="color: #334155; font-size: 15px;">Dear Faculty Member,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">The examination timetable for <strong>${exam.name}</strong> (${exam.department} - Year ${exam.year} / Sem ${exam.semester}) has been published. Please review the schedule below for invigilation planning and curriculum review:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; color: #1e293b; font-weight: 600;">Subject</th>
                  <th style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; color: #1e293b; font-weight: 600;">Date</th>
                  <th style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; color: #1e293b; font-weight: 600;">Time</th>
                  <th style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; color: #1e293b; font-weight: 600;">Hall</th>
                  <th style="padding: 12px 10px; border: 1px solid #e2e8f0; text-align: left; color: #1e293b; font-weight: 600;">Duration</th>
                </tr>
              </thead>
              <tbody>
                ${scheduleRowsHtml || '<tr><td colspan="5" style="text-align: center; padding: 12px; color: #64748b;">No schedule slots added yet.</td></tr>'}
              </tbody>
            </table>
            
            <p style="margin-top: 24px; color: #64748b; font-size: 13px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              Please make necessary arrangements for invigilation duties.
            </p>
            <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 20px; margin-bottom: 0;">Academic Administration Office</p>
          </div>
        `;

        // Async faculty email dispatch in background
        (async () => {
          console.log(`[Timetable Faculty Email Dispatcher] Sending ${facultyMembers.length} faculty emails in background...`);
          for (const f of facultyMembers) {
            if (f.email) {
              sendEmail({
                to: f.email,
                subject: `Exam Timetable Published: ${exam.name}`,
                html: facultyEmailHtml
              }).catch(err => console.error(`[Background Timetable Faculty Email Error] Faculty: ${f.email}, error:`, err));
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        })();
      }

      // Notify Admin
      const aNotifId = 'AN-' + Math.random().toString(36).substr(2, 9);
      await sendNotification('admin_notifications', {
        id: aNotifId,
        title: `Exam timetable published for ${exam.name}`,
        category: 'Academic',
        time: 'Just now',
        unread: true
      });
    }

    res.json({ success: true, message: 'Timetable saved and notifications delivered.' });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Hall Ticket Eligibility Check & List
 */
export async function getHallTicketsEligibility(req, res, next) {
  try {
    const { id: exam_id } = req.params;

    // Get exam department, year, semester
    const { data: exam, error: examErr } = await supabase
      .from('exams')
      .select('*')
      .eq('id', exam_id)
      .single();

    if (examErr) throw examErr;

    // Get students matching exam parameters
    const { data: students, error: studentErr } = await supabase
      .from('students')
      .select('id, full_name, roll_number, department, year, semester, attendance_percentage')
      .eq('department', exam.department)
      .eq('year', exam.year)
      .eq('semester', exam.semester);

    if (studentErr) throw studentErr;

    // Get fees and hall tickets
    const { data: feesList } = await supabase
      .from('fees')
      .select('student, amount, paid_amount, status');

    const { data: hallTickets } = await supabase
      .from('hall_tickets')
      .select('*')
      .eq('exam_id', exam_id);

    const feeMap = {};
    if (feesList) {
      feesList.forEach(f => {
        const sId = f.student;
        if (!feeMap[sId]) feeMap[sId] = { totalUnpaid: 0 };
        if (f.status !== 'Paid' && f.status !== 'paid') {
          feeMap[sId].totalUnpaid += (Number(f.amount) - Number(f.paid_amount));
        }
      });
    }

    const ticketMap = {};
    if (hallTickets) {
      hallTickets.forEach(t => {
        ticketMap[t.student_id] = t;
      });
    }

    const studentsEligibility = students.map(s => {
      const unpaidFees = feeMap[s.id]?.totalUnpaid || 0;
      const attendance = Number(s.attendance_percentage || 100);
      const feeEligible = unpaidFees <= 0;
      const attendanceEligible = attendance >= 75.0;

      const ticket = ticketMap[s.id];

      return {
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        department: s.department,
        year: s.year,
        semester: s.semester,
        attendance_percentage: attendance,
        unpaid_fees: unpaidFees,
        feeEligible,
        attendanceEligible,
        eligible: feeEligible && attendanceEligible,
        status: ticket?.status || 'Not Generated',
        seat_number: ticket?.seat_number || null
      };
    });

    res.json({ success: true, data: studentsEligibility });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve Hall Ticket
 */
export async function approveHallTicket(req, res, next) {
  try {
    const { id: exam_id } = req.params;
    const { student_id, seat_number, status } = req.body;

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const { data: existingTicket } = await supabase
      .from('hall_tickets')
      .select('*')
      .eq('student_id', student_id)
      .eq('exam_id', exam_id)
      .maybeSingle();

    let result;
    if (existingTicket) {
      const { data, error } = await supabase
        .from('hall_tickets')
        .update({
          seat_number: seat_number || existingTicket.seat_number,
          status: status || 'Approved',
          approved_by: req.user?.id
        })
        .eq('id', existingTicket.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const generatedSeatNum = seat_number || `S-${Math.floor(100 + Math.random() * 900)}`;
      const { data, error } = await supabase
        .from('hall_tickets')
        .insert({
          student_id,
          exam_id,
          seat_number: generatedSeatNum,
          status: 'Approved',
          approved_by: req.user?.id
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    try {
      const { data: student } = await supabase
        .from('students')
        .select('full_name, email, parent_email, user_id')
        .eq('id', student_id)
        .maybeSingle();

      const { data: exam } = await supabase
        .from('exams')
        .select('name')
        .eq('id', exam_id)
        .maybeSingle();

      if (student && exam) {
        dispatchNotification({
          userId: student.user_id,
          studentId: student_id,
          email: student.email,
          parentEmail: student.parent_email,
          type: 'Academic',
          title: `Hall Ticket Generated: ${exam.name}`,
          message: `Dear ${student.full_name}, your hall ticket for "${exam.name}" has been generated. Seat Number: ${result.seat_number}. Status: ${result.status}.`,
          priority: 'Medium'
        });
      }
    } catch (notifErr) {
      console.error('Failed to send hall ticket notification:', notifErr);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Results & Marks Upload
 */
export async function getExamResults(req, res, next) {
  try {
    const { id: exam_id } = req.params;
    const { subject } = req.query; // Filter by subject

    const { data: exam } = await supabase.from('exams').select('*').eq('id', exam_id).single();
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Get students in this exam
    const { data: students } = await supabase
      .from('students')
      .select('id, user_id, full_name, roll_number, email')
      .eq('department', exam.department)
      .eq('year', exam.year)
      .eq('semester', exam.semester);

    if (!students) return res.json({ success: true, data: [] });

    // Get student users reference ids to join results
    const { data: users } = await supabase.from('users').select('id, email').eq('role', 'student');
    const userMap = {};
    if (users) {
      users.forEach(u => {
        userMap[u.email.toLowerCase()] = u.id;
      });
    }

    // Get marks records
    const { data: resultsList } = await supabase
      .from('results')
      .select('*')
      .eq('semester', exam.semester)
      .eq('exam_id', exam_id);

    const resultMap = {};
    if (resultsList) {
      resultsList.forEach(r => {
        const key = `${r.student}_${r.subject.toLowerCase()}`;
        resultMap[key] = r;
      });
    }

    const data = students.map(s => {
      const studentUserId = s.user_id || userMap[s.email.toLowerCase()] || s.id;
      const key = `${studentUserId}_${(subject || '').toLowerCase()}`;
      const resRecord = resultMap[key];

      return {
        result_id: resRecord ? resRecord.id : null,
        student_id: s.id,
        user_id: studentUserId,
        full_name: s.full_name,
        roll_number: s.roll_number,
        marks: resRecord ? resRecord.marks : null,
        internal_marks: resRecord ? resRecord.internal_marks : null,
        external_marks: resRecord ? resRecord.external_marks : null,
        grace_applied: resRecord ? resRecord.grace_applied : false,
        grace_marks: resRecord ? resRecord.grace_marks : 0,
        grade: resRecord ? resRecord.grade : '',
        credits: resRecord ? resRecord.credits : 3
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * Save Exam Results
 */
export async function saveExamResults(req, res, next) {
  try {
    const { id: exam_id } = req.params;
    const { subject, marksData } = req.body; // marksData: array of { student_user_id, marks, internal_marks, external_marks, grade, credits }

    if (!subject || !marksData) {
      return res.status(400).json({ success: false, message: 'Subject and marksData are required' });
    }

    const { data: exam } = await supabase.from('exams').select('*').eq('id', exam_id).single();
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    for (const m of marksData) {
      let internal = m.internal_marks !== undefined && m.internal_marks !== null ? parseFloat(m.internal_marks) : null;
      let external = m.external_marks !== undefined && m.external_marks !== null ? parseFloat(m.external_marks) : null;
      let total;

      if (internal !== null || external !== null) {
        total = (internal || 0) + (external || 0);
      } else {
        total = parseInt(m.marks || 0);
        internal = Math.round(total * 0.3);
        external = total - internal;
      }

      // Borderline Grace Marks Logic:
      // If total score is 38 or 39, and internal score is >= 18 out of 30, add up to 2 grace marks to push them to 40 (passing)
      let graceApplied = false;
      let graceMarksVal = 0;
      if (total >= 38 && total < 40 && internal >= 18) {
        graceMarksVal = 40 - total;
        total = 40;
        graceApplied = true;
      }

      // Grade Calculation
      let grade = 'F';
      if (total >= 90) grade = 'O';
      else if (total >= 80) grade = 'A+';
      else if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B+';
      else if (total >= 50) grade = 'B';
      else if (total >= 40) grade = 'C';

      // Find if result already exists for student, subject, semester, and exam
      const { data: existing } = await supabase
        .from('results')
        .select('*')
        .eq('student', m.student_user_id)
        .eq('subject', subject)
        .eq('semester', exam.semester)
        .eq('exam_id', exam_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('results')
          .update({
            marks: total,
            internal_marks: internal,
            external_marks: external,
            grade,
            grace_applied: graceApplied,
            grace_marks: graceMarksVal,
            credits: parseInt(m.credits || 3),
            exam_id
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('results')
          .insert({
            student: m.student_user_id,
            subject,
            semester: exam.semester,
            marks: total,
            internal_marks: internal,
            external_marks: external,
            grade,
            grace_applied: graceApplied,
            grace_marks: graceMarksVal,
            credits: parseInt(m.credits || 3),
            exam_id
          });
      }
    }

    res.json({ success: true, message: 'Marks updated successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Exam Analytics (Pass/Fail percentages, department performance)
 */
export async function getExamAnalytics(req, res, next) {
  try {
    const { id: exam_id } = req.params;

    const { data: exam } = await supabase.from('exams').select('*').eq('id', exam_id).single();
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Fetch results
    const { data: resultsList, error } = await supabase
      .from('results')
      .select('*')
      .eq('exam_id', exam_id);

    if (error) throw error;

    if (!resultsList || resultsList.length === 0) {
      return res.json({
        success: true,
        data: {
          passPercentage: 0,
          failPercentage: 0,
          averageMarks: 0,
          totalSubmissions: 0,
          topStudents: []
        }
      });
    }

    let passCount = 0;
    let failCount = 0;
    let sumMarks = 0;

    resultsList.forEach(r => {
      sumMarks += Number(r.marks || 0);
      if (Number(r.marks || 0) >= 40) {
        passCount++;
      } else {
        failCount++;
      }
    });

    const total = resultsList.length;
    const passPercentage = Math.round((passCount / total) * 100);
    const failPercentage = 100 - passPercentage;
    const averageMarks = Math.round(sumMarks / total);

    // Get student profiles details
    const studentUserIds = resultsList.map(r => r.student);
    const { data: studentsList } = await supabase
      .from('students')
      .select('id, full_name, roll_number, email');
    const { data: users } = await supabase.from('users').select('id, email').eq('role', 'student');
    const emailToStudentMap = {};
    if (studentsList) {
      studentsList.forEach(s => {
        emailToStudentMap[s.email.toLowerCase()] = s;
      });
    }
    const userIdToStudentMap = {};
    if (users) {
      users.forEach(u => {
        const profile = emailToStudentMap[u.email.toLowerCase()];
        if (profile) {
          userIdToStudentMap[u.id] = profile;
        }
      });
    }

    // Top students
    const studentAggregates = {};
    resultsList.forEach(r => {
      const studentId = r.student;
      if (!studentAggregates[studentId]) {
        studentAggregates[studentId] = { sum: 0, count: 0 };
      }
      studentAggregates[studentId].sum += Number(r.marks || 0);
      studentAggregates[studentId].count++;
    });

    const topStudents = Object.keys(studentAggregates).map(uid => {
      const agg = studentAggregates[uid];
      const studentInfo = userIdToStudentMap[uid] || { full_name: 'Student', roll_number: uid };
      return {
        full_name: studentInfo.full_name,
        roll_number: studentInfo.roll_number,
        averageMarks: Math.round(agg.sum / agg.count)
      };
    }).sort((a, b) => b.averageMarks - a.averageMarks).slice(0, 5);

    res.json({
      success: true,
      data: {
        passPercentage,
        failPercentage,
        averageMarks,
        totalSubmissions: total,
        topStudents
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 15. Create offered course (Exam Cell / Admin)
 */
export async function createCourse(req, res, next) {
  try {
    const { course_code, course_name, credits, course_type, department, year, semester, mentor_id } = req.body;
    if (!course_code || !course_name || credits === undefined || !course_type || !department || !year || !semester) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        course_code,
        course_name,
        credits: Number(credits),
        course_type,
        department,
        year: Number(year),
        semester: Number(semester),
        mentor_id: mentor_id || null
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('UNIQUE')) {
        return res.status(400).json({ success: false, message: 'Course Code must be unique. A course with this code already exists.' });
      }
      throw error;
    }
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 16. Get offered courses (shared)
 */
export async function getCourses(req, res, next) {
  try {
    const { department, year, semester } = req.query;
    let query = supabase.from('courses').select('*, mentor:faculty(*)');
    if (department) query = query.eq('department', department);
    if (year) query = query.eq('year', Number(year));
    if (semester) query = query.eq('semester', Number(semester));

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 17. Register a student for a course (Student)
 */
export async function registerCourse(req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    // Find student profile matching the logged-in user
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, year, semester')
      .eq('user_id', req.user.id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Insert course registration
    const { data, error } = await supabase
      .from('student_course_registrations')
      .insert({
        student_id: student.id,
        course_id: courseId,
        semester: course.semester,
        year: course.year,
        status: 'Registered'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('UNIQUE')) {
        return res.status(400).json({ success: false, message: 'You have already registered for this course' });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 18. Get my registrations (Student)
 */
export async function getMyRegistrations(req, res, next) {
  try {
    // Find student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { data: registrations, error } = await supabase
      .from('student_course_registrations')
      .select('*, courses:courses(*)')
      .eq('student_id', student.id);

    if (error) throw error;

    // Fetch mentors for the courses if any exist to solve nested relation limitation in the query builder
    const courseIds = registrations.map(r => r.courses?.id).filter(Boolean);
    if (courseIds.length > 0) {
      const { data: coursesWithMentors } = await supabase
        .from('courses')
        .select('*, mentor:faculty(*)')
        .in('id', courseIds);

      if (coursesWithMentors) {
        const courseMap = new Map(coursesWithMentors.map(c => [c.id, c]));
        registrations.forEach(r => {
          if (r.courses?.id) {
            r.courses = courseMap.get(r.courses.id) || r.courses;
          }
        });
      }
    }

    res.json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------
// Advanced Exam Cell Upgrades Endpoints
// -------------------------------------------------------------

/**
 * 23. Request Marks Correction (Faculty / Admin)
 */
export async function requestMarksCorrection(req, res, next) {
  try {
    const { result_id, new_internal_marks, new_external_marks, reason } = req.body;
    if (!result_id || new_internal_marks === undefined || new_external_marks === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'result_id, new_internal_marks, new_external_marks, and reason are required' });
    }

    const { data: result, error: resultErr } = await supabase
      .from('results')
      .select('*')
      .eq('id', result_id)
      .single();

    if (resultErr || !result) {
      return res.status(404).json({ success: false, message: 'Result record not found' });
    }

    const { data, error } = await supabase
      .from('marks_correction_requests')
      .insert({
        result_id,
        requested_by: req.user.id,
        old_internal_marks: result.internal_marks || 0.00,
        old_external_marks: result.external_marks || result.marks || 0.00,
        new_internal_marks: parseFloat(new_internal_marks),
        new_external_marks: parseFloat(new_external_marks),
        reason,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 24. Get Pending Correction Requests (Admin / HOD / CoE)
 */
export async function getPendingCorrections(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('marks_correction_requests')
      .select('*, result:results(*), requester:users(*)')
      .eq('status', 'Pending')
      .order('requested_at', { ascending: false });

    if (error) throw error;

    // Join students profile to resolve roll number & name of the student in results
    const studentUserIds = data.map(d => d.result?.student).filter(Boolean);
    let studentMap = {};
    if (studentUserIds.length > 0) {
      const { data: students } = await supabase
        .from('students')
        .select('user_id, full_name, roll_number')
        .in('user_id', studentUserIds);

      if (students) {
        students.forEach(s => {
          studentMap[s.user_id] = s;
        });
      }
    }

    const enriched = data.map(d => ({
      ...d,
      student_profile: d.result?.student ? studentMap[d.result.student] : null
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * 25. Approve/Reject Marks Correction (Admin / HOD / CoE)
 */
export async function approveMarksCorrection(req, res, next) {
  try {
    const { request_id, action, remarks } = req.body;
    if (!request_id || !action || !['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'request_id and action (Approved/Rejected) are required' });
    }

    const { data: request, error: reqErr } = await supabase
      .from('marks_correction_requests')
      .select('*, result:results(*)')
      .eq('id', request_id)
      .single();

    if (reqErr || !request) {
      return res.status(404).json({ success: false, message: 'Correction request not found' });
    }

    if (action === 'Approved') {
      const internal = parseFloat(request.new_internal_marks);
      const external = parseFloat(request.new_external_marks);
      let total = internal + external;

      // Borderline Grace Marks Logic:
      let graceApplied = false;
      let graceMarksVal = 0;
      if (total >= 38 && total < 40 && internal >= 18) {
        graceMarksVal = 40 - total;
        total = 40;
        graceApplied = true;
      }

      // Grade Calculation
      let grade = 'F';
      if (total >= 90) grade = 'O';
      else if (total >= 80) grade = 'A+';
      else if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B+';
      else if (total >= 50) grade = 'B';
      else if (total >= 40) grade = 'C';

      // Update Result record
      const { error: updateErr } = await supabase
        .from('results')
        .update({
          marks: total,
          internal_marks: internal,
          external_marks: external,
          grade,
          grace_applied: graceApplied,
          grace_marks: graceMarksVal
        })
        .eq('id', request.result_id);

      if (updateErr) throw updateErr;
    }

    // Update Request status
    const { data: updatedRequest, error: updateRequestErr } = await supabase
      .from('marks_correction_requests')
      .update({
        status: action,
        reviewed_by: req.user.id,
        reviewer_remarks: remarks || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', request_id)
      .select()
      .single();

    if (updateRequestErr) throw updateRequestErr;

    res.json({ success: true, data: updatedRequest });
  } catch (err) {
    next(err);
  }
}

/**
 * 26. Extended Exam Analytics (Rank list, At-Risk, Branch Pass comparison)
 */
export async function getExtendedAnalytics(req, res, next) {
  try {
    const { id: exam_id } = req.params;

    const { data: exam, error: examErr } = await supabase
      .from('exams')
      .select('*')
      .eq('id', exam_id)
      .single();

    if (examErr || !exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Get all results
    const { data: results, error: resultsErr } = await supabase
      .from('results')
      .select('*')
      .eq('exam_id', exam_id);

    if (resultsErr) throw resultsErr;

    // Get all students for attendance matching
    const { data: students, error: studentErr } = await supabase
      .from('students')
      .select('id, user_id, full_name, roll_number, department, attendance_percentage')
      .eq('department', exam.department)
      .eq('year', exam.year)
      .eq('semester', exam.semester);

    if (studentErr) throw studentErr;

    const studentMap = {};
    students.forEach(s => {
      studentMap[s.user_id || s.id] = s;
    });

    // 1. Department pass rate calculations
    const branchStats = {};
    let totalPassed = 0;
    let totalFailed = 0;
    let sumMarks = 0;

    results.forEach(r => {
      const studentProfile = studentMap[r.student];
      const dept = studentProfile?.department || exam.department;

      if (!branchStats[dept]) {
        branchStats[dept] = { total: 0, passed: 0 };
      }
      branchStats[dept].total++;
      sumMarks += Number(r.marks || 0);

      if (Number(r.marks || 0) >= 40) {
        branchStats[dept].passed++;
        totalPassed++;
      } else {
        totalFailed++;
      }
    });

    const branchData = Object.keys(branchStats).map(b => ({
      branch: b,
      passRate: Math.round((branchStats[b].passed / branchStats[b].total) * 100),
      total: branchStats[b].total
    }));

    // 2. Rank List (Top 10)
    const studentAggregates = {};
    results.forEach(r => {
      const uid = r.student;
      if (!studentAggregates[uid]) {
        studentAggregates[uid] = { sum: 0, count: 0 };
      }
      studentAggregates[uid].sum += Number(r.marks || 0);
      studentAggregates[uid].count++;
    });

    const rankList = Object.keys(studentAggregates).map(uid => {
      const agg = studentAggregates[uid];
      const profile = studentMap[uid] || { full_name: 'Student', roll_number: uid, department: exam.department };
      return {
        full_name: profile.full_name,
        roll_number: profile.roll_number,
        department: profile.department,
        averageMarks: Math.round(agg.sum / agg.count),
        totalMarks: agg.sum
      };
    }).sort((a, b) => b.totalMarks - a.totalMarks).slice(0, 10);

    // 3. At-Risk Students
    // Defined as: attendance < 75% OR has an 'F' grade in results, OR average marks < 45 in current exam
    const atRiskStudents = students.map(s => {
      const studentResults = results.filter(r => r.student === s.user_id || r.student === s.id);
      const attendance = Number(s.attendance_percentage || 100);
      
      let failedSubjectsCount = 0;
      let sum = 0;
      studentResults.forEach(r => {
        sum += Number(r.marks || 0);
        if (r.grade === 'F') {
          failedSubjectsCount++;
        }
      });

      const avgMarks = studentResults.length > 0 ? (sum / studentResults.length) : 80;
      const isAtRisk = attendance < 75.0 || failedSubjectsCount > 0 || avgMarks < 45;

      let riskScore = 0.1;
      let factors = [];
      if (attendance < 75.0) {
        riskScore += 0.4;
        factors.push(`Low Attendance (${attendance}%)`);
      }
      if (failedSubjectsCount > 0) {
        riskScore += 0.3;
        factors.push(`${failedSubjectsCount} Failed Subject(s)`);
      }
      if (avgMarks < 45) {
        riskScore += 0.2;
        factors.push(`Low Average Score (${Math.round(avgMarks)})`);
      }

      return {
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        department: s.department,
        attendance_percentage: attendance,
        riskScore: parseFloat(Math.min(riskScore, 1.0).toFixed(2)),
        factors,
        isAtRisk
      };
    }).filter(s => s.isAtRisk).sort((a, b) => b.riskScore - a.riskScore);

    res.json({
      success: true,
      data: {
        passRate: results.length > 0 ? Math.round((totalPassed / results.length) * 100) : 100,
        averageMarks: results.length > 0 ? Math.round(sumMarks / results.length) : 0,
        totalSubmissions: results.length,
        branchData,
        rankList,
        atRiskStudents
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 27. Register Supplementary Exam (Student)
 */
export async function registerSupplementary(req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    // 1. Resolve student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('user_id', req.user.id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Fetch course information
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // 3. Verify that student actually has a backlog (grade = 'F') in this subject
    const { data: backlog, error: backlogError } = await supabase
      .from('results')
      .select('*')
      .eq('student', student.user_id)
      .eq('subject', course.course_name)
      .eq('grade', 'F')
      .maybeSingle();

    if (!backlog) {
      return res.status(400).json({
        success: false,
        message: 'Registration Denied: You do not have an active backlog (Grade F) in this subject.'
      });
    }

    // 4. Create the exam registration record marked as Supplementary
    const { data, error } = await supabase
      .from('exam_registrations')
      .insert({
        student_id: student.id,
        course_id: course.id,
        semester: course.semester,
        year: course.year,
        status: 'Registered'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'You have already registered for this supplementary exam.' });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 19. Get Course registration statistics (Exam Cell / Admin)
 */
export async function getCourseAnalytics(req, res, next) {
  try {
    // Fetch all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*, mentor:faculty(*)');
    if (coursesError) throw coursesError;

    // Fetch all student course registrations
    const { data: registrations, error: regError } = await supabase
      .from('student_course_registrations')
      .select('*, student:students(*)');
    if (regError) throw regError;

    // Fetch all student exam registrations
    const { data: examRegs, error: examRegsError } = await supabase
      .from('exam_registrations')
      .select('*, student:students(*)');
    if (examRegsError) throw examRegsError;

    // Fetch all students for totals
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, department');
    if (studentsError) throw studentsError;

    // Count registrations per course
    const courseRegs = {};
    registrations.forEach(r => {
      courseRegs[r.course_id] = (courseRegs[r.course_id] || 0) + 1;
    });

    const coursesWithCounts = courses.map(c => ({
      ...c,
      registration_count: courseRegs[c.id] || 0
    }));

    // Department breakdown for courses
    const deptStats = {};
    const semStats = {};

    registrations.forEach(r => {
      const dept = r.student?.department || 'Unknown';
      deptStats[dept] = (deptStats[dept] || 0) + 1;

      const sem = `Semester ${r.semester}`;
      semStats[sem] = (semStats[sem] || 0) + 1;
    });

    // Department breakdown for exams and total students
    const totalStudentsPerDept = {};
    students.forEach(s => {
      const dept = s.department || 'Unknown';
      totalStudentsPerDept[dept] = (totalStudentsPerDept[dept] || 0) + 1;
    });

    const examRegsPerDept = {};
    examRegs.forEach(er => {
      const dept = er.student?.department || 'Unknown';
      examRegsPerDept[dept] = (examRegsPerDept[dept] || 0) + 1;
    });

    // Keep all departments (from the total students list) to prevent missing branches
    const deptExamBreakdown = Object.keys(totalStudentsPerDept).map(dept => ({
      department: dept,
      registeredCount: examRegsPerDept[dept] || 0,
      totalStudents: totalStudentsPerDept[dept] || 0
    }));

    res.json({
      success: true,
      data: {
        courses: coursesWithCounts,
        departmentBreakdown: Object.keys(deptStats).map(dept => ({ department: dept, count: deptStats[dept] })),
        semesterBreakdown: Object.keys(semStats).map(sem => ({ semester: sem, count: semStats[sem] })),
        examStats: {
          totalExamRegistrations: examRegs.length,
          deptExamBreakdown
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 20. Get Faculty by Department (Exam Cell / Admin helper)
 */
export async function getFacultyByDepartment(req, res, next) {
  try {
    const { department } = req.query;
    let query = supabase.from('faculty').select('id, full_name, department');
    if (department) {
      query = query.eq('department', department);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 21. Register for exam (Student)
 */
export async function registerExam(req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    // 1. Resolve student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, year, semester')
      .eq('user_id', req.user.id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Verify course info to populate year and semester of the exam registration
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, year, semester')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // 4. Create the exam registration record
    const { data, error } = await supabase
      .from('exam_registrations')
      .insert({
        student_id: student.id,
        course_id: course.id,
        semester: course.semester,
        year: course.year,
        status: 'Registered'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ success: false, message: 'You have already registered for this exam.' });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * 22. Get my exam registrations (Student)
 */
export async function getMyExamRegistrations(req, res, next) {
  try {
    // 1. Resolve student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Fetch exam registrations
    const { data, error } = await supabase
      .from('exam_registrations')
      .select('*, courses:courses(*)')
      .eq('student_id', student.id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

