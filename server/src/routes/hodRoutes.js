import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireHODRole, departmentIsolationMiddleware } from '../middleware/hodMiddleware.js';
import {
  getDashboardSummary,
  getAnalyticsData,
  getDepartmentSummary,
  getDepartmentNotifications,
  getPendingApprovals,
  createDepartmentAnnouncement,
  assignFacultyMentor,
  updateDepartmentSettings,
  getDepartmentStudents,
  getDepartmentStudentById,
  getDepartmentFaculty,
  getDepartmentFacultyById,
  getDepartmentAcademics,
  approveLessonPlan,
  getDepartmentAttendance,
  getDepartmentExaminations,
  notifyDefaulters,
  getDepartmentMentoring,
  getDepartmentResearch,
  getDepartmentEvents,
  getDepartmentReports,
  emailDepartmentReport,
  getDepartmentDocuments,
  getDepartmentApprovals,
  approveRequest,
  rejectRequest,
  getDepartmentAuditLogs,
  getDepartmentSettingsFull,
} from '../controllers/hodController.js';

import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = express.Router();

// Protect all HOD routes with Auth and HOD role checks
router.use(protect);
router.use(requireHODRole);
router.use(departmentIsolationMiddleware);

// Announcements & Circulars Centralized API
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// ─── GET Endpoints ────────────────────────────────────────
router.get('/dashboard', getDashboardSummary);
router.get('/analytics', getAnalyticsData);
router.get('/department-summary', getDepartmentSummary);
router.get('/notifications', getDepartmentNotifications);
router.get('/students', getDepartmentStudents);
router.get('/students/:id', getDepartmentStudentById);
router.get('/faculty', getDepartmentFaculty);
router.get('/faculty/:id', getDepartmentFacultyById);
router.get('/academics', getDepartmentAcademics);
router.get('/attendance', getDepartmentAttendance);
router.get('/examinations', getDepartmentExaminations);
router.get('/mentoring', getDepartmentMentoring);
router.get('/research', getDepartmentResearch);
router.get('/events', getDepartmentEvents);
router.get('/reports', getDepartmentReports);
router.get('/documents', getDepartmentDocuments);
router.get('/approvals', getDepartmentApprovals);
router.get('/audit', getDepartmentAuditLogs);
router.get('/settings-full', getDepartmentSettingsFull);

// ─── POST / PUT Endpoints ─────────────────────────────────
router.post('/announcement', createDepartmentAnnouncement);
router.post('/reports/email-report', emailDepartmentReport);
router.post('/mentor-assignment', assignFacultyMentor);
router.post('/lesson-plan/approve', approveLessonPlan);
router.post('/attendance/notify', notifyDefaulters);
router.post('/approvals/:id/approve', approveRequest);
router.post('/approvals/:id/reject', rejectRequest);
router.put('/settings', updateDepartmentSettings);

export default router;
