import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni" });
  },
});