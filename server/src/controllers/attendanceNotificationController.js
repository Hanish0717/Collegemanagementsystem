import { supabase } from '../config/supabase.js';
import { runMonthlyAttendanceNotifications } from '../services/attendanceNotificationService.js';

/**
 * @desc   Trigger the Monthly Attendance Notification Cycle manually
 * @route  POST /api/attendance-notifications/trigger
 * @access Admin/Super Admin
 */
export const triggerNotifications = async (req, res, next) => {
  try {
    // Run calculation asynchronously in the background so it doesn't block the HTTP request
    runMonthlyAttendanceNotifications()
      .then(results => {
        console.log("Background run completed successfully:", results);
      })
      .catch(err => {
        console.error("Background run failed:", err);
      });

    res.status(200).json({
      success: true,
      message: 'Monthly attendance notification cycle triggered successfully in the background.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Monthly Attendance Notification Dashboard Stats and recent logs
 * @route  GET /api/attendance-notifications/dashboard
 * @access Admin/Super Admin
 */
export const getNotificationDashboard = async (req, res, next) => {
  try {
    // We run parallel calls to count the stats
    const [
      { count: totalCount },
      { count: warningCount },
      { count: criticalCount },
      { count: detentionCount },
      { count: failedCount },
      { data: recentLogs }
    ] = await Promise.all([
      supabase.from('attendance_notifications').select('*', { count: 'exact', head: true }),
      supabase.from('attendance_notifications').select('*', { count: 'exact', head: true }).eq('notification_type', 'Warning'),
      supabase.from('attendance_notifications').select('*', { count: 'exact', head: true }).eq('notification_type', 'Critical Warning'),
      supabase.from('attendance_notifications').select('*', { count: 'exact', head: true }).eq('notification_type', 'Detention Alert'),
      supabase.from('attendance_notifications').select('*', { count: 'exact', head: true }).eq('status', 'Failed'),
      supabase.from('attendance_notifications').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalCount || 0,
          warning: warningCount || 0,
          critical: criticalCount || 0,
          detention: detentionCount || 0,
          failed: failedCount || 0
        },
        recentLogs: recentLogs || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Monthly Attendance Notification Logs/History
 * @route  GET /api/attendance-notifications/history
 * @access Admin/Super Admin
 */
export const getNotificationHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, slab, status } = req.query;

    let query = supabase
      .from('attendance_notifications')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`student_name.ilike.%${search}%,roll_number.ilike.%${search}%`);
    }

    if (slab) {
      query = query.eq('notification_type', slab);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: logs, count: total, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: {
        logs: logs || [],
        pagination: {
          total: total || 0,
          page: pageNum,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
