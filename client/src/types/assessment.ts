/**
 * Assessment Management Foundation - Type Definitions
 * Lifecycle Statuses:
 * Draft -> Submitted_to_TPO -> Pending_Approval -> Approved -> Scheduled ->
 * Published -> In_Progress -> Completed -> Results_Generated -> Results_Verified ->
 * Results_Published -> Sent_to_Recruiter
 */

export type AssessmentStatus =
  | 'Draft'
  | 'Submitted_to_TPO'
  | 'Pending_Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'In_Progress'
  | 'Completed'
  | 'Results_Generated'
  | 'Results_Verified'
  | 'Results_Published'
  | 'Sent_to_Recruiter';

export const ASSESSMENT_STATUS_FLOW: AssessmentStatus[] = [
  'Draft',
  'Submitted_to_TPO',
  'Pending_Approval',
  'Approved',
  'Scheduled',
  'Published',
  'In_Progress',
  'Completed',
  'Results_Generated',
  'Results_Verified',
  'Results_Published',
  'Sent_to_Recruiter'
];

export interface StatusMeta {
  key: AssessmentStatus;
  label: string;
  stepNumber: number;
  badgeVariant: string;
  color: string;
  bgColor: string;
  description: string;
}

export const STATUS_METADATA: Record<AssessmentStatus, StatusMeta> = {
  Draft: {
    key: 'Draft',
    label: 'Draft',
    stepNumber: 1,
    badgeVariant: 'secondary',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    description: 'Initial assessment setup created by Recruiter. Not yet submitted to TPO.'
  },
  Submitted_to_TPO: {
    key: 'Submitted_to_TPO',
    label: 'Submitted to TPO',
    stepNumber: 2,
    badgeVariant: 'warning',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    description: 'Submitted to Training & Placement Officer for initial review.'
  },
  Pending_Approval: {
    key: 'Pending_Approval',
    label: 'Pending Approval',
    stepNumber: 3,
    badgeVariant: 'warning',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    description: 'Under formal evaluation by Placement Cell head.'
  },
  Approved: {
    key: 'Approved',
    label: 'Approved',
    stepNumber: 4,
    badgeVariant: 'success',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'Approved by TPO. Ready for lab slot assignment.'
  },
  Scheduled: {
    key: 'Scheduled',
    label: 'Scheduled',
    stepNumber: 5,
    badgeVariant: 'indigo',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    description: 'Scheduled on Placement Calendar with date, time, and lab capacity.'
  },
  Published: {
    key: 'Published',
    label: 'Published',
    stepNumber: 6,
    badgeVariant: 'purple',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    description: 'Published to eligible student portal.'
  },
  In_Progress: {
    key: 'In_Progress',
    label: 'In Progress',
    stepNumber: 7,
    badgeVariant: 'purple',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 animate-pulse',
    description: 'Live test window currently active.'
  },
  Completed: {
    key: 'Completed',
    label: 'Completed',
    stepNumber: 8,
    badgeVariant: 'secondary',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    description: 'Test window concluded. Candidate responses submitted.'
  },
  Results_Generated: {
    key: 'Results_Generated',
    label: 'Results Generated',
    stepNumber: 9,
    badgeVariant: 'indigo',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    description: 'Scores computed by evaluation engine.'
  },
  Results_Verified: {
    key: 'Results_Verified',
    label: 'Results Verified',
    stepNumber: 10,
    badgeVariant: 'emerald',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700',
    description: 'Placement Officer audited and verified score cutoffs.'
  },
  Results_Published: {
    key: 'Results_Published',
    label: 'Results Published',
    stepNumber: 11,
    badgeVariant: 'purple',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800',
    description: 'Shortlist published to student dashboard.'
  },
  Sent_to_Recruiter: {
    key: 'Sent_to_Recruiter',
    label: 'Sent to Recruiter',
    stepNumber: 12,
    badgeVariant: 'success',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border-green-400 dark:border-green-700 font-semibold',
    description: 'Verified candidate list delivered to Recruiter for interview scheduling.'
  }
};

export interface AssessmentStatusHistory {
  id: string;
  assessment_id: string;
  from_status: AssessmentStatus | null;
  to_status: AssessmentStatus;
  changed_by: string;
  comments?: string;
  created_at: string;
}

export interface AssessmentTimelineEvent {
  id: string;
  assessment_id: string;
  event_type: string;
  title: string;
  description?: string;
  actor_name?: string;
  actor_role?: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  drive_id: string;
  recruiter_id?: string | null;
  company_id?: string | null;
  company_name?: string;
  assessment_name: string;
  description?: string;
  instructions?: string;
  passing_marks: number;
  total_marks: number;
  duration: number; // in minutes
  current_status: AssessmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  drive?: {
    id: string;
    company_name?: string;
    job_title?: string;
    drive_date?: string;
  };
  status_history?: AssessmentStatusHistory[];
  timeline?: AssessmentTimelineEvent[];
}

export interface CreateAssessmentDTO {
  drive_id: string;
  recruiter_id?: string;
  company_id?: string;
  company_name?: string;
  assessment_name: string;
  description?: string;
  instructions?: string;
  passing_marks?: number;
  total_marks?: number;
  duration?: number;
  current_status?: AssessmentStatus;
}
