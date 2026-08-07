import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Award,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Badge, Card, PageHeader, StatCard } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export function AdminAcademics() {
  const [activeTab, setActiveTab] = useState<'compliance' | 'feedback' | 'curriculum'>(
    'compliance',
  );

  // Syllabus Compliance Tracker State
  const [syllabusCompliance, setSyllabusCompliance] = useState([
    {
      id: 'SYL-01',
      subject: 'Operating Systems',
      dept: 'CSE',
      faculty: 'Dr. Kumar Swamy',
      totalWeeks: 16,
      weeksCompleted: 10,
      status: 'On Track',
    },
    {
      id: 'SYL-02',
      subject: 'Database Management Systems',
      dept: 'CSE',
      faculty: 'Prof. Anitha Rao',
      totalWeeks: 16,
      weeksCompleted: 6,
      status: 'Delayed',
    },
    {
      id: 'SYL-03',
      subject: 'Computer Networks',
      dept: 'CSE',
      faculty: 'Dr. Srinivas Rao',
      totalWeeks: 16,
      weeksCompleted: 11,
      status: 'On Track',
    },
    {
      id: 'SYL-04',
      subject: 'Machine Learning Foundations',
      dept: 'ECE',
      faculty: 'Dr. Srinivas Rao',
      totalWeeks: 16,
      weeksCompleted: 13,
      status: 'On Track',
    },
    {
      id: 'SYL-05',
      subject: 'VLSI System Architectures',
      dept: 'ECE',
      faculty: 'Prof. Anjali Sharma',
      totalWeeks: 16,
      weeksCompleted: 12,
      status: 'On Track',
    },
  ]);

  // Faculty Feedback Scores State
  const [feedbackScores, setFeedbackScores] = useState([
    {
      name: 'Dr. Kumar Swamy',
      subject: 'Operating Systems',
      rating: 4.8,
      count: 54,
      sentiment: 'Excellent',
    },
    {
      name: 'Prof. Anitha Rao',
      subject: 'Database Management Systems',
      rating: 3.9,
      count: 48,
      sentiment: 'Neutral',
    },
    {
      name: 'Dr. Srinivas Rao',
      subject: 'Computer Networks',
      rating: 4.6,
      count: 62,
      sentiment: 'Positive',
    },
    {
      name: 'Prof. Anjali Sharma',
      subject: 'VLSI System Architectures',
      rating: 4.4,
      count: 41,
      sentiment: 'Positive',
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Management"
        desc="Monitor syllabus compliance, audit course quality feedback, and orchestrate curriculum updates."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Average Syllabus Completion"
          value="76.2%"
          change="Across all departments"
          icon={TrendingUp}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Course Quality Score"
          value="4.42 / 5.0"
          change="Based on 205 responses"
          icon={MessageSquare}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Active Curriculum Schemes"
          value="3 Schemes"
          change="R23, R20, R18"
          icon={BookOpen}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Delayed Batches"
          value="1 Course Alert"
          change="Requires allocation adjustment"
          icon={AlertTriangle}
          gradient="bg-gradient-violet"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'compliance', label: 'Syllabus Compliance Audit', icon: CheckCircle },
          { id: 'feedback', label: 'Faculty Feedback Audit', icon: MessageSquare },
          { id: 'curriculum', label: 'Curriculum & Workload', icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Syllabus Compliance */}
      {activeTab === 'compliance' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Syllabus Coverage Tracking</h3>
              <p className="text-xs text-muted-foreground">
                Monitor week-wise syllabus logging to ensure timely curriculum delivery.
              </p>
            </div>
            <Badge tone="info">Live Feed</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2.5">Subject Code</th>
                  <th className="text-left pb-2.5">Subject</th>
                  <th className="text-left pb-2.5">Department</th>
                  <th className="text-left pb-2.5">Assigned Faculty</th>
                  <th className="text-center pb-2.5">Completed Weeks</th>
                  <th className="text-center pb-2.5">Coverage Progress</th>
                  <th className="text-right pb-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syllabusCompliance.map((row) => {
                  const pct = Math.round((row.weeksCompleted / row.totalWeeks) * 100);
                  const isDelayed = row.weeksCompleted < 8 && row.id === 'SYL-02';
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3 font-mono font-bold text-indigo-700">{row.id}</td>
                      <td className="py-3 font-bold text-slate-800">{row.subject}</td>
                      <td className="py-3 font-medium text-slate-600">{row.dept}</td>
                      <td className="py-3 font-semibold text-slate-600">{row.faculty}</td>
                      <td className="py-3 text-center font-bold text-slate-700">
                        {row.weeksCompleted} / {row.totalWeeks} Weeks
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <span
                            className={`font-mono font-bold ${isDelayed ? 'text-rose-500' : 'text-emerald-600'}`}
                          >
                            {pct}%
                          </span>
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isDelayed ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            if (row.weeksCompleted >= row.totalWeeks) {
                              toast.info('Curriculum is already 100% completed!');
                              return;
                            }
                            setSyllabusCompliance((prev) =>
                              prev.map((s) =>
                                s.id === row.id
                                  ? { ...s, weeksCompleted: s.weeksCompleted + 1 }
                                  : s,
                              ),
                            );
                            toast.success(`Logged week completed for ${row.subject}`);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                        >
                          + Log Week
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Faculty Feedback */}
      {activeTab === 'feedback' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Course Feedback Audit</h3>
              <p className="text-xs text-muted-foreground">
                Anonymous student feedback averages for academic quality evaluation.
              </p>
            </div>
            <button
              onClick={() => {
                toast.success('Broadcasted response reminders to student dashboards.');
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Request Response Updates
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2.5">Faculty Name</th>
                  <th className="text-left pb-2.5">Subject Course</th>
                  <th className="text-center pb-2.5">Total Responses</th>
                  <th className="text-center pb-2.5">General Sentiment</th>
                  <th className="text-right pb-2.5">Average Student Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackScores.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 font-bold text-slate-800">{row.name}</td>
                    <td className="py-3 font-semibold text-slate-600">{row.subject}</td>
                    <td className="py-3 text-center font-bold text-slate-700">
                      {row.count} Feedbacks
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.sentiment === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : row.sentiment === 'Positive'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {row.sentiment}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          row.rating >= 4.5
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.rating >= 4.0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ★ {row.rating} / 5.0
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Curriculum & Workload */}
      {activeTab === 'curriculum' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">
              Curriculum Portals &amp; Syllabi Schemes
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curriculum updates are governed by the Board of Studies. Active schemes running on
              campus include:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'R23 Scheme Curriculum',
                  desc: 'Applicable for semesters 1 to 5. Modern AI/ML integration.',
                  code: 'R23',
                },
                {
                  title: 'R20 Scheme Curriculum',
                  desc: 'Applicable for semesters 6 to 8. Focus on core engineering architectures.',
                  code: 'R20',
                },
              ].map((sch, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-xs">{sch.title}</span>
                      <Badge tone="info">{sch.code}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{sch.desc}</p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link
                      to="/dashboard/admin/lms"
                      className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      Audit Syllabus Outlines <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Cross-Module Timelines</h3>
            <div className="space-y-3.5">
              {[
                {
                  label: 'Weekly Timetables',
                  path: '/dashboard/admin/timetable',
                  icon: Calendar,
                  color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                },
                {
                  label: 'LMS Digital Syllabus',
                  path: '/dashboard/admin/lms',
                  icon: BookOpen,
                  color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
                },
                {
                  label: 'Examination Schedules',
                  path: '/dashboard/admin/exams/schedule',
                  icon: Award,
                  color: 'text-violet-600 bg-violet-50 border-violet-100',
                },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path as any}
                  className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft hover:bg-accent/40 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-8 rounded-lg border grid place-items-center ${link.color} shrink-0`}
                    >
                      <link.icon className="size-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{link.label}</span>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
