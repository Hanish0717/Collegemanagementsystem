import { supabase } from './config/supabase.js';
import { runMonthlyAttendanceNotifications } from './services/attendanceNotificationService.js';

/**
 * Starts the background scheduler that checks the time every hour.
 * On the 1st day of the month at 9:00 AM, it runs the calculations.
 */
export const startScheduler = () => {
  console.log("⏰ Monthly Attendance Notification Scheduler Started successfully.");

  // Run the checker every hour
  setInterval(async () => {
    try {
      const now = new Date();
      // 1st of the month, 9:00 AM (local server time)
      if (now.getDate() === 1 && now.getHours() === 9) {
        console.log("⏰ Scheduled Time reached (1st of month, 9:00 AM). Checking run status...");

        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
        
        const { count, error } = await supabase
          .from('attendance_notifications')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', todayStart);

        if (error) {
          console.error("❌ Scheduler check failed to query database:", error);
          return;
        }

        if (count === 0) {
          console.log("🚀 No run detected for today. Initiating automatic monthly attendance calculations...");
          await runMonthlyAttendanceNotifications();
        } else {
          console.log("ℹ️ Monthly attendance notifications already processed for today.");
        }
      }
    } catch (err) {
      console.error("❌ Scheduler interval check encountered an error:", err);
    }
  }, 60 * 60 * 1000); // 1 hour interval
};
