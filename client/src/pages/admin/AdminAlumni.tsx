import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Award, Calendar, DollarSign, Plus, Trash2, CheckCircle, MessageSquare, 
  Briefcase, Heart, BookOpen, Send, FileText, Settings, Search, Filter, 
  MapPin, ExternalLink, ThumbsUp, Download, RefreshCw, Star, HelpCircle, Save, 
  ShieldAlert, Share2, MessageCircle, MoreVertical, Check, X, ShieldCheck, 
  Mail, Phone, Image, Paperclip, Smile, Eye, EyeOff, Lock, BellRing, Sparkles
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { EventGalleryTab, InternshipsTab, PlacementPortalTab, HelpTab } from "./AlumniExtraTabs";
import { toast } from "sonner";
import { 
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
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
  fetchAIRecommendations
} from "@/services/alumniService";

type TabId = 
  | "dashboard" 
  | "directory" 
  | "registration" 
  | "profile" 
  | "events" 
  | "gallery"
  | "jobs" 
  | "internships"
  | "placement"
  | "mentorship" 
  | "donations" 
  | "stories" 
  | "networking" 
  | "messaging" 
  | "announcements" 
  | "notifications"
  | "verification"
  | "ai-features"
  | "reports" 
  | "settings"
  | "help";

export function AdminAlumni() {
  const queryClient = useQueryClient();

  const getTabFromUrl = (): TabId => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as TabId;
      if (tab) return tab;
    }
    return "dashboard";
  };

  const [activeTab, _setActiveTab] = useState<TabId>(getTabFromUrl());

  const setActiveTab = (tabId: TabId) => {
    _setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.pushState({}, "", url.toString());
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      _setActiveTab(getTabFromUrl());
    };
    window.addEventListener("popstate", handleUrlChange);
    const interval = setInterval(handleUrlChange, 200);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  // Local active alumni id context (simulate current logged in alumni profile)
  const currentAlumniId = "alm-001";

  // Data queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["alumni-stats"],
    queryFn: fetchAlumniDashboardStats
  });

  const { data: directoryList = [], isLoading: dirLoading } = useQuery({
    queryKey: ["alumni-directory"],
    queryFn: () => fetchAlumniDirectory()
  });

  const { data: pendingAlumni = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["alumni-pending"],
    queryFn: fetchPendingAlumni
  });

  const { data: eventList = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["alumni-events"],
    queryFn: fetchAlumniEvents
  });

  const { data: jobList = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["alumni-jobs"],
    queryFn: fetchAlumniJobs
  });

  const { data: mentorshipRequests = [], isLoading: mentorLoading } = useQuery({
    queryKey: ["alumni-mentorship"],
    queryFn: fetchMentorshipRequests
  });

  const { data: donationLeaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["alumni-leaderboard"],
    queryFn: fetchDonationLeaderboard
  });

  const { data: successStories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ["alumni-stories"],
    queryFn: fetchSuccessStories
  });

  const { data: connections = [], isLoading: connsLoading } = useQuery({
    queryKey: ["alumni-connections", currentAlumniId],
    queryFn: () => fetchAlumniConnections(currentAlumniId)
  });

  const { data: feedPosts = [], isLoading: feedLoading } = useQuery({
    queryKey: ["alumni-feed"],
    queryFn: fetchAlumniFeed
  });

  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>("alm-001");
  const { data: selectedProfile, isLoading: profileDetailLoading } = useQuery({
    queryKey: ["alumni-profile-detail", selectedAlumniId],
    queryFn: () => fetchAlumniProfile(selectedAlumniId!),
    enabled: !!selectedAlumniId
  });

  const menuItems = null; // Navigation moved to left sidebar — internal menu removed

  const tabTitle: Record<TabId, string> = {
    dashboard: "Dashboard", directory: "Alumni Directory", registration: "Alumni Registration",
    profile: "Alumni Profiles", events: "Events & Reunions", gallery: "Event Gallery",
    jobs: "Job Portal", internships: "Internship Opportunities", placement: "Placement Portal",
    mentorship: "Mentorship", donations: "Donations", stories: "Success Stories",
    networking: "Professional Network", messaging: "Messages", announcements: "Announcements",
    notifications: "Notifications", verification: "Alumni Verification",
    "ai-features": "AI Recommendations", reports: "Reports & Analytics",
    settings: "Settings", help: "Help",
  };

  const tabGroup: Partial<Record<TabId, string>> = {
    directory: "Alumni Management", registration: "Alumni Management", profile: "Alumni Management", verification: "Alumni Management",
    jobs: "Career", internships: "Career", placement: "Career",
    mentorship: "Community", networking: "Community", messaging: "Community",
    events: "Events", gallery: "Events",
    donations: "Contributions", stories: "Contributions",
    announcements: "Communication", notifications: "Communication",
  };

  return (
    <div className="space-y-6">
      {/* Page breadcrumb + title */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span className="font-medium text-foreground">Alumni</span>
        {tabGroup[activeTab] && (
          <>
            <span>/</span>
            <span>{tabGroup[activeTab]}</span>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-indigo-600">{tabTitle[activeTab]}</span>
      </div>

      <PageHeader
        title={tabTitle[activeTab]}
        desc={activeTab === "dashboard"
          ? "Alumni network overview — registrations, placements, events, donations and analytics."
          : `Manage ${tabTitle[activeTab].toLowerCase()} in the Alumni workspace.`}
      />

      {/* Full-width content area */}
      <div>
        {activeTab === "dashboard" && (
          <DashboardTab
            stats={stats}
            isLoading={statsLoading}
            onNavigate={setActiveTab}
            donationLeaderboard={donationLeaderboard}
            eventList={eventList}
            directoryList={directoryList}
            mentorshipRequests={mentorshipRequests}
          />
        )}
        {activeTab === "directory" && (
          <DirectoryTab
            list={directoryList}
            isLoading={dirLoading}
            pending={pendingAlumni}
            pendingLoading={pendingLoading}
            onSelectAlumni={(id: string) => {
              setSelectedAlumniId(id);
              setActiveTab("profile");
            }}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
            }}
            currentAlumniId={currentAlumniId}
          />
        )}
        {activeTab === "registration" && (
          <RegistrationTab
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
              setActiveTab("directory");
            }}
          />
        )}
        {activeTab === "profile" && (
          <ProfileTab
            directory={directoryList}
            selectedId={selectedAlumniId}
            onSelectId={setSelectedAlumniId}
            profile={selectedProfile}
            isLoading={profileDetailLoading}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-profile-detail", selectedAlumniId] });
              queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
            }}
          />
        )}
        {activeTab === "events" && (
          <EventsTab
            list={eventList}
            isLoading={eventsLoading}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
            }}
            alumniList={directoryList}
          />
        )}
        {activeTab === "gallery" && <EventGalleryTab eventList={eventList} />}
        {activeTab === "jobs" && (
          <JobsTab
            list={jobList}
            isLoading={jobsLoading}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-jobs"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
            }}
            alumniList={directoryList}
          />
        )}
        {activeTab === "internships" && <InternshipsTab alumniList={directoryList} />}
        {activeTab === "placement" && <PlacementPortalTab alumniList={directoryList} stats={stats} />}
        {activeTab === "mentorship" && (
          <MentorshipTab
            requests={mentorshipRequests}
            isLoading={mentorLoading}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-mentorship"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
            }}
            alumniList={directoryList}
          />
        )}
        {activeTab === "donations" && (
          <DonationsTab
            leaderboard={donationLeaderboard}
            isLoading={leaderboardLoading}
            alumniList={directoryList}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-leaderboard"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
            }}
          />
        )}
        {activeTab === "stories" && (
          <StoriesTab
            stories={successStories}
            isLoading={storiesLoading}
            alumniList={directoryList}
            onRefetch={() => queryClient.invalidateQueries({ queryKey: ["alumni-stories"] })}
          />
        )}
        {activeTab === "networking" && (
          <NetworkingTab
            posts={feedPosts}
            isLoading={feedLoading}
            connections={connections}
            connsLoading={connsLoading}
            alumniList={directoryList}
            currentAlumniId={currentAlumniId}
            onRefetch={() => {
              queryClient.invalidateQueries({ queryKey: ["alumni-feed"] });
              queryClient.invalidateQueries({ queryKey: ["alumni-connections"] });
            }}
          />
        )}
        {activeTab === "messaging" && (
          <MessagingTab alumniList={directoryList} currentAlumniId={currentAlumniId} />
        )}
        {activeTab === "announcements" && <AnnouncementsTab alumniList={directoryList} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "verification" && <VerificationTab alumniList={directoryList} />}
        {activeTab === "ai-features" && <AIFeaturesTab currentAlumniId={currentAlumniId} />}
        {activeTab === "reports" && (
          <ReportsTab alumni={directoryList} donations={donationLeaderboard} />
        )}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "help" && <HelpTab />}
      </div>
    </div>
  );
}

// ── 1. DASHBOARD TAB ─────────────────────────────────────
function DashboardTab({ stats, isLoading, onNavigate, donationLeaderboard, eventList, directoryList, mentorshipRequests }: any) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <RefreshCw className="size-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading dashboard analytics…</span>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalAlumni: 0, activeAlumni: 0, newRegistrations: 0, upcomingEvents: 0,
    totalDonations: 0, jobOpportunities: 0, mentorshipRequests: 0, eventRegistrations: 0
  };

  const growthData  = stats?.charts?.byGraduationYear || [];
  const deptData    = stats?.charts?.byDepartment || [];
  const empData     = stats?.charts?.byEmploymentStatus || [];

  const placementData = [
    { batch: "2019", placed: 88, higher: 10 },
    { batch: "2020", placed: 82, higher: 12 },
    { batch: "2021", placed: 91, higher:  7 },
    { batch: "2022", placed: 95, higher:  4 },
  ];
  const donationTrend = [
    { month: "Jan", amount: 42000 }, { month: "Feb", amount: 58000 },
    { month: "Mar", amount: 35000 }, { month: "Apr", amount: 72000 },
    { month: "May", amount: 63000 }, { month: "Jun", amount: 89000 },
  ];

  const quickActions = [
    { label: "Add Alumni",       icon: Plus,         tab: "registration" as const,   color: "bg-indigo-600 hover:bg-indigo-700" },
    { label: "Create Event",     icon: Calendar,     tab: "events"       as const,   color: "bg-violet-600 hover:bg-violet-700" },
    { label: "Post Job",         icon: Briefcase,    tab: "jobs"         as const,   color: "bg-cyan-600   hover:bg-cyan-700"   },
    { label: "Announcement",     icon: Send,         tab: "announcements"as const,   color: "bg-pink-600   hover:bg-pink-700"   },
    { label: "Success Story",    icon: BookOpen,     tab: "stories"      as const,   color: "bg-emerald-600 hover:bg-emerald-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 p-6 text-white flex items-center justify-between shadow-soft overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative">
          <div className="text-2xl font-bold mb-1">Alumni Management Dashboard</div>
          <div className="text-white/80 text-sm">Real-time overview of your alumni network, placements, events, and contributions.</div>
        </div>
        <div className="relative hidden md:flex gap-3">
          {quickActions.map(q => (
            <button
              key={q.tab}
              onClick={() => onNavigate(q.tab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white ${q.color} transition shadow cursor-pointer`}
            >
              <q.icon className="size-3.5" />
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Alumni"          value={`${kpis.totalAlumni}`}          change="Registered graduates"    icon={Users}       gradient="from-blue-600 to-cyan-500" />
        <StatCard label="Active Alumni"         value={`${kpis.activeAlumni}`}         change="Verified & active"       icon={CheckCircle} gradient="from-emerald-500 to-teal-600" />
        <StatCard label="New Registrations"     value={`${kpis.newRegistrations}`}     change="This month"              icon={Plus}        gradient="from-violet-500 to-indigo-600" />
        <StatCard label="Employment Rate"       value={`${Math.floor(kpis.totalAlumni ? (kpis.activeAlumni / kpis.totalAlumni) * 100 : 72)}%`} change="Placed alumni"  icon={Briefcase}   gradient="from-amber-500 to-orange-600" />
        <StatCard label="Total Donations"       value={`₹${kpis.totalDonations.toLocaleString()}`} change="Capital endowments" icon={DollarSign} gradient="from-teal-500 to-emerald-600" />
        <StatCard label="Upcoming Events"       value={`${kpis.upcomingEvents}`}       change="Reunions & webinars"     icon={Calendar}    gradient="from-rose-500 to-pink-600" />
        <StatCard label="Pending Mentorships"   value={`${kpis.mentorshipRequests}`}   change="Awaiting match"          icon={Star}        gradient="from-purple-500 to-violet-600" />
        <StatCard label="Job Opportunities"     value={`${kpis.jobOpportunities}`}     change="Active listings"         icon={FileText}    gradient="from-sky-500 to-blue-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">Alumni Growth by Graduation Year</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="rgba(99,102,241,0.15)" strokeWidth={2} name="Alumni" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">Department Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={70} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ec4899" radius={[0,4,4,0]} name="Alumni" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">Placement Statistics (Batch-wise)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="batch" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="placed" fill="#4f46e5" radius={[4,4,0,0]} name="Placed %" />
                <Bar dataKey="higher" fill="#06b6d4" radius={[4,4,0,0]} name="Higher Studies %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">Donations Overview (Monthly)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} tick={{ fontSize: 11 }} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip formatter={(v: any) => [`₹${v.toLocaleString()}`, "Donations"]} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={2} name="Donations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity + Upcoming */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Newly Registered */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Newly Registered Alumni</h3>
            <button onClick={() => onNavigate("directory")} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {directoryList.slice(0, 4).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 text-xs">
                <div className="size-8 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {a.full_name?.charAt(0) ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{a.full_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{a.designation} · Class of {a.graduation_year}</div>
                </div>
              </div>
            ))}
            {directoryList.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No alumni registered yet</div>}
          </div>
        </Card>

        {/* Recent Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Upcoming Events</h3>
            <button onClick={() => onNavigate("events")} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {eventList.slice(0, 3).map((ev: any) => (
              <div key={ev.id} className="flex items-start gap-3 text-xs">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0"><Calendar className="size-3.5" /></div>
                <div>
                  <div className="font-semibold">{ev.title}</div>
                  <div className="text-[10px] text-muted-foreground">{ev.date} · {ev.venue || ev.location || "TBD"}</div>
                </div>
              </div>
            ))}
            {eventList.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No upcoming events</div>}
          </div>
        </Card>

        {/* Top Donors */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Recent Donations</h3>
            <button onClick={() => onNavigate("donations")} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-3">
            {donationLeaderboard.slice(0, 4).map((d: any, idx: number) => (
              <div key={d.id || idx} className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-[10px] text-muted-foreground">Class of {d.graduationYear}</div>
                </div>
                <div className="font-mono font-bold text-emerald-600">₹{d.totalDonated?.toLocaleString()}</div>
              </div>
            ))}
            {donationLeaderboard.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No donations yet</div>}
          </div>
        </Card>
      </div>

      {/* Mobile Quick Actions */}
      <Card className="md:hidden">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(q => (
            <button
              key={q.tab}
              onClick={() => onNavigate(q.tab)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white ${q.color} transition cursor-pointer`}
            >
              <q.icon className="size-4" />
              {q.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}


// ── 2. ALUMNI DIRECTORY TAB ──────────────────────────────
function DirectoryTab({ list, isLoading, pending, pendingLoading, onSelectAlumni, onRefetch, currentAlumniId }: any) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [year, setYear] = useState("All Years");
  const [skills, setSkills] = useState("");
  const [country, setCountry] = useState("");

  const [activeSubTab, setActiveSubTab] = useState<"directory" | "pending">("directory");

  const queryClient = useQueryClient();
  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Approved" | "Rejected" }) =>
      approveAlumniProfile(id, status),
    onSuccess: () => {
      onRefetch();
      toast.success("Profile registration resolved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile registration status");
    }
  });

  const connectMutation = useMutation({
    mutationFn: (receiverId: string) => sendConnectionRequest(currentAlumniId, receiverId),
    onSuccess: () => {
      toast.success("Connection request sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["alumni-connections", currentAlumniId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Request already pending.");
    }
  });

  const filteredList = list.filter((a: any) => {
    const s = search.toLowerCase();
    const matchSearch = a.full_name.toLowerCase().includes(s) || 
                        a.email.toLowerCase().includes(s) || 
                        (a.current_company && a.current_company.toLowerCase().includes(s)) ||
                        (a.designation && a.designation.toLowerCase().includes(s));
    const matchDept = dept === "All Departments" || a.department === dept;
    const matchYear = year === "All Years" || String(a.graduation_year) === year;
    const matchCountry = !country.trim() || (a.country && a.country.toLowerCase().includes(country.toLowerCase()));
    const matchSkills = !skills.trim() || (a.skills && a.skills.some((sk: string) => sk.toLowerCase().includes(skills.toLowerCase())));
    return matchSearch && matchDept && matchYear && matchCountry && matchSkills;
  });

  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      toast.error("No records to export.");
      return;
    }
    const headers = ["Full Name", "Roll Number", "Email", "Phone", "Department", "Graduation Year", "Company", "Designation", "Country"];
    const rows = filteredList.map((a: any) => [
      a.full_name, a.roll_number, a.email, a.phone, a.department, a.graduation_year, a.current_company, a.designation, a.country || "India"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alumni_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Alumni Directory CSV downloaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-sidebar-border gap-6">
        <button
          onClick={() => setActiveSubTab("directory")}
          className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === "directory"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Approved Directory ({list.length})
        </button>
        <button
          onClick={() => setActiveSubTab("pending")}
          className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === "pending"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Review Approvals ({pending.length})
        </button>
      </div>

      {activeSubTab === "directory" ? (
        <>
          {/* Advanced Filter Toolbar */}
          <Card className="p-4 border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Department</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none cursor-pointer"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Graduation Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none cursor-pointer"
                >
                  <option value="All Years">All Years</option>
                  <option value="2022">Class of 2022</option>
                  <option value="2021">Class of 2021</option>
                  <option value="2020">Class of 2020</option>
                  <option value="2019">Class of 2019</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Filter Skills</label>
                <input
                  type="text"
                  placeholder="React, AWS, etc."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Country</label>
                <input
                  type="text"
                  placeholder="India, USA..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 justify-between pt-3 border-t">
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 border rounded-xl bg-background hover:bg-muted text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Download className="size-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={() => toast.success("Exported to Excel successfully!")}
                  className="flex items-center gap-1.5 px-3 py-2 border rounded-xl bg-background hover:bg-muted text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Download className="size-3.5" />
                  Export Excel
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, designation, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Directory Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <RefreshCw className="size-8 animate-spin text-indigo" />
              <span className="text-sm font-medium">Fetching directory registry...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border rounded-2xl bg-muted/20">
              <Users className="size-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">No alumni records match these filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((a: any) => (
                <Card key={a.id} className="border flex flex-col justify-between hover:border-indigo-500/50 transition">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="size-11 rounded-full bg-indigo-500/10 text-indigo flex items-center justify-center font-bold text-sm">
                        {a.full_name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge tone="success">Verified</Badge>
                        <ShieldCheck className="size-4.5 text-emerald-500 shrink-0" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{a.full_name}</h4>
                      <p className="text-[11px] text-muted-foreground">{a.department} • Class of {a.graduation_year}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t text-[11px] space-y-2 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="size-3.5 text-muted-foreground/70" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{a.designation || 'Software Engineer'}</span> at <span className="font-bold text-indigo-600">{a.current_company || 'Google'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-muted-foreground/70" />
                        <span>{a.location || 'Bangalore'}, {a.country || 'India'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-between items-center">
                    <button
                      onClick={() => onSelectAlumni(a.id)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Profile
                      <ExternalLink className="size-3.5" />
                    </button>

                    {a.id !== currentAlumniId && (
                      <button
                        onClick={() => connectMutation.mutate(a.id)}
                        className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-[10px] cursor-pointer transition shadow-sm"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Pending Approvals Table */
        <Card className="overflow-hidden border">
          {pendingLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <RefreshCw className="size-8 animate-spin text-indigo" />
              <span className="text-sm font-medium">Fetching pending registration logs...</span>
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <CheckCircle className="size-12 mx-auto mb-4 opacity-30 text-emerald-500" />
              <p className="text-sm font-medium">All registration requests resolved!</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Grad Profile</th>
                    <th className="py-3 px-4">Student ID / Roll</th>
                    <th className="py-3 px-4">Department &amp; Class</th>
                    <th className="py-3 px-4">Work Details</th>
                    <th className="py-3 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pending.map((a: any) => (
                    <tr key={a.id} className="hover:bg-accent/40 transition">
                      <td className="py-3 px-4 font-semibold">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{a.full_name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{a.email}</div>
                      </td>
                      <td className="py-3 px-4 font-medium font-mono text-muted-foreground">
                        {a.student_id || a.roll_number || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div>{a.department}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">Class of {a.graduation_year}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{a.designation || 'Design Engineer'}</span> at <span className="font-bold text-indigo-600">{a.current_company || 'Tata Motors'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => approveMutation.mutate({ id: a.id, status: "Approved" })}
                            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer transition text-[10px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => approveMutation.mutate({ id: a.id, status: "Rejected" })}
                            className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer transition text-[10px]"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ── 3. ALUMNI REGISTRATION TAB ───────────────────────────
function RegistrationTab({ onSuccess }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roll, setRoll] = useState("");
  const [studentId, setStudentId] = useState("");
  const [dept, setDept] = useState("Computer Science");
  const [year, setYear] = useState("2022");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("India");
  const [linkedin, setLinkedin] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const regMutation = useMutation({
    mutationFn: (payload: any) => registerAlumni(payload),
    onSuccess: () => {
      toast.success("Profile request logged! Review queue update pending.");
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message || "Profile email or Student ID already present.");
    }
  });

  const handleSendOtp = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    toast.success("Verification OTP code sent successfully to " + email);
    setSentOtp(true);
  };

  const handleVerifyOtp = () => {
    if (otp === "123456") {
      toast.success("OTP verification successful! Form unlocked.");
      setOtpVerified(true);
    } else {
      toast.error("Invalid verification code. Try '123456' for verification.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify your email via OTP first!");
      return;
    }
    const payload = {
      full_name: name,
      email,
      phone,
      roll_number: roll || null,
      student_id: studentId || null,
      department: dept,
      graduation_year: Number(year),
      current_company: company || null,
      designation: designation || null,
      location: location || null,
      country,
      linkedin: linkedin || null,
      skills,
      biography: bio || null,
      status: "Pending"
    };
    regMutation.mutate(payload);
  };

  return (
    <Card className="border">
      <h3 className="font-semibold text-sm mb-1.5">Intake Portal Registration</h3>
      <p className="text-xs text-muted-foreground mb-6">Alumni self-registration form. Fields are locked until OTP verification clears.</p>
      
      <div className="p-4 border rounded-2xl bg-muted/20 mb-6 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="font-bold block text-slate-800 dark:text-slate-200">Email Verification Steps</span>
          <span className="text-muted-foreground text-[10px]">Provide email and request OTP code.</span>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="email"
            placeholder="anjali@alumni.com"
            disabled={sentOtp}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-background outline-none text-xs"
          />
          {!sentOtp ? (
            <button
              onClick={handleSendOtp}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer transition text-[10px]"
            >
              Get OTP
            </button>
          ) : !otpVerified ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-24 px-3 py-2 border rounded-xl bg-background outline-none text-xs"
              />
              <button
                onClick={handleVerifyOtp}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer transition text-[10px]"
              >
                Verify
              </button>
            </div>
          ) : (
            <Badge tone="success">Verified</Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs opacity-90">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-muted-foreground">Full Name *</label>
            <input
              type="text"
              required
              disabled={!otpVerified}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anjali Sen"
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border bg-background text-xs outline-none disabled:bg-muted"
            />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground">Phone Number</label>
            <input
              type="text"
              disabled={!otpVerified}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543200"
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border bg-background text-xs outline-none disabled:bg-muted"
            />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground">Academic Identifiers</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <input
                type="text"
                disabled={!otpVerified}
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                placeholder="Roll (e.g. 17CS801)"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs outline-none disabled:bg-muted"
              />
              <input
                type="text"
                disabled={!otpVerified}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Student ID (e.g. STU-801)"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs outline-none disabled:bg-muted"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold text-muted-foreground">Academic Department</label>
            <select
              disabled={!otpVerified}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border bg-background text-xs outline-none disabled:bg-muted cursor-pointer"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!otpVerified || regMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl transition cursor-pointer disabled:from-slate-400 disabled:to-slate-500"
          >
            {regMutation.isPending ? "Submitting Registration Details..." : "Register Alumni Record"}
          </button>
        </div>
      </form>
    </Card>
  );
}

// ── 4. PROFILE TAB ───────────────────────────────────────
function ProfileTab({ directory, selectedId, onSelectId, profile, isLoading, onRefetch }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCompany, setEditCompany] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateAlumniProfile(selectedId!, payload),
    onSuccess: () => {
      onRefetch();
      setIsEditing(false);
      toast.success("Detailed profile saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save profile details");
    }
  });

  const handleStartEdit = () => {
    if (profile) {
      setEditCompany(profile.current_company || "");
      setEditDesignation(profile.designation || "");
      setEditLocation(profile.location || "");
      setEditBio(profile.biography || "");
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      current_company: editCompany,
      designation: editDesignation,
      location: editLocation,
      biography: editBio
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 border">
        <div className="flex items-center gap-3 text-xs">
          <label className="font-semibold text-muted-foreground">Select Alumni Profile:</label>
          <select
            value={selectedId || ""}
            onChange={(e) => onSelectId(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-background outline-none font-semibold cursor-pointer"
          >
            {directory.map((a: any) => (
              <option key={a.id} value={a.id}>{a.full_name} (Class of {a.graduation_year})</option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-indigo" />
          <span className="text-sm font-medium">Loading profile history...</span>
        </div>
      ) : !profile ? (
        <div className="text-center py-20 text-muted-foreground">
          <Award className="size-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Select a profile to begin.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border relative">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="size-16 rounded-full bg-violet-500/10 text-violet flex items-center justify-center font-bold text-2xl">
                    {profile.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{profile.full_name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{profile.department} • Class of {profile.graduation_year}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-muted-foreground/70" />
                      <span>{profile.location || 'Bangalore'}, {profile.country || 'India'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={isEditing ? handleSave : handleStartEdit}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-[11px] cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Save className="size-3" />
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>

              <div className="mt-6 pt-5 border-t">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Biography Summary</h4>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-background text-xs outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {profile.biography || "No biography details logged."}
                  </p>
                )}
              </div>
            </Card>

            {/* Timelines and Educations */}
            <Card className="border">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">Professional Experience Registry</h4>
              
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/15">
                {profile.employment && profile.employment.map((emp: any) => (
                  <div key={emp.id} className="flex gap-4 relative pl-8 text-xs">
                    <div className="absolute left-1.5 top-1 size-3.5 rounded-full border-2 border-indigo-500 bg-background" />
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">{emp.designation}</h5>
                      <p className="font-semibold text-indigo-600">{emp.company_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{emp.start_date} — {emp.is_current ? 'Present' : emp.end_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">Employment Profile</h4>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-bold">Current Company</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none"
                    />
                  ) : (
                    <div className="font-semibold mt-0.5 text-foreground">{profile.current_company || 'N/A'}</div>
                  )}
                </div>

                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-bold">Designation</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none"
                    />
                  ) : (
                    <div className="font-semibold mt-0.5 text-foreground">{profile.designation || 'N/A'}</div>
                  )}
                </div>

                <div>
                  <div className="text-muted-foreground text-[10px] uppercase font-bold">Location</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-xl bg-background text-xs outline-none"
                    />
                  ) : (
                    <div className="font-semibold mt-0.5 text-foreground">{profile.location || 'N/A'}</div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">Skills Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {(profile.skills || []).map((s: string, idx: number) => (
                  <Badge key={idx} tone="info">{s}</Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 5. EVENTS TAB ────────────────────────────────────────
function EventsTab({ list, isLoading, onRefetch, alumniList }: any) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Reunion");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [qrCodeModal, setQrCodeModal] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (payload: any) => createAlumniEvent(payload),
    onSuccess: () => {
      onRefetch();
      setIsCreateOpen(false);
      setTitle("");
      setDesc("");
      setDate("");
      setTime("");
      setVenue("");
      setCapacity("");
      toast.success("Event scheduled successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to schedule event");
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !venue.trim()) {
      toast.error("Please enter required fields");
      return;
    }
    createMutation.mutate({
      title,
      description: desc,
      category,
      date,
      time,
      venue,
      capacity: capacity ? Number(capacity) : null,
      status: "Published"
    });
  };

  const handleScanQR = (eventTitle: string) => {
    setQrCodeModal(eventTitle);
    setTimeout(() => {
      toast.success("QR Attendance verified successfully for " + eventTitle);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Scheduled Reunions &amp; Workshops</h3>
        <button
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="size-4" />
          Schedule Event
        </button>
      </div>

      {isCreateOpen && (
        <Card className="border">
          <h4 className="font-bold text-sm mb-3">Schedule New Event</h4>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Grand Reunions dinner 2026"
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer"
                >
                  <option value="Reunion">Reunion</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Networking">Networking</option>
                  <option value="Webinar">Webinar</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Event Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Event Venue *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Main Auditorium"
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3.5 py-2 border rounded-xl hover:bg-muted font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
              >
                Schedule
              </button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-indigo" />
          <span className="text-sm font-medium">Loading events...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((e: any) => (
            <Card key={e.id} className="border flex flex-col justify-between hover:border-indigo-500/30 transition">
              <div>
                <div className="flex items-start justify-between">
                  <Badge tone="info">{e.category}</Badge>
                  <span className="text-[10px] font-bold font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">{e.time || '18:00 - 20:00'}</span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-sm leading-tight text-slate-800 dark:text-slate-200">{e.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 font-semibold">{e.date} • {e.venue}</p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{e.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs">
                <button
                  onClick={() => handleScanQR(e.title)}
                  className="px-3 py-1.5 border hover:bg-muted text-foreground font-bold rounded-lg cursor-pointer transition text-[10px] flex items-center gap-1"
                >
                  <Eye className="size-3" />
                  QR Attendance Scan
                </button>

                <button
                  onClick={() => {
                    if (alumniList.length === 0) {
                      toast.error("Please add active alumni in directory first!");
                      return;
                    }
                    registerForEvent(e.id, alumniList[0].id).then(() => {
                      toast.success(`Mock registered alumni ${alumniList[0].full_name} for event!`);
                    }).catch(err => toast.error(err.message));
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition text-[10px]"
                >
                  Register
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* QR code attendance popup */}
      {qrCodeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-xs text-center p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Event Check-In QR</h4>
            <div className="size-48 bg-white border-2 border-indigo-500 mx-auto flex items-center justify-center p-2 rounded-2xl">
              {/* Renders a simulated QR image */}
              <div className="w-full h-full border border-dashed border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                [SIMULATED QR ENCODING]
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{qrCodeModal}</p>
            <button
              onClick={() => setQrCodeModal(null)}
              className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close Check-In
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── 6. JOBS TAB ──────────────────────────────────────────
function JobsTab({ list, isLoading, onRefetch, alumniList }: any) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [desc, setDesc] = useState("");
  const [reqs, setReqs] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [deadline, setDeadline] = useState("");

  const postMutation = useMutation({
    mutationFn: (payload: any) => postAlumniJob(payload),
    onSuccess: () => {
      onRefetch();
      setIsPostOpen(false);
      setTitle("");
      setCompany("");
      setLocation("");
      setDesc("");
      setReqs("");
      setEligibility("");
      setDeadline("");
      toast.success("Job posting logged successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post job");
    }
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !desc.trim()) {
      toast.error("Please fill in required fields");
      return;
    }
    postMutation.mutate({
      title,
      company,
      location,
      job_type: jobType,
      description: desc,
      requirements: reqs,
      eligibility,
      deadline: deadline || null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Active Vacancies &amp; Referrals</h3>
        <button
          onClick={() => setIsPostOpen(!isPostOpen)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="size-4" />
          Post Job Opportunity
        </button>
      </div>

      {isPostOpen && (
        <Card className="border">
          <h4 className="font-bold text-sm mb-3">Post New Job Vacancy</h4>
          <form onSubmit={handlePostSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Backend Developer"
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Job Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bangalore (Hybrid)"
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Employment Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Job Description *</label>
              <textarea
                rows={3}
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Job details..."
                className="w-full mt-1.5 p-3 border rounded-xl bg-background outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPostOpen(false)}
                className="px-3.5 py-2 border rounded-xl hover:bg-muted font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
              >
                Post Job
              </button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-indigo" />
          <span className="text-sm font-medium">Loading vacancies...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((j: any) => (
            <Card key={j.id} className="border hover:border-indigo-500/30 transition flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{j.title}</h4>
                  <Badge tone="info">{j.job_type}</Badge>
                </div>
                <div className="text-xs font-semibold text-indigo-600 mt-1">{j.company} • <span className="text-muted-foreground">{j.location || 'Remote'}</span></div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{j.description}</p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <button
                  onClick={() => {
                    if (alumniList.length === 0) {
                      toast.error("Please add active alumni in directory first!");
                      return;
                    }
                    applyForJob(j.id, alumniList[0].id, "https://storage.googleapis.com/resume.pdf").then(() => {
                      toast.success(`Applied for referral successfully!`);
                    }).catch(err => toast.error(err.message));
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] cursor-pointer transition shadow-sm"
                >
                  Quick Apply
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 7. MENTORSHIP TAB ────────────────────────────────────
function MentorshipTab({ requests, isLoading, onRefetch, alumniList }: any) {
  const [activeSubTab, setActiveSubTab] = useState<"requests" | "book">("requests");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [requestReason, setRequestReason] = useState("");

  const queryClient = useQueryClient();
  const matchMutation = useMutation({
    mutationFn: ({ id, status, sessionSchedule }: { id: string; status: string; sessionSchedule?: string }) =>
      matchMentorship(id, status, sessionSchedule),
    onSuccess: () => {
      onRefetch();
      toast.success("Mentorship matched successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    }
  });

  const sessionMutation = useMutation({
    mutationFn: (payload: any) => bookMentorshipSession(payload),
    onSuccess: () => {
      toast.success("Mentorship session slot booked successfully!");
      setActiveSubTab("requests");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to book session");
    }
  });

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorId || !requestReason.trim()) {
      toast.error("Please fill in required fields.");
      return;
    }
    sessionMutation.mutate({
      requestId: `ses-${Date.now()}`,
      mentorId: selectedMentorId,
      studentId: "44444444-4444-4444-4444-444444444444",
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      startTime: "16:00",
      endTime: "17:00"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-sidebar-border gap-6">
        <button
          onClick={() => setActiveSubTab("requests")}
          className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === "requests"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Mentorship Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveSubTab("book")}
          className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === "book"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Book Session
        </button>
      </div>

      {activeSubTab === "requests" ? (
        isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="size-8 animate-spin text-indigo" />
            <span className="text-sm font-medium">Loading requests...</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {requests.map((r: any) => (
              <Card key={r.id} className="border flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Student Mentoring Request</h4>
                    <Badge tone={r.status === 'Approved' ? 'success' : 'warn'}>{r.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase">Student Name</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{r.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase">Assigned Mentor</span>
                      <span className="font-semibold text-indigo-600">{r.mentorName}</span>
                    </div>
                  </div>
                  {r.request_reason && <p className="text-slate-600 dark:text-slate-300 mt-2.5 italic">"{r.request_reason}"</p>}
                </div>

                {r.status === 'Pending' && (
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => matchMutation.mutate({ id: r.id, status: "Approved", sessionSchedule: new Date().toISOString() })}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer transition text-[11px]"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => matchMutation.mutate({ id: r.id, status: "Rejected" })}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer transition text-[11px]"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Book Session Form */
        <Card className="border max-w-xl">
          <h4 className="font-bold text-sm mb-3">Book Mentorship Slot</h4>
          <form onSubmit={handleBookSession} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground">Select Mentor *</label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background text-xs outline-none cursor-pointer"
              >
                <option value="" disabled>Select Mentor...</option>
                {alumniList.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.full_name} ({a.designation})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Reason for Session request *</label>
              <textarea
                rows={3}
                required
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Explain what topics you want career guidance on..."
                className="w-full mt-1.5 p-3 border rounded-xl bg-background outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Book Session Slot
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

// ── 8. DONATIONS TAB ─────────────────────────────────────
function DonationsTab({ leaderboard, isLoading, alumniList, onRefetch }: any) {
  const [amount, setAmount] = useState("");
  const [alumniId, setAlumniId] = useState("");
  const [cause, setCause] = useState("AIML Lab Supercomputing Fund");

  const donateMutation = useMutation({
    mutationFn: (payload: any) => recordDonation(payload),
    onSuccess: () => {
      onRefetch();
      setAmount("");
      toast.success("Contribution recorded successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record contribution");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !alumniId) {
      toast.error("Please fill in required fields");
      return;
    }
    donateMutation.mutate({
      alumniId,
      amount: Number(amount),
      cause,
      transactionId: `TXN-${Math.floor(Math.random() * 90000000 + 10000000)}`
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border">
        <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase tracking-wider">Endowment Leaderboard</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="size-8 animate-spin text-indigo" />
            <span className="text-sm font-medium">Loading leaderboard...</span>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Donor</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Total Gift</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaderboard.map((d: any, idx: number) => (
                  <tr key={d.id} className="hover:bg-accent/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{d.name}</td>
                    <td className="py-3 px-4 text-muted-foreground font-semibold">Class of {d.graduationYear}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">₹{d.totalDonated.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="border flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1.5">Record Donation Gift</h3>
          <p className="text-xs text-muted-foreground mb-4">Log tax-exempt gift payments.</p>
          
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground">Donor *</label>
              <select
                value={alumniId}
                onChange={(e) => setAlumniId(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs outline-none cursor-pointer"
              >
                <option value="" disabled>Select Alumni...</option>
                {alumniList.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.full_name} (Class of {a.graduation_year})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={donateMutation.isPending}
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition cursor-pointer"
            >
              Log Donation
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

// ── 9. STORIES TAB ───────────────────────────────────────
function StoriesTab({ stories, isLoading, alumniList, onRefetch }: any) {
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [alumniId, setAlumniId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Featured Alumni");
  const [content, setContent] = useState("");

  const storyMutation = useMutation({
    mutationFn: (payload: any) => createSuccessStory(payload),
    onSuccess: () => {
      onRefetch();
      setIsWriteOpen(false);
      setAlumniId("");
      setTitle("");
      setContent("");
      toast.success("Success story published!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish story");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !alumniId) {
      toast.error("Please fill in required fields");
      return;
    }
    storyMutation.mutate({
      alumniId,
      title,
      content,
      category
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Achievements &amp; Success Stories</h3>
        <button
          onClick={() => setIsWriteOpen(!isWriteOpen)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="size-4" />
          Publish Story
        </button>
      </div>

      {isWriteOpen && (
        <Card className="border">
          <h4 className="font-bold text-sm mb-3">Publish Story</h4>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-muted-foreground">Select Alumni Author *</label>
                <select
                  value={alumniId}
                  onChange={(e) => setAlumniId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Alumni...</option>
                  {alumniList.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs outline-none cursor-pointer"
                >
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Research">Research</option>
                  <option value="Featured Alumni">Featured Alumni</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Story Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Forbes 30 under 30 achievement"
                className="w-full mt-1.5 px-3 py-2.5 border rounded-xl bg-background text-xs outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Story Content *</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write achievements details..."
                className="w-full mt-1.5 p-3 border rounded-xl bg-background text-xs outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsWriteOpen(false)}
                className="px-3.5 py-2 border rounded-xl hover:bg-muted font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
              >
                Publish
              </button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <RefreshCw className="size-8 animate-spin text-indigo" />
          <span className="text-sm font-medium">Loading stories...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {stories.map((s: any) => (
            <Card key={s.id} className="border flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="info">{s.category}</Badge>
                </div>
                <h4 className="font-bold text-base mt-2 text-slate-800 dark:text-slate-200">{s.title}</h4>
                <div className="text-xs font-semibold text-indigo-600 mt-1">Written by: {s.alumniName} • <span className="text-muted-foreground">{s.designation} at {s.company}</span></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 10. NETWORKING TAB (SOCIAL FEED) ──────────────────────
function NetworkingTab({ posts, isLoading, connections, connsLoading, alumniList, currentAlumniId, onRefetch }: any) {
  const [postText, setPostText] = useState("");
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const addPostMutation = useMutation({
    mutationFn: (content: string) => createAlumniPost(currentAlumniId, content),
    onSuccess: () => {
      setPostText("");
      onRefetch();
      toast.success("Post published to network feed!");
    }
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likeAlumniPost(postId, currentAlumniId),
    onSuccess: () => {
      onRefetch();
    }
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      commentAlumniPost(postId, currentAlumniId, content),
    onSuccess: () => {
      setCommentText({});
      onRefetch();
      toast.success("Comment added!");
    }
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    addPostMutation.mutate(postText);
  };

  const handleCommentSubmit = (postId: string) => {
    const content = commentText[postId];
    if (!content || !content.trim()) return;
    commentMutation.mutate({ postId, content });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 text-xs">
      <div className="lg:col-span-2 space-y-6">
        {/* Post Form */}
        <Card className="border">
          <form onSubmit={handlePostSubmit} className="space-y-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind? Share articles or job referrals..."
              className="w-full p-3 border rounded-xl bg-background outline-none"
            />
            <div className="flex justify-between items-center">
              <button type="button" className="flex items-center gap-1 text-muted-foreground hover:text-indigo-600 transition">
                <Image className="size-4" />
                <span>Photo / Video</span>
              </button>
              <button
                type="submit"
                disabled={addPostMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Post Circular
              </button>
            </div>
          </form>
        </Card>

        {/* Feed Posts */}
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading feed...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post.id} className="border space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-full bg-indigo-500/10 text-indigo flex items-center justify-center font-bold text-sm shrink-0">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">{post.authorName}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{post.authorDesignation} at {post.authorCompany || 'Independent'}</span>
                  </div>
                </div>

                <p className="leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{post.content}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="Post Attachment" className="w-full h-48 object-cover rounded-xl border shadow-sm" />
                )}

                <div className="flex items-center gap-4 pt-3 border-t text-muted-foreground font-bold">
                  <button onClick={() => likeMutation.mutate(post.id)} className="flex items-center gap-1.5 hover:text-indigo-600 transition">
                    <ThumbsUp className="size-4" />
                    <span>Like ({post.likes_count})</span>
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-2 border-t pt-3">
                  {(post.comments || []).map((c: any) => (
                    <div key={c.id} className="p-2 bg-muted/30 rounded-xl">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.authorName}</span>
                      <p className="mt-1 text-slate-600 dark:text-slate-300 font-medium">{c.content}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[post.id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      className="flex-1 px-3 py-1.5 border rounded-xl bg-background outline-none"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Network Connections */}
      <Card className="border h-fit">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">My Professional Connections</h4>
        {connsLoading ? (
          <div className="text-center py-6 text-muted-foreground">Loading connections...</div>
        ) : (
          <div className="space-y-3">
            {connections.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{c.targetName}</div>
                  <div className="text-[10px] text-muted-foreground">{c.targetDesignation} at {c.targetCompany || 'Google'}</div>
                </div>
                <Badge tone={c.status === 'Accepted' ? 'success' : 'warn'}>{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── 11. MESSAGING TAB ────────────────────────────────────
function MessagingTab({ alumniList, currentAlumniId }: any) {
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [inputText, setInputText] = useState("");

  const { data: thread = [], refetch: refetchChat } = useQuery({
    queryKey: ["alumni-chat-thread", currentAlumniId, selectedPeerId],
    queryFn: () => fetchAlumniMessages(currentAlumniId, selectedPeerId),
    enabled: !!selectedPeerId
  });

  const sendMsgMutation = useMutation({
    mutationFn: (content: string) => sendAlumniMessage(currentAlumniId, selectedPeerId, content),
    onSuccess: () => {
      setInputText("");
      refetchChat();
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMsgMutation.mutate(inputText);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border rounded-2xl overflow-hidden bg-background h-[500px] text-xs">
      {/* Peers List Sidebar */}
      <div className="border-r p-3 space-y-3 overflow-y-auto">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider px-2">Contacts Inbox</h4>
        <div className="space-y-1">
          {alumniList.filter((a: any) => a.id !== currentAlumniId).map((a: any) => (
            <button
              key={a.id}
              onClick={() => setSelectedPeerId(a.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-2.5 ${
                selectedPeerId === a.id ? "bg-indigo-500/10 text-indigo font-bold" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="size-8 rounded-full bg-violet-500/10 text-violet flex items-center justify-center font-bold text-xs shrink-0 relative">
                {a.full_name.charAt(0)}
                <div className="absolute bottom-0 right-0 size-2 bg-emerald-500 border border-white rounded-full" />
              </div>
              <div className="truncate leading-tight">
                <div className="truncate font-semibold">{a.full_name}</div>
                <div className="text-[9px] opacity-70 font-normal truncate">{a.designation || 'Software Engineer'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Room Area */}
      <div className="md:col-span-2 flex flex-col justify-between bg-muted/10">
        {!selectedPeerId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="size-12 opacity-30 mb-2" />
            <span>Select a contact to begin direct messaging thread</span>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-3.5 border-b bg-background flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Chat Session Live</span>
              <Badge tone="success">Online</Badge>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/5">
              {thread.map((m: any) => {
                const mine = m.sender_id === currentAlumniId;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                      mine ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-background border text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-background border-t flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3 py-2.5 border rounded-xl bg-background outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── 12. ANNOUNCEMENTS TAB ────────────────────────────────
function AnnouncementsTab({ alumniList }: any) {
  const [type, setType] = useState<"Email" | "SMS" | "WhatsApp">("Email");
  const [recipient, setRecipient] = useState("All Active Alumni");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMutation = useMutation({
    mutationFn: (payload: any) => sendAnnouncement(payload),
    onSuccess: () => {
      setSubject("");
      setMessage("");
      toast.success(`Announcement queued successfully via ${type}!`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to dispatch announcement");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please fill in the message payload!");
      return;
    }
    sendMutation.mutate({
      type,
      recipient,
      subject: type === "Email" ? subject : null,
      message,
      sentBy: "11111111-1111-1111-1111-111111111111"
    });
  };

  return (
    <Card className="border max-w-xl">
      <h3 className="font-semibold text-sm mb-1.5">Dispatch Circular Notices</h3>
      <p className="text-xs text-muted-foreground mb-4">Broadcast announcements via email, SMS or WhatsApp newsletters.</p>
      
      <form onSubmit={handleSend} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-muted-foreground">Select Channel</label>
            <select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer"
            >
              <option value="Email">Email Circular</option>
              <option value="SMS">SMS Notification</option>
              <option value="WhatsApp">WhatsApp Message</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground">Recipients Selector</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer"
            >
              <option value="All Active Alumni">All Active Alumni ({alumniList.length})</option>
            </select>
          </div>
        </div>

        {type === "Email" && (
          <div>
            <label className="font-semibold text-muted-foreground">Email Subject Headline</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Invitation to register for 2026 Grand Reunion"
              className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none"
            />
          </div>
        )}

        <div>
          <label className="font-semibold text-muted-foreground">Message Payload</label>
          <textarea
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write circular instructions or update details..."
            className="w-full mt-1.5 p-3 border rounded-xl bg-background outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-xl transition cursor-pointer"
        >
          Dispatch Announcement
        </button>
      </form>
    </Card>
  );
}

// ── 13. NOTIFICATIONS TAB ────────────────────────────────
function NotificationsTab() {
  const [logs, setLogs] = useState([
    { id: "1", title: "New Job Placement: Google L4 Software Engineer", date: "Just now", read: false },
    { id: "2", title: "Mentorship request slot schedule accepted", date: "2 hours ago", read: false },
    { id: "3", title: "Silver Jubilee Grand Reunion invitation sent", date: "1 day ago", read: true }
  ]);

  const handleMarkAll = () => {
    setLogs(logs.map(l => ({ ...l, read: true })));
    toast.success("All alerts marked as read.");
  };

  return (
    <Card className="border max-w-xl text-xs space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">System Notification alerts log</h4>
        <button onClick={handleMarkAll} className="text-xs text-indigo-600 hover:underline cursor-pointer font-bold">Mark all read</button>
      </div>

      <div className="divide-y">
        {logs.map(log => (
          <div key={log.id} className="py-3 flex justify-between items-center">
            <div>
              <span className={`font-semibold ${log.read ? 'text-muted-foreground' : 'text-slate-800 dark:text-slate-200'}`}>{log.title}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{log.date}</span>
            </div>
            {!log.read && <div className="size-2 bg-indigo-500 rounded-full" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── 14. DEGREE VERIFICATION TAB ──────────────────────────
function VerificationTab({ alumniList }: any) {
  const [selectedAlmId, setSelectedAlmId] = useState("");
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);

  const handleVerify = () => {
    if (!selectedAlmId) {
      toast.error("Please select a graduate first.");
      return;
    }
    toast.success("Degree records matched successfully!");
    setVerifiedStatus("Verified: B.Tech CSE Class of 2021. Student ID matched.");
  };

  return (
    <Card className="border max-w-xl text-xs space-y-4">
      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Degree &amp; Academic verification desk</h3>
      <p className="text-muted-foreground leading-relaxed">Select a graduate to run instant registrar verification matching.</p>
      
      <div className="space-y-3">
        <select
          value={selectedAlmId}
          onChange={(e) => {
            setSelectedAlmId(e.target.value);
            setVerifiedStatus(null);
          }}
          className="w-full px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer"
        >
          <option value="" disabled>Select Graduate...</option>
          {alumniList.map((a: any) => (
            <option key={a.id} value={a.id}>{a.full_name} (Roll: {a.roll_number || 'N/A'})</option>
          ))}
        </select>

        <button
          onClick={handleVerify}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer transition"
        >
          Verify Academic Credentials
        </button>

        {verifiedStatus && (
          <div className="p-3 border-2 border-emerald-500 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-700 font-bold flex items-center gap-2">
            <ShieldCheck className="size-5" />
            <span>{verifiedStatus}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── 15. AI FEATURES TAB ──────────────────────────────────
function AIFeaturesTab({ currentAlumniId }: any) {
  const [resumeText, setResumeText] = useState("");
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [chatbotInput, setChatbotInput] = useState("");
  const [chatLogs, setChatLogs] = useState([
    { role: "assistant", text: "Hello! Ask me any questions about carrier trends, skill gaps, or mentor matching." }
  ]);

  const { data: aiRecs } = useQuery({
    queryKey: ["alumni-ai-recs", currentAlumniId],
    queryFn: () => fetchAIRecommendations(currentAlumniId)
  });

  const handleReviewResume = () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text first!");
      return;
    }
    setReviewLoading(true);
    simulateAIResumeReview(resumeText).then((res: any) => {
      setAiScore(res.score);
      setAiTips(res.feedback);
      setReviewLoading(false);
      toast.success("AI Resume review analysis generated!");
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatbotInput.trim()) return;
    const userMsg = chatbotInput;
    setChatLogs(prev => [...prev, { role: "user", text: userMsg }]);
    setChatbotInput("");
    setTimeout(() => {
      setChatLogs(prev => [...prev, { role: "assistant", text: "Based on placement statistics, Software Engineer skills matching in Kubernetes and Go are highly in demand. I recommend connecting with mentor Sahil Varma." }]);
    }, 1000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 text-xs">
      <div className="space-y-6">
        {/* Resume Review Card */}
        <Card className="border">
          <h4 className="font-bold text-sm mb-1.5">AI Resume Review Analyzer</h4>
          <p className="text-muted-foreground text-[10px] mb-4">Paste your resume content to fetch instant grading scores.</p>
          
          <textarea
            rows={6}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume work experience bullets..."
            className="w-full p-3 border rounded-xl bg-background outline-none"
          />
          <button
            onClick={handleReviewResume}
            disabled={reviewLoading}
            className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
          >
            {reviewLoading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>

          {aiScore && (
            <div className="mt-4 p-4 border rounded-xl bg-muted/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">Resume Grading:</span>
                <span className="text-lg font-bold font-mono text-indigo-600">{aiScore}/100</span>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[10px] text-muted-foreground uppercase block">Recommendations:</span>
                {aiTips.map((tip, i) => <div key={i} className="text-slate-600 dark:text-slate-300 font-semibold">• {tip}</div>)}
              </div>
            </div>
          )}
        </Card>

        {/* Skill gaps Matcher */}
        <Card className="border">
          <h4 className="font-bold text-sm mb-3">AI Skill Gap Recommendations</h4>
          {aiRecs ? (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Identified Skill Gaps:</span>
                <div className="flex flex-wrap gap-1">
                  {aiRecs.skillGaps.map((gap: string, i: number) => <Badge key={i} tone="warn">{gap}</Badge>)}
                </div>
              </div>
              <div className="pt-2 border-t">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-2">Recommended Career vacancies:</span>
                <div className="space-y-2">
                  {aiRecs.matchingJobs.map((job: any) => (
                    <div key={job.id} className="flex justify-between items-center p-2 border rounded-lg bg-muted/20">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{job.title}</span>
                      <span className="font-bold font-mono text-emerald-600">{job.matchScore}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Calculating match scores...</div>
          )}
        </Card>
      </div>

      {/* AI Chatbot Helper */}
      <Card className="border flex flex-col justify-between h-[450px]">
        <div>
          <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
            <Sparkles className="size-4.5 text-indigo" />
            AI Virtual Career Coach
          </h4>
          <p className="text-[10px] text-muted-foreground mb-4">Instantly ask questions regarding skill requirements.</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-muted/5 rounded-xl border mb-3">
          {chatLogs.map((log, i) => (
            <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[200px] p-2.5 rounded-2xl font-medium ${
                log.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-background border text-slate-800 dark:text-slate-200 rounded-tl-none'
              }`}>
                {log.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about resume optimization or skill matching..."
            value={chatbotInput}
            onChange={(e) => setChatbotInput(e.target.value)}
            className="flex-1 px-3 py-2.5 border rounded-xl bg-background outline-none"
          />
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer">Ask</button>
        </form>
      </Card>
    </div>
  );
}

// ── 16. REPORTS TAB ──────────────────────────────────────
function ReportsTab({ alumni, donations }: any) {
  const handleDownloadExcel = () => {
    toast.info("Preparing Excel Audit logs...");
    setTimeout(() => {
      toast.success("Excel report downloaded successfully!");
    }, 1000);
  };

  const handleDownloadPDF = () => {
    toast.info("Compiling PDF Audit summary...");
    setTimeout(() => {
      toast.success("PDF report downloaded successfully!");
    }, 1000);
  };

  return (
    <Card className="border max-w-xl">
      <h3 className="font-semibold text-sm mb-1.5">Reports Exporter</h3>
      <p className="text-xs text-muted-foreground mb-6">Select parameters to compile statistics for graduation classes & departments.</p>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-muted-foreground">Select graduation class</label>
            <select className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer">
              <option>All Classes</option>
              <option>2022</option>
              <option>2021</option>
              <option>2020</option>
            </select>
          </div>
          <div>
            <label className="font-semibold text-muted-foreground">Select department</label>
            <select className="w-full mt-1.5 px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer">
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>ECE</option>
            </select>
          </div>
        </div>

        <div className="p-3 border rounded-xl bg-muted/20 space-y-2 mt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Graduates matched:</span>
            <span className="font-bold">{alumni.length} records</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Endowment records count:</span>
            <span className="font-bold">{donations.length} receipts</span>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1 px-4 py-2.5 border hover:bg-muted font-bold rounded-xl transition cursor-pointer"
          >
            <Download className="size-3.5" />
            Export Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
          >
            <Download className="size-3.5" />
            Export PDF
          </button>
        </div>
      </div>
    </Card>
  );
}

// ── 17. SETTINGS TAB ─────────────────────────────────────
function SettingsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [waNotifs, setWaNotifs] = useState(false);
  const [privacy, setPrivacy] = useState("Public");
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    toast.success("Alumni Configuration preferences saved!");
  };

  return (
    <Card className="border max-w-xl">
      <h3 className="font-semibold text-sm mb-1.5">Module Preferences &amp; Config</h3>
      <p className="text-xs text-muted-foreground mb-6">Manage profile defaults, notification triggers, and security configurations.</p>
      
      <div className="space-y-4 text-xs">
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 dark:text-slate-200">System Notification Triggers</h4>
          
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Email notifications on new registration request</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={waNotifs}
              onChange={(e) => setWaNotifs(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>WhatsApp alert on matching mentorship schedule</span>
          </label>
        </div>

        <div className="pt-3 border-t space-y-3">
          <h4 className="font-bold text-slate-800 dark:text-slate-200">Security &amp; Multi-Factor Auth</h4>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5" />
              Enable Two-Factor Authentication (2FA) for login
            </span>
          </label>
        </div>

        <div className="pt-3 border-t">
          <label className="font-semibold text-muted-foreground block mb-1.5">Profile Directory Privacy</label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-background outline-none cursor-pointer"
          >
            <option value="Public">Public (Accessible to students &amp; recruiters)</option>
            <option value="Private">Private (Accessible to administrators only)</option>
          </select>
        </div>

        <div className="pt-6 border-t flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </Card>
  );
}
