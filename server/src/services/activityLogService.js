/**
 * Activity Audit Logging Service
 * 
 * Records critical user actions, authentication events, designation changes,
 * department transfers, and permission edits for full audit compliance.
 */

import { supabase } from '../config/supabase.js';

/**
 * Log a system activity audit event.
 * @param {object} params 
 * @param {string} params.userId 
 * @param {string} params.performedBy 
 * @param {string} params.action - e.g. 'USER_CREATED', 'USER_UPDATED', 'DESIGNATION_CHANGED', 'SOFT_DELETE'
 * @param {string} params.module - e.g. 'ADMIN_USER_MANAGEMENT', 'FACULTY_MANAGEMENT'
 * @param {string} params.details 
 * @param {string} [params.ipAddress] 
 */
export async function logActivity({
  userId,
  performedBy = 'System Admin',
  action,
  module = 'ADMIN_USER_MANAGEMENT',
  details,
  ipAddress = '127.0.0.1',
}) {
  try {
    const logEntry = {
      user_id: userId,
      performed_by: performedBy,
      action,
      module,
      details,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('audit_logs').insert([logEntry]);
    if (error) {
      console.warn('Supabase audit_logs table note:', error.message);
    }
  } catch (err) {
    console.error('Failed to write activity audit log:', err.message);
  }
}

export default {
  logActivity,
};
