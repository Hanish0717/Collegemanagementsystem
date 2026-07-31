import { createFileRoute } from '@tanstack/react-router';
import { HODAttendanceApprovals } from '@/pages/admin/HODAttendanceApprovals';

export const Route = createFileRoute('/admin/attendance-approvals')({
  component: HODAttendanceApprovals,
});
