import { createFileRoute } from "@tanstack/react-router";
import { AdminAlumni } from '@/modules/admin/pages/AdminAlumniPage';

export const Route = createFileRoute("/dashboard/admin/alumni")({
  component: AdminAlumni,
});
