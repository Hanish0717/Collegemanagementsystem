import { createFileRoute } from '@tanstack/react-router';
import { FacultyAttendance } from '@/pages/faculty/FacultyAttendance';

export const Route = createFileRoute('/dashboard/faculty/attendance')({
  component: FacultyAttendance,
});
