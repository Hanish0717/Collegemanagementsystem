import express from 'express';
import {
  getAlumniDashboardStats,
  listAlumniDirectory,
  registerAlumni,
  getPendingAlumni,
  approveAlumniProfile,
  getAlumniProfile,
  updateAlumniProfile,
  getAlumniEvents,
  createAlumniEvent,
  registerAlumniEvent,
  getAlumniJobs,
  postAlumniJob,
  applyAlumniJob,
  getMentorshipRequests,
  matchMentorship,
  createDonation,
  listDonations,
  getDonationLeaderboard,
  getSuccessStories,
  createSuccessStory,
  sendAnnouncement,
  getAnnouncementLogs,
  getAlumniConnections,
  sendConnectionRequest,
  respondToConnectionRequest,
  getAlumniFeed,
  createAlumniPost,
  likeAlumniPost,
  commentAlumniPost,
  getAlumniMessages,
  sendAlumniMessage,
  bookMentorshipSession,
  cancelMentorshipSession,
  simulateAIResumeReview,
  getAIRecommendations
} from '../controllers/alumni/alumniController.js';

const router = express.Router();

// Dashboard & Profiles
router.get('/dashboard', getAlumniDashboardStats);
router.get('/directory', listAlumniDirectory);
router.post('/register', registerAlumni);
router.get('/pending', getPendingAlumni);
router.put('/profiles/:id/approve', approveAlumniProfile);
router.get('/profiles/:id', getAlumniProfile);
router.put('/profiles/:id', updateAlumniProfile);

// Events
router.get('/events', getAlumniEvents);
router.post('/events', createAlumniEvent);
router.post('/events/:id/register', registerAlumniEvent);

// Jobs
router.get('/jobs', getAlumniJobs);
router.post('/jobs', postAlumniJob);
router.post('/jobs/:id/apply', applyAlumniJob);

// Mentorship, Donations, Success Stories, and Announcements
router.get('/mentorship/requests', getMentorshipRequests);
router.post('/mentorship/match', matchMentorship);
router.post('/donations', createDonation);
router.get('/donations', listDonations);
router.get('/donations/leaderboard', getDonationLeaderboard);
router.get('/stories', getSuccessStories);
router.post('/stories', createSuccessStory);
router.post('/communication/announce', sendAnnouncement);
router.get('/communication/logs', getAnnouncementLogs);

// Networking & Feed
router.get('/connections', getAlumniConnections);
router.post('/connections/request', sendConnectionRequest);
router.post('/connections/respond', respondToConnectionRequest);
router.get('/feed', getAlumniFeed);
router.post('/feed/posts', createAlumniPost);
router.post('/feed/posts/:id/like', likeAlumniPost);
router.post('/feed/posts/:id/comments', commentAlumniPost);

// Messaging & Bookings
router.get('/chat/messages', getAlumniMessages);
router.post('/chat/send', sendAlumniMessage);
router.post('/mentorship/sessions', bookMentorshipSession);
router.put('/mentorship/sessions/:id/cancel', cancelMentorshipSession);

// AI Features
router.post('/ai/resume-review', simulateAIResumeReview);
router.get('/ai/recommendations', getAIRecommendations);

export default router;
