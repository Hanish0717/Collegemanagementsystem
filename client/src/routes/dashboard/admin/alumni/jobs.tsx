import { createFileRoute } from '@tanstack/react-router';
import { JobsPage } from '@/pages/admin/alumni/JobsPage';

export const Route = createFileRoute('/dashboard/admin/alumni/jobs')({
  component: JobsPage,
});
