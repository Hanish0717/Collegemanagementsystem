import { createFileRoute, redirect } from "@tanstack/react-router";
import { CompanyDashboard } from "@/pages/company/CompanyDashboard";
import { getDashboardForRole, toFrontendRole } from "@/services/authService";
import { setActiveRole } from "@/lib/roles";

export const Route = createFileRoute("/company/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("company_recruiter_user") || localStorage.getItem("cms_user");
      const token = localStorage.getItem("company_recruiter_token") || localStorage.getItem("cms_token");

      if (!token || !stored) {
        throw redirect({ to: "/login" });
      }

      let role = "";
      let rawRole = "";
      try {
        const user = JSON.parse(stored);
        rawRole = user.role || "";
        role = toFrontendRole(rawRole);
      } catch (e) {
        console.error("Error parsing user in company dashboard beforeLoad:", e);
      }

      if (role && role !== "company_recruiter") {
        const target = getDashboardForRole(rawRole || role);
        setActiveRole(role as any);
        localStorage.setItem("campusly.role", role);
        throw redirect({ to: target as any });
      }

      if (role === "company_recruiter") {
        setActiveRole("company_recruiter");
        localStorage.setItem("campusly.role", "company_recruiter");
      }
    }
  },
  component: CompanyDashboard,
});

