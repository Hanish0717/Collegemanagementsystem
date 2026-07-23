import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentMentoring, MentoringItem } from '../services/hodMentoringResearchEventService';
import { hodStore } from '../services/hodStore';

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
import { exportToCSV } from '../utils/exportUtils';

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
  const [selectedCohort, setSelectedCohort] = useState('Sem 5 Section A');
  const [selectedMentor, setSelectedMentor] = useState('Prof. Vikram Rathore (Asst. Prof)');

  useEffect(() => {
    async function loadData() {
      const res = await fetchDepartmentMentoring(departmentCode);
      setData(res);
    }
    loadData();

    const handleStoreChange = () => loadData();
    window.addEventListener('hod_store_updated', handleStoreChange);
    return () => window.removeEventListener('hod_store_updated', handleStoreChange);
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

      {/* Tab 1: Mentoring Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Live Cohort Mentor Allocations Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
            {[
              { cohort: 'Sem 5 Section A', sem: 5, sec: 'A', defaultMentor: 'Prof. Vikram Rathore' },
              { cohort: 'Sem 5 Section B', sem: 5, sec: 'B', defaultMentor: 'Prof. Sneha Verma' },
              { cohort: 'Sem 7 Section A', sem: 7, sec: 'A', defaultMentor: 'Dr. Ananya Roy' },
              { cohort: 'Sem 3 Section A', sem: 3, sec: 'A', defaultMentor: 'Dr. Ramesh Kumar' },
            ].map(({ cohort, sem, sec, defaultMentor }) => {
              const matched = list.find((s: MentoringItem) => s.sem === sem && s.sec.toUpperCase() === sec);
              const mentorName = matched?.mentor || defaultMentor;
              return (
                <div key={cohort} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">{cohort}</span>
                    <span className="text-[10px] font-bold text-slate-400">Assigned Cohort</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Mentor</span>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{mentorName}</p>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-bold border-t border-slate-100 dark:border-slate-800">
                    <span>Mentees: 60 Students</span>
                    <span className="text-emerald-600 font-black">Active Session</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Student Mentoring Roster */}
          <AdvancedTable
            title={`${departmentInfo.shortName} Live Mentoring Roster`}
            subtitle={`Department mentoring allocations strictly isolated to ${departmentInfo.name}`}
            columns={columns}
            data={list}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search mentees by name, roll number, or mentor..."
          />
        </div>
      )}

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

      {/* Tab 3: Counseling Records */}
      {activeTab === 'counseling' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Department Counseling Session Log</h4>
          <div className="space-y-3 text-xs">
            {list.map((item: MentoringItem) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h5 className="font-black text-slate-900 dark:text-white">{item.name} ({item.rollNumber}) — Sem {item.sem} ({item.sec})</h5>
                  <p className="text-slate-500 font-medium mt-1">Counselor: {item.mentor} • Last Session: {item.lastMeeting} • Next Scheduled: {item.nextMeeting}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => NotificationToast.info('Counseling Log', `Opened session notes for ${item.name}`)}>
                  View Session Log
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Tab 4: At Risk Analysis */}
      {activeTab === 'riskanalysis' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Student Risk Analysis & Early Warning Workbench</h4>
          <div className="space-y-3 text-xs">
            {list.filter((s: MentoringItem) => s.riskLevel === 'Critical' || s.riskLevel === 'High' || s.riskLevel === 'At-Risk').map((item: MentoringItem) => (
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

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign Faculty Mentor"
        subtitle={`Select faculty mentor for ${departmentInfo.shortName} students`}
        variant="assign"
        confirmLabel="Assign Mentor"
        onConfirm={() => {
          const mentorNameClean = selectedMentor.replace(/\s*\([^)]*\)/, '').trim();
          const semMatch = selectedCohort.match(/Sem\s*(\d+)/i);
          const secMatch = selectedCohort.match(/Sec(?:tion)?\s*([A-Z])/i);
          const targetSem = semMatch ? parseInt(semMatch[1], 10) : 5;
          const targetSec = secMatch ? secMatch[1].toUpperCase() : 'A';

          // 1. Update React local state immediately
          setData((prev: any) => {
            const currentList = prev?.mentoringList || [];
            const updatedList = currentList.map((item: MentoringItem) => {
              if (item.sem === targetSem && item.sec.toUpperCase() === targetSec) {
                return { ...item, mentor: mentorNameClean };
              }
              return item;
            });
            return {
              ...prev,
              mentoringList: updatedList,
            };
          });

          // 2. Persist in hodStore & dispatch event to sync all pages
          hodStore.setCohortMentor(selectedCohort, mentorNameClean);
          setAssignModal(false);
          NotificationToast.success('Mentor Assigned Successfully', `Assigned ${mentorNameClean} as Mentor for ${selectedCohort}`);
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Select Cohort</label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white"
            >
              <option value="Sem 5 Section A">Sem 5 Section A</option>
              <option value="Sem 5 Section B">Sem 5 Section B</option>
              <option value="Sem 7 Section A">Sem 7 Section A</option>
              <option value="Sem 3 Section A">Sem 3 Section A</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Select Faculty Mentor</label>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white"
            >
              <option value="Prof. Vikram Rathore (Asst. Prof)">Prof. Vikram Rathore (Asst. Prof)</option>
              <option value="Dr. Ramesh Kumar (Professor & Head)">Dr. Ramesh Kumar (Professor & Head)</option>
              <option value="Prof. Sneha Verma (Assoc. Prof)">Prof. Sneha Verma (Assoc. Prof)</option>
              <option value="Dr. Ananya Roy (Asst. Prof)">Dr. Ananya Roy (Asst. Prof)</option>
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
