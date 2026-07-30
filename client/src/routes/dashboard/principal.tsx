import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";

export const Route = createFileRoute("/dashboard/principal")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin" });
  },
  component: AdminDashboard,
});
