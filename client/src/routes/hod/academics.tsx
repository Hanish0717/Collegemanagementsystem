import { createFileRoute } from '@tanstack/react-router';
import { HODAcademicPage } from '@/modules/hod/pages/HODAcademicPage';

export const Route = createFileRoute('/hod/academics')({
  component: HODAcademicPage,
});
