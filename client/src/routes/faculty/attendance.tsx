import { createFileRoute } from '@tanstack/react-router';
import { FacultyAttendance } from '@/pages/faculty/FacultyAttendance';

export const Route = createFileRoute('/faculty/attendance')({
  component: FacultyAttendance,
});
