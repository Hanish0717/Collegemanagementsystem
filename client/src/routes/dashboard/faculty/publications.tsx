import { createFileRoute } from '@tanstack/react-router';
import { FacultyPublications } from '@/pages/faculty/FacultyPublications';

export const Route = createFileRoute('/dashboard/faculty/publications')({
  component: FacultyPublications,
});
