import { createFileRoute } from "@tanstack/react-router";
import { AdminAccreditation } from '@/modules/admin/pages/AdminAccreditationPage';

export const Route = createFileRoute("/dashboard/admin/accreditation")({
  component: AdminAccreditation,
});
