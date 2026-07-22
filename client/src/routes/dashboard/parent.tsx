import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/parent")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || user.role !== "parent") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Outlet,
});
