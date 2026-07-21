import { createFileRoute } from '@tanstack/react-router';
import { HODAttendancePage } from '@/modules/hod/pages/HODAttendancePage';

export const Route = createFileRoute('/hod/attendance')({
  component: HODAttendancePage,
});
