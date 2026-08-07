import { createFileRoute } from "@tanstack/react-router";
import { AdminAdmissions } from '@/modules/admin/pages/AdminAdmissionsPage';

export const Route = createFileRoute("/dashboard/admin/admissions")({
  component: AdminAdmissions,
});
