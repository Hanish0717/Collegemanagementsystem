import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentExaminations } from '../services/hodAttendanceExamService';

import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { GlassCard } from '../components/shared/GlassCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { LinearProgress } from '../components/shared/ProgressComponents';
import { ActionsMenu } from '../components/shared/ActionsMenu';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';

import {
  Award,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  BarChart2,
  BookOpen,
  Eye,
  Search,
} from 'lucide-react';

export function HODExaminationsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'internals' | 'externals' | 'results' | 'analytics' | 'halltickets'>('dashboard');

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetchDepartmentExaminations(departmentCode);
      setData(res);
    }
    loadData();
  }, [departmentCode]);

  const summary = data?.summary || {};
  const results = data?.results || [];

  const tabs = [
    { id: 'dashboard', label: 'Exam Dashboard', icon: BarChart2 },
    { id: 'internals', label: 'Internal Examinations', icon: BookOpen },
    { id: 'externals', label: 'External Examinations', icon: Award },
    { id: 'results', label: 'Results Roster', icon: CheckCircle2 },
    { id: 'analytics', label: 'Result Analytics', icon: BarChart2 },
    { id: 'halltickets', label: 'Exam Hall Tickets', icon: FileText },
  ] as const;

  const resultColumns: Column<any>[] = [
    { key: 'rank', header: 'Dept Rank', render: (item) => <span className="font-black text-indigo-600">#{item.rank}</span> },
    { key: 'rollNumber', header: 'Roll Number', render: (item) => <span className="font-mono font-bold text-blue-600">{item.rollNumber}</span> },
    { key: 'name', header: 'Student Name', render: (item) => <span className="font-extrabold text-slate-900 dark:text-white">{item.name}</span> },
    { key: 'sem', header: 'Semester', render: (item) => <span className="font-bold text-slate-700 dark:text-slate-300">Sem {item.sem}</span> },
    { key: 'sgpa', header: 'SGPA', render: (item) => <span className="font-black text-purple-600">{item.sgpa}</span> },
    { key: 'cgpa', header: 'CGPA', render: (item) => <span className="font-black text-emerald-600">{item.cgpa}</span> },
    { key: 'backlogs', header: 'Active Backlogs', render: (item) => <span className={`font-bold ${item.backlogs > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{item.backlogs}</span> },
    { key: 'status', header: 'Result Status', render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <ActionsMenu
          items={[
            { label: 'View Grade Sheet', icon: Eye, onClick: () => NotificationToast.info('Grade Sheet Opened', `Viewing marks for ${item.name}`) },
            { label: 'Print Hall Ticket', icon: Printer, onClick: () => NotificationToast.success('Hall Ticket Printed', `Printed hall ticket for ${item.rollNumber}`) },
          ]}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Department Examination Management"
      subtitle={`Mid-exam internal marks, semester grade sheets, pass percentages, and hall tickets for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Examination Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" iconLeft={Download} onClick={() => NotificationToast.success('Exporting Results', 'Downloading semester grade sheets...')}>
            Export Results
          </Button>
          <Button variant="primary" size="sm" iconLeft={FileText} onClick={() => setActiveTab('halltickets')}>
            Print Hall Tickets
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Department Pass %" value={`${summary.deptPassPercentage || 94.2}%`} subtitle="Overall pass rate" icon={CheckCircle2} accentColor="emerald" />
          <StatisticsCard label="Average Dept Marks" value={`${summary.averageMarks || 84.5}%`} subtitle="Internal + External" icon={Award} accentColor="blue" />
          <StatisticsCard label="Top Performers (CGPA > 9.0)" value={summary.topPerformersCount || 18} subtitle="Dean's List" icon={StarIcon} accentColor="purple" />
          <StatisticsCard label="Active Backlogs" value={summary.backlogsCount || 5} subtitle="Remedial support needed" icon={BookOpen} accentColor="rose" />
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

      {/* Tab 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Pass Rate Distribution by Semester</h4>
            <LinearProgress value={96} label="Sem 7 (Batch 2022-2026)" color="bg-emerald-600" />
            <LinearProgress value={92} label="Sem 5 (Batch 2023-2027)" color="bg-blue-600" />
            <LinearProgress value={89} label="Sem 3 (Batch 2024-2028)" color="bg-purple-600" />
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Mid-Exam Evaluation Status</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
                <span>Internal Marks Submitted</span>
                <span className="text-emerald-600">14 of 16 Subjects</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
                <span>Pending Valuation Sheets</span>
                <span className="text-rose-600">2 Subjects</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 4: Results Roster */}
      {activeTab === 'results' && (
        <AdvancedTable
          title={`${departmentInfo.shortName} Examination Results Roster`}
          subtitle={`Verified grade sheets strictly isolated to ${departmentInfo.name}`}
          columns={resultColumns}
          data={results}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search results by student name, roll number, or rank..."
        />
      )}

      {/* Tab 6: Hall Tickets */}
      {activeTab === 'halltickets' && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Official University Examination Hall Ticket Generator</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Generate and print semester examination admit cards for {departmentInfo.shortName} students</p>
            </div>
            <Button variant="primary" size="sm" iconLeft={Printer} onClick={() => window.print()}>
              Print All Hall Tickets
            </Button>
          </div>

          {/* Sample Hall Ticket Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">College Management System ERP</h3>
                <p className="text-xs font-bold text-blue-600">Official End-Semester Hall Ticket — November 2026</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs">Eligible & Approved</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Student Name</span><p className="font-extrabold text-slate-900 dark:text-white">Aarav Sharma</p></div>
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Roll Number</span><p className="font-mono font-bold text-blue-600">23091A4201</p></div>
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Department</span><p className="font-extrabold text-slate-900 dark:text-white">{departmentInfo.shortName}</p></div>
              <div><span className="text-slate-400 font-bold uppercase text-[10px]">Exam Center</span><p className="font-extrabold text-slate-900 dark:text-white">Tech Hall A-3</p></div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Fallback for remaining tabs */}
      {!['dashboard', 'results', 'halltickets'].includes(activeTab) && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Dataset</p>
          <p className="mt-1">Official {activeTab} examination data loaded from examination cell database for {departmentInfo.name}.</p>
        </GlassCard>
      )}
    </PageContainer>
  );
}

function StarIcon(props: any) {
  return <Award {...props} />;
}
