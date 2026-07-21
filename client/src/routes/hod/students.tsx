import { createFileRoute } from '@tanstack/react-router';
import { HODStudentsDirectoryPage } from '@/modules/hod/pages/HODStudentsDirectoryPage';

export const Route = createFileRoute('/hod/students')({
  component: HODStudentsDirectoryPage,
});
