import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminDepartments } from '@/pages/superAdmin/SuperAdminDepartments';

export const Route = createFileRoute('/dashboard/super-admin/departments')({
  component: SuperAdminDepartments,
});
