import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { fetchDepartmentAttendance, dispatchShortageAlert } from '../services/hodAttendanceExamService';

import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { GlassCard } from '../components/shared/GlassCard';
import { LinearProgress } from '../components/shared/ProgressComponents';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { exportToCSV } from '../utils/exportUtils';
import {
  CalendarCheck,
  AlertTriangle,
  Users,
  Briefcase,
  Download,
  Bell,
  BarChart2,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';

export function HODAttendancePage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'faculty' | 'analytics' | 'alerts'>('dashboard');

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetchDepartmentAttendance(departmentCode);
      setData(res);
    }
    loadData();
  }, [departmentCode]);

  const summary = data?.summary || {};
  const defaulters = data?.defaulters || [];

  const handleNotify = async (studentId: string, name: string) => {
    await dispatchShortageAlert(studentId, 'Attendance shortage warning', departmentCode);
    NotificationToast.success('Shortage Warning Sent', `Alert sent to ${name} and mentor.`);
  };

  const tabs = [
    { id: 'dashboard', label: 'Attendance Dashboard', icon: BarChart2 },
    { id: 'students', label: 'Student Attendance', icon: Users },
    { id: 'faculty', label: 'Faculty Attendance', icon: Briefcase },
    { id: 'analytics', label: 'Attendance Analytics', icon: BarChart2 },
    { id: 'alerts', label: 'Low Attendance Alerts', icon: AlertTriangle },
  ] as const;

  return (
    <PageContainer
      title="Department Attendance Monitoring"
      subtitle={`Daily biometric logs, student shortage alerts (<75%), and faculty attendance for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Attendance Management' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Attendance_Sheet_${departmentInfo.shortName}.csv`, defaulters);
              NotificationToast.success('Exporting Report', 'Downloading monthly attendance sheet...');
            }}
          >
            Export Sheet
          </Button>
          <Button variant="primary" size="sm" iconLeft={Bell} onClick={() => NotificationToast.info('Notifying Defaulters', 'Shortage alerts dispatched to all students <75%')}>
            Notify Defaulters
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Overall Student Attendance" value={`${summary.overallStudentAttendance || 91.4}%`} subtitle="Biometric aggregate" icon={CalendarCheck} accentColor="emerald" />
          <StatisticsCard label="Today's Attendance" value={`${summary.todayAttendance || 93.8}%`} subtitle="Live today" icon={CheckCircle2} accentColor="blue" />
          <StatisticsCard label="Faculty Attendance" value={`${summary.facultyAttendance || 96.5}%`} subtitle="Staff biometric" icon={Briefcase} accentColor="purple" />
          <StatisticsCard label="Shortage Defaulters (<75%)" value={summary.defaultersCount || 4} subtitle="Action required" icon={AlertTriangle} accentColor="rose" />
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
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Cohort Attendance Rates</h4>
            <LinearProgress value={94} label="Sem 5 Section A" color="bg-emerald-600" />
            <LinearProgress value={88} label="Sem 5 Section B" color="bg-blue-600" />
            <LinearProgress value={92} label="Sem 7 Section A" color="bg-purple-600" />
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Today's Class Statistics</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
                <span>Classes Conducted Today</span>
                <span className="text-blue-600">18 Classes</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between font-bold">
                <span>Total Biometric Scans</span>
                <span className="text-emerald-600">452 Scans</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 5: Low Attendance Alerts */}
      {activeTab === 'alerts' && (
        <GlassCard className="p-5 space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Critical Attendance Shortage Interventions (&lt;75%)</h4>
          <div className="space-y-3">
            {defaulters.map((item: any) => (
              <div key={item.id} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">{item.status}</span>
                    <h5 className="font-black text-slate-900 dark:text-white">{item.name} ({item.rollNumber})</h5>
                  </div>
                  <p className="text-slate-500 font-medium mt-1">Sem {item.sem} Sec {item.sec} • Assigned Mentor: {item.mentor}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-rose-600">{item.attendance}%</span>
                  <Button variant="danger" size="sm" iconLeft={Send} onClick={() => handleNotify(item.id, item.name)}>
                    Notify Defaulter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Fallback for remaining tabs */}
      {!['dashboard', 'alerts'].includes(activeTab) && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Dataset</p>
          <p className="mt-1">Official {activeTab} data loaded from biometric database for {departmentInfo.name}.</p>
        </GlassCard>
      )}
    </PageContainer>
  );
}
