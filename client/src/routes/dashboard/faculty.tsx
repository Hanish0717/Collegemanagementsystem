import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/dashboard/faculty")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: Outlet,
});
