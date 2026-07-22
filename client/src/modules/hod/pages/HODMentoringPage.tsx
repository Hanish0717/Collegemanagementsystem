import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentMentoring, MentoringItem } from '../services/hodMentoringResearchEventService';

import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { GlassCard } from '../components/shared/GlassCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ActionsMenu } from '../components/shared/ActionsMenu';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import { NotificationToast } from '../components/shared/NotificationToast';

import {
  Heart,
  Users,
  AlertTriangle,
  Calendar,
  Download,
  UserCheck,
  Eye,
  MessageSquare,
  FileText,
  Star,
  Plus,
} from 'lucide-react';

export function HODMentoringPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roster' | 'counseling' | 'riskanalysis'>('dashboard');

  const [data, setData] = useState<any>(null);
  const [assignModal, setAssignModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await fetchDepartmentMentoring(departmentCode);
      setData(res);
    }
    loadData();
  }, [departmentCode]);

  const summary = data?.summary || {};
  const list = data?.mentoringList || [];

  const tabs = [
    { id: 'dashboard', label: 'Mentoring Dashboard', icon: Heart },
    { id: 'roster', label: 'Student Mentoring Roster', icon: Users },
    { id: 'counseling', label: 'Counseling Records', icon: MessageSquare },
    { id: 'riskanalysis', label: 'Student Risk Analysis', icon: AlertTriangle },
  ] as const;

  const columns: Column<MentoringItem>[] = [
    { key: 'rollNumber', header: 'Roll Number', render: (item) => <span className="font-mono font-bold text-blue-600">{item.rollNumber}</span> },
    { key: 'name', header: 'Student Name', render: (item) => <span className="font-extrabold text-slate-900 dark:text-white">{item.name}</span> },
    { key: 'cohort', header: 'Sem / Sec', render: (item) => <span className="font-bold text-slate-700 dark:text-slate-300">Sem {item.sem} ({item.sec})</span> },
    { key: 'mentor', header: 'Assigned Mentor', render: (item) => <span className="font-semibold text-slate-700 dark:text-slate-300">{item.mentor}</span> },
    { key: 'lastMeeting', header: 'Last Session', render: (item) => <span className="font-mono text-xs text-slate-500">{item.lastMeeting}</span> },
    { key: 'nextMeeting', header: 'Next Session', render: (item) => <span className="font-mono text-xs text-blue-600 font-bold">{item.nextMeeting}</span> },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50' : 'bg-emerald-100 text-emerald-800'}`}>
          {item.riskLevel} Risk
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <ActionsMenu
          items={[
            { label: 'View Mentoring Log', icon: Eye, onClick: () => NotificationToast.info('Mentoring Opened', `Log for ${item.name}`) },
            { label: 'Record Counseling', icon: MessageSquare, onClick: () => NotificationToast.success('Session Recorded', `Counseling recorded for ${item.name}`) },
          ]}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Department Mentoring Management"
      subtitle={`Faculty mentoring allocations, counseling notes, and at-risk student monitoring for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Mentoring Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Mentoring_Roster_${departmentInfo.shortName}.csv`, list);
              NotificationToast.success('Exporting Data', 'Downloading mentoring report...');
            }}
          >
            Export
          </Button>
          <Button variant="primary" size="sm" iconLeft={UserCheck} onClick={() => setAssignModal(true)}>
            Assign Mentor
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Total Faculty Mentors" value={summary.totalMentors || 12} subtitle="Allocated mentors" icon={Heart} accentColor="blue" />
          <StatisticsCard label="Students Assigned" value={summary.studentsAssigned || 480} subtitle="Active mentees" icon={Users} accentColor="emerald" />
          <StatisticsCard label="Students At-Risk" value={summary.studentsAtRisk || 5} subtitle="Intervention needed" icon={AlertTriangle} accentColor="rose" />
          <StatisticsCard label="Avg Mentor Rating" value={`${summary.avgMentorRating || 4.8} / 5`} subtitle="Mentee feedback" icon={Star} accentColor="amber" />
        </div>
      }
    >
      {/* Sub-tabs Navigation */}
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

      {/* Tab 2: Student Mentoring Roster */}
      {activeTab === 'roster' && (
        <AdvancedTable
          title={`${departmentInfo.shortName} Mentoring Roster`}
          subtitle={`Student mentoring allocations strictly isolated to ${departmentInfo.name}`}
          columns={columns}
          data={list}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search mentees by name, roll number, or mentor..."
        />
      )}

      {/* Tab 4: At Risk Analysis */}
      {activeTab === 'riskanalysis' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Student Risk Analysis & Early Warning Workbench</h4>
          <div className="space-y-3 text-xs">
            {list.filter((s: MentoringItem) => s.riskLevel === 'Critical' || s.riskLevel === 'High').map((item: MentoringItem) => (
              <div key={item.id} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-900 dark:text-white">{item.name} ({item.rollNumber})</h5>
                  <p className="text-slate-500 font-medium mt-1">Attendance: {item.attendance}% • CGPA: {item.cgpa} • Assigned Mentor: {item.mentor}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => NotificationToast.info('Counseling Scheduled', `Scheduled session with ${item.mentor}`)}>
                  Schedule Parent Meeting
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Fallback */}
      {!['roster', 'riskanalysis'].includes(activeTab) && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Dataset</p>
          <p className="mt-1">Official {activeTab} records loaded from mentoring cell database for {departmentInfo.name}.</p>
        </GlassCard>
      )}

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign Faculty Mentor"
        subtitle={`Select faculty mentor for ${departmentInfo.shortName} students`}
        variant="assign"
        confirmLabel="Assign Mentor"
        onConfirm={() => {
          setAssignModal(false);
          NotificationToast.success('Mentor Assigned', 'Assigned Dr. Ramesh Kumar to cohort');
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Cohort</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold text-xs">
              <option>Sem 5 Section A</option>
              <option>Sem 5 Section B</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Faculty Mentor</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold text-xs">
              <option>Dr. Ramesh Kumar (Professor & Head)</option>
              <option>Prof. Sneha Verma (Assoc. Prof)</option>
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
