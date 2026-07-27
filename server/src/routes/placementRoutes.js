import express from 'express';
import { 
  getPlacementDashboard, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  createDrive, 
  updateDrive,
  createApplication,
  updateApplication,
  createInterview,
  updateInterview,
  getTrainingPrograms,
  createTrainingProgram,
  updateTrainingProgram,
  getPlacementCalendar,
  getPlacementNotifications,
  markNotificationRead,
  getStudentApplications,
  withdrawStudentApplication,
  sendDriveReminder,
  getNotificationHistory,
  getBatchAnalytics,
  getPlacementTargets,
  updateExemptionStatus,
  createExemptionRequest,
  getCareerDeclarations,
  submitCareerDeclaration,
  processCareerDeclarationAction,
  verifyParentDeclaration,
  getAlumniOpportunities,
  submitAlumniOpportunity,
  processAlumniOpportunityAction,
  getStudentPlacementHistory,
  getAllPlacementHistories,
  getPlacementReportsData,
  getPlacementPredictionsAndInsights
} from '../controllers/placementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getPlacementDashboard);
router.get('/calendar', protect, getPlacementCalendar);
router.get('/notifications', protect, getPlacementNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.get('/student-applications', protect, getStudentApplications);
router.put('/student-applications/withdraw', protect, withdrawStudentApplication);
router.post('/communication/send-reminder', protect, sendDriveReminder);
router.get('/communication/history', protect, getNotificationHistory);
router.get('/analytics/batch', protect, getBatchAnalytics);
router.get('/targets', protect, getPlacementTargets);
router.post('/targets/exemptions', protect, createExemptionRequest);
router.put('/targets/exemptions/:id/status', protect, updateExemptionStatus);
router.get('/career-declarations', protect, getCareerDeclarations);
router.post('/career-declarations', protect, submitCareerDeclaration);
router.put('/career-declarations/:id/action', protect, processCareerDeclarationAction);
router.put('/career-declarations/:id/parent-verify', protect, verifyParentDeclaration);
router.get('/alumni-opportunities', protect, getAlumniOpportunities);
router.post('/alumni-opportunities', protect, submitAlumniOpportunity);
router.put('/alumni-opportunities/:id/action', protect, processAlumniOpportunityAction);
router.get('/history/student/:studentId', protect, getStudentPlacementHistory);
router.get('/history/students', protect, getAllPlacementHistories);
router.get('/reports/generate', protect, getPlacementReportsData);
router.get('/intelligence/predictions', protect, getPlacementPredictionsAndInsights);

router.post('/companies', protect, createCompany);
router.put('/companies/:id', protect, updateCompany);
router.delete('/companies/:id', protect, deleteCompany);
router.post('/drives', protect, createDrive);
router.put('/drives/:id', protect, updateDrive);

router.post('/applications', protect, createApplication);
router.put('/applications/:id', protect, updateApplication);
router.post('/interviews', protect, createInterview);
router.put('/interviews/:id', protect, updateInterview);

router.get('/training', protect, getTrainingPrograms);
router.post('/training', protect, createTrainingProgram);
router.put('/training/:id', protect, updateTrainingProgram);

export default router;
