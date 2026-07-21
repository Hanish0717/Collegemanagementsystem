import { createFileRoute } from '@tanstack/react-router';
import { HODExaminationsPage } from '@/modules/hod/pages/HODExaminationsPage';

export const Route = createFileRoute('/hod/examinations')({
  component: HODExaminationsPage,
});
