import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * Map a notification category type to the database column in notification_preferences
 */
const getPreferenceColumn = (type) => {
  const t = String(type).toLowerCase();
  if (t === 'academic' || t === 'result' || t === 'exam') return 'academic_alerts';
  if (t === 'attendance') return 'attendance_alerts';
  if (t === 'fee' || t === 'hostelfee' || t === 'transportfee') return 'fee_alerts';
  if (t === 'placement') return 'placement_alerts';
  if (t === 'hostel' || t === 'complaint') return 'hostel_alerts';
  if (t === 'transport') return 'transport_alerts';
  return 'academic_alerts'; // default fallback
};

/**
 * Get or create default notification preferences for a user
 */
export const getOrCreatePreferences = async (userId) => {
  try {
    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (prefs) return prefs;

    // Create default preferences
    const { data: newPrefs, error: insertErr } = await supabase
      .from('notification_preferences')
      .insert([{
        user_id: userId,
        academic_alerts: true,
        attendance_alerts: true,
        fee_alerts: true,
        placement_alerts: true,
        hostel_alerts: true,
        transport_alerts: true,
        email_enabled: true,
        in_app_enabled: true,
        sms_enabled: false
      }])
      .select()
      .single();

    if (insertErr) throw insertErr;
    return newPrefs;
  } catch (error) {
    console.error('[NotificationService] Error in getOrCreatePreferences:', error);
    // Return standard fallback object if DB fails to preserve user experience
    return {
      academic_alerts: true,
      attendance_alerts: true,
      fee_alerts: true,
      placement_alerts: true,
      hostel_alerts: true,
      transport_alerts: true,
      email_enabled: true,
      in_app_enabled: true,
      sms_enabled: false
    };
  }
};

/**
 * Centralized asynchronous notification dispatcher with preferences verification and audit logs
 */
export const dispatchNotification = ({
  userId,
  studentId, // optional, for student_notifications table
  recipientRole = 'student', // 'student', 'faculty', 'admin', 'super-admin'
  email,
  parentEmail,
  type, // 'Academic', 'Attendance', 'Fee', 'Placement', 'Hostel', 'Transport', etc.
  title,
  message,
  emailTemplate = null,
  priority = 'Medium'
}) => {
  // Execute in background to keep HTTP requests non-blocking
  (async () => {
    try {
      console.log(`[Notification Service] Dispatching ${type} alert to User ID: ${userId || studentId || 'unknown'}`);
      
      let prefs = null;
      if (userId) {
        prefs = await getOrCreatePreferences(userId);
      } else if (studentId) {
        // Find corresponding user ID from students table
        const { data: student } = await supabase
          .from('students')
          .select('user_id, email, parent_email')
          .eq('id', studentId)
          .maybeSingle();
        if (student) {
          if (student.user_id) {
            prefs = await getOrCreatePreferences(student.user_id);
          }
          if (!email) email = student.email;
          if (!parentEmail) parentEmail = student.parent_email;
        }
      }

      // Default fallback preferences if none retrieved
      if (!prefs) {
        prefs = {
          academic_alerts: true,
          attendance_alerts: true,
          fee_alerts: true,
          placement_alerts: true,
          hostel_alerts: true,
          transport_alerts: true,
          email_enabled: true,
          in_app_enabled: true
        };
      }

      const prefColumn = getPreferenceColumn(type);
      const categoryEnabled = prefs[prefColumn] !== false;

      // 1. In-App Notification channel
      if (prefs.in_app_enabled && categoryEnabled) {
        try {
          const notifId = `N-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          
          if (recipientRole === 'student' || studentId) {
            // Write to student_notifications
            await supabase
              .from('student_notifications')
              .insert([{
                id: notifId,
                student_id: studentId,
                title,
                type,
                priority,
                time: 'Just now',
                unread: true
              }]);
          } else if (recipientRole === 'faculty') {
            await supabase
              .from('faculty_notifications')
              .insert([{
                id: notifId,
                title,
                category: type,
                priority,
                time: '1m ago',
                unread: true
              }]);
          } else if (recipientRole === 'admin') {
            await supabase
              .from('admin_notifications')
              .insert([{
                id: notifId,
                title,
                category: type,
                time: 'Just now',
                unread: true
              }]);
          } else if (recipientRole === 'super-admin') {
            await supabase
              .from('system_notifications')
              .insert([{
                id: notifId,
                title,
                type,
                time: 'Just now',
                unread: true
              }]);
          }
          
          // Log audit trail
          await supabase
            .from('notification_logs')
            .insert([{
              user_id: userId || null,
              recipient_email: email || 'in-app-only',
              type,
              title,
              message: message || title,
              channel: 'in-app',
              status: 'sent'
            }]);

        } catch (dbErr) {
          console.error('[Notification Service] In-app insertion error:', dbErr);
          await supabase
            .from('notification_logs')
            .insert([{
              user_id: userId || null,
              recipient_email: email || 'in-app-only',
              type,
              title,
              message: message || title,
              channel: 'in-app',
              status: 'failed',
              error_details: dbErr.message
            }]);
        }
      }

      // 2. Email Notification channel
      if (prefs.email_enabled && categoryEnabled) {
        // Dispatch to recipient email
        if (email) {
          try {
            const result = await sendEmail({
              to: email,
              subject: title,
              html: emailTemplate || `<p>${message || title}</p>`
            });

            await supabase
              .from('notification_logs')
              .insert([{
                user_id: userId || null,
                recipient_email: email,
                type,
                title,
                message: message || title,
                channel: 'email',
                status: result ? 'sent' : 'failed',
                error_details: result ? null : 'SMTP failure or missing credentials'
              }]);
          } catch (mailErr) {
            console.error('[Notification Service] Email dispatch error:', mailErr);
            await supabase
              .from('notification_logs')
              .insert([{
                user_id: userId || null,
                recipient_email: email,
                type,
                title,
                message: message || title,
                channel: 'email',
                status: 'failed',
                error_details: mailErr.message
              }]);
          }
        }

        // Dispatch to parent email if student alert and parentEmail is defined
        if (parentEmail) {
          try {
            const result = await sendEmail({
              to: parentEmail,
              subject: `Parent Portal Alert: ${title}`,
              html: emailTemplate || `<p>${message || title}</p>`
            });

            await supabase
              .from('notification_logs')
              .insert([{
                user_id: userId || null,
                recipient_email: parentEmail,
                type,
                title: `Parent Portal Alert: ${title}`,
                message: message || title,
                channel: 'email',
                status: result ? 'sent' : 'failed',
                error_details: result ? null : 'SMTP failure or missing credentials'
              }]);
          } catch (mailErr) {
            console.error('[Notification Service] Parent email dispatch error:', mailErr);
          }
        }
      }
    } catch (e) {
      console.error('[Notification Service] Unhandled background error:', e);
    }
  })();
};
