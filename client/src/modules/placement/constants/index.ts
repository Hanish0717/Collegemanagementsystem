/** Placement module route paths — single source of truth */
export const PLACEMENT_ROUTES = {
  ROOT: '/dashboard/placement',
  DASHBOARD: '/dashboard/placement/',
  COMPANIES: '/dashboard/placement/companies',
  DRIVES: '/dashboard/placement/drives',
  APPLICATIONS: '/dashboard/placement/applications',
  INTERVIEWS: '/dashboard/placement/interviews',
  STUDENTS: '/dashboard/placement/history',
  RECRUITERS: '/dashboard/placement/recruiters',
  RESULTS_REVIEW: '/dashboard/placement/results-review',
  ELIGIBILITY: '/dashboard/placement/eligibility',
  CALENDAR: '/dashboard/placement/calendar',
  NOTIFICATIONS: '/dashboard/placement/notifications',
  REPORTS: '/dashboard/placement/reports',
  TARGETS: '/dashboard/placement/targets',
  ALUMNI: '/dashboard/placement/alumni',
  INTELLIGENCE: '/dashboard/placement/intelligence',
} as const;

/** Placement Officer role identifier */
export const PLACEMENT_ROLE = 'placement' as const;

/** Permitted roles for accessing the placement module */
export const PLACEMENT_ALLOWED_ROLES = ['placement', 'admin', 'super_admin'] as const;

/** Default pagination page size */
export const PLACEMENT_PAGE_SIZE = 25;

/** Supported export formats */
export const PLACEMENT_EXPORT_FORMATS = ['CSV', 'Excel', 'PDF'] as const;

/** Recruitment stages ordered by workflow progression */
export const RECRUITMENT_STAGES = [
  'Applied',
  'Test Appeared',
  'Test Score',
  'Recruiter Result',
  'TPO Review',
  'Technical Interview',
  'HR Interview',
  'Offer',
  'Selected',
  'Joining',
  'Rejected',
] as const;

/** Candidate decision status labels */
export const CANDIDATE_STATUS = {
  PASS: 'Pass',
  FAIL: 'Fail',
  PENDING: 'Pending',
} as const;

/** Result review statuses */
export const REVIEW_STATUS = {
  PENDING: 'Pending TPO Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CORRECTION: 'Correction Requested',
  LOCKED: 'Approved & Locked',
} as const;

/** Override action types */
export const OVERRIDE_ACTIONS = {
  STATUS_CHANGE: 'STATUS_CHANGE',
  ADD_STUDENT: 'ADD_STUDENT',
  REMOVE_STUDENT: 'REMOVE_STUDENT',
} as const;
