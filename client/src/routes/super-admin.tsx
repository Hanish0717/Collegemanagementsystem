import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/super-admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || (user.role !== "super-admin" && user.role !== "super_admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: DashboardLayout,
});
