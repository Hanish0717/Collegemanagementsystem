import { supabase } from '../config/supabase.js';
import { getOrCreatePreferences } from '../services/notificationService.js';

// @desc    Get user notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const preferences = await getOrCreatePreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      academicAlerts,
      attendanceAlerts,
      feeAlerts,
      placementAlerts,
      hostelAlerts,
      transportAlerts,
      emailEnabled,
      inAppEnabled,
      smsEnabled
    } = req.body;

    const updateData = {};
    if (academicAlerts !== undefined) updateData.academic_alerts = academicAlerts;
    if (attendanceAlerts !== undefined) updateData.attendance_alerts = attendanceAlerts;
    if (feeAlerts !== undefined) updateData.fee_alerts = feeAlerts;
    if (placementAlerts !== undefined) updateData.placement_alerts = placementAlerts;
    if (hostelAlerts !== undefined) updateData.hostel_alerts = hostelAlerts;
    if (transportAlerts !== undefined) updateData.transport_alerts = transportAlerts;
    if (emailEnabled !== undefined) updateData.email_enabled = emailEnabled;
    if (inAppEnabled !== undefined) updateData.in_app_enabled = inAppEnabled;
    if (smsEnabled !== undefined) updateData.sms_enabled = smsEnabled;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedPrefs, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPrefs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system notification audit logs
// @route   GET /api/notifications/logs
// @access  Private (Admin/Super-Admin)
export const getNotificationLogs = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'super-admin') {
      const error = new Error('Access denied: Unauthorized access to system audit logs');
      error.statusCode = 403;
      throw error;
    }

    const { data: logs, error } = await supabase
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: logs || []
    });
  } catch (error) {
    next(error);
  }
};
