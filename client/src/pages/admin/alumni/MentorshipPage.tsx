import React, { useState, useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchMentorship, bookMentorshipSession } from "@/services/alumniService";
import { GradientHeader, GlassCard, StatCard } from "./components/CardElements";
import { FormGroup, StyledInput, FileUploadZone } from "./components/FormElements";
import { StyledTable, TableRow, TableCell, TablePagination } from "./components/TableElements";
import { 
  Calendar as CalendarIcon, Star, Filter, Search, Clock, Video, Users, 
  ArrowRight, ShieldCheck, Award, Briefcase, Plus, Target, CheckCircle2, 
  X, Check, UserPlus, Heart, MessageSquare, LineChart, ShieldAlert, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export function MentorshipPage() {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal open states
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isMentorProfileOpen, setIsMentorProfileOpen] = useState(false);
  const [isMenteeProfileOpen, setIsMenteeProfileOpen] = useState(false);

  // Selected entities for view modals
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    mentor: "", mentee: "", date: "", timeSlot: "10:00 AM - 11:00 AM", platform: "Google Meet", meetingLink: "", notes: ""
  });

  const { mentorshipRequests: rawMentorshipRequests, mentorLoading } = useAlumni();
  const queryClient = useQueryClient();

  const mentorshipList = useMemo(() => {
    return (rawMentorshipRequests || []).map((m: any) => ({
      id: m.id,
      mentor: {
        name: m.mentorName || "Sarah Connor",
        company: "OpenAI",
        designation: "AI Researcher",
        skills: ["Machine Learning", "Python", "RLHF"],
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${m.mentorName || 'SC'}`
      },
      mentee: {
        name: m.studentName || "Alice Green",
        rollNo: "CS202340",
        gpa: "3.9",
        goals: m.request_reason || "AI research internships",
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${m.studentName || 'AG'}`
      },
      department: "Computer Science",
      industry: "Artificial Intelligence",
      program: "Research Internship Prep",
      startDate: m.created_at?.split('T')[0] || "2026-06-01",
      endDate: "2026-09-01",
      status: m.status || "Pending",
      rating: 5.0
    }));
  }, [rawMentorshipRequests]);

  // Statistics
  const totalMentorsCount = 142;
  const totalMenteesCount = 195;
  const activeProgramsCount = mentorshipList.filter((m: any) => m.status === "Active" || m.status === "Approved").length + 72;
  const completedProgramsCount = mentorshipList.filter((m: any) => m.status === "Completed").length + 245;
  const pendingRequestsCount = mentorshipList.filter((m: any) => m.status === "Pending").length;
  const successRate = 98;

  // Chart Data
  const industryData = [
    { name: "Software Eng", value: 45 },
    { name: "Artificial Intelligence", value: 30 },
    { name: "Product Design", value: 20 },
    { name: "Fintech", value: 25 },
    { name: "Hardware Systems", value: 15 }
  ];

  const sessionsMonthlyData = [
    { name: "Jan", count: 85 },
    { name: "Feb", count: 110 },
    { name: "Mar", count: 140 },
    { name: "Apr", count: 185 },
    { name: "May", count: 220 },
    { name: "Jun", count: 290 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#ec4899', '#f97316', '#8b5cf6'];

  // Match / Filter Logics
  const filteredMentorships = mentorshipList.filter((m: any) => {
    const matchesSearch = m.mentor.name.toLowerCase().includes(search.toLowerCase()) || m.mentee.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === "All" || m.department === filterDept;
    const matchesStatus = filterStatus === "All" || m.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const limit = 10;
  const totalPages = Math.ceil(filteredMentorships.length / limit) || 1;
  const paginated = filteredMentorships.slice((currentPage - 1) * limit, currentPage * limit);

  // Mutations
  const matchMutation = useMutation({
    mutationFn: ({ id, status, sessionSchedule }: { id: string; status: string; sessionSchedule?: string }) => matchMentorship(id, status, sessionSchedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-mentorship"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success("Mentorship match updated successfully!");
      setIsMatchOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update match.");
    }
  });

  const bookSessionMutation = useMutation({
    mutationFn: (variables: { mentorId: string; studentId: string; date: string; startTime: string; endTime: string }) => bookMentorshipSession({
      requestId: "mnt-001",
      mentorId: variables.mentorId,
      studentId: variables.studentId,
      date: variables.date,
      startTime: variables.startTime,
      endTime: variables.endTime
    }),
    onSuccess: () => {
      toast.success("Mentorship session scheduled successfully!");
      setIsSchedulerOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to book session.");
    }
  });

  // Actions
  const handleAssignSubmit = (mentor: any, mentee: any, program: string) => {
    matchMutation.mutate({
      id: "mnt-001",
      status: "Approved",
      sessionSchedule: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.mentor || !scheduleForm.date) {
      toast.error("Please select a mentor and a meeting date.");
      return;
    }
    bookSessionMutation.mutate({
      mentorId: "alm-001",
      studentId: "s1111111-1111-1111-1111-111111111111",
      date: scheduleForm.date,
      startTime: "10:00 AM",
      endTime: "11:00 AM"
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <GradientHeader 
        title="Mentorship Coordinator Hub" 
        description="Verify mentor availabilities, review student match requests, run the AI-based matching system, and schedule 1-on-1 career sessions."
        icon={Star}
        color="from-amber-500 to-orange-500"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => setIsSchedulerOpen(true)}>
            <CalendarIcon className="w-4 h-4 mr-2" /> Schedule Meeting
          </Button>
          <Button className="rounded-xl bg-white text-orange-600 hover:bg-white/90" onClick={() => setIsMatchOpen(true)}>
            <Target className="w-4 h-4 mr-2" /> Match Mentor
          </Button>
        </div>
      </GradientHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Alumni Mentors" value={totalMentorsCount} icon={Users} color="blue" />
        <StatCard title="Total Student Mentees" value={totalMenteesCount} icon={Users} color="purple" />
        <StatCard title="Active Pairings" value={activeProgramsCount} icon={Target} color="orange" trend={{ value: 12.5, isPositive: true }} />
        <StatCard title="Completed Programs" value={completedProgramsCount} icon={ShieldCheck} color="green" />
        <StatCard title="Pending Requests" value={pendingRequestsCount} icon={Clock} color="rose" />
        <StatCard title="Success Rating" value={`${successRate}%`} icon={Award} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-6">Monthly Coaching Sessions Completed</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-6">Mentors Industry Distribution</h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {industryData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Connection Table */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search mentor or mentee..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-9 rounded-xl bg-background/50 border-muted text-sm h-10"
              />
            </div>
            <select className="h-10 rounded-xl bg-background border px-3 text-xs focus:ring-1 focus:ring-orange-500" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Fine Arts">Fine Arts</option>
            </select>
            <select className="h-10 rounded-xl bg-background border px-3 text-xs focus:ring-1 focus:ring-orange-500" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <Button variant="outline" className="rounded-xl border-muted" onClick={() => toast.success("Exporting mentorship data logs...")}>
            <FileText className="w-4 h-4 mr-2" /> Export Statement
          </Button>
        </div>

        <StyledTable headers={["Mentor (Alumni)", "Mentee (Student)", "Department", "Industry Core", "Coaching Program", "Start Date", "Status", "Session Review", "Actions"]}>
          {paginated.length > 0 ? paginated.map((mnt: any) => (
            <TableRow key={mnt.id}>
              <TableCell>
                <div onClick={() => { setSelectedMentor(mnt.mentor); setIsMentorProfileOpen(true); }} className="flex items-center gap-3 cursor-pointer hover:opacity-85">
                  <img src={mnt.mentor.image} alt={mnt.mentor.name} className="w-10 h-10 rounded-full border bg-muted" />
                  <div>
                    <p className="font-semibold text-sm leading-tight text-primary">{mnt.mentor.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{mnt.mentor.designation} at {mnt.mentor.company}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div onClick={() => { setSelectedMentee(mnt.mentee); setIsMenteeProfileOpen(true); }} className="flex items-center gap-3 cursor-pointer hover:opacity-85">
                  <img src={mnt.mentee.image} alt={mnt.mentee.name} className="w-10 h-10 rounded-full border bg-muted" />
                  <div>
                    <p className="font-semibold text-sm leading-tight text-primary">{mnt.mentee.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Roll No: {mnt.mentee.rollNo}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell><span className="text-xs">{mnt.department}</span></TableCell>
              <TableCell><span className="text-xs text-muted-foreground font-semibold">{mnt.industry}</span></TableCell>
              <TableCell><span className="text-xs font-medium">{mnt.program}</span></TableCell>
              <TableCell><span className="text-xs text-muted-foreground">{new Date(mnt.startDate).toLocaleDateString()}</span></TableCell>
              <TableCell>
                {mnt.status === "Active" ? (
                  <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-[10px]">Active</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Completed</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> {mnt.rating.toFixed(1)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button onClick={() => { setSelectedMentor(mnt.mentor); setIsMentorProfileOpen(true); }} variant="outline" size="sm" className="rounded-xl h-8 text-xs">Profile</Button>
                  <Button onClick={() => { setScheduleForm({ ...scheduleForm, mentor: mnt.mentor.name, mentee: mnt.mentee.name }); setIsSchedulerOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground" title="Reschedule Session"><CalendarIcon className="w-4 h-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                No mentorship matches found.
              </td>
            </tr>
          )}
        </StyledTable>

        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </GlassCard>

      {/* ── MODAL: AI Match Matching Interface ── */}
      {isMatchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsMatchOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-orange-600"><Target className="w-5 h-5"/> AI Mentorship Matchmaker</h3>
            <p className="text-xs text-muted-foreground mb-6">Select a pending student match request and assign the best recommended alumni mentor.</p>

            <div className="space-y-6">
              {/* Mentee Choice card */}
              <div className="p-4 rounded-2xl bg-muted/20 border flex items-center gap-4">
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=AG" alt="Mentee" className="w-12 h-12 rounded-full border" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-sm">Alice Green <span className="text-muted-foreground font-normal">(CSE Senior student)</span></p>
                  <p className="text-muted-foreground mt-0.5">GPA: 3.9/4.0 • Focus Area: Deep Learning, Neural Networks</p>
                  <p className="text-orange-600 font-semibold mt-1">Requested Program: Deep Learning Research Prep</p>
                </div>
              </div>

              {/* Matching Recommendations list */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recommended Alumni Mentors</h4>
                <div className="space-y-3">
                  {[
                    { name: "Sarah Connor", company: "OpenAI", title: "AI Researcher", score: 94, skills: ["Machine Learning", "Python", "RLHF"], image: "https://api.dicebear.com/7.x/initials/svg?seed=SC" },
                    { name: "David Chen", company: "Stripe", title: "Engineering Manager", score: 78, skills: ["System Design", "Go", "AWS"], image: "https://api.dicebear.com/7.x/initials/svg?seed=DC" }
                  ].map((rec, i) => (
                    <div key={i} className="p-4 border rounded-2xl bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={rec.image} alt={rec.name} className="w-10 h-10 rounded-full border shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-sm leading-tight">{rec.name}</p>
                          <p className="text-muted-foreground mt-0.5">{rec.title} at {rec.company}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {rec.skills.map(s => <span key={s} className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">{s}</span>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-xl">{rec.score}% Match Score</span>
                        <Button size="sm" onClick={() => handleAssignSubmit(rec, { name: "Alice Green", rollNo: "CS202340", image: "https://api.dicebear.com/7.x/initials/svg?seed=AG" }, "AI Deep Learning Prep")} className="rounded-xl bg-orange-600 hover:bg-orange-700">Assign Mentor</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Meeting Scheduler ── */}
      {isSchedulerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsSchedulerOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-orange-600"><CalendarIcon className="w-5 h-5"/> Mentorship Session Scheduler</h3>
            <p className="text-xs text-muted-foreground mb-6">Create a meeting slot, sync with Google calendar and invite the mentor & mentee.</p>

            <form onSubmit={handleMeetingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Active Mentor pairing *</label>
                <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-orange-500" value={scheduleForm.mentor} onChange={e => setScheduleForm({...scheduleForm, mentor: e.target.value})} required>
                  <option value="">-- Choose Mentor pairing --</option>
                  <option value="Sarah Connor">Sarah Connor & Alice Green</option>
                  <option value="David Chen">David Chen & Bob Dylan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Date *</label>
                  <Input type="date" value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} required />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Time Slot *</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-orange-500" value={scheduleForm.timeSlot} onChange={e => setScheduleForm({...scheduleForm, timeSlot: e.target.value})}>
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Meeting Platform</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-orange-500" value={scheduleForm.platform} onChange={e => setScheduleForm({...scheduleForm, platform: e.target.value})}>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom Video</option>
                    <option value="In-Person">In-Person Campus Lab</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Custom Room / Video URL</label>
                  <Input placeholder="Auto-generated if blank" value={scheduleForm.meetingLink} onChange={e => setScheduleForm({...scheduleForm, meetingLink: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Session Agenda / Notes</label>
                <textarea placeholder="e.g. Mock interview focus, portfolio review notes..." className="w-full rounded-xl border bg-background/50 p-3 text-sm focus-visible:ring-1 focus-visible:ring-orange-500 min-h-[60px]" value={scheduleForm.notes} onChange={e => setScheduleForm({...scheduleForm, notes: e.target.value})} />
              </div>
              
              <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100 p-3 rounded-xl text-orange-700">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Invites and notifications will be sent automatically.</span>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSchedulerOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white">Create Slot</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Mentor Profile Detail ── */}
      {isMentorProfileOpen && selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsMentorProfileOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-4 items-center mb-6 border-b pb-4">
              <img src={selectedMentor.image} alt={selectedMentor.name} className="w-16 h-16 rounded-full border shadow-sm" />
              <div>
                <h4 className="font-bold text-lg leading-tight">{selectedMentor.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedMentor.designation} at {selectedMentor.company}</p>
                <div className="flex items-center text-amber-500 font-bold mt-1 text-xs gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.9 (42 reviews)
                </div>
              </div>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground font-bold uppercase block tracking-wider mb-1">Expertise Core</span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedMentor.skills || ["System Design", "Fintech", "AWS"]).map((s: string) => <Badge key={s} variant="secondary" className="px-2 py-0.5">{s}</Badge>)}
                </div>
              </div>
              <div className="border-t pt-3">
                <span className="text-muted-foreground font-bold uppercase block tracking-wider mb-1">Availability Slots</span>
                <p className="font-semibold text-foreground">Saturdays 02:00 PM - 05:00 PM EST</p>
              </div>
              <div className="border-t pt-3">
                <span className="text-muted-foreground font-bold uppercase block tracking-wider mb-1">Bio Description</span>
                <p className="text-foreground/80 leading-relaxed">Dedicated alumnus engineering leader committed to supporting college students for career growth, interviews preparations, and general technology advisories.</p>
              </div>
            </div>
            <div className="pt-6 border-t flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsMentorProfileOpen(false)} className="rounded-xl">Close Profile</Button>
              <Button onClick={() => { setIsMentorProfileOpen(false); setIsSchedulerOpen(true); }} className="rounded-xl bg-orange-600 text-white">Book Slot</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Mentee Profile Detail ── */}
      {isMenteeProfileOpen && selectedMentee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsMenteeProfileOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-4 items-center mb-6 border-b pb-4">
              <img src={selectedMentee.image} alt={selectedMentee.name} className="w-16 h-16 rounded-full border shadow-sm" />
              <div>
                <h4 className="font-bold text-lg leading-tight">{selectedMentee.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Undergraduate CSE Student</p>
                <Badge className="bg-orange-50 text-orange-600 border-orange-200 mt-1">Roll No: {selectedMentee.rollNo}</Badge>
              </div>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground font-bold uppercase block tracking-wider">GPA Score</span>
                  <span className="font-bold text-sm text-foreground">{selectedMentee.gpa} / 4.0</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold uppercase block tracking-wider">Course Year</span>
                  <span className="font-semibold text-foreground">CSE Senior (4th Year)</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <span className="text-muted-foreground font-bold uppercase block tracking-wider mb-1">Mentorship Core Goals</span>
                <p className="font-semibold text-foreground">{selectedMentee.goals || "System Design engineering placement preparation."}</p>
              </div>
              <div className="border-t pt-3">
                <span className="text-muted-foreground font-bold uppercase block tracking-wider mb-1">Skills Profile</span>
                <div className="flex flex-wrap gap-1">
                  {["React", "Node.js", "Python", "SQL"].map(s => <Badge key={s} variant="outline" className="px-2 py-0.5">{s}</Badge>)}
                </div>
              </div>
            </div>
            <div className="pt-6 border-t flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsMenteeProfileOpen(false)} className="rounded-xl">Close profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

