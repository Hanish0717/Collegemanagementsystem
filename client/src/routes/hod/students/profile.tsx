import { createFileRoute } from '@tanstack/react-router';
import { HODStudentProfilePage } from '@/modules/hod/pages/HODStudentProfilePage';

export const Route = createFileRoute('/hod/students/profile')({
  component: HODStudentProfilePage,
});
