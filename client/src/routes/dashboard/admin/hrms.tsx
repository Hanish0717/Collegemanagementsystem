import { createFileRoute } from "@tanstack/react-router";
import { AdminHRMS } from '@/modules/admin/pages/AdminHRMSPage';

export const Route = createFileRoute("/dashboard/admin/hrms")({
  component: AdminHRMS,
});
