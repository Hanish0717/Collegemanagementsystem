import { createFileRoute } from '@tanstack/react-router';
import { StudentTimetable } from '@/pages/student/StudentTimetable';

export const Route = createFileRoute('/dashboard/student/timetable')({
  component: StudentTimetable,
});
