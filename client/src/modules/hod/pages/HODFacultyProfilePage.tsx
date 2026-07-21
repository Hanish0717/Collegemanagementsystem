import React, { useState } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { DepartmentHeader } from '../components/shared/DepartmentHeader';
import { GlassCard } from '../components/shared/GlassCard';
import { AvatarCard } from '../components/shared/AvatarCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Timeline } from '../components/shared/Timeline';
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
  Printer,
  Star,
  Users,
} from 'lucide-react';

export function HODFacultyProfilePage() {
  const { departmentInfo } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'classes' | 'workload' | 'attendance' | 'research' | 'publications' | 'feedback' | 'leave' | 'achievements' | 'documents' | 'timeline'>('overview');

  const faculty = {
    name: 'Dr. Ramesh Kumar',
    empId: 'EMP-AIML-101',
    designation: 'Professor & Head',
    dept: departmentInfo.shortName,
    qualification: 'Ph.D in AI & Vision',
    specialization: 'Deep Learning & Neural Networks',
    experience: '14 Years',
    joiningDate: '15 June 2012',
    email: 'ramesh.kumar@college.com',
    phone: '+91 98765 11111',
    officeRoom: 'Tech Block 304',
    attendance: 98,
    publications: 18,
    feedbackScore: 4.9,
    status: 'Active',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'subjects', label: 'Assigned Subjects', icon: BookOpen },
    { id: 'classes', label: 'Class Advisory', icon: Users },
    { id: 'workload', label: 'Workload Breakdown', icon: Briefcase },
    { id: 'attendance', label: 'Faculty Attendance', icon: CalendarCheck },
    { id: 'research', label: 'Research & Grants', icon: FlaskConical },
    { id: 'publications', label: 'Publications', icon: FileText },
    { id: 'feedback', label: 'Student Feedback', icon: Star },
    { id: 'leave', label: 'Leave History', icon: Shield },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'documents', label: 'HR Documents', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ] as const;

  return (
    <div className="space-y-6">
      <DepartmentHeader
        title="Faculty Member Comprehensive Profile"
        subtitle={`Audit workload allocation, research grants, and student feedback for ${faculty.name}`}
        breadcrumbItems={[
          { label: 'Faculty Management', to: '/hod/faculty' },
          { label: faculty.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="size-4 text-blue-600" /> Print Faculty Dossier
            </button>
          </div>
        }
      />

      {/* Main Faculty Header Card */}
      <GlassCard className="p-6 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-blue-600/10 border-purple-200 dark:border-purple-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <AvatarCard
            name={faculty.name}
            subtitle={`Emp ID: ${faculty.empId} • ${faculty.designation} (${faculty.dept} Dept)`}
            badge={faculty.status}
            size="lg"
          />

          <div className="flex flex-wrap items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Feedback Rating</span>
              <p className="text-lg font-black text-amber-500">{faculty.feedbackScore} / 5</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Attendance</span>
              <p className="text-lg font-black text-emerald-600">{faculty.attendance}%</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Publications</span>
              <p className="text-lg font-black text-purple-600 dark:text-purple-400">{faculty.publications} Papers</p>
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
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Faculty Profile Details</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 font-bold">Qualification</span><p className="font-bold text-slate-800 dark:text-slate-200">{faculty.qualification}</p></div>
              <div><span className="text-slate-400 font-bold">Specialization</span><p className="font-bold text-slate-800 dark:text-slate-200">{faculty.specialization}</p></div>
              <div><span className="text-slate-400 font-bold">Teaching Exp</span><p className="font-bold text-slate-800 dark:text-slate-200">{faculty.experience}</p></div>
              <div><span className="text-slate-400 font-bold">Joining Date</span><p className="font-bold text-slate-800 dark:text-slate-200">{faculty.joiningDate}</p></div>
              <div><span className="text-slate-400 font-bold">Email</span><p className="font-bold text-slate-800 dark:text-slate-200">{faculty.email}</p></div>
              <div><span className="text-slate-400 font-bold">Office Room</span><p className="font-bold text-slate-800 dark:text-slate-200">{faculty.officeRoom}</p></div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Weekly Workload Distribution</h4>
            <LinearProgress value={85} label="Lecture Hours (16 hrs/wk)" color="bg-blue-600" />
            <LinearProgress value={90} label="Research & Grant Work" color="bg-purple-600" />
            <LinearProgress value={100} label="Student Counseling Load" color="bg-emerald-600" />
          </GlassCard>
        </div>
      )}

      {activeTab === 'workload' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Official Teaching & Lab Workload Allocation</h4>
          <div className="space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
              <span>Deep Learning & Neural Networks (AIML501) — Sem 5 Sec A</span>
              <span className="text-blue-600">4 Hours / Week</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
              <span>Advanced Computer Vision Lab (AIML701L) — Sem 7 Sec A</span>
              <span className="text-purple-600">6 Hours / Week</span>
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'timeline' && (
        <GlassCard className="p-5">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-4">Faculty Career & Academic Timeline</h4>
          <Timeline
            items={[
              { id: '1', title: 'Received ₹45 Lakh DST-SERB Research Grant', subtitle: 'Project: Medical Imaging Diagnosis using Vision Transformers', timestamp: 'Jan 2026', tone: 'emerald' },
              { id: '2', title: 'Promoted to Professor & Head of Department', subtitle: 'Department of Artificial Intelligence & Machine Learning', timestamp: 'August 2024', tone: 'purple' },
              { id: '3', title: 'Awarded Best Faculty Researcher 2023', subtitle: 'Published 5 Scopus Q1 Journal Papers', timestamp: 'Dec 2023', tone: 'blue' },
              { id: '4', title: 'Joined College as Associate Professor', subtitle: 'Employee ID EMP-AIML-101', timestamp: 'June 2012', tone: 'indigo' },
            ]}
          />
        </GlassCard>
      )}

      {/* Placeholder fallback for remaining 9 tabs */}
      {!['overview', 'workload', 'timeline'].includes(activeTab) && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Dossier</p>
          <p className="mt-1">Official {activeTab} records loaded from department database for {faculty.name}.</p>
        </GlassCard>
      )}
    </div>
  );
}
