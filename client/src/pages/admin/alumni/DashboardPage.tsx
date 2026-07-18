import React, { useState } from "react";
import { useAlumni } from "../AdminAlumni";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  registerAlumni, 
  createAlumniEvent, 
  recordDonation, 
  sendAnnouncement, 
  matchMentorship 
} from "@/services/alumniService";
import { GradientHeader, StatCard, GlassCard } from "./components/CardElements";
import { GradientAreaChart, StyledBarChart, DonutChart } from "./components/ChartElements";
import { EventCard, JobCard } from "./components/SpecificCards";
import { 
  LayoutDashboard, Users, GraduationCap, DollarSign, Briefcase, Calendar, 
  ChevronRight, Plus, Heart, Target, Send, UserCheck, Shield, BookOpen, 
  MapPin, X, ArrowRight, Star, Mail, MessageSquare, Award, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export function DashboardPage() {
  const { stats, eventList, jobList, statsLoading } = useAlumni();

  // Dialog open states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isRecordDonationOpen, setIsRecordDonationOpen] = useState(false);
  const [isMatchMentorOpen, setIsMatchMentorOpen] = useState(false);
  const [isSendAnnouncementOpen, setIsSendAnnouncementOpen] = useState(false);

  // Form states
  const [alumniForm, setAlumniForm] = useState({ name: "", email: "", batch: "2024", department: "Computer Science", company: "", designation: "", location: "" });
  const [eventForm, setEventForm] = useState({ title: "", date: "", location: "", organizer: "", price: "0", banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" });
  const [donationForm, setDonationForm] = useState({ donor: "", amount: "", category: "Scholarship", mode: "UPI", refNo: "", notes: "" });
  const [announcementForm, setAnnouncementForm] = useState({ channel: "Email", targetGroup: "All", subject: "", message: "" });
  const [mentorMatchForm, setMentorMatchForm] = useState({ department: "Computer Science", industry: "Software Engineering", experience: "5+ Years", mentor: "", mentee: "" });

  const queryClient = useQueryClient();

  // Mutations
  const registerMutation = useMutation({
    mutationFn: registerAlumni,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
      toast.success(`Alumni registered: ${alumniForm.name}`);
      setIsRegisterOpen(false);
      setAlumniForm({ name: "", email: "", batch: "2024", department: "Computer Science", company: "", designation: "", location: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register alumni");
    }
  });

  const eventMutation = useMutation({
    mutationFn: createAlumniEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-events"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`Event created successfully: ${eventForm.title}`);
      setIsCreateEventOpen(false);
      setEventForm({ title: "", date: "", location: "", organizer: "", price: "0", banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create event");
    }
  });

  const donationMutation = useMutation({
    mutationFn: recordDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-leaderboard"] });
      toast.success(`Donation of ₹${donationForm.amount} recorded successfully.`);
      setIsRecordDonationOpen(false);
      setDonationForm({ donor: "", amount: "", category: "Scholarship", mode: "UPI", refNo: "", notes: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record donation");
    }
  });

  const announcementMutation = useMutation({
    mutationFn: sendAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-announcements"] });
      toast.success(`Announcement sent successfully via ${announcementForm.channel}!`);
      setIsSendAnnouncementOpen(false);
      setAnnouncementForm({ channel: "Email", targetGroup: "All", subject: "", message: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to broadcast announcement");
    }
  });

  const mentorshipMatchMutation = useMutation({
    mutationFn: ({ id, status, sessionSchedule }: { id: string; status: string; sessionSchedule?: string }) => matchMentorship(id, status, sessionSchedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-mentorship"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`Mentorship matched successfully!`);
      setIsMatchMentorOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to match mentorship pairing");
    }
  });

  if (statsLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  // Realistic mock data for charts
  const kpis = stats?.kpis || {
    totalAlumni: 24500,
    activeAlumni: 18200,
    newRegistrations: 340,
    totalDonations: 425000,
    upcomingEvents: 8,
    mentorshipRequests: 142
  };
  const charts = stats?.charts || {};

  const gradYearData = (charts.byGraduationYear?.length > 0)
    ? charts.byGraduationYear.map((item: any) => ({ name: String(item.year), count: item.count }))
    : [
        { name: "2019", count: 320 },
        { name: "2020", count: 480 },
        { name: "2021", count: 610 },
        { name: "2022", count: 750 },
        { name: "2023", count: 980 },
        { name: "2024", count: 1250 }
      ];

  const donationTrendData = [
    { name: "Jan", amount: 15000 },
    { name: "Feb", amount: 22000 },
    { name: "Mar", amount: 18000 },
    { name: "Apr", amount: 35000 },
    { name: "May", amount: 28000 },
    { name: "Jun", amount: 45000 }
  ];

  const deptData = (charts.byDepartment?.length > 0)
    ? charts.byDepartment.map((item: any) => ({ name: item.name, students: item.count }))
    : [
        { name: "Computer Science", students: 950 },
        { name: "Electronics & Comm", students: 780 },
        { name: "Mechanical Eng", students: 540 },
        { name: "Business Management", students: 430 },
        { name: "Information Tech", students: 600 }
      ];

  const eventParticipationData = [
    { name: "Alumni Meet", count: 450 },
    { name: "Tech Summit", count: 1200 },
    { name: "Pitch Night", count: 320 },
    { name: "Webinar", count: 850 }
  ];

  const mentorshipGrowthData = [
    { name: "Jan", count: 40 },
    { name: "Feb", count: 55 },
    { name: "Mar", count: 78 },
    { name: "Apr", count: 110 },
    { name: "May", count: 145 },
    { name: "Jun", count: 195 }
  ];

  // Quick Action form submissions
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniForm.name || !alumniForm.email) {
      toast.error("Please fill out the name and email fields.");
      return;
    }
    registerMutation.mutate({
      full_name: alumniForm.name,
      email: alumniForm.email,
      graduation_year: parseInt(alumniForm.batch),
      department: alumniForm.department,
      current_company: alumniForm.company,
      designation: alumniForm.designation,
      location: alumniForm.location
    });
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.location) {
      toast.error("Please fill in all required fields.");
      return;
    }
    eventMutation.mutate({
      title: eventForm.title,
      date: eventForm.date,
      venue: eventForm.location,
      organizer: eventForm.organizer || "Alumni relations cell",
      category: "Reunion",
      image_url: eventForm.banner,
      capacity: 100,
      status: "Published"
    });
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.donor || !donationForm.amount) {
      toast.error("Please fill in the donor name and amount.");
      return;
    }
    donationMutation.mutate({
      alumniId: "alm-001",
      amount: parseFloat(donationForm.amount),
      cause: donationForm.category,
      transactionId: donationForm.refNo || `TXN${Date.now()}`
    });
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.subject || !announcementForm.message) {
      toast.error("Please enter a subject and message.");
      return;
    }
    announcementMutation.mutate({
      type: announcementForm.channel as any,
      recipient: announcementForm.targetGroup,
      subject: announcementForm.subject,
      message: announcementForm.message,
      sentBy: "Alumni Coordinator"
    });
  };

  const handleMentorshipMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorMatchForm.mentor || !mentorMatchForm.mentee) {
      toast.error("Please select both a mentor and a mentee.");
      return;
    }
    mentorshipMatchMutation.mutate({
      id: mentorMatchForm.mentee,
      status: "Approved",
      sessionSchedule: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <GradientHeader 
        title="Alumni Coordinator Dashboard" 
        description="Overview of your college's alumni relations, mentorship matchings, events, and fundraising contributions."
        icon={LayoutDashboard}
        color="from-rose-500 to-pink-600"
      >
        <Button variant="secondary" className="rounded-xl bg-white/20 text-white hover:bg-white/30 border-0">
          Export Overview Report
        </Button>
      </GradientHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Alumni" value={kpis.totalAlumni.toLocaleString()} icon={Users} color="blue" trend={{ value: 12.5, isPositive: true }} trendLabel="vs last year" />
        <StatCard title="Active Alumni" value={kpis.activeAlumni.toLocaleString()} icon={UserCheck} color="green" trend={{ value: 8.2, isPositive: true }} />
        <StatCard title="Pending Verifications" value={kpis.newRegistrations.toLocaleString()} icon={GraduationCap} color="purple" trend={{ value: 15.4, isPositive: true }} />
        <StatCard title="Total Donations" value={`₹${kpis.totalDonations.toLocaleString("en-IN")}`} icon={DollarSign} color="green" trend={{ value: 24.5, isPositive: true }} />
        <StatCard title="Upcoming Events" value={String(kpis.upcomingEvents)} icon={Calendar} color="rose" />
        <StatCard title="Active Mentorships" value={String(kpis.mentorshipRequests)} icon={Target} color="orange" trend={{ value: 18.2, isPositive: true }} />
      </div>

      {/* Quick Actions Row */}
      <GlassCard className="p-6">
        <h3 className="font-semibold text-lg mb-4">Quick Operations</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Button onClick={() => setIsRegisterOpen(true)} className="flex items-center justify-center p-6 h-auto flex-col rounded-2xl border bg-card hover:bg-muted/50 gap-2 group transition-all text-card-foreground">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-medium text-xs">Register Alumni</span>
          </Button>

          <Button onClick={() => setIsCreateEventOpen(true)} className="flex items-center justify-center p-6 h-auto flex-col rounded-2xl border bg-card hover:bg-muted/50 gap-2 group transition-all text-card-foreground">
            <div className="p-3 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-medium text-xs">Create Event</span>
          </Button>

          <Button onClick={() => setIsRecordDonationOpen(true)} className="flex items-center justify-center p-6 h-auto flex-col rounded-2xl border bg-card hover:bg-muted/50 gap-2 group transition-all text-card-foreground">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="font-medium text-xs">Record Donation</span>
          </Button>

          <Button onClick={() => setIsMatchMentorOpen(true)} className="flex items-center justify-center p-6 h-auto flex-col rounded-2xl border bg-card hover:bg-muted/50 gap-2 group transition-all text-card-foreground">
            <div className="p-3 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-medium text-xs">Match Mentor</span>
          </Button>

          <Button onClick={() => setIsSendAnnouncementOpen(true)} className="flex items-center justify-center p-6 h-auto flex-col rounded-2xl border bg-card hover:bg-muted/50 gap-2 group transition-all text-card-foreground col-span-2 md:col-span-1">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <span className="font-medium text-xs">Send Announcement</span>
          </Button>
        </div>
      </GlassCard>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GradientAreaChart title="Alumni by Graduation Year" data={gradYearData} dataKey="count" xKey="name" color="#8b5cf6" />
        </div>
        <div className="lg:col-span-1">
          <DonutChart title="Alumni by Department" data={deptData} dataKey="students" nameKey="name" colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981']} />
        </div>
      </div>

      {/* Secondary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StyledBarChart title="Donations Trend (USD)" data={donationTrendData} dataKey="amount" xKey="name" color="#10b981" />
        </div>
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Mentorship Network Growth</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mentorshipGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMentorship" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} fill="url(#colorMentorship)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-6">Event Registration Counts</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventParticipationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Dashboard Widgets: Recent Activites, Notifications, Mentorship Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <GlassCard className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Registrations</h3>
            <Button variant="ghost" size="sm" className="rounded-xl text-primary">View All</Button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2">
            {[
              { name: "Johnathan Miller", batch: "2023", dept: "CSE", company: "Meta", designation: "Software Engineer", image: "https://api.dicebear.com/7.x/initials/svg?seed=JM" },
              { name: "Clara Oswald", batch: "2022", dept: "ECE", company: "Intel", designation: "Hardware Architect", image: "https://api.dicebear.com/7.x/initials/svg?seed=CO" },
              { name: "Robert Downey", batch: "2020", dept: "MBA", company: "Tesla", designation: "Product Manager", image: "https://api.dicebear.com/7.x/initials/svg?seed=RD" }
            ].map((reg, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <img src={reg.image} alt={reg.name} className="w-10 h-10 rounded-full border bg-background" />
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">{reg.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Class of {reg.batch} ({reg.dept})</p>
                  <p className="text-xs text-primary font-medium mt-1">{reg.designation} at {reg.company}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full dark:bg-emerald-950/20 dark:text-emerald-400">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Mentorship Requests & Recent Donations */}
        <GlassCard className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Mentorship & Donations</h3>
          </div>
          <div className="space-y-6 flex-1">
            {/* Mentorship requests */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Pending Mentor Matches</h4>
              <div className="space-y-3">
                {[
                  { student: "Alice Green", dept: "CSE", mentor: "Sarah Connor (OpenAI)", score: 92 },
                  { student: "Bob Dylan", dept: "ECE", mentor: "David Chen (Stripe)", score: 85 }
                ].map((req, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-card text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold">{req.student} <span className="text-muted-foreground font-normal">({req.dept})</span></p>
                      <p className="text-muted-foreground mt-1">Suggested: {req.mentor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">{req.score}% match</span>
                      <Button size="sm" className="h-7 px-2.5 rounded-lg text-[10px] bg-orange-600 hover:bg-orange-700">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Donations */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Donations</h4>
              <div className="space-y-3">
                {[
                  { donor: "Alexander Pierce", batch: "1995", amount: 500, category: "Infrastructure" },
                  { donor: "Helena Smith", batch: "2012", amount: 1500, category: "Scholarships" }
                ].map((don, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-card text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold">{don.donor} <span className="text-muted-foreground font-normal">({don.batch})</span></p>
                      <p className="text-muted-foreground mt-1">Fund: {don.category}</p>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">${don.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Notifications & System Alerts */}
        <GlassCard className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">System Notifications</h3>
            <Button variant="ghost" size="sm" className="rounded-xl text-primary">Mark read</Button>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { text: "15 self-registrations waiting for verification check.", time: "10 mins ago", type: "warning", icon: Shield },
              { text: "Donation receipt generated automatically for Transaction #94320.", time: "1 hr ago", type: "success", icon: DollarSign },
              { text: "New mentorship request submitted by Alice Green (2024).", time: "2 hrs ago", type: "info", icon: Target },
              { text: "Bulk announcement email sent successfully to 1,200 alumni.", time: "Yesterday", type: "success", icon: Send }
            ].map((item, idx) => {
              const colors = {
                warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
                success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
                info: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
              };
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                  <div className={`p-2 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center ${colors[item.type as 'warning'|'success'|'info']}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.text}</p>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* ── MODAL: Register Alumni ── */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsRegisterOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-blue-600"><Users className="w-5 h-5"/> Quick Alumni Registration</h3>
            <p className="text-xs text-muted-foreground mb-6">Manually register a verified alumnus directly into the workspace.</p>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Full Name *</label>
                <Input value={alumniForm.name} onChange={e => setAlumniForm({...alumniForm, name: e.target.value})} placeholder="e.g. Johnathan Miller" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Email Address *</label>
                  <Input type="email" value={alumniForm.email} onChange={e => setAlumniForm({...alumniForm, email: e.target.value})} placeholder="e.g. john@meta.com" required />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Location</label>
                  <Input value={alumniForm.location} onChange={e => setAlumniForm({...alumniForm, location: e.target.value})} placeholder="e.g. London, UK" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Graduation Year</label>
                  <Input type="number" value={alumniForm.batch} onChange={e => setAlumniForm({...alumniForm, batch: e.target.value})} placeholder="2024" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Department</label>
                  <Input value={alumniForm.department} onChange={e => setAlumniForm({...alumniForm, department: e.target.value})} placeholder="Computer Science" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Current Company</label>
                  <Input value={alumniForm.company} onChange={e => setAlumniForm({...alumniForm, company: e.target.value})} placeholder="e.g. Meta" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Designation</label>
                  <Input value={alumniForm.designation} onChange={e => setAlumniForm({...alumniForm, designation: e.target.value})} placeholder="e.g. Software Engineer" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">Save Alumni</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Create Event ── */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsCreateEventOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-600"><Calendar className="w-5 h-5"/> Create Alumni Event</h3>
            <p className="text-xs text-muted-foreground mb-6">Schedule and publish a new event or reunion for the alumni network.</p>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Event Title *</label>
                <Input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="e.g. 10-Year CSE Reunion" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Date & Time *</label>
                  <Input type="datetime-local" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} required />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Ticket Price (₹) *</label>
                  <Input type="number" value={eventForm.price} onChange={e => setEventForm({...eventForm, price: e.target.value})} placeholder="0 (for free)" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Venue / Virtual Link *</label>
                <Input value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} placeholder="e.g. Grand Ballroom / Zoom Link" required />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Organizer / Host</label>
                <Input value={eventForm.organizer} onChange={e => setEventForm({...eventForm, organizer: e.target.value})} placeholder="e.g. Alumni Relations Cell" />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateEventOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-rose-600 hover:bg-rose-700">Publish Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Record Donation ── */}
      {isRecordDonationOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsRecordDonationOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-emerald-600"><DollarSign className="w-5 h-5"/> Record Alumni Donation</h3>
            <p className="text-xs text-muted-foreground mb-6">Manually book and record a financial contribution from an alumnus.</p>
            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Donor Name *</label>
                <Input value={donationForm.donor} onChange={e => setDonationForm({...donationForm, donor: e.target.value})} placeholder="e.g. Sarah Connor" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Amount (₹) *</label>
                  <Input type="number" value={donationForm.amount} onChange={e => setDonationForm({...donationForm, amount: e.target.value})} placeholder="e.g. 5000" required />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Purpose / Category</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={donationForm.category} onChange={e => setDonationForm({...donationForm, category: e.target.value})}>
                    <option value="Scholarship">Scholarship Fund</option>
                    <option value="Infrastructure">Infrastructure Development</option>
                    <option value="Library">Library Resources</option>
                    <option value="Laboratory">Lab Equipment</option>
                    <option value="Sports">Sports Amenities</option>
                    <option value="General">General Fund</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Payment Method</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={donationForm.mode} onChange={e => setDonationForm({...donationForm, mode: e.target.value})}>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Reference Number</label>
                  <Input value={donationForm.refNo} onChange={e => setDonationForm({...donationForm, refNo: e.target.value})} placeholder="e.g. TXN942084203" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Private Notes / Remarks</label>
                <Textarea value={donationForm.notes} onChange={e => setDonationForm({...donationForm, notes: e.target.value})} placeholder="e.g. Earmarked for Merit-cum-Means scholarship scheme." className="rounded-xl min-h-[80px]" />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsRecordDonationOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">Record Donation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Match Mentor ── */}
      {isMatchMentorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsMatchMentorOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-orange-600"><Target className="w-5 h-5"/> Mentorship Match Coordinator</h3>
            <p className="text-xs text-muted-foreground mb-6">Match students or junior mentees with established alumni mentors.</p>
            <form onSubmit={handleMentorshipMatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Target Department</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={mentorMatchForm.department} onChange={e => setMentorMatchForm({...mentorMatchForm, department: e.target.value})}>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Business Management">Business Management</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Industry Sectors</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={mentorMatchForm.industry} onChange={e => setMentorMatchForm({...mentorMatchForm, industry: e.target.value})}>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Fintech">Fintech & Finance</option>
                    <option value="Automotive">Automotive Tech</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Select Mentor (Alumni)</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={mentorMatchForm.mentor} onChange={e => setMentorMatchForm({...mentorMatchForm, mentor: e.target.value})}>
                    <option value="">-- Choose Alumni Mentor --</option>
                    <option value="Sarah Connor">Sarah Connor (Lead Researcher, OpenAI)</option>
                    <option value="David Chen">David Chen (Engineering Manager, Stripe)</option>
                    <option value="Emily Watson">Emily Watson (Lead Designer, Figma)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Select Mentee (Student / Junior)</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={mentorMatchForm.mentee} onChange={e => setMentorMatchForm({...mentorMatchForm, mentee: e.target.value})}>
                    <option value="">-- Choose Mentee --</option>
                    <option value="Alice Green">Alice Green (CSE Student - Year 4)</option>
                    <option value="Bob Dylan">Bob Dylan (ECE Student - Year 3)</option>
                    <option value="Clara Oswald">Clara Oswald (Alumni, Year 2023)</option>
                  </select>
                </div>
              </div>
              {mentorMatchForm.mentor && mentorMatchForm.mentee && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-xs text-orange-800">Match Compatibility Score</h5>
                    <p className="text-xs text-orange-950 mt-0.5">Based on department alignment, skills match, and industry focus.</p>
                  </div>
                  <span className="text-xl font-bold text-orange-600 bg-white shadow-sm border border-orange-200 px-3 py-1.5 rounded-xl">94% MATCH</span>
                </div>
              )}
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsMatchMentorOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700">Assign Mentor</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Send Announcement ── */}
      {isSendAnnouncementOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsSendAnnouncementOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-purple-600"><Send className="w-5 h-5"/> Send Broadcast Announcement</h3>
            <p className="text-xs text-muted-foreground mb-6">Broadcast an important announcement or newsletter to your filtered alumni network.</p>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Communication Channel</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={announcementForm.channel} onChange={e => setAnnouncementForm({...announcementForm, channel: e.target.value})}>
                    <option value="Email">Email Newsletter</option>
                    <option value="SMS">Direct SMS Text</option>
                    <option value="WhatsApp">WhatsApp Broadcast</option>
                    <option value="Push">App Push Notification</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Target Recipient Group</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-primary" value={announcementForm.targetGroup} onChange={e => setAnnouncementForm({...announcementForm, targetGroup: e.target.value})}>
                    <option value="All">All Registered Alumni (24,500)</option>
                    <option value="CSE">Computer Science Dept only (950)</option>
                    <option value="Batch2024">Class of 2024 only (1,250)</option>
                    <option value="Donors">Past Donors only (1,245)</option>
                  </select>
                </div>
              </div>
              {announcementForm.channel === "Email" && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Email Subject *</label>
                  <Input value={announcementForm.subject} onChange={e => setAnnouncementForm({...announcementForm, subject: e.target.value})} placeholder="e.g. Annual Homecoming & Reunion 2026 Invitation" required />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold block mb-1">Message Body *</label>
                <Textarea value={announcementForm.message} onChange={e => setAnnouncementForm({...announcementForm, message: e.target.value})} placeholder="Write details of the broadcast message here..." className="rounded-xl min-h-[120px]" required />
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSendAnnouncementOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-purple-600 hover:bg-purple-700">Send Announcement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

