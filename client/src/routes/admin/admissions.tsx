import { createFileRoute } from "@tanstack/react-router";
import { AdminAdmissions } from "@/pages/admin/AdminAdmissions";

export const Route = createFileRoute("/admin/admissions")({
  component: AdminAdmissions,
});
