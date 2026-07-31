import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/student")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cms_user");
      if (!stored) {
        const demoUser = {
          id: "std_2023_cse_042",
          fullName: "Hanish Kumar",
          email: "student@college.com",
          role: "student"
        };
        localStorage.setItem("cms_user", JSON.stringify(demoUser));
        localStorage.setItem("cms_token", "mock_student_token_xyz999");
        localStorage.setItem("campusly.role", "student");
      }
    }
  },
  component: DashboardLayout,
});
