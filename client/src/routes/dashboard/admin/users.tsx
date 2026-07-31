import { createFileRoute } from "@tanstack/react-router";
import { AdminUserDirectory } from "@/pages/admin/AdminUserDirectory";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUserDirectory,
});
