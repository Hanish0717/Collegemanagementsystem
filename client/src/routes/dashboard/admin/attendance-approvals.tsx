import { createFileRoute } from '@tanstack/react-router';
import { HODAttendanceApprovals } from '@/modules/admin/pages/HODAttendanceApprovalsPage';

export const Route = createFileRoute('/dashboard/admin/attendance-approvals')({
  component: HODAttendanceApprovals,
});
