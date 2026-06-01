import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/sendEmail.js';

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
        .select('id, email, parent_email, full_name')
        .eq('department', updatedExam.department)
        .eq('year', updatedExam.year)
        .eq('semester', updatedExam.semester);

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">Examination Results Published</h2>
          <p style="color: #334155; font-size: 15px;">Dear Student / Parent,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">The academic results for <strong>${updatedExam.name}</strong> (${updatedExam.department} - Year ${updatedExam.year} / Sem ${updatedExam.semester}) have been officially published by the administration.</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">You can now log into your student / parent dashboard to view the subject-wise marks, grades, and credits earned.</p>
          
          <div style="margin-top: 24px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">View Results on Dashboard</a>
          </div>
          
          <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 32px; margin-bottom: 0;">Academic Administration Office</p>
        </div>
      `;

      if (students && students.length > 0) {
        // Bulk insert student notifications
        const studentNotifs = students.map(s => ({
          id: 'SN-' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 5),
          student_id: s.id,
          title: `Semester Results Published: ${updatedExam.name}`,
          type: 'Academic',
          priority: 'High',
          time: 'Just now',
          unread: true
        }));
        await supabase.from('student_notifications').insert(studentNotifs);

        // Async email dispatch in background
        (async () => {
          console.log(`[Results Email Dispatcher] Sending ${students.length} student/parent emails in background...`);
          for (const s of students) {
            if (s.email) {
              sendEmail({
                to: s.email,
                subject: `Results Published: ${updatedExam.name}`,
                html: emailHtml
              }).catch(err => console.error(`[Background Results Email Error] Student: ${s.email}, error:`, err));
            }
            if (s.parent_email) {
              sendEmail({
                to: s.parent_email,
                subject: `Child's Results Published: ${updatedExam.name}`,
                html: emailHtml
              }).catch(err => console.error(`[Background Results Email Error] Parent: ${s.parent_email}, error:`, err));
            }
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
        .select('id, email, parent_email, full_name')
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

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">Examination Timetable Published</h2>
          <p style="color: #334155; font-size: 15px;">Dear Student / Parent,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">The official examination schedule for <strong>${exam.name}</strong> (${exam.department} - Year ${exam.year} / Sem ${exam.semester}) has been published. Please review the schedule below:</p>
          
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
            💡 <strong>Reminder:</strong> Please verify your hall ticket eligibility in the portal. A minimum of 75% attendance and clearance of all academic fees are mandatory to be issued a hall ticket.
          </p>
          <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 20px; margin-bottom: 0;">Academic Administration Office</p>
        </div>
      `;

      if (students && students.length > 0) {
        // Bulk insert student notifications
        const studentNotifs = students.map(s => ({
          id: 'SN-' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 5),
          student_id: s.id,
          title: `New Exam Timetable published: ${exam.name}`,
          type: 'Academic',
          priority: 'High',
          time: 'Just now',
          unread: true
        }));
        await supabase.from('student_notifications').insert(studentNotifs);

        // Async email dispatch in background
        (async () => {
          console.log(`[Timetable Email Dispatcher] Sending ${students.length} student/parent emails in background...`);
          for (const s of students) {
            if (s.email) {
              sendEmail({
                to: s.email,
                subject: `Exam Timetable Published: ${exam.name}`,
                html: emailHtml
              }).catch(err => console.error(`[Background Timetable Email Error] Student: ${s.email}, error:`, err));
            }
            if (s.parent_email) {
              sendEmail({
                to: s.parent_email,
                subject: `Child's Exam Timetable Published: ${exam.name}`,
                html: emailHtml
              }).catch(err => console.error(`[Background Timetable Email Error] Parent: ${s.parent_email}, error:`, err));
            }
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
        student_id: s.id,
        user_id: studentUserId,
        full_name: s.full_name,
        roll_number: s.roll_number,
        marks: resRecord ? resRecord.marks : null,
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
    const { subject, marksData } = req.body; // marksData: array of { student_user_id, marks, grade, credits }

    if (!subject || !marksData) {
      return res.status(400).json({ success: false, message: 'Subject and marksData are required' });
    }

    const { data: exam } = await supabase.from('exams').select('*').eq('id', exam_id).single();
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    for (const m of marksData) {
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
            marks: parseInt(m.marks),
            grade: m.grade || 'F',
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
            marks: parseInt(m.marks),
            grade: m.grade || 'F',
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
