import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/reports")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/reports" });
  },
});