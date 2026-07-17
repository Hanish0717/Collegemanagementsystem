import { createFileRoute } from '@tanstack/react-router';
import { FacultyClasses } from '@/pages/faculty/FacultyClasses';

export const Route = createFileRoute('/dashboard/faculty/classes')({
  component: FacultyClasses,
});
