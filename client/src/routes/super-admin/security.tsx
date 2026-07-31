import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminSecurity } from "@/pages/superAdmin/SuperAdminSecurity";

export const Route = createFileRoute("/super-admin/security")({
  component: SuperAdminSecurity,
});
