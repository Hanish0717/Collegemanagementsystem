import { createFileRoute } from '@tanstack/react-router';
import { FacultyResearch } from '@/pages/faculty/FacultyResearch';

export const Route = createFileRoute('/dashboard/faculty/research')({
  component: FacultyResearch,
});
