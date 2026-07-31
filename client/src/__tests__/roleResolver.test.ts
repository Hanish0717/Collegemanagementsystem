import { describe, it, expect } from "vitest";
import { normalizeRole, resolveDashboardRoute } from "../lib/roleResolver";

describe("Role Resolver Unit Tests", () => {
  it("normalizes super admin role variations cleanly to super_admin", () => {
    expect(normalizeRole("super-admin")).toBe("super_admin");
    expect(normalizeRole("super_admin")).toBe("super_admin");
    expect(normalizeRole("SUPERADMIN")).toBe("super_admin");
    expect(normalizeRole("Super Admin")).toBe("super_admin");
  });

  it("normalizes academic & staff roles", () => {
    expect(normalizeRole("hostel-warden")).toBe("warden");
    expect(normalizeRole("placement-officer")).toBe("placement");
    expect(normalizeRole("transport-manager")).toBe("transport");
    expect(normalizeRole("exam-cell")).toBe("exam_cell");
    expect(normalizeRole("alumni-coordinator")).toBe("alumni_coordinator");
  });

  it("returns null for unrecognized or empty roles without defaulting to student", () => {
    expect(normalizeRole(null)).toBeNull();
    expect(normalizeRole(undefined)).toBeNull();
    expect(normalizeRole("")).toBeNull();
    expect(normalizeRole("invalid_unknown_role_xyz")).toBeNull();
  });

  it("resolves exact dashboard target routes for all canonical roles", () => {
    expect(resolveDashboardRoute("super_admin")).toBe("/super-admin");
    expect(resolveDashboardRoute("super-admin")).toBe("/super-admin");
    expect(resolveDashboardRoute("admin")).toBe("/admin");
    expect(resolveDashboardRoute("faculty")).toBe("/faculty");
    expect(resolveDashboardRoute("student")).toBe("/student");
    expect(resolveDashboardRoute("parent")).toBe("/parent");
    expect(resolveDashboardRoute("principal")).toBe("/principal");
    expect(resolveDashboardRoute("dean")).toBe("/dean");
    expect(resolveDashboardRoute("hod")).toBe("/hod/dashboard");
    expect(resolveDashboardRoute("exam_cell")).toBe("/exams");
    expect(resolveDashboardRoute("accounts")).toBe("/finance");
    expect(resolveDashboardRoute("warden")).toBe("/hostel");
    expect(resolveDashboardRoute("transport")).toBe("/transport");
    expect(resolveDashboardRoute("librarian")).toBe("/librarian");
    expect(resolveDashboardRoute("placement")).toBe("/placement");
    expect(resolveDashboardRoute("alumni")).toBe("/alumni/dashboard");
  });

  it("redirects invalid roles to /login", () => {
    expect(resolveDashboardRoute("invalid_role")).toBe("/login");
    expect(resolveDashboardRoute(null)).toBe("/login");
  });
});
