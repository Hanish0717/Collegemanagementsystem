import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminUsers } from "@/pages/superAdmin/SuperAdminUsers";

export const Route = createFileRoute("/dashboard/super-admin/users")({
  component: SuperAdminUsers,
});
