import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  Send,
  Download,
  Filter,
  Search,
  UserCheck,
  Award,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Bell,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight as ArrowRightIcon
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementCalendar, type CalendarEventItem } from "@/services/placementService";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function PlacementCalendar() {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Drive" | "Deadline" | "Interview">("All");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; items: CalendarEventItem[] } | null>(null);

  // Student Queue Filter States
  const [studentSearch, setStudentSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [queueStatusFilter, setQueueStatusFilter] = useState("ALL");

  // Officer Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Modal Form Inputs
  const [newCompany, setNewCompany] = useState("");
  const [newRound, setNewRound] = useState("Technical Round 1");
  const [newVenue, setNewVenue] = useState("Computer Lab 1");
  const [newDate, setNewDate] = useState("2026-07-28");
  const [newTime, setNewTime] = useState("10:00 AM");

  useEffect(() => {
    fetchPlacementCalendar()
      .then((res) => {
        setEvents(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load placement calendar events:", err);
        setLoading(false);
      });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("en-US", { month: "long" });

  const firstDayIndexRaw = new Date(year, month, 1).getDay();
  const firstDayIndex = firstDayIndexRaw === 0 ? 6 : firstDayIndexRaw - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const filteredEvents = events.filter((e) => selectedFilter === "All" || e.type === selectedFilter);

  const getEventsForDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  // Scheduled Student Queue Data
  const [studentQueue, setStudentQueue] = useState([
    { id: "SQ_101", rollNo: "CS100001", name: "Student Demo", dept: "CSE", company: "Amazon India", round: "Technical Round 2", slot: "09:30 AM", attendance: "Checked In", status: "Ongoing" },
    { id: "SQ_102", rollNo: "EC100012", name: "Priya Patel", dept: "ECE", company: "Qualcomm India", round: "VLSI Technical", slot: "10:00 AM", attendance: "Present", status: "Scheduled" },
    { id: "SQ_103", rollNo: "IT202604", name: "Rohan Sharma", dept: "IT", company: "Microsoft India", round: "System Design", slot: "11:15 AM", attendance: "Pending", status: "Scheduled" },
    { id: "SQ_104", rollNo: "CS202688", name: "Ananya Deshmukh", dept: "CSE", company: "Amazon India", round: "Behavioral & HR", slot: "01:30 PM", attendance: "Present", status: "Scheduled" },
    { id: "SQ_105", rollNo: "EE202619", name: "Karthik Verma", dept: "EEE", company: "TCS Digital", round: "Coding Round", slot: "02:00 PM", attendance: "Absent", status: "Absent" },
  ]);

  // Results Management Entries
  const [resultEntries, setResultEntries] = useState([
    { id: "RES_1", studentName: "Rohan Sharma", rollNo: "IT202604", company: "Microsoft India", round: "System Design", status: "Pending Evaluation" },
    { id: "RES_2", studentName: "Priya Patel", rollNo: "EC100012", company: "Qualcomm India", round: "VLSI Technical", status: "Pending Evaluation" },
    { id: "RES_3", studentName: "Karthik Verma", rollNo: "EE202619", company: "TCS Digital", round: "Coding Round", status: "Absent" },
  ]);

  const handleUpdateResult = (resId: string, outcome: "Selected" | "Rejected" | "Hold" | "Move to Next Round") => {
    setResultEntries((prev) => prev.filter((r) => r.id !== resId));
    toast.success(`Result updated to "${outcome}". Notification dispatched.`);
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany) {
      toast.error("Please enter company name.");
      return;
    }
    const newEvt: CalendarEventItem = {
      id: `EVT_${Date.now()}`,
      title: `${newCompany} ${newRound}`,
      date: newDate,
      type: "Interview",
      company: newCompany,
      venue: newVenue,
      details: `Scheduled at ${newTime}`,
    };
    setEvents([newEvt, ...events]);
    toast.success(`Scheduled ${newCompany} ${newRound} for ${newDate}!`);
    setIsScheduleModalOpen(false);
    setNewCompany("");
  };

  const filteredQueue = studentQueue.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.company.toLowerCase().includes(studentSearch.toLowerCase());
    const matchCompany = companyFilter === "ALL" || s.company.toLowerCase() === companyFilter.toLowerCase();
    const matchStatus = queueStatusFilter === "ALL" || s.status.toLowerCase() === queueStatusFilter.toLowerCase();
    return matchSearch && matchCompany && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Enterprise Interview Management Dashboard 🎯"
        desc="Real-time recruitment schedule, today's timeline, panel assignments, room allocation, student queue & evaluation results."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition flex items-center gap-1.5"
            >
              <Plus className="size-4" /> Schedule Interview
            </button>
            <button
              onClick={() => toast.success("Exported today's interview schedule to CSV.")}
              className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-accent transition cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" /> Export Schedule
            </button>
          </div>
        }
      />

      {/* SECTION 1: DASHBOARD SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Interviews", val: "48", icon: "📋", tone: "info" },
          { label: "Today's Schedule", val: "5", icon: "⏰", tone: "success" },
          { label: "Upcoming", val: "18", icon: "📅", tone: "info" },
          { label: "Pending Results", val: resultEntries.length, icon: "⏳", tone: "warn" },
          { label: "Completed", val: "22", icon: "✅", tone: "success" },
          { label: "Active Companies", val: "8", icon: "🏢", tone: "info" },
          { label: "Scheduled Students", val: "142", icon: "👥", tone: "info" },
          { label: "Attendance Rate", val: "94.2%", icon: "📊", tone: "success" },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-3 text-center hover:bg-accent/40 transition">
            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <span>{kpi.icon}</span>
              <span className="truncate">{kpi.label}</span>
            </div>
            <div className="text-base font-extrabold text-foreground mt-1">{kpi.val}</div>
          </Card>
        ))}
      </div>

      {/* SECTION 2: TODAY'S SCHEDULE TIMELINE */}
      <Card className="bg-gradient-soft border">
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-foreground">Today's Interview Schedule & Live Timeline</h3>
              <p className="text-xs text-muted-foreground">July 27, 2026 • Live status of ongoing recruitment rounds.</p>
            </div>
          </div>
          <Badge tone="success" className="flex items-center gap-1 animate-pulse">
            <span className="size-2 rounded-full bg-emerald-500" /> 3 Rounds Active
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { time: "09:30 AM", company: "Amazon India", round: "Technical Round 2 (System Design)", venue: "Conference Hall B", panel: "Panel Alpha", status: "Ongoing", count: 12 },
            { time: "11:00 AM", company: "Qualcomm India", round: "VLSI Technical Assessment", venue: "Embedded Hardware Lab", panel: "Panel Beta", status: "Upcoming", count: 8 },
            { time: "02:00 PM", company: "TCS Digital", round: "Hands-on Coding & Problem Solving", venue: "Computer Lab 3", panel: "Panel Gamma", status: "Upcoming", count: 25 },
          ].map((item) => (
            <div
              key={item.time}
              className={`p-4 rounded-xl border space-y-2 transition ${
                item.status === "Ongoing"
                  ? "bg-primary/5 border-primary shadow-xs"
                  : "bg-background/80 hover:bg-accent/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
                  <Clock className="size-3.5" /> {item.time}
                </span>
                <Badge tone={item.status === "Ongoing" ? "success" : "info"}>
                  {item.status}
                </Badge>
              </div>

              <div>
                <div className="font-extrabold text-sm text-foreground">{item.company}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.round}</div>
              </div>

              <div className="text-[11px] text-muted-foreground pt-2 border-t flex justify-between">
                <span>📍 {item.venue}</span>
                <span>👨‍🏫 {item.panel} ({item.count} Candidates)</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 3: QUICK ACTIONS TOOLBAR */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Placement Officer Quick Actions:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border hover:bg-accent transition font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3.5 text-primary" /> Schedule Interview
            </button>
            <button
              onClick={() => toast.info("Panel Assignment Modal ready.")}
              className="px-3 py-1.5 rounded-lg border hover:bg-accent transition font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Users className="size-3.5 text-indigo-600" /> Assign Panel
            </button>
            <button
              onClick={() => toast.info("Room Conflict Checker: All 8 Labs Available.")}
              className="px-3 py-1.5 rounded-lg border hover:bg-accent transition font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Building2 className="size-3.5 text-purple-600" /> Allocate Room
            </button>
            <button
              onClick={() => toast.success("Dispatched SMS & Email notifications to 45 scheduled candidates.")}
              className="px-3 py-1.5 rounded-lg bg-gradient-primary text-white font-semibold flex items-center gap-1 cursor-pointer hover:opacity-95 transition"
            >
              <Send className="size-3.5" /> Notify Students
            </button>
          </div>
        </div>
      </Card>

      {/* SECTION 4: INTERACTIVE INTERVIEW CALENDAR */}
      <Card>
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-primary text-white grid place-items-center font-bold">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{monthName} {year}</h3>
              <p className="text-xs text-muted-foreground">{filteredEvents.length} scheduled recruitment events</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(["All", "Drive", "Deadline", "Interview"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedFilter === filter
                    ? "bg-gradient-primary text-white shadow-xs"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {filter}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-1" />

            <button onClick={prevMonth} className="p-2 rounded-xl border hover:bg-accent transition cursor-pointer">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-accent cursor-pointer">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl border hover:bg-accent transition cursor-pointer">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading recruitment calendar...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-2 bg-muted/30 rounded-xl">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {paddingArray.map((_, idx) => (
                <div key={`pad-${idx}`} className="h-28 rounded-xl border border-dashed border-muted/50 bg-muted/10 opacity-40" />
              ))}

              {daysArray.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <div
                    key={day}
                    onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ date: `${monthName} ${day}, ${year}`, items: dayEvents })}
                    className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer hover:shadow-md ${
                      isToday ? "border-primary bg-primary/5 font-bold" : "bg-background hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isToday ? "size-6 rounded-full bg-gradient-primary text-white grid place-items-center" : "text-muted-foreground"}`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          className={`text-[10px] p-1 rounded-md font-medium truncate ${
                            evt.type === "Drive"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200"
                              : evt.type === "Deadline"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200"
                          }`}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground text-center font-semibold">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* SECTION 5: UPCOMING INTERVIEW CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground">Upcoming Recruitment Drive Cards</h3>
          <Badge tone="info">Next 7 Days</Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { company: "Amazon India", round: "Technical Round 2 & System Design", date: "July 27, 2026", time: "09:30 AM", venue: "Conference Hall B", panel: "Panel Alpha (3 Evaluators)", scheduled: 12, total: 15, status: "Ongoing" },
            { company: "Qualcomm India", round: "VLSI Technical Assessment", date: "July 27, 2026", time: "11:00 AM", venue: "Hardware Embedded Lab", panel: "Panel Beta (2 Evaluators)", scheduled: 8, total: 10, status: "Scheduled" },
            { company: "Microsoft India", round: "SDE Technical Round 1", date: "July 28, 2026", time: "10:00 AM", venue: "Computer Lab 1", panel: "Panel Gamma (4 Evaluators)", scheduled: 24, total: 30, status: "Confirmed" },
          ].map((card) => (
            <Card key={card.company} className="hover:shadow-md transition space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="font-extrabold text-sm text-foreground">{card.company}</div>
                <Badge tone={card.status === "Ongoing" ? "success" : "info"}>{card.status}</Badge>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="font-semibold text-foreground">{card.round}</div>
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> {card.date} at {card.time}
                </div>
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-indigo-600" /> {card.venue}
                </div>
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-purple-600" /> {card.panel}
                </div>
              </div>

              <div className="pt-2 border-t text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Scheduled Candidates:</span>
                  <span className="text-foreground">{card.scheduled} / {card.total}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-accent overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${(card.scheduled / card.total) * 100}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 6: SCHEDULED STUDENT QUEUE TABLE */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b">
          <div>
            <h3 className="font-bold text-base">Scheduled Student Candidate Queue</h3>
            <p className="text-xs text-muted-foreground">Manage candidate check-ins, time slots, and attendance status.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              placeholder="Search candidate or roll..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-background text-xs outline-none focus:border-primary w-full sm:w-48"
            />
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">All Companies</option>
              <option value="Amazon India">Amazon India</option>
              <option value="Qualcomm India">Qualcomm India</option>
              <option value="Microsoft India">Microsoft India</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b bg-accent/30">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Candidate & Roll</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Dept</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company & Round</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Slot Time</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Attendance</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredQueue.map((sq) => (
                <tr key={sq.id} className="hover:bg-accent/40 transition">
                  <td className="py-3 px-4 font-bold text-foreground">
                    <div>{sq.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{sq.rollNo}</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-semibold">{sq.dept}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-foreground">{sq.company}</div>
                    <div className="text-[11px] text-muted-foreground">{sq.round}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{sq.slot}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge tone={sq.attendance === "Checked In" ? "success" : sq.attendance === "Present" ? "info" : "danger"}>
                      {sq.attendance}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toast.success(`Marked ${sq.name} as Checked In.`)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Check In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 7 & 8: INTERVIEW PANELS & ROOM ALLOCATION */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Interview Panels */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <h3 className="font-bold text-base">Interview Panel Assignments</h3>
            <Badge tone="info">Active Evaluators</Badge>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: "Panel Alpha", interviewer: "Dr. Rajesh Kumar (Tech Lead, Amazon)", room: "Conf B", assigned: 12, status: "Evaluating" },
              { name: "Panel Beta", interviewer: "Sanjay Mehta (Hardware Arch, Qualcomm)", room: "VLSI Lab", assigned: 8, status: "Active" },
              { name: "Panel Gamma", interviewer: "Pooja Hegde (Principal SDE, Microsoft)", room: "Lab 1", assigned: 24, status: "Scheduled" },
            ].map((p) => (
              <div key={p.name} className="p-3 rounded-xl border bg-background flex items-center justify-between gap-3 hover:bg-accent/40 transition">
                <div>
                  <div className="font-bold text-foreground text-sm">{p.name} — {p.interviewer}</div>
                  <div className="text-muted-foreground mt-0.5">Room: {p.room} • {p.assigned} Candidates Assigned</div>
                </div>
                <Badge tone={p.status === "Evaluating" ? "success" : "info"}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Room Allocation Matrix */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <h3 className="font-bold text-base">Room Allocation Matrix</h3>
            <Badge tone="success">Conflict-Free Grid</Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {[
              { room: "Conference Hall B", capacity: 40, company: "Amazon India", round: "Tech Round 2", status: "Occupied" },
              { room: "Computer Lab 1", capacity: 60, company: "Microsoft India", round: "Coding Round", status: "Occupied" },
              { room: "Hardware Embedded Lab", capacity: 25, company: "Qualcomm India", round: "VLSI Assessment", status: "Occupied" },
              { room: "Seminar Hall 2", capacity: 100, company: "None", round: "Available", status: "Available" },
            ].map((r) => (
              <div key={r.room} className="p-3 rounded-xl border bg-background space-y-1 hover:bg-accent/40 transition">
                <div className="flex justify-between font-bold text-foreground">
                  <span>{r.room}</span>
                  <Badge tone={r.status === "Occupied" ? "danger" : "success"}>{r.status}</Badge>
                </div>
                <div className="text-muted-foreground text-[11px]">Capacity: {r.capacity} Seats • {r.company} ({r.round})</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SECTION 9: RESULT MANAGEMENT CENTER */}
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200 dark:border-emerald-900">
          <div>
            <h3 className="font-bold text-base text-foreground">Interview Results Management Center</h3>
            <p className="text-xs text-muted-foreground">Officer evaluation results entry and status transitions.</p>
          </div>
          <Badge tone="warn">{resultEntries.length} Pending Results</Badge>
        </div>

        <div className="space-y-3">
          {resultEntries.map((res) => (
            <div key={res.id} className="p-3.5 rounded-xl border bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-foreground">{res.studentName} ({res.rollNo})</div>
                <div className="text-muted-foreground">{res.company} • {res.round}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleUpdateResult(res.id, "Selected")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer hover:bg-emerald-700 transition"
                >
                  Selected
                </button>
                <button
                  onClick={() => handleUpdateResult(res.id, "Move to Next Round")}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold cursor-pointer hover:opacity-95 transition"
                >
                  Next Round
                </button>
                <button
                  onClick={() => handleUpdateResult(res.id, "Hold")}
                  className="px-3 py-1.5 rounded-lg border text-foreground font-semibold cursor-pointer hover:bg-accent transition"
                >
                  Hold
                </button>
                <button
                  onClick={() => handleUpdateResult(res.id, "Rejected")}
                  className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 font-semibold cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 transition"
                >
                  Rejected
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 11 & 12: ANALYTICS & ACTIVITY FEED */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-sm mb-4">Interview Attendance & Outcome Analytics</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { company: "Amazon", selected: 12, rejected: 4, ongoing: 6 },
                { company: "Qualcomm", selected: 8, rejected: 2, ongoing: 4 },
                { company: "Microsoft", selected: 15, rejected: 5, ongoing: 10 },
                { company: "TCS Digital", selected: 25, rejected: 8, ongoing: 12 },
              ]}>
                <XAxis dataKey="company" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="selected" fill="#10b981" name="Selected" />
                <Bar dataKey="ongoing" fill="#3b82f6" name="Ongoing" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Real-time Activity Feed */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h3 className="font-bold text-sm">Recent Interview Activity Feed</h3>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { time: "10:15 AM", title: "Amazon Tech Round 2 Started", desc: "12 candidates checked in." },
              { time: "09:45 AM", title: "Panel Alpha Assigned to Conf B", desc: "Dr. Rajesh Kumar leading evaluation." },
              { time: "09:00 AM", title: "SMS & Email Notifications Dispatched", desc: "Sent to 45 candidates." },
            ].map((feed, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border bg-background space-y-1">
                <div className="font-bold text-foreground flex justify-between">
                  <span>{feed.title}</span>
                  <span className="text-[10px] text-muted-foreground">{feed.time}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{feed.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleScheduleInterview} className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-foreground">Schedule Recruitment Interview</h3>
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Interview Round</label>
                <select
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background outline-none focus:border-primary"
                >
                  <option value="Technical Round 1">Technical Round 1</option>
                  <option value="Technical Round 2 (System Design)">Technical Round 2 (System Design)</option>
                  <option value="Coding Assessment">Coding Assessment</option>
                  <option value="HR & Behavioral Round">HR & Behavioral Round</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Allocated Venue / Room</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 py-2 rounded-xl border text-muted-foreground text-xs font-semibold hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition"
              >
                Schedule & Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DAY EVENTS MODAL */}
      {selectedDayEvents && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-foreground">{selectedDayEvents.date} Events</h3>
              <button onClick={() => setSelectedDayEvents(null)} className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-semibold">✕</button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedDayEvents.items.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border bg-gradient-soft space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{item.title}</span>
                    <Badge tone={item.type === "Drive" ? "success" : item.type === "Deadline" ? "warn" : "info"}>
                      {item.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="size-3 text-primary shrink-0" />
                    <span>{item.venue}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1 border-t border-muted/40">
                    {item.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
