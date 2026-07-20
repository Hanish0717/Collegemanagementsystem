import { createFileRoute } from '@tanstack/react-router';
import { FacultyStudents } from '@/pages/faculty/FacultyStudents';

export const Route = createFileRoute('/dashboard/faculty/students')({
  component: FacultyStudents,
});
