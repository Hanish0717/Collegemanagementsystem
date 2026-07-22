import api from "../lib/api";
import type { RoleId } from "../lib/roles";
import type { AuthUser, LoginPayload, LoginResponse } from "@/types/auth";

const demoCredentialsByRole: Record<RoleId, { email: string; password: string }> = {
  super_admin: { email: "superadmin@college.com", password: "password123" },
  admin: { email: "admin@college.com", password: "password123" },
  faculty: { email: "faculty@college.com", password: "password123" },
  student: { email: "student@college.com", password: "password123" },
  parent: { email: "parent@college.com", password: "password123" },
  librarian: { email: "librarian@college.com", password: "password123" },
  placement: { email: "placement@college.com", password: "password123" },
  warden: { email: "warden@college.com", password: "password123" },
  transport: { email: "transport@college.com", password: "password123" },
  principal: { email: "principal@college.com", password: "password123" },
  dean: { email: "dean@college.com", password: "password123" },
  hod: { email: "hod@college.com", password: "password123" },
  exam_cell: { email: "examcell@college.com", password: "password123" },
  accounts: { email: "accounts@college.com", password: "password123" },
  lms: { email: "lms@college.com", password: "password123" },
  alumni_coordinator: { email: "alumni.coordinator@college.com", password: "password123" },
  alumni: { email: "alumni@college.com", password: "password123" },
};

// ── Role Mapping (backend ↔ frontend) ───────────────────
// Backend uses "super-admin", "placement-officer", "hostel-warden", "transport-manager"
// Frontend uses "super_admin", "placement", "warden", "transport"
const backendRoleToFrontendRole: Record<string, RoleId> = {
  "super-admin": "super_admin",
  admin: "admin",
  faculty: "faculty",
  lms: "lms",
  student: "student",
  parent: "parent",
  librarian: "librarian",
  "placement-officer": "placement",
  "hostel-warden": "warden",
  "transport-manager": "transport",
  principal: "principal",
  dean: "dean",
  hod: "hod",
  "exam-cell": "exam_cell",
  accounts: "accounts",
  "alumni-coordinator": "alumni_coordinator",
  alumni: "alumni",
};

const frontendRoleToBackendRole: Record<RoleId, string> = {
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

/** Convert backend role string to frontend RoleId */
export function toFrontendRole(backendRole: string): RoleId {
  return backendRoleToFrontendRole[backendRole] ?? "student";
}

/** Convert frontend RoleId to backend role string */
export function toBackendRole(frontendRole: RoleId): string {
  return frontendRoleToBackendRole[frontendRole] ?? "student";
}

// ── Role → Dashboard Route Mapping ──────────────────────
const roleDashboardMap: Record<string, string> = {
  "super-admin": "/dashboard/super-admin",
  admin: "/dashboard/admin",
  faculty: "/dashboard/faculty",
  lms: "/dashboard/admin/lms",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
  librarian: "/dashboard/librarian",
  "placement-officer": "/dashboard/placement",
  "hostel-warden": "/dashboard/hostel",
  "transport-manager": "/dashboard/transport",
  principal: "/dashboard",
  dean: "/dashboard",
  hod: "/dashboard",
  "exam-cell": "/dashboard",
  accounts: "/dashboard",
  "alumni-coordinator": "/alumni/dashboard",
  alumni: "/alumni/dashboard",
};

/** Get the correct dashboard path for a backend role */
export function getDashboardForRole(backendRole: string): string {
  return roleDashboardMap[backendRole] ?? "/dashboard";
}

// ── Storage Keys ────────────────────────────────────────
const TOKEN_KEY = "cms_token";
const USER_KEY = "cms_user";
const ROLE_KEY = "campusly.role"; // must match the key used in roles.ts

// ── Auth Functions ──────────────────────────────────────

export async function login(payload: LoginPayload): Promise<any> {
  const { data } = await api.post<any>("/api/auth/login", payload);

  if (data.needsVerification) {
    return data;
  }

  const { token, user } = data;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Sync the frontend role system so sidebar/nav renders correctly
  const frontendRole = toFrontendRole(user.role);
  localStorage.setItem(ROLE_KEY, frontendRole);

  return user;
}

/** Switch the current demo workspace to a role-specific login. */
export async function loginAsDemoRole(roleId: RoleId): Promise<AuthUser> {
  const credentials = demoCredentialsByRole[roleId];
  if (!credentials) {
    throw new Error(`No demo credentials configured for role ${roleId}`);
  }

  return login(credentials);
}

/** Fetch the currently authenticated user from backend. */
export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<{ success: boolean; user: AuthUser }>("/api/auth/me");
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  // Keep role in sync
  const frontendRole = toFrontendRole(data.user.role);
  localStorage.setItem(ROLE_KEY, frontendRole);

  return data.user;
}

/** Clear all auth data from localStorage. */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem("cms_student_profile");
  localStorage.removeItem("cms_parent_child_data");
  localStorage.removeItem("cms_faculty_profile");
}

/** Check whether we have a stored token. */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(TOKEN_KEY);
}

/** Get the stored user (without network call). Returns null if none. */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Get the stored JWT token. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
