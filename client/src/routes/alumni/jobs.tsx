import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/jobs")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/jobs" });
  },
});