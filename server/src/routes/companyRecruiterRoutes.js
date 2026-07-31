import express from 'express';
import {
  getRecruiters,
  createRecruiter,
  updateRecruiter,
  toggleRecruiterStatus,
  resetRecruiterPassword,
  assignDrives,
  companyLogin,
  changePassword,
  getRecruiterMe,
  getAssignedDrives,
  getAssignedApplicants,
  updateCandidateStatus,
  getDashboardStats,
  getEligibleStudents,
  approveAssessmentDetails,
  scheduleAndConductAssessment,
  getAssessments,
  createOnlineTest,
  getTestAttendance,
  submitStudentTest,
  getInterviews,
  createInterviewSchedule,
  updateInterviewStatusAndResult,
  uploadResults,
  getReports,
  downloadAnalyticsReport,
  getSubmittedResultsForReview,
  updateResultReviewStatus,
  overrideCandidateDecision,
  getResultOverrides,
  getSystemAuditLogs,
  lockAndShareResults,
  getStudentPlacementHistory
} from '../controllers/companyRecruiterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ── Public Recruiter Auth Routes ──────────────────────────────
router.post('/auth/login', companyLogin);

// ── Protected Recruiter Portal Routes ─────────────────────────
router.get('/auth/me', protect, authorizeRoles('company_recruiter'), getRecruiterMe);
router.post('/auth/change-password', protect, authorizeRoles('company_recruiter'), changePassword);
router.get('/portal/stats', protect, authorizeRoles('company_recruiter'), getDashboardStats);
router.get('/portal/drives', protect, authorizeRoles('company_recruiter'), getAssignedDrives);
router.get('/portal/applicants', protect, authorizeRoles('company_recruiter'), getAssignedApplicants);
router.get('/portal/eligible-students', protect, authorizeRoles('company_recruiter'), getEligibleStudents);
router.get('/portal/assessments', protect, authorizeRoles('company_recruiter', 'placement-officer', 'placement', 'admin', 'super-admin'), getAssessments);
router.post('/portal/tests', protect, authorizeRoles('company_recruiter'), createOnlineTest);
router.put('/portal/tests/:testId/approve', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), approveAssessmentDetails);
router.post('/portal/tests/:testId/conduct', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), scheduleAndConductAssessment);
router.get('/portal/tests/:testId/attendance', protect, authorizeRoles('company_recruiter', 'placement-officer', 'placement', 'admin', 'super-admin'), getTestAttendance);
router.post('/placement/student/test-submit', protect, submitStudentTest);
router.get('/portal/interviews', protect, authorizeRoles('company_recruiter'), getInterviews);
router.post('/portal/interviews', protect, authorizeRoles('company_recruiter'), createInterviewSchedule);
router.put('/portal/interviews/:interviewId', protect, authorizeRoles('company_recruiter'), updateInterviewStatusAndResult);
router.post('/portal/upload-results', protect, authorizeRoles('company_recruiter'), uploadResults);
router.get('/portal/reports', protect, authorizeRoles('company_recruiter', 'placement-officer', 'placement', 'admin', 'super-admin'), getReports);
router.get('/portal/reports/download', protect, authorizeRoles('company_recruiter', 'placement-officer', 'placement', 'admin', 'super-admin'), downloadAnalyticsReport);
router.put('/portal/applicants/:applicationId/status', protect, authorizeRoles('company_recruiter', 'placement-officer', 'placement', 'admin', 'super-admin'), updateCandidateStatus);

// ── Placement Officer Recruiter & Review Routes ─────────────
router.get('/placement/recruiters', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), getRecruiters);
router.post('/placement/recruiters', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), createRecruiter);
router.put('/placement/recruiters/:id', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), updateRecruiter);
router.put('/placement/recruiters/:id/status', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), toggleRecruiterStatus);
router.post('/placement/recruiters/:id/reset-password', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), resetRecruiterPassword);
router.put('/placement/recruiters/:id/assign-drives', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), assignDrives);

router.get('/placement/results-review', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), getSubmittedResultsForReview);
router.put('/placement/results-review/:id/status', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), updateResultReviewStatus);
router.post('/placement/results-review/:id/override', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), overrideCandidateDecision);
router.get('/placement/results-review/:id/overrides', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), getResultOverrides);
router.post('/placement/results-review/:id/lock-and-share', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), lockAndShareResults);

// ── Student Placement History Timeline Routes ────────────────
router.get('/placement/student-history/:studentId', protect, getStudentPlacementHistory);
router.get('/placement/student-history', protect, getStudentPlacementHistory);

// ── Immutable Audit Log Ledger Route ──────────────────────────
router.get('/placement/audit-logs', protect, authorizeRoles('placement-officer', 'placement', 'admin', 'super-admin'), getSystemAuditLogs);

export default router;
