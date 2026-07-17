import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminCourses } from '@/pages/superAdmin/SuperAdminCourses';

export const Route = createFileRoute('/dashboard/super-admin/courses')({
  component: SuperAdminCourses,
});
