import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Play,
  Video,
  Clock,
  BookOpen,
  Users,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Zap,
  Star,
  Upload,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  Link2,
  RefreshCw,
  Monitor,
  GraduationCap,
  Layers,
  PenLine,
  Bell,
  Clipboard,
  ClipboardCheck,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { getStoredFacultyProfile } from '@/services/facultyProfileService';
import { useNavigate } from '@tanstack/react-router';

// ─── Department Subjects Map ──────────────────────────────────────────────────
const DEPT_SUBJECTS: Record<string, string[]> = {
  CSE:          ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Java Programming', 'Python Programming', 'Web Technologies', 'Cloud Computing', 'Compiler Design'],
  AIML:         ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Neural Networks', 'Reinforcement Learning', 'Generative AI'],
  AIDS:         ['Data Analytics', 'Big Data', 'Data Visualization', 'Data Mining', 'Statistics', 'Predictive Analytics', 'Business Intelligence'],
  CYBERSECURITY:['Ethical Hacking', 'Cryptography', 'Information Security', 'Network Security', 'Digital Forensics', 'Secure Coding'],
  ECE:          ['Digital Electronics', 'Analog Circuits', 'Signals & Systems', 'Embedded Systems', 'VLSI', 'IoT', 'Communication Systems'],
  EEE:          ['Electrical Machines', 'Power Systems', 'Power Electronics', 'Control Systems', 'Renewable Energy', 'High Voltage Engineering'],
  IT:           ['Cloud Computing', 'Web Technologies', 'Database Systems', 'Mobile Computing', 'Software Engineering', 'Network Administration'],
  MECH:         ['Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Manufacturing Technology', 'CAD/CAM', 'Machine Design', 'Heat Transfer'],
  CIVIL:        ['Structural Engineering', 'Surveying', 'Geotechnical Engineering', 'Concrete Technology', 'Environmental Engineering', 'Transportation Engineering', 'Construction Management'],
};

// ─── Subject → Color palette ──────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Data Structures':      { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'DBMS':                 { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  'Operating Systems':    { bg: 'bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
  'Computer Networks':    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Software Engineering': { bg: 'bg-pink-100',   text: 'text-pink-700',   border: 'border-pink-200',   dot: 'bg-pink-500' },
  'Java Programming':     { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  'Python Programming':   { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  'Web Technologies':     { bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-200',   dot: 'bg-cyan-500' },
  'Cloud Computing':      { bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-200',    dot: 'bg-sky-500' },
  'Compiler Design':      { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'default':              { bg: 'bg-slate-100',  text: 'text-slate-700',  border: 'border-slate-200',  dot: 'bg-slate-500' },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS['default'];
}

// ─── Timetable per department (Mon–Fri, 5 slots) ─────────────────────────────
function buildTimetable(dept: string, subjects: string[]) {
  const s = (i: number) => subjects[i % subjects.length];
  return {
    '09:00–10:00': { Mon: s(0), Tue: s(1), Wed: s(2), Thu: s(3), Fri: s(1) },
    '10:00–11:00': { Mon: s(2), Tue: 'Free',Wed: s(1), Thu: s(2), Fri: s(2) },
    '11:00–12:00': { Mon: s(3), Tue: s(0), Wed: 'Free',Thu: s(0), Fri: 'Lab' },
    '14:00–15:00': { Mon: s(1), Tue: 'Lab', Wed: s(3), Thu: 'Free',Fri: s(3) },
    '15:00–16:00': { Mon: 'Free',Tue: s(2), Wed: s(0), Thu: 'Lab', Fri: s(0) },
  };
}

// ─── Recent class history ─────────────────────────────────────────────────────
function buildHistory(subjects: string[]) {
  const entries = [
    { date: '22 Jul', students: 42, attended: 40, duration: 60 },
    { date: '21 Jul', students: 42, attended: 38, duration: 55 },
    { date: '19 Jul', students: 42, attended: 41, duration: 60 },
    { date: '17 Jul', students: 42, attended: 36, duration: 50 },
    { date: '15 Jul', students: 42, attended: 39, duration: 60 },
  ];
  return entries.map((e, i) => ({
    ...e,
    subject: subjects[i % subjects.length],
    attendance: Math.round((e.attended / e.students) * 100),
  }));
}

// ─── Today's schedule (static per dept) ──────────────────────────────────────
function buildTodaySchedule(subjects: string[]) {
  return [
    { time: '09:00 AM', subject: subjects[0], sem: 5, section: 'A' },
    { time: '10:30 AM', subject: subjects[1 % subjects.length], sem: 5, section: 'B' },
    { time: '02:00 PM', subject: subjects[2 % subjects.length], sem: 3, section: 'A' },
  ];
}

// ─── Generate meeting link ────────────────────────────────────────────────────
function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

// ─── Main Component ───────────────────────────────────────────────────────────
export function FacultyClasses() {
  const profile    = getStoredFacultyProfile();
  const dept       = (profile.department || 'CSE').toUpperCase();
  const subjects   = DEPT_SUBJECTS[dept] || DEPT_SUBJECTS['CSE'];
  const timetable  = buildTimetable(dept, subjects);
  const history    = buildHistory(subjects);
  const todaySched = buildTodaySchedule(subjects);
  const navigate   = useNavigate();

  // Form state
  const [formSubject,  setFormSubject]  = useState(subjects[0]);
  const [formTopic,    setFormTopic]    = useState('');
  const [formDate,     setFormDate]     = useState('');
  const [formTime,     setFormTime]     = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formPlatform, setFormPlatform] = useState('Google Meet');
  const [formLink,     setFormLink]     = useState(generateMeetLink());
  const [scheduling,   setScheduling]   = useState(false);
  const [scheduled,    setScheduled]    = useState<any[]>([]);
  const [activeTab,    setActiveTab]    = useState<'overview' | 'timetable' | 'history'>('overview');

  // Auto-infer class info from subject
  const subjectInfo = useMemo(() => {
    const idx = subjects.indexOf(formSubject);
    const sems = [3, 5, 5, 7, 7, 3, 5, 5, 3, 7];
    const secs = ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'];
    return { dept, semester: sems[idx] ?? 5, section: secs[idx] ?? 'A' };
  }, [formSubject, dept]);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic || !formDate || !formTime) { alert('Please fill in all required fields'); return; }
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
      setScheduled(prev => [{
        id: Date.now(),
        subject: formSubject,
        topic: formTopic,
        date: formDate,
        time: formTime,
        duration: formDuration,
        platform: formPlatform,
        link: formLink,
        dept,
        semester: subjectInfo.semester,
        section: subjectInfo.section,
        status: 'Scheduled',
      }, ...prev]);
      setFormTopic(''); setFormDate(''); setFormTime('');
      setFormLink(generateMeetLink());
      alert(`✅ Class "${formTopic}" scheduled for ${formDate} at ${formTime}. Meeting: ${formLink}`);
    }, 900);
  };

  const subjectColor = getSubjectColor(formSubject);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Class Management"
        desc={`Dashboard · Faculty · Class Management`}
      />

      {/* ── Personalized Welcome Banner ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white,transparent)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">{getGreeting()} 👋</p>
            <h2 className="text-2xl font-bold">{profile.designation ? `Prof. ${profile.name}` : profile.name}</h2>
            <p className="text-violet-200 text-sm mt-1">{profile.departmentFullName || dept}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/15 backdrop-blur rounded-xl px-5 py-3 text-center">
              <div className="text-2xl font-bold">{todaySched.length}</div>
              <div className="text-xs text-violet-200 mt-0.5">Today's Classes</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl px-5 py-3 text-center">
              <div className="text-sm font-semibold">{todaySched[0]?.subject}</div>
              <div className="text-xs text-violet-200 mt-0.5">Next · {todaySched[0]?.time}</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl px-5 py-3 text-center">
              <div className="text-2xl font-bold">18</div>
              <div className="text-xs text-violet-200 mt-0.5">Weekly Hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Classes", value: String(todaySched.length), sub: 'Active slots', icon: Calendar, color: 'from-violet-500 to-indigo-600' },
          { label: 'Next Class', value: todaySched[0]?.subject?.split(' ')[0] ?? '—', sub: `${todaySched[0]?.time} · Sec ${todaySched[0]?.section}`, icon: Clock, color: 'from-blue-500 to-cyan-500' },
          { label: 'Weekly Teaching Hours', value: '18 Hrs', sub: '6 hrs remaining', icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
          { label: 'Average Attendance', value: '91%', sub: 'Across all subjects', icon: TrendingUp, color: 'from-orange-500 to-amber-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="relative overflow-hidden hover:shadow-md transition">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 bg-gradient-to-br ${color} opacity-10`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white grid place-items-center mb-3`}>
              <Icon className="size-5" />
            </div>
            <div className="text-xs text-muted-foreground font-medium">{label}</div>
            <div className="text-xl font-bold mt-1 leading-tight">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-muted">
        {(['overview', 'timetable', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'timetable' ? 'Weekly Timetable' : 'Class History'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main grid: Schedule form + Today panel + Quick actions */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Schedule New Class Form ─────────────────────────── */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white grid place-items-center">
                    <Plus className="size-4" />
                  </div>
                  <h3 className="font-semibold text-base">Schedule New Class</h3>
                </div>
                <form onSubmit={handleSchedule} className="space-y-4">
                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
                    <select
                      value={formSubject}
                      onChange={e => setFormSubject(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Auto-filled info row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Department', value: subjectInfo.dept },
                      { label: 'Semester', value: `Semester ${subjectInfo.semester}` },
                      { label: 'Section', value: `Section ${subjectInfo.section}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                        <div className="rounded-xl border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground/80">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Topic */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Topic / Title *</label>
                    <input
                      placeholder={`e.g. Introduction to ${formSubject}`}
                      value={formTopic}
                      onChange={e => setFormTopic(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </div>

                  {/* Date / Time / Duration */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                      <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                        className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Start Time *</label>
                      <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)}
                        className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Duration (min)</label>
                      <select value={formDuration} onChange={e => setFormDuration(e.target.value)}
                        className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                        {['30','45','60','75','90','120'].map(d => <option key={d} value={d}>{d} min</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Meeting Platform</label>
                    <select value={formPlatform} onChange={e => setFormPlatform(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 px-3 py-2.5 text-sm focus:outline-none">
                      {['Google Meet', 'Zoom', 'Microsoft Teams', 'Webex', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Auto-generated link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Link2 className="size-3" /> Meeting Link (Auto-Generated)
                    </label>
                    <div className="flex gap-2">
                      <input value={formLink} readOnly
                        className="flex-1 rounded-xl border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground" />
                      <button type="button" onClick={() => setFormLink(generateMeetLink())}
                        className="px-3 py-2 rounded-xl border hover:bg-accent transition" title="Regenerate">
                        <RefreshCw className="size-4" />
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={scheduling}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    {scheduling ? <><RefreshCw className="size-4 animate-spin" /> Scheduling...</> : <><Plus className="size-4" /> Schedule Class</>}
                  </button>
                </form>
              </Card>
            </div>

            {/* ── Right Column: Today's Schedule + Quick Actions ────── */}
            <div className="space-y-5">
              {/* Today's Schedule */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white grid place-items-center">
                    <Clock className="size-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Today's Schedule</h3>
                </div>
                <div className="space-y-3">
                  {todaySched.map((cls, i) => {
                    const col = getSubjectColor(cls.subject);
                    const now = new Date();
                    const [hm, ampm] = cls.time.split(' ');
                    const [hh] = hm.split(':').map(Number);
                    const hour = ampm === 'PM' && hh !== 12 ? hh + 12 : hh;
                    const isPast = now.getHours() > hour;
                    const isNow  = now.getHours() === hour;
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                        isNow ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20' : 'hover:bg-accent/40'
                      }`}>
                        <div className="text-xs font-bold text-muted-foreground w-16 pt-0.5 shrink-0">{cls.time}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                              {cls.subject}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Sem {cls.sem} · Sec {cls.section}</div>
                        </div>
                        {isNow && <span className="text-xs font-semibold text-indigo-600 shrink-0">Live</span>}
                        {isPast && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white grid place-items-center">
                    <Zap className="size-4" />
                  </div>
                  <h3 className="font-semibold text-sm">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Start Live Class', icon: Play, color: 'text-violet-600 bg-violet-50 border-violet-100', to: '/faculty/classes' },
                    { label: 'Take Attendance',  icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50 border-blue-100',   to: '/faculty/attendance' },
                    { label: 'Upload Materials', icon: Upload, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', to: '/faculty/materials' },
                    { label: 'Enter Marks',      icon: PenLine, color: 'text-orange-600 bg-orange-50 border-orange-100',   to: '/faculty/marks' },
                    { label: 'Send Announcement',icon: Bell, color: 'text-pink-600 bg-pink-50 border-pink-100',     to: '/faculty/communication' },
                  ].map(({ label, icon: Icon, color, to }) => (
                    <button key={label} onClick={() => navigate({ to })}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition hover:scale-[1.01] cursor-pointer ${color}`}>
                      <Icon className="size-4 shrink-0" />
                      <span>{label}</span>
                      <ChevronRight className="size-3.5 ml-auto" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* ── Workload + Performance cards ──────────────────────── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Teaching Workload */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white grid place-items-center">
                  <Layers className="size-4" />
                </div>
                <h3 className="font-semibold text-base">Teaching Workload</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Assigned Subjects', value: String(Math.min(subjects.length, 4)), icon: BookOpen, color: 'text-violet-600' },
                  { label: "Today's Classes",   value: String(todaySched.length),            icon: Calendar, color: 'text-blue-600' },
                  { label: 'Weekly Hours',       value: '18',                                 icon: Clock,    color: 'text-emerald-600' },
                  { label: 'Remaining Hours',    value: '6',                                  icon: AlertCircle, color: 'text-orange-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <Icon className={`size-5 shrink-0 ${color}`} />
                    <div>
                      <div className="text-lg font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Teaching Performance */}
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white grid place-items-center">
                  <Star className="size-4" />
                </div>
                <h3 className="font-semibold text-base">Teaching Performance</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Avg Attendance',     value: '91%', icon: TrendingUp, color: 'text-emerald-600' },
                  { label: 'Assignments Given',  value: '25',  icon: Clipboard,  color: 'text-blue-600' },
                  { label: 'Materials Uploaded', value: '18',  icon: Upload,     color: 'text-violet-600' },
                  { label: 'Student Feedback',   value: '4.8★',icon: Star,       color: 'text-amber-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <Icon className={`size-5 shrink-0 ${color}`} />
                    <div>
                      <div className="text-lg font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Scheduled Classes grid (user-added) ──────────────── */}
          {scheduled.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white grid place-items-center">
                  <Video className="size-4" />
                </div>
                <h3 className="font-semibold text-base">Newly Scheduled Classes</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduled.map(cls => {
                  const col = getSubjectColor(cls.subject);
                  return (
                    <div key={cls.id} className="rounded-xl border p-4 hover:shadow-md transition space-y-3">
                      <div className="flex items-start justify-between">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${col.bg} ${col.text} ${col.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />{cls.subject}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Scheduled</span>
                      </div>
                      <div className="font-semibold text-sm">{cls.topic}</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5"><Calendar className="size-3" />{cls.date} · {cls.time}</div>
                        <div className="flex items-center gap-1.5"><Clock className="size-3" />{cls.duration} min · {cls.platform}</div>
                        <div className="flex items-center gap-1.5"><GraduationCap className="size-3" />Sem {cls.semester} · Sec {cls.section}</div>
                      </div>
                      <button
                        onClick={() => window.open(cls.link, '_blank')}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition">
                        <Play className="size-3" /> Join Class
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── TIMETABLE TAB ────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'timetable' && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white grid place-items-center">
              <Calendar className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Weekly Timetable</h3>
              <p className="text-xs text-muted-foreground">{profile.departmentFullName || dept} · Academic 2025–26</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-32">Time</th>
                  {DAYS.map(d => (
                    <th key={d} className="text-left py-3 px-4 font-semibold text-muted-foreground">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(timetable).map(([slot, row]) => (
                  <tr key={slot} className="hover:bg-accent/30 transition">
                    <td className="py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{slot}</td>
                    {DAYS.map(d => {
                      const val = (row as any)[d] as string;
                      const isFree = val === 'Free' || val === 'Lab';
                      const col = isFree ? null : getSubjectColor(val);
                      return (
                        <td key={d} className="py-3 px-4">
                          {isFree
                            ? <span className="text-xs text-muted-foreground italic">{val}</span>
                            : (
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${col!.bg} ${col!.text} ${col!.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${col!.dot}`} />
                                {val}
                              </span>
                            )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Subject color legend */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Subject Color Legend</p>
            <div className="flex flex-wrap gap-2">
              {subjects.slice(0, 8).map(s => {
                const col = getSubjectColor(s);
                return (
                  <span key={s} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${col.bg} ${col.text} ${col.border}`}>
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />{s}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── HISTORY TAB ──────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
                <CheckCircle2 className="size-4" />
              </div>
              <h3 className="font-semibold text-base">Recent Class History</h3>
            </div>
            <div className="space-y-3">
              {history.map((cls, i) => {
                const col = getSubjectColor(cls.subject);
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border hover:bg-accent/30 transition">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${col.bg} ${col.text}`}>
                      <Video className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{cls.subject}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${col.bg} ${col.text} ${col.border}`}>
                          {cls.date}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="size-3" />{cls.attended}/{cls.students} Students</span>
                        <span className="flex items-center gap-1"><TrendingUp className="size-3" />{cls.attendance}% Attendance</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" />{cls.duration} min</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Timeline */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white grid place-items-center">
                <ChevronRight className="size-4" />
              </div>
              <h3 className="font-semibold text-base">Upcoming Today</h3>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-400 to-transparent" />
              {todaySched.map((cls, i) => {
                const col = getSubjectColor(cls.subject);
                return (
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white shadow ${col.dot}`} />
                    <div className="ml-2">
                      <div className="text-xs font-bold text-muted-foreground">{cls.time}</div>
                      <div className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${col.bg} ${col.text} ${col.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                        {cls.subject} · Sem {cls.sem} Sec {cls.section}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
