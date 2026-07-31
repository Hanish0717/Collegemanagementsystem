import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/analytics")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/alumni/reports" });
  },
});