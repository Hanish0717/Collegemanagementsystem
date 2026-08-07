import { createFileRoute } from "@tanstack/react-router";
import { AdminLMS } from '@/modules/admin/pages/AdminLMSPage';

export const Route = createFileRoute("/dashboard/admin/lms")({
  component: AdminLMS,
});
