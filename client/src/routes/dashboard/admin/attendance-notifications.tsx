import { createFileRoute } from '@tanstack/react-router';
import { AdminAttendanceNotifications } from '@/modules/admin/pages/AdminAttendanceNotificationsPage';

export const Route = createFileRoute('/dashboard/admin/attendance-notifications')({
  component: AdminAttendanceNotifications,
});
