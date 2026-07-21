import React, { useState } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { DepartmentHeader } from '../components/shared/DepartmentHeader';
import { GlassCard } from '../components/shared/GlassCard';
import { AvatarCard } from '../components/shared/AvatarCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Timeline } from '../components/shared/Timeline';
import { DataTable, Column } from '../components/shared/DataTable';
import { LinearProgress } from '../components/shared/ProgressComponents';
import {
  User,
  BookOpen,
  CalendarCheck,
  Award,
  FlaskConical,
  Briefcase,
  Heart,
  FileText,
  Shield,
  Clock,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';

export function HODStudentProfilePage() {
  const { departmentInfo } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'attendance' | 'results' | 'projects' | 'internships' | 'mentoring' | 'certificates' | 'achievements' | 'disciplinary' | 'documents' | 'timeline'>('overview');

  const student = {
    name: 'Aarav Sharma',
    rollNumber: '23091A4201',
    regNumber: 'REG-2023-4201',
    dept: departmentInfo.shortName,
    year: 3,
    sem: 5,
    sec: 'A',
    batch: '2023-2027',
    email: 'aarav.sharma@college.com',
    phone: '+91 98765 43210',
    mentor: 'Dr. Ramesh Kumar',
    cgpa: 9.2,
    attendance: 94,
    placementStatus: 'Placed (Microsoft - ₹28.5 LPA)',
    status: 'Active',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic Standing', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck },
    { id: 'results', label: 'Results & Grades', icon: Award },
    { id: 'projects', label: 'Projects', icon: FlaskConical },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'mentoring', label: 'Mentoring Logs', icon: Heart },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Sparkles },
    { id: 'disciplinary', label: 'Disciplinary', icon: Shield },
    { id: 'documents', label: 'Documents Vault', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ] as const;

  return (
    <div className="space-y-6">
      <DepartmentHeader
        title="Student Comprehensive Profile"
        subtitle={`Audit transcript, attendance logs, and mentoring records for ${student.name}`}
        breadcrumbItems={[
          { label: 'Students', to: '/hod/students' },
          { label: student.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="size-4 text-blue-600" /> Print Profile
            </button>
          </div>
        }
      />

      {/* Main Student Header Card */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-blue-200 dark:border-blue-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AvatarCard
            name={student.name}
            subtitle={`Roll No: ${student.rollNumber} • ${student.dept} Dept (Sem ${student.sem} Sec ${student.sec})`}
            badge={student.status}
            size="lg"
          />

          <div className="flex flex-wrap items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Current CGPA</span>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{student.cgpa}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Attendance</span>
              <p className="text-lg font-black text-emerald-600">{student.attendance}%</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Placement</span>
              <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{student.placementStatus}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Profile 12 Sub-tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-200/80 dark:border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
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

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Personal & Academic Details</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 font-bold">Email</span><p className="font-bold text-slate-800 dark:text-slate-200">{student.email}</p></div>
              <div><span className="text-slate-400 font-bold">Phone</span><p className="font-bold text-slate-800 dark:text-slate-200">{student.phone}</p></div>
              <div><span className="text-slate-400 font-bold">Batch</span><p className="font-bold text-slate-800 dark:text-slate-200">{student.batch}</p></div>
              <div><span className="text-slate-400 font-bold">Faculty Mentor</span><p className="font-bold text-blue-600">{student.mentor}</p></div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Department Standing Summary</h4>
            <LinearProgress value={student.attendance} label="Overall Attendance %" color="bg-emerald-600" />
            <LinearProgress value={92} label="Curriculum Progress (Sem 5)" color="bg-purple-600" />
          </GlassCard>
        </div>
      )}

      {activeTab === 'academic' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Sem 5 Registered Subject Courses</h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
              <span>Deep Learning & Neural Networks (AIML501)</span>
              <span className="text-blue-600">4 Credits • Grade A+</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
              <span>Natural Language Processing (AIML502)</span>
              <span className="text-blue-600">3 Credits • Grade A</span>
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'timeline' && (
        <GlassCard className="p-5">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-4">Academic Progression Timeline</h4>
          <Timeline
            items={[
              { id: '1', title: 'Placed at Microsoft India', subtitle: 'Software Development Engineer - ₹28.5 LPA Package', timestamp: 'July 2026', tone: 'emerald' },
              { id: '2', title: 'Sem 4 Examination Results', subtitle: 'Scored 9.4 SGPA • Rank #2 in AIML Department', timestamp: 'May 2026', tone: 'purple' },
              { id: '3', title: 'Selected for Smart India Hackathon', subtitle: 'Team Leader for Computer Vision Project', timestamp: 'Feb 2026', tone: 'blue' },
              { id: '4', title: 'Enrolled in AIML Department', subtitle: 'Admission Roll Number 23091A4201', timestamp: 'Aug 2023', tone: 'indigo' },
            ]}
          />
        </GlassCard>
      )}

      {/* Placeholder fallback for remaining 9 tabs */}
      {!['overview', 'academic', 'timeline'].includes(activeTab) && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Records</p>
          <p className="mt-1">Official {activeTab} logs loaded from department database for {student.name}.</p>
        </GlassCard>
      )}
    </div>
  );
}
