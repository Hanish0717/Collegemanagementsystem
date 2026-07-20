import express from 'express';
import {
  getCommunicationDashboard,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getTemplates,
  createTemplate,
  getSurveys,
  createSurvey,
  getPolls,
  createPoll,
  submitVote,
  getLogs,
  getGateways,
  updateGatewaySettings,
  submitCircularWorkflow
} from '../controllers/communicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getCommunicationDashboard);

router.route('/announcements')
  .get(getAnnouncements)
  .post(createAnnouncement);

router.route('/announcements/:id')
  .put(updateAnnouncement)
  .delete(deleteAnnouncement);

router.post('/announcements/:id/workflow', submitCircularWorkflow);

router.route('/templates')
  .get(getTemplates)
  .post(createTemplate);

router.route('/surveys')
  .get(getSurveys)
  .post(createSurvey);

router.route('/polls')
  .get(getPolls)
  .post(createPoll);

router.post('/polls/:id/vote', submitVote);

router.get('/logs', getLogs);

router.route('/gateways')
  .get(getGateways);

router.put('/gateways/:channel', updateGatewaySettings);

export default router;
