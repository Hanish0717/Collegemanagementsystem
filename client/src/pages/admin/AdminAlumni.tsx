import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Award,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  MessageSquare,
  Briefcase,
  Heart,
  BookOpen,
  Send,
  FileText,
  Settings,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  ThumbsUp,
  Download,
  RefreshCw,
  Star,
  HelpCircle,
  Save,
  ShieldAlert,
  Share2,
  MessageCircle,
  MoreVertical,
  Check,
  X,
  ShieldCheck,
  Mail,
  Phone,
  Image,
  Paperclip,
  Smile,
  Eye,
  EyeOff,
  Lock,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAlumniDashboardStats,
  fetchAlumniDirectory,
  registerAlumni,
  fetchPendingAlumni,
  approveAlumniProfile,
  fetchAlumniProfile,
  updateAlumniProfile,
  fetchAlumniEvents,
  createAlumniEvent,
  registerForEvent,
  fetchAlumniJobs,
  postAlumniJob,
  applyForJob,
  fetchMentorshipRequests,
  matchMentorship,
  recordDonation,
  fetchDonationLeaderboard,
  fetchSuccessStories,
  createSuccessStory,
  sendAnnouncement,
  fetchAnnouncementLogs,
  fetchAlumniConnections,
  sendConnectionRequest,
  respondToConnectionRequest,
  fetchAlumniFeed,
  createAlumniPost,
  likeAlumniPost,
  commentAlumniPost,
  fetchAlumniMessages,
  sendAlumniMessage,
  bookMentorshipSession,
  cancelMentorshipSession,
  simulateAIResumeReview,
  fetchAIRecommendations,
} from '@/services/alumniService';

import { Outlet, useRouterState, useNavigate as useRouterNavigate } from '@tanstack/react-router';
import { createContext, useContext } from 'react';

export const AlumniContext = createContext<any>(null);

export function useAlumni() {
  return useContext(AlumniContext);
}

export function AdminAlumni() {
  console.log('AdminAlumni Rendered');
  const queryClient = useQueryClient();
  const currentAlumniId = 'alm-001';

  // Data queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['alumni-stats'],
    queryFn: fetchAlumniDashboardStats,
  });

  const { data: directoryList = [], isLoading: dirLoading } = useQuery({
    queryKey: ['alumni-directory'],
    queryFn: () => fetchAlumniDirectory(),
  });

  const { data: pendingAlumni = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['alumni-pending'],
    queryFn: fetchPendingAlumni,
  });

  const { data: eventList = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['alumni-events'],
    queryFn: fetchAlumniEvents,
  });

  const { data: jobList = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['alumni-jobs'],
    queryFn: fetchAlumniJobs,
  });

  const { data: mentorshipRequests = [], isLoading: mentorLoading } = useQuery({
    queryKey: ['alumni-mentorship'],
    queryFn: fetchMentorshipRequests,
  });

  const { data: donationLeaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['alumni-leaderboard'],
    queryFn: fetchDonationLeaderboard,
  });

  const { data: successStories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ['alumni-stories'],
    queryFn: fetchSuccessStories,
  });

  const { data: announcementLogs = [], isLoading: announcementLoading } = useQuery({
    queryKey: ['alumni-announcements'],
    queryFn: fetchAnnouncementLogs,
  });

  const { data: connections = [], isLoading: connsLoading } = useQuery({
    queryKey: ['alumni-connections', currentAlumniId],
    queryFn: () => fetchAlumniConnections(currentAlumniId),
  });

  const { data: feedPosts = [], isLoading: feedLoading } = useQuery({
    queryKey: ['alumni-feed'],
    queryFn: fetchAlumniFeed,
  });

  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>('alm-001');
  const { data: selectedProfile, isLoading: profileDetailLoading } = useQuery({
    queryKey: ['alumni-profile-detail', selectedAlumniId],
    queryFn: () => fetchAlumniProfile(selectedAlumniId!),
    enabled: !!selectedAlumniId,
  });

  const contextValue = {
    stats,
    statsLoading,
    directoryList,
    dirLoading,
    pendingAlumni,
    pendingLoading,
    eventList,
    eventsLoading,
    jobList,
    jobsLoading,
    mentorshipRequests,
    mentorLoading,
    donationLeaderboard,
    leaderboardLoading,
    successStories,
    storiesLoading,
    announcementLogs,
    connections,
    connsLoading,
    feedPosts,
    feedLoading,
    selectedAlumniId,
    setSelectedAlumniId,
    selectedProfile,
    profileDetailLoading,
    currentAlumniId,
    queryClient,
  };

  return (
    <AlumniContext.Provider value={contextValue}>
      <Outlet />
    </AlumniContext.Provider>
  );
}
