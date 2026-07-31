/**
 * Placement Module Routes
 *
 * This directory re-exports the canonical TanStack Router route files
 * so the module remains self-contained. The actual route files that
 * Vite/TanStack Router reads must live under src/routes/ — those are
 * NOT moved to avoid breaking routeTree.gen.ts auto-generation.
 *
 * Canonical route files:
 *   src/routes/dashboard/placement.tsx            → /dashboard/placement (parent guard)
 *   src/routes/dashboard/placement/index.tsx       → /dashboard/placement/
 *   src/routes/dashboard/placement/companies.tsx   → /dashboard/placement/companies
 *   src/routes/dashboard/placement/drives.tsx      → /dashboard/placement/drives
 *   src/routes/dashboard/placement/applications.tsx→ /dashboard/placement/applications
 *   src/routes/dashboard/placement/interviews.tsx  → /dashboard/placement/interviews
 *   src/routes/dashboard/placement/recruiters.tsx  → /dashboard/placement/recruiters
 *   src/routes/dashboard/placement/results-review.tsx → /dashboard/placement/results-review
 *   src/routes/dashboard/placement/eligibility.tsx → /dashboard/placement/eligibility
 *   src/routes/dashboard/placement/calendar.tsx    → /dashboard/placement/calendar
 *   src/routes/dashboard/placement/notifications.tsx→ /dashboard/placement/notifications
 *   src/routes/dashboard/placement/reports.tsx     → /dashboard/placement/reports
 *   src/routes/dashboard/placement/targets.tsx     → /dashboard/placement/targets
 *   src/routes/dashboard/placement/alumni.tsx      → /dashboard/placement/alumni
 *   src/routes/dashboard/placement/intelligence.tsx→ /dashboard/placement/intelligence
 *   src/routes/dashboard/placement/history.tsx     → /dashboard/placement/history
 *
 * All URLs are unchanged. No route files were duplicated.
 */

export * from '../constants';
