import { createFileRoute } from '@tanstack/react-router';
import { FacultyMarks } from '@/pages/faculty/FacultyMarks';

export const Route = createFileRoute('/dashboard/faculty/marks')({
  component: FacultyMarks,
});
