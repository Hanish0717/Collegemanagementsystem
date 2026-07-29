import { supabase } from '../config/supabase.js';

export async function logAuditEvent({
  actor,
  role = 'user',
  action,
  target = 'System',
  details = '',
  status = 'SUCCESS',
  ip = '127.0.0.1'
}) {
  try {
    const logEntry = {
      actor,
      role,
      action,
      target,
      details,
      status,
      ip,
      time: new Date().toISOString()
    };

    // Store in Supabase audit logs or print to security stream
    await supabase.from('notification_logs').insert([{
      type: 'AUDIT_LOG',
      message: `[AUDIT] ${actor} (${role}) performed ${action} on ${target}`,
      recipient: 'admin@college.com',
      created_at: new Date().toISOString()
    }]).catch(() => {});

    console.log(`[AUDIT LOG] ${logEntry.time} | ${logEntry.actor} (${logEntry.role}) | ${logEntry.action} | ${logEntry.target} | ${logEntry.status}`);
    return logEntry;
  } catch (err) {
    console.error('Error logging audit event:', err.message);
  }
}
