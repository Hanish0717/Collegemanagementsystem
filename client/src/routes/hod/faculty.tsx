import { createFileRoute } from '@tanstack/react-router';
import { HODFacultyDirectoryPage } from '@/modules/hod/pages/HODFacultyDirectoryPage';

export const Route = createFileRoute('/hod/faculty')({
  component: HODFacultyDirectoryPage,
});
