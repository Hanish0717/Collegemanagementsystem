import { useState, useEffect } from 'react';
import { Outlet, useRouterState, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  AlertTriangle,
  FileCheck,
  CalendarCheck,
  CheckSquare,
  HelpCircle,
  PieChart,
  Check,
  HeartHandshake,
} from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/dashboard/ui';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

import { getStoredFacultyProfile } from '@/services/facultyProfileService';

export function FacultyDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(20);

  const profile = getStoredFacultyProfile();
  const displayName = profile.name || user?.fullName || 'Kondapalli Bhargav';

  const classPerformanceData = [
    { class: 'Section A', classAvg: 78, topScore: 96 },
    { class: 'Section B', classAvg: 72, topScore: 91 },
    { class: 'Section C', classAvg: 83, topScore: 98 },
    { class: 'Section D', classAvg: 75, topScore: 94 },
  ];

  // Only show Outlet for nested sub-routes — render dashboard content on the main paths
  const isFacultyDashboardPath =
    path === '/faculty/dashboard' ||
    path === '/faculty/' ||
    path === '/faculty' ||
    path === '/dashboard/faculty' ||
    path === '/dashboard';

  if (!isFacultyDashboardPath) {
    return <Outlet />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Page Header & Hero Welcome Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Faculty Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200">
              {profile.department}
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, Prof. {displayName}! Here is your personalized teaching & academic overview.
          </p>
        </div>

        {/* Personalized Profile Quick Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="size-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
          />
          <div className="text-xs leading-tight">
            <div className="font-extrabold text-slate-900 dark:text-white">
              Prof. {profile.name}
            </div>
            <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
              {profile.designation} • ID: {profile.employeeId}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Welcome Card with Integrated AI Action Tiles */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-100/90 via-indigo-50/70 to-purple-100/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-blue-200/60 dark:border-blue-900/50 p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Greeting */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="size-3.5 text-blue-600" />
              <span>Personalized Faculty Portal — {profile.departmentFullName}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Good morning, Prof. {displayName}! 👋
            </h2>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {profile.designation} — Department of {profile.departmentFullName}
            </p>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
              Employee ID: <span className="font-mono font-extrabold text-slate-900 dark:text-white">{profile.employeeId}</span> • You have <span className="font-bold text-slate-900 dark:text-white">3 classes today</span> and <span className="font-bold text-blue-600 dark:text-blue-400">12 pending tasks</span>.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate({ to: '/dashboard/faculty/classes' })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition cursor-pointer"
              >
                <span>View My Classes</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Right AI Quick Action Cards */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-blue-100 dark:border-blue-900/50 shadow-xs flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <Sparkles className="size-3.5 text-purple-600" />
                  <span>AI Lesson Planner</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Create smart lesson plans in seconds with AI.
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/dashboard/ai' })}
                className="px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-700 text-xs font-semibold transition shrink-0 cursor-pointer"
              >
                Create Lesson Plan &gt;
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-purple-100 dark:border-purple-900/50 shadow-xs flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <FileText className="size-3.5 text-purple-600" />
                  <span>AI Content Generator</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Generate worksheets, quizzes and study materials.
                </p>
              </div>
              <button
                onClick={() => navigate({ to: '/dashboard/ai' })}
                className="px-3 py-1.5 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-700 text-xs font-semibold transition shrink-0 cursor-pointer"
              >
                Generate Content &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Top 4 KPI Stat Cards with Custom Accent Themes & Sparklines ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Classes"
          value="3"
          subtitle="Next: Physics - 10A (09:30 AM - 10:15 AM)"
          icon={CalendarIcon}
          theme="blue"
        />
        <StatCard
          label="Student Count"
          value="128"
          subtitle="Across 4 Classes"
          icon={Users}
          theme="green"
        />
        <StatCard
          label="Assignments to Grade"
          value="12"
          subtitle="Due within 3 days"
          icon={FileText}
          theme="purple"
        />
        <StatCard
          label="Pending Leave Requests"
          value="2"
          subtitle="Requires your approval"
          icon={Clock}
          theme="amber"
        />
      </div>

      {/* ── 3. Quick Links Row ── */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quick Links</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
            Customize ⚙️
          </button>
        </div>
          {[
            { label: 'Counselling', icon: HeartHandshake, to: '/dashboard/faculty/students' },
            { label: 'Timetable', icon: CalendarIcon, to: '/dashboard/faculty/classes' },
            { label: 'Lesson Plans', icon: BookOpen, to: '/dashboard/faculty/materials' },
            { label: 'Attendance', icon: CheckSquare, to: '/dashboard/faculty/attendance' },
            { label: 'Paper Evaluation', icon: FileCheck, to: '/dashboard/faculty/evaluations' },
            { label: 'Results', icon: GraduationCap, to: '/dashboard/faculty/performance' },
            { label: 'AI Quiz Builder', icon: Sparkles, to: '/dashboard/ai' },
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate({ to: item.to })}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 hover:bg-blue-50/50 transition cursor-pointer group shadow-2xs"
              >
                <div className="size-9 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 grid place-items-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <IconComp className="size-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── 4. Main 2-Column Section (Left Dashboard Analytics, Right Calendar/Schedule) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Upcoming Activities & Homework Submissions Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Activities */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Upcoming Activities</h3>
                <button
                  onClick={() => navigate({ to: '/dashboard/events' })}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { date: '21', month: 'MAY', title: 'Physics Practical - Lab Session', details: 'Class 10A • 09:30 AM - 11:00 AM' },
                  { date: '22', month: 'MAY', title: 'Chemistry Quiz', details: 'Class 11B • 10:30 AM - 11:00 AM' },
                  { date: '23', month: 'MAY', title: 'Maths Worksheet Discussion', details: 'Class 9C • 11:15 AM - 12:00 PM' },
                  { date: '24', month: 'MAY', title: 'Parent-Teacher Meeting', details: 'Virtual • 04:00 PM - 06:00 PM' },
                ].map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="size-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex flex-col items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
                      <span className="text-[9px] font-bold tracking-wider uppercase">{act.month}</span>
                      <span className="text-sm font-extrabold leading-none">{act.date}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{act.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Homework Submissions Donut Breakdown */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Homework Submissions</h3>
                <button className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Circular Donut Metric */}
                <div className="relative size-28 shrink-0 flex items-center justify-center">
                  <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      strokeDasharray="76, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">76%</span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">Submitted</span>
                  </div>
                </div>

                {/* Legend Table */}
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-slate-500 font-medium">Total Assigned</span>
                    <span className="font-bold text-slate-900 dark:text-white">34</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald-500 inline-block" /> Submitted
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">26</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <span className="size-2 rounded-full bg-amber-500 inline-block" /> Pending
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-medium flex items-center gap-1">
                      <span className="size-2 rounded-full bg-rose-500 inline-block" /> Overdue
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">3</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Student Performance Overview Bar Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Student Performance Overview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Class Average vs Top Score across sections</p>
              </div>
              <select className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Semester 1</option>
              </select>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="class" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="classAvg" name="Class Average %" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="topScore" name="Top Score %" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AI Student Risk Alerts & Notifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Student Risk Alerts */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-rose-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Student Risk Alerts</h3>
                </div>
                <button className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Rohan Mehta', class: '10A', status: 'High Risk', reason: 'Declining in Physics & Maths', avatarColor: 'bg-rose-500' },
                  { name: 'Aisha Khan', class: '11B', status: 'Medium Risk', reason: 'Low assignment submission', avatarColor: 'bg-amber-500' },
                  { name: 'Karan Verma', class: '9C', status: 'Low Risk', reason: 'Needs improvement in Tests', avatarColor: 'bg-emerald-500' },
                ].map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`size-8 rounded-full ${st.avatarColor} text-white font-bold grid place-items-center text-xs shrink-0`}>
                        {st.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {st.name} <span className="text-slate-400 font-normal">({st.class})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{st.reason}</div>
                      </div>
                    </div>
                    <Badge
                      tone={st.status === 'High Risk' ? 'danger' : st.status === 'Medium Risk' ? 'warn' : 'success'}
                    >
                      {st.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications Stream */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Bell className="size-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                </div>
                <button className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                  View All
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { title: 'New assignment submitted', sub: 'Arjun Singh submitted Physics Worksheet', time: '10 min ago' },
                  { title: 'Leave request received', sub: '2 leave requests need your approval', time: '1 hr ago' },
                  { title: 'Grades are ready to publish', sub: 'Chemistry Quiz results are ready', time: '2 hr ago' },
                  { title: 'Timetable updated', sub: 'New schedule published for Class 10A', time: '3 hr ago' },
                ].map((n, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <div className="size-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{n.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{n.sub}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: 4 Cols (Calendar, Today's Schedule, Smart Reminders) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Calendar Widget */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Calendar</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronLeft className="size-3.5" />
                </button>
                <span>May 2026</span>
                <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
              {[
                26, 27, 28, 29, 30, 1, 2,
                3, 4, 5, 6, 7, 8, 9,
                10, 11, 12, 14, 15, 16, 17,
                18, 18, 20, 21, 22, 23, 24,
                25, 26, 27, 28, 29, 30, 1,
              ].map((day, idx) => {
                const isSelected = day === selectedDate && idx > 15 && idx < 28;
                const isMuted = idx < 5 || idx > 33;

                return (
                  <button
                    key={idx}
                    onClick={() => !isMuted && setSelectedDate(day)}
                    className={`size-7 mx-auto rounded-full grid place-items-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : isMuted
                          ? 'text-slate-300 dark:text-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Today's Schedule Timeline */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Today's Schedule</h3>
              <button
                onClick={() => navigate({ to: '/dashboard/faculty/classes' })}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                View Timetable
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '08:30 AM', end: '09:15 AM', class: 'Class 9C - Physics', room: 'Room 204', isNow: false },
                { time: '09:30 AM', end: '10:15 AM', class: 'Class 10A - Physics', room: 'Room 205', isNow: true },
                { time: '11:15 AM', end: '12:00 PM', class: 'Class 11B - Physics', room: 'Lab 1', isNow: false },
                { time: '02:00 PM', end: '02:45 PM', class: 'Class 12A - Physics', room: 'Room 206', isNow: false },
              ].map((slot, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    slot.isNow
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 shadow-2xs'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="text-[11px] font-bold text-slate-500">
                    <div>{slot.time}</div>
                    <div className="text-[10px] text-slate-400">{slot.end}</div>
                  </div>

                  <div className="flex-1 px-3 border-l ml-3 border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{slot.class}</div>
                    <div className="text-[11px] text-slate-500">{slot.room}</div>
                  </div>

                  {slot.isNow && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
                      Now
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Smart Reminders Widget */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Reminders</h3>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Upcoming Lecture', sub: 'Class 10A - Physics in 15 mins', icon: Clock, color: 'bg-purple-100 text-purple-600' },
                { title: 'Pending Evaluations', sub: '12 assignments to grade', icon: FileCheck, color: 'bg-amber-100 text-amber-600' },
                { title: 'Next Free Slot', sub: 'Today 12:00 PM - 02:00 PM', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
              ].map((rem, idx) => {
                const RemIcon = rem.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-xl ${rem.color} grid place-items-center shrink-0`}>
                        <RemIcon className="size-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{rem.title}</div>
                        <div className="text-[11px] text-slate-500">{rem.sub}</div>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-slate-400" />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate({ to: '/dashboard/notifications' })}
              className="mt-3 w-full text-center text-xs text-blue-600 font-semibold hover:underline cursor-pointer block"
            >
              View All Reminders
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
