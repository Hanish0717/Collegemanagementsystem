/**
 * Placement Officer Module — Public API
 *
 * Import anything placement-related from this single entry point:
 *   import { PlacementDashboard, usePlacementRecruiters, PLACEMENT_ROUTES } from '@/modules/placement'
 */

// ── Pages ────────────────────────────────────────────────────────────────────
export { PlacementDashboard } from './pages/Dashboard';
export { PlacementCompanies } from './pages/Companies';
export { PlacementDrives } from './pages/Drives';
export { PlacementApplications } from './pages/Applications';
export { PlacementInterviews } from './pages/Interviews';
export { PlacementStudentDossier } from './pages/Students';
export { PlacementRecruiters } from './pages/Recruiters';
export { RecruiterResultsReview } from './pages/Results';
export { PlacementIntelligence } from './pages/Analytics';
export { PlacementReports } from './pages/Reports';
export { PlacementNotifications } from './pages/Notifications';
export { PlacementCalendar } from './pages/Calendar';
export { PlacementEligibility } from './pages/Eligibility';
export { PlacementAlumniHiring } from './pages/AlumniHiring';
export { PlacementTargets } from './pages/Targets';

// ── Components ───────────────────────────────────────────────────────────────
export { PlacementErrorBoundary } from './components';

// ── Layout ───────────────────────────────────────────────────────────────────
export { PlacementLayout } from './layouts/PlacementLayout';

// ── Hooks ────────────────────────────────────────────────────────────────────
export { usePlacementRecruiters } from './hooks/usePlacementRecruiters';
export { usePlacementResults } from './hooks/usePlacementResults';

// ── Context ──────────────────────────────────────────────────────────────────
export { PlacementModuleProvider, usePlacementModule } from './contexts';

// ── Services ─────────────────────────────────────────────────────────────────
export {
  fetchRecruiters,
  createCompanyRecruiter,
  updateCompanyRecruiter,
  toggleRecruiterStatus,
  resetRecruiterPassword,
  assignDrivesToRecruiter,
  fetchSubmittedResultsForReview,
  updateResultReviewStatus,
  overrideCandidateDecision,
  fetchResultOverrides,
  lockAndShareResults,
  fetchSystemAuditLogs,
  fetchStudentPlacementHistory,
} from './services/placementService';

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  CompanyRecruiterItem,
  CreateRecruiterPayload,
  SubmittedResultReviewItem,
  DecisionOverridePayload,
  SystemAuditLogEntry,
} from './types';

// ── Utils ────────────────────────────────────────────────────────────────────
export {
  formatScore,
  getStatusBadgeClass,
  toRelativeTime,
  getInitials,
  downloadBlob,
  toCSV,
} from './utils';

// ── Constants ────────────────────────────────────────────────────────────────
export {
  PLACEMENT_ROUTES,
  PLACEMENT_ROLE,
  PLACEMENT_ALLOWED_ROLES,
  PLACEMENT_PAGE_SIZE,
  PLACEMENT_EXPORT_FORMATS,
  RECRUITMENT_STAGES,
  CANDIDATE_STATUS,
  REVIEW_STATUS,
  OVERRIDE_ACTIONS,
} from './constants';
