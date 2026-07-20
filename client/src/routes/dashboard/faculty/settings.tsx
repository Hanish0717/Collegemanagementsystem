import { createFileRoute } from '@tanstack/react-router';
import { FacultySettings } from '@/pages/faculty/FacultySettings';

export const Route = createFileRoute('/dashboard/faculty/settings')({
  component: FacultySettings,
});
