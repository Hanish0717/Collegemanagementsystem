import { createFileRoute } from '@tanstack/react-router';
import { HODForbiddenPage } from '@/modules/hod/pages/HODForbiddenPage';

export const Route = createFileRoute('/hod/403')({
  component: HODForbiddenPage,
});
