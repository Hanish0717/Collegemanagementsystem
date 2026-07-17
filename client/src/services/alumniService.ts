import api from '@/lib/api';

export async function fetchAlumniDashboardStats() {
  const response = await api.get('/api/alumni/dashboard');
  return response.data.data;
}

export async function fetchAlumniDirectory(
  filters: {
    search?: string;
    department?: string;
    graduationYear?: string;
    company?: string;
    location?: string;
    skills?: string;
  } = {},
) {
  const response = await api.get('/api/alumni/directory', { params: filters });
  return response.data.data;
}

export async function registerAlumni(payload: any) {
  const response = await api.post('/api/alumni/register', payload);
  return response.data;
}

export async function fetchPendingAlumni() {
  const response = await api.get('/api/alumni/pending');
  return response.data.data;
}

export async function approveAlumniProfile(id: string, status: 'Approved' | 'Rejected') {
  const response = await api.put(`/api/alumni/profiles/${id}/approve`, { status });
  return response.data;
}

export async function fetchAlumniProfile(id: string) {
  const response = await api.get(`/api/alumni/profiles/${id}`);
  return response.data.data;
}

export async function updateAlumniProfile(id: string, payload: any) {
  const response = await api.put(`/api/alumni/profiles/${id}`, payload);
  return response.data;
}

export async function fetchAlumniEvents() {
  const response = await api.get('/api/alumni/events');
  return response.data.data;
}

export async function createAlumniEvent(payload: any) {
  const response = await api.post('/api/alumni/events', payload);
  return response.data;
}

export async function registerForEvent(eventId: string, alumniId: string) {
  const response = await api.post(`/api/alumni/events/${eventId}/register`, { alumniId });
  return response.data;
}

export async function fetchAlumniJobs() {
  const response = await api.get('/api/alumni/jobs');
  return response.data.data;
}

export async function postAlumniJob(payload: any) {
  const response = await api.post('/api/alumni/jobs', payload);
  return response.data;
}

export async function applyForJob(jobId: string, alumniId: string, resumeUrl: string) {
  const response = await api.post(`/api/alumni/jobs/${jobId}/apply`, { alumniId, resumeUrl });
  return response.data;
}

export async function fetchMentorshipRequests() {
  const response = await api.get('/api/alumni/mentorship/requests');
  return response.data.data;
}

export async function matchMentorship(id: string, status: string, sessionSchedule?: string) {
  const response = await api.post('/api/alumni/mentorship/match', { id, status, sessionSchedule });
  return response.data;
}

export async function recordDonation(payload: {
  alumniId: string;
  amount: number;
  cause: string;
  transactionId?: string;
}) {
  const response = await api.post('/api/alumni/donations', payload);
  return response.data;
}

export async function fetchDonationLeaderboard() {
  const response = await api.get('/api/alumni/donations/leaderboard');
  return response.data.data;
}

export async function fetchSuccessStories() {
  const response = await api.get('/api/alumni/stories');
  return response.data.data;
}

export async function createSuccessStory(payload: {
  alumniId: string;
  title: string;
  content: string;
  category: string;
}) {
  const response = await api.post('/api/alumni/stories', payload);
  return response.data;
}

export async function sendAnnouncement(payload: {
  type: 'Email' | 'SMS' | 'WhatsApp';
  recipient: string;
  subject?: string;
  message: string;
  sentBy?: string;
}) {
  const response = await api.post('/api/alumni/communication/announce', payload);
  return response.data;
}

export async function fetchAnnouncementLogs() {
  const response = await api.get('/api/alumni/communication/logs');
  return response.data.data;
}

export async function fetchAlumniConnections(alumniId: string) {
  const response = await api.get('/api/alumni/connections', { params: { alumniId } });
  return response.data.data;
}

export async function sendConnectionRequest(senderId: string, receiverId: string) {
  const response = await api.post('/api/alumni/connections/request', { senderId, receiverId });
  return response.data;
}

export async function respondToConnectionRequest(id: string, status: 'Accepted' | 'Rejected') {
  const response = await api.post('/api/alumni/connections/respond', { id, status });
  return response.data;
}

export async function fetchAlumniFeed() {
  const response = await api.get('/api/alumni/feed');
  return response.data.data;
}

export async function createAlumniPost(authorId: string, content: string, imageUrl?: string) {
  const response = await api.post('/api/alumni/feed/posts', { authorId, content, imageUrl });
  return response.data;
}

export async function likeAlumniPost(id: string, alumniId: string) {
  const response = await api.post(`/api/alumni/feed/posts/${id}/like`, { alumniId });
  return response.data;
}

export async function commentAlumniPost(id: string, authorId: string, content: string) {
  const response = await api.post(`/api/alumni/feed/posts/${id}/comments`, { authorId, content });
  return response.data;
}

export async function fetchAlumniMessages(senderId: string, receiverId: string) {
  const response = await api.get('/api/alumni/chat/messages', { params: { senderId, receiverId } });
  return response.data.data;
}

export async function sendAlumniMessage(
  senderId: string,
  receiverId: string,
  content: string,
  fileUrl?: string,
) {
  const response = await api.post('/api/alumni/chat/send', {
    senderId,
    receiverId,
    content,
    fileUrl,
  });
  return response.data;
}

export async function bookMentorshipSession(payload: {
  requestId: string;
  mentorId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const response = await api.post('/api/alumni/mentorship/sessions', payload);
  return response.data;
}

export async function cancelMentorshipSession(id: string) {
  const response = await api.put(`/api/alumni/mentorship/sessions/${id}/cancel`);
  return response.data;
}

export async function simulateAIResumeReview(resumeText: string) {
  const response = await api.post('/api/alumni/ai/resume-review', { resumeText });
  return response.data.data;
}

export async function fetchAIRecommendations(alumniId: string) {
  const response = await api.get('/api/alumni/ai/recommendations', { params: { alumniId } });
  return response.data.data;
}
