import { createFileRoute } from "@tanstack/react-router";
import { AdminUserDirectory } from '@/modules/admin/pages/AdminUserDirectoryPage';

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUserDirectory,
});
