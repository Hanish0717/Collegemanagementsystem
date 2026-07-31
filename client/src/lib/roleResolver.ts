import type { RoleId } from "./roles";

/**
 * Valid Role IDs supported by the platform.
 */
export const VALID_ROLE_IDS: RoleId[] = [
  "super_admin",
  "admin",
  "faculty",
  "lms",
  "student",
  "parent",
  "librarian",
  "placement",
  "warden",
  "transport",
  "principal",
  "dean",
  "hod",
  "exam_cell",
  "accounts",
  "alumni_coordinator",
  "alumni",
];

/**
 * Normalizes any role input (from DB, JWT payload, local storage, API responses)
 * into a single canonical frontend RoleId format (`super_admin`).
 * Returns `null` if the role is unrecognized or invalid (NEVER silently fallbacks to student).
 */
export function normalizeRole(rawRole: string | null | undefined): RoleId | null {
  if (!rawRole || typeof rawRole !== "string") return null;

  const clean = rawRole.trim().toLowerCase();
  if (!clean) return null;

  // Replacement map for common backend & legacy role aliases
  const aliasMap: Record<string, RoleId> = {
    // Super admin variations
    "super_admin": "super_admin",
    "super-admin": "super_admin",
    "superadmin": "super_admin",
    "super admin": "super_admin",

    // Admin variations
    "admin": "admin",
    "administrator": "admin",
    "system_admin": "admin",
    "system-admin": "admin",

    // Faculty & LMS
    "faculty": "faculty",
    "teacher": "faculty",
    "professor": "faculty",
    "lms": "lms",
    "lms_coordinator": "lms",
    "lms-coordinator": "lms",

    // Student & Parent
    "student": "student",
    "parent": "parent",
    "guardian": "parent",

    // Academic Administrators
    "principal": "principal",
    "vice_principal": "principal",
    "vice-principal": "principal",
    "dean": "dean",
    "hod": "hod",
    "head_of_department": "hod",
    "head-of-department": "hod",

    // Operations & Staff
    "exam_cell": "exam_cell",
    "exam-cell": "exam_cell",
    "examcell": "exam_cell",
    "accounts": "accounts",
    "accountant": "accounts",
    "finance": "accounts",
    "librarian": "librarian",
    "library": "librarian",
    "placement": "placement",
    "placement_officer": "placement",
    "placement-officer": "placement",
    "warden": "warden",
    "hostel_warden": "warden",
    "hostel-warden": "warden",
    "transport": "transport",
    "transport_manager": "transport",
    "transport-manager": "transport",

    // Alumni
    "alumni_coordinator": "alumni_coordinator",
    "alumni-coordinator": "alumni_coordinator",
    "alumni": "alumni",
  };

  if (aliasMap[clean]) return aliasMap[clean];

  // Try replacing hyphen or space with underscore
  const underscored = clean.replace(/[-\s]+/g, "_");
  if (aliasMap[underscored]) return aliasMap[underscored];

  // Direct check against valid role IDs
  if (VALID_ROLE_IDS.includes(underscored as RoleId)) {
    return underscored as RoleId;
  }

  console.warn(`[RoleResolver] Unknown or unsupported role received: "${rawRole}"`);
  return null;
}

/**
 * Returns the exact target route for a normalized role.
 * Ensures consistent routing across the entire application.
 */
export function resolveDashboardRoute(rawRole: string | null | undefined): string {
  const role = normalizeRole(rawRole);
  if (!role) {
    console.error(`[RoleResolver] Cannot resolve route for invalid role: "${rawRole}"`);
    return "/login";
  }

  const dashboardRouteMap: Record<RoleId, string> = {
    super_admin: "/super-admin",
    admin: "/admin",
    faculty: "/faculty",
    lms: "/lms",
    student: "/student",
    parent: "/parent",
    librarian: "/librarian",
    placement: "/placement",
    warden: "/hostel",
    transport: "/transport",
    principal: "/principal",
    dean: "/dean",
    hod: "/hod",
    exam_cell: "/exams",
    accounts: "/finance",
    alumni_coordinator: "/alumni-coordinator",
    alumni: "/alumni",
  };

  return dashboardRouteMap[role] || "/login";
}

/**
 * Converts a frontend RoleId to standard backend role string format.
 */
export function toBackendRoleFormat(frontendRole: RoleId): string {
  const map: Record<RoleId, string> = {
    super_admin: "super-admin",
    admin: "admin",
    faculty: "faculty",
    lms: "faculty",
    student: "student",
    parent: "parent",
    librarian: "librarian",
    placement: "placement-officer",
    warden: "hostel-warden",
    transport: "transport-manager",
    principal: "principal",
    dean: "dean",
    hod: "hod",
    exam_cell: "exam-cell",
    accounts: "accounts",
    alumni_coordinator: "alumni-coordinator",
    alumni: "alumni",
  };
  return map[frontendRole] || "student";
}
