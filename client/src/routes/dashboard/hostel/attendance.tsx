import { createFileRoute } from '@tanstack/react-router';
import { HostelAttendance } from '@/pages/hostel/HostelAttendance';

export const Route = createFileRoute('/dashboard/hostel/attendance')({
  component: HostelAttendance,
});
