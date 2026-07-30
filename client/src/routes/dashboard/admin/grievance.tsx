import { createFileRoute } from "@tanstack/react-router";
import { AdminGrievance } from '@/modules/admin/pages/AdminGrievancePage';

export const Route = createFileRoute("/dashboard/admin/grievance")({
  component: AdminGrievance,
});
