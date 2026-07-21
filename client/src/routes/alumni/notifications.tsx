import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/notifications")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/notifications" });
  },
});