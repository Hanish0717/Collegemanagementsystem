import { createFileRoute } from '@tanstack/react-router';
import { HODFacultyProfilePage } from '@/modules/hod/pages/HODFacultyProfilePage';

export const Route = createFileRoute('/hod/faculty/profile')({
  component: HODFacultyProfilePage,
});
