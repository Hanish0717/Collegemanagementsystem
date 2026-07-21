import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/communication")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/announcements" });
  },
});