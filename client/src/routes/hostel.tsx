import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/hostel")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});
