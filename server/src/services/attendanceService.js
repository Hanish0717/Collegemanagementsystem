import { supabase } from '../config/supabase.js';

export const updateStudentAttendancePercentage = async (studentId) => {
  try {
    const { count: total } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student', studentId);

    const { count: attended } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student', studentId)
      .in('status', ['Present', 'present', 'Late', 'late']);

    const percentage = (total && total > 0) ? Math.round(((attended || 0) / total) * 100 * 10) / 10 : 100;

    await supabase
      .from('students')
      .update({ attendance_percentage: percentage })
      .eq('id', studentId);

    if (percentage < 75.0) {
      // Background async worker
      (async () => {
        try {
          const { data: student } = await supabase
            .from('students')
            .select('full_name, email, parent_email')
            .eq('id', studentId)
            .maybeSingle();

          if (student) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { data: existing } = await supabase
              .from('student_notifications')
              .select('id')
              .eq('student_id', studentId)
              .eq('type', 'Attendance')
              .ilike('title', '%warning%')
              .gt('created_at', sevenDaysAgo)
              .limit(1);

            if (!existing || existing.length === 0) {
              const notifId = `SN-ATT-WARN-${Date.now()}`;
              await supabase
                .from('student_notifications')
                .insert([{
                  id: notifId,
                  student_id: studentId,
                  title: `Attendance Warning: Your attendance has fallen below 75%. Current: ${percentage}%.`,
                  type: 'Attendance',
                  priority: 'High',
                  time: 'Just now',
                  unread: true
                }]);

              const { generateAttendanceWarningTemplate } = await import('../utils/emailTemplates.js');
              const { default: sendEmail } = await import('../utils/sendEmail.js');

              const emailHtml = generateAttendanceWarningTemplate(student.full_name, percentage);

              if (student.email) {
                sendEmail({
                  to: student.email,
                  subject: 'Attendance Warning',
                  html: emailHtml
                }).catch(err => console.error('Error sending attendance warning email to student:', err));
              }
              if (student.parent_email) {
                sendEmail({
                  to: student.parent_email,
                  subject: 'Attendance Warning - Child Alert',
                  html: emailHtml
                }).catch(err => console.error('Error sending attendance warning email to parent:', err));
              }
            }
          }
        } catch (err) {
          console.error('Error handling attendance automation warning:', err);
        }
      })();
    }

    return percentage;
  } catch (error) {
    console.error(`Error updating attendance percentage for student ${studentId}:`, error);
    throw error;
  }
};
