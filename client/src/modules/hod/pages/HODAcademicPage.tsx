import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentAcademics, approveDepartmentLessonPlan, DepartmentSubject, LessonPlanItem } from '../services/hodAcademicService';

import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { GlassCard } from '../components/shared/GlassCard';
import { LinearProgress } from '../components/shared/ProgressComponents';
import { ActionsMenu } from '../components/shared/ActionsMenu';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { Modal } from '../components/shared/Modal';
import { exportToCSV } from '../utils/exportUtils';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FlaskConical,
  Award,
  Users,
  Check,
  X,
  Eye,
  Plus,
  BarChart2,
} from 'lucide-react';

export function HODAcademicPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'curriculum' | 'timetable' | 'workload' | 'lessonplans' | 'coursefiles' | 'obe' | 'calendar' | 'semesters' | 'reports'>('dashboard');

  const [academics, setAcademics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [assignSubjectModal, setAssignSubjectModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchDepartmentAcademics(departmentCode);
      setAcademics(data);
      setLoading(false);
    }
    loadData();
  }, [departmentCode]);

  const handleApprovePlan = async (id: string, decision: 'approved' | 'rejected') => {
    await approveDepartmentLessonPlan(id, decision, departmentCode);
    NotificationToast.success('Lesson Plan Updated', `Lesson Plan ${id} has been ${decision}`);
    const data = await fetchDepartmentAcademics(departmentCode);
    setAcademics(data);
  };

  const tabs = [
    { id: 'dashboard', label: 'Academic Dashboard', icon: BarChart2 },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'curriculum', label: 'Curriculum (R23)', icon: Award },
    { id: 'timetable', label: 'Timetable Grid', icon: Calendar },
    { id: 'workload', label: 'Faculty Workload', icon: Users },
    { id: 'lessonplans', label: 'Lesson Plans', icon: CheckCircle2 },
    { id: 'coursefiles', label: 'Course Files', icon: FileText },
    { id: 'obe', label: 'OBE Matrix', icon: FlaskConical },
    { id: 'calendar', label: 'Academic Calendar', icon: Clock },
    { id: 'semesters', label: 'Semester Status', icon: Award },
    { id: 'reports', label: 'Reports', icon: Download },
  ] as const;

  const subjectColumns: Column<DepartmentSubject>[] = [
    { key: 'code', header: 'Subject Code', render: (item) => <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.code}</span> },
    { key: 'name', header: 'Course Name', render: (item) => <span className="font-extrabold text-slate-900 dark:text-white">{item.name}</span> },
    { key: 'credits', header: 'Credits', render: (item) => <span className="font-bold text-purple-600">{item.credits} Credits</span> },
    { key: 'sem', header: 'Sem & Sec', render: (item) => <span className="font-bold text-slate-700 dark:text-slate-300">Sem {item.sem} ({item.section})</span> },
    { key: 'type', header: 'Course Type', render: (item) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'Lab' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>{item.type}</span> },
    { key: 'faculty', header: 'Assigned Faculty', render: (item) => <span className="font-semibold text-slate-700 dark:text-slate-300">{item.faculty}</span> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <ActionsMenu
          items={[
            { label: 'View Syllabus', icon: Eye, onClick: () => NotificationToast.info('Syllabus Opened', `Viewing ${item.code}`) },
            { label: 'View Timetable', icon: Calendar, onClick: () => setActiveTab('timetable') },
          ]}
        />
      ),
    },
  ];

  const summary = academics?.summary || {};

  return (
    <PageContainer
      title="Department Academic Management"
      subtitle={`Course syllabus, timetable schedules, lesson plans, course files, and OBE attainment for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Academic Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Academic_Subjects_${departmentInfo.shortName}.csv`, academics?.subjects || []);
              NotificationToast.success('Exporting Academic Report', 'Downloading summary CSV...');
            }}
          >
            Export
          </Button>
          <Button variant="primary" size="sm" iconLeft={Plus} onClick={() => setAssignSubjectModal(true)}>
            Assign Subject
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Total Dept Subjects" value={summary.totalSubjects || 16} subtitle={`${summary.theoryCourses || 10} Theory • ${summary.labCourses || 6} Lab`} icon={BookOpen} accentColor="blue" />
          <StatisticsCard label="Faculty Assigned" value={summary.facultyAssigned || 12} subtitle="Workload allocated" icon={Users} accentColor="emerald" />
          <StatisticsCard label="Pending Lesson Plans" value={summary.pendingLessonPlans || 3} subtitle="Awaiting HOD signoff" icon={Clock} accentColor="rose" />
          <StatisticsCard label="Avg Attendance" value={`${summary.avgAttendance || 91.2}%`} subtitle="Biometric aggregate" icon={CheckCircle2} accentColor="purple" />
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
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Academic Progress Metrics</h4>
            <LinearProgress value={85} label="Curriculum Syllabus Completion" color="bg-blue-600" />
            <LinearProgress value={75} label="Lesson Plan Approvals" color="bg-emerald-600" />
            <LinearProgress value={92} label="Course Files Uploaded to Vault" color="bg-purple-600" />
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Upcoming Academic Events</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex justify-between">
                <span>Mid-Semester Exam II (AIML Dept)</span>
                <span className="font-mono font-bold text-blue-600">Aug 12, 2026</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 flex justify-between">
                <span>BOS (Board of Studies) Curriculum Review</span>
                <span className="font-mono font-bold text-purple-600">Aug 20, 2026</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: Subjects */}
      {activeTab === 'subjects' && (
        <AdvancedTable
          title={`${departmentInfo.shortName} Subject Roster`}
          subtitle={`Department course offerings strictly isolated to ${departmentInfo.name}`}
          columns={subjectColumns}
          data={academics?.subjects || []}
          keyExtractor={(item) => item.code}
          searchPlaceholder="Search subjects by code, name, or faculty..."
        />
      )}

      {/* Tab 4: Timetable */}
      {activeTab === 'timetable' && (
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Sem 5 Section A Timetable Grid</h4>
            <span className="text-xs font-bold text-blue-600">Academic Year 2025-2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-300">
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800">Day / Period</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800">Period 1 (9-10 AM)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800">Period 2 (10-11 AM)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800">Period 3 (11-12 PM)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800">Period 4 (1-2 PM)</th>
                </tr>
              </thead>
              <tbody className="font-semibold">
                <tr>
                  <td className="p-2.5 border font-extrabold bg-slate-50 dark:bg-slate-900">Monday</td>
                  <td className="p-2.5 border bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">Deep Learning (AIML501)</td>
                  <td className="p-2.5 border bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">NLP (AIML502)</td>
                  <td className="p-2.5 border bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300">AI Ethics (AIML504)</td>
                  <td className="p-2.5 border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">CV Lab (AIML503L)</td>
                </tr>
                <tr>
                  <td className="p-2.5 border font-extrabold bg-slate-50 dark:bg-slate-900">Tuesday</td>
                  <td className="p-2.5 border bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">NLP (AIML502)</td>
                  <td className="p-2.5 border bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">Deep Learning (AIML501)</td>
                  <td className="p-2.5 border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">CV Lab (AIML503L)</td>
                  <td className="p-2.5 border bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300">AI Ethics (AIML504)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Tab 6: Lesson Plans */}
      {activeTab === 'lessonplans' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Faculty Lesson Plan Approvals Workbench</h4>
          <div className="space-y-3">
            {(academics?.lessonPlans || []).map((lp: LessonPlanItem) => (
              <div key={lp.id} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={lp.status} />
                    <h5 className="font-extrabold text-slate-900 dark:text-white">{lp.subject}</h5>
                  </div>
                  <p className="text-slate-500 font-medium mt-1">Faculty: {lp.faculty} • Units Completed: {lp.completedUnits}/{lp.totalUnits} ({lp.completionPct}%)</p>
                </div>

                {lp.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" iconLeft={X} onClick={() => handleApprovePlan(lp.id, 'rejected')}>
                      Reject
                    </Button>
                    <Button variant="primary" size="sm" iconLeft={Check} onClick={() => handleApprovePlan(lp.id, 'approved')}>
                      Approve Lesson Plan
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Tab 8: OBE Matrix */}
      {activeTab === 'obe' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Course Outcome (CO) & Program Outcome (PO) Attainment Matrix</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">CO1: Neural Network Architecture Design</span>
              <LinearProgress value={88} label="Target 80% • Achieved 88%" color="bg-emerald-600" />
            </div>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">CO2: Vision Transformer Optimization</span>
              <LinearProgress value={82} label="Target 80% • Achieved 82%" color="bg-blue-600" />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Fallback for remaining sub-tabs */}
      {!['dashboard', 'subjects', 'timetable', 'lessonplans', 'obe'].includes(activeTab) && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Records</p>
          <p className="mt-1">Official {activeTab} records loaded from department database for {departmentInfo.name}.</p>
        </GlassCard>
      )}

      {/* Assign Subject Modal */}
      <Modal
        isOpen={assignSubjectModal}
        onClose={() => setAssignSubjectModal(false)}
        title="Assign Course Subject"
        subtitle={`Allocate subject course to ${departmentInfo.shortName} faculty`}
        variant="assign"
        confirmLabel="Assign Subject"
        onConfirm={() => {
          setAssignSubjectModal(false);
          NotificationToast.success('Subject Assigned', 'Assigned Deep Learning (AIML501) to Dr. Ramesh Kumar');
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Select Subject</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Deep Learning & Neural Networks (AIML501)</option>
              <option>Natural Language Processing (AIML502)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Select Faculty</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
              <option>Dr. Ramesh Kumar (Professor & Head)</option>
              <option>Prof. Sneha Verma (Assoc. Prof)</option>
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
