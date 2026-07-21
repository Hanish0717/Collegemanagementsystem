import React, { useState } from 'react';
import { GlassCard } from '../shared/GlassCard';
import { ChartCard } from '../shared/ChartCard';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BookOpen,
  CalendarCheck,
  Award,
  GraduationCap,
  FlaskConical,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface HODAnalyticsSuiteProps {
  enrollmentTrend: any[];
  sectionDistribution: any[];
  dailyAttendanceData: any[];
  passPercentageBySem: any[];
  facultyWorkloadData: any[];
}

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function HODAnalyticsSuite({
  enrollmentTrend,
  sectionDistribution,
  dailyAttendanceData,
  passPercentageBySem,
  facultyWorkloadData,
}: HODAnalyticsSuiteProps) {
  const [activeTab, setActiveTab] = useState<'academic' | 'attendance' | 'results' | 'faculty' | 'research' | 'placement' | 'events'>('academic');

  const tabs = [
    { id: 'academic', label: 'Academic & Enrollment', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck },
    { id: 'results', label: 'Result & Grades', icon: Award },
    { id: 'faculty', label: 'Faculty Workload', icon: GraduationCap },
    { id: 'research', label: 'Research & Grants', icon: FlaskConical },
    { id: 'placement', label: 'Placements & Packages', icon: TrendingUp },
    { id: 'events', label: 'Events & Symposia', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-200/80 dark:border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Academic & Enrollment */}
      {activeTab === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="5-Year Student Enrollment Trend"
            subtitle="Male vs Female student intake growth"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={enrollmentTrend}>
                <defs>
                  <linearGradient id="maleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="femaleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="male" name="Male Students" stroke="#2563eb" strokeWidth={2} fill="url(#maleGrad)" />
                <Area type="monotone" dataKey="female" name="Female Students" stroke="#8b5cf6" strokeWidth={2} fill="url(#femaleGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Section Cohort Distribution" subtitle="Class size per active section">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sectionDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {sectionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Tab 2: Attendance Audit */}
      {activeTab === 'attendance' && (
        <ChartCard title="Daily Attendance Comparison" subtitle="Student vs Faculty attendance rate (%) over the week">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyAttendanceData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="student" name="Student Attendance %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="faculty" name="Faculty Attendance %" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Tab 3: Result & Grades */}
      {activeTab === 'results' && (
        <ChartCard title="Semester-wise Pass Percentage & GPA" subtitle="Academic performance by semester">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={passPercentageBySem}>
              <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="passRate" name="Pass Percentage %" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Tab 4: Faculty Workload */}
      {activeTab === 'faculty' && (
        <ChartCard title="Faculty Teaching Workload Hours" subtitle="Weekly teaching hours per professor">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={facultyWorkloadData} layout="vertical">
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="workload" name="Weekly Hours" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Tab 5: Research & Grants */}
      {activeTab === 'research' && (
        <GlassCard className="p-6 text-center space-y-3">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Department Research Highlights</h4>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            ₹48 Lakhs received in DST-SERB funded grants. 38 papers published in IEEE Transactions and Scopus-indexed journals in AY 2025-2026.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl"><div className="text-xl font-black text-purple-600">38</div><div className="text-[10px] text-slate-500 font-bold">Scopus Papers</div></div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl"><div className="text-xl font-black text-blue-600">₹48 L</div><div className="text-[10px] text-slate-500 font-bold">Grants Value</div></div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl"><div className="text-xl font-black text-amber-600">6</div><div className="text-[10px] text-slate-500 font-bold">Patents Filed</div></div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl"><div className="text-xl font-black text-emerald-600">14</div><div className="text-[10px] text-slate-500 font-bold">Conference Papers</div></div>
          </div>
        </GlassCard>
      )}

      {/* Tab 6: Placements */}
      {activeTab === 'placement' && (
        <GlassCard className="p-6 text-center space-y-3">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Department Placement Record</h4>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            91.8% placement rate for Final Year Batch. Highest salary package: <strong>₹28.5 LPA</strong> by Microsoft; Average package: <strong>₹9.2 LPA</strong>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl"><div className="text-xl font-black text-emerald-600">91.8%</div><div className="text-[10px] text-slate-500 font-bold">Placement Rate</div></div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl"><div className="text-xl font-black text-blue-600">₹28.5 L</div><div className="text-[10px] text-slate-500 font-bold">Highest Package</div></div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl"><div className="text-xl font-black text-indigo-600">₹9.2 L</div><div className="text-[10px] text-slate-500 font-bold">Average Package</div></div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl"><div className="text-xl font-black text-purple-600">42</div><div className="text-[10px] text-slate-500 font-bold">Recruiting Companies</div></div>
          </div>
        </GlassCard>
      )}

      {/* Tab 7: Events */}
      {activeTab === 'events' && (
        <GlassCard className="p-6 text-center space-y-3">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Department Seminars & Hackathons</h4>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            12 events organized in AY 2025-26, including AICTE-sponsored FDPs and Smart India Hackathon internal rounds.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
