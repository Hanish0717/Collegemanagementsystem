import { createFileRoute } from '@tanstack/react-router';
import { AdminAttendanceNotifications } from '@/pages/admin/AdminAttendanceNotifications';

export const Route = createFileRoute('/admin/attendance-notifications')({
  component: AdminAttendanceNotifications,
});
