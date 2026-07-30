import express from 'express';
import {
  getSuperAdminStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getBackups,
  createBackup,
  restoreBackup,
  saveBackupSettings,
  getAutomations,
  toggleAutomation,
  saveAutomationSettings,
  getNotifications,
  toggleNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  saveNotificationCategories,
  getSecurityLogs,
  getSystemSettings,
  saveProfile,
  saveSecuritySettings,
  saveNotificationPrefs,
  updatePassword,
  getSystemConfig,
  saveConfigToggles,
  saveConfigInstitution,
  getReportsData,
  downloadReportCSV,
  getUsers,
  toggleUserStatus,
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/dashboard/stats', protect, requireRole('super-admin'), getSuperAdminStats);
router.get('/departments', protect, requireRole('super-admin', 'admin', 'principal'), getDepartments);
router.get('/users', protect, requireRole('super-admin', 'admin', 'principal'), getUsers);

router.use(protect);
router.use(requireRole('super-admin'));

router.route('/users')
  .get(getUsers);

router.route('/users/:id/status')
  .put(toggleUserStatus);

router.route('/admins')
  .get(getAdmins)
  .post(createAdmin);

router.route('/admins/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

router.route('/departments')
  .get(getDepartments)
  .post(createDepartment);

router.route('/departments/:code')
  .put(updateDepartment)
  .delete(deleteDepartment);

// Courses
router.route('/courses')
  .get(getCourses)
  .post(createCourse);
router.route('/courses/:code')
  .put(updateCourse)
  .delete(deleteCourse);

// Backups
router.route('/backups')
  .get(getBackups)
  .post(createBackup);
router.route('/backups/restore')
  .post(restoreBackup);
router.route('/backups/settings')
  .post(saveBackupSettings);

// Automations
router.route('/automations')
  .get(getAutomations);
router.route('/automations/:name/toggle')
  .put(toggleAutomation);
router.route('/automations/:name/settings')
  .post(saveAutomationSettings);

// Notifications
router.route('/notifications')
  .get(getNotifications)
  .delete(clearAllNotifications);
router.route('/notifications/mark-all-read')
  .post(markAllNotificationsRead);
router.route('/notifications/categories')
  .post(saveNotificationCategories);
router.route('/notifications/:id')
  .delete(deleteNotification);
router.route('/notifications/:id/read')
  .put(toggleNotificationRead);

// Security Logs
router.route('/security-logs')
  .get(getSecurityLogs);

// Settings & Config
router.route('/settings')
  .get(getSystemSettings);
router.route('/settings/profile')
  .post(saveProfile);
router.route('/settings/password')
  .post(updatePassword);
router.route('/settings/security')
  .post(saveSecuritySettings);
router.route('/settings/notifications')
  .post(saveNotificationPrefs);

router.route('/config')
  .get(getSystemConfig);
router.route('/config/toggles')
  .post(saveConfigToggles);
router.route('/config/institution')
  .post(saveConfigInstitution);

// Reports
router.route('/reports/data')
  .get(getReportsData);
router.route('/reports/download/:type')
  .get(downloadReportCSV);

export default router;
