import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/events")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/events" });
  },
});