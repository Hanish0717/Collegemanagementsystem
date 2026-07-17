import { createFileRoute } from '@tanstack/react-router';
import { FacultyPerformance } from '@/pages/faculty/FacultyPerformance';

export const Route = createFileRoute('/dashboard/faculty/performance')({
  component: FacultyPerformance,
});
