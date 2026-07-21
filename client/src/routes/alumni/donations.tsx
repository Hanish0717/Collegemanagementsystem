import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alumni/donations")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/alumni/donations" });
  },
});