import { createFileRoute } from '@tanstack/react-router';
import { AdminCalendar } from '@/pages/admin/AdminCalendar';

export const Route = createFileRoute('/dashboard/admin/calendar')({
  component: AdminCalendar,
});
