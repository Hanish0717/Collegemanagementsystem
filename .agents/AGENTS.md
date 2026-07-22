# Enterprise College ERP - Release Branch Validation Guidelines (`release/v1.0`)

## Role Definition & Scope
You are acting as Senior Staff Software Engineer, Enterprise Architect, DevOps Engineer, QA Lead, and Security Engineer.
Your responsibility is to prepare this College ERP for a production release on branch `release/v1.0` without breaking any existing functionality.

### Core Directives
1. **Preserve Functionality & Design**: Do NOT rewrite the project. Do NOT redesign the UI. Do NOT change business logic unless it is verified as incorrect.
2. **Branch Strategy**: All fixes, testing, verification, and deployment validation must happen on `release/v1.0`. Merge into `main` ONLY after every verification passes.
3. **No Temporary Workarounds**: Fix the root causes of routing, rendering, authentication, deployment, and state management issues.

---

## Final Acceptance Criteria Matrix

### 1. Routing & Outlets
- Route Tree, Nested Routes, Layout Routes (`<Outlet />`), Protected Routes, Dynamic Routes, and Role Redirection verified.

### 2. Rendering & Layouts
- Every role dashboard renders correctly without blank pages, duplicate layouts, or hydration mismatches.

### 3. Authentication & RBAC
- Login, Logout, Session Restore on page refresh, JWT authorization, and role isolation verified across all 16 roles (`super_admin`, `admin`, `principal`, `vice_principal`, `dean`, `hod`, `faculty`, `student`, `parent`, `exam_cell`, `librarian`, `placement`, `warden`, `transport`, `accounts`, `lms`, `alumni`).

### 4. Modules & Workflows
- Cross-module flow: `Pre-Admission` → `Admission` → `SIS` → `Academic` → `Attendance` → `Examination` → `Finance` → `Library` → `Placement` → `Graduation` → `Alumni`.
- CRUD, Search, Filters, Export (CSV/Excel/PDF), and Notifications verified.

### 5. Deployment & Production Build
- `npm run build` succeeds cleanly for client and SSR environments.
- Backend API healthy on port 5000 (`/api/health` OK).
