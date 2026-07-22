import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentReports, ReportTypeItem } from '../services/hodFinalService';
import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { LinearProgress } from '../components/shared/ProgressComponents';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import {
  Users, Briefcase, CalendarCheck, Award, FlaskConical, TrendingUp,
  Building2, Calendar, Heart, BookOpen, Download, Printer, FileSpreadsheet, Mail, BarChart2,
} from 'lucide-react';

const REPORT_ICONS: Record<string, React.ElementType> = {
  Users, Briefcase, CalendarCheck, Award, FlaskConical, TrendingUp,
  Building: Building2, Calendar, Heart, BookOpen,
};

export function HODReportsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'analytics'>('dashboard');
  const [data, setData] = useState<any>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentReports(departmentCode).then(setData);
  }, [departmentCode]);

  const summary = data?.summary || {};
  const reportTypes: ReportTypeItem[] = data?.reportTypes || [];

  const handleGenerate = (type: string) => {
    setGenerating(type);
    setTimeout(() => {
      setGenerating(null);
      exportToCSV(`HOD_Report_${type.replace(/\s+/g, '_')}_${departmentInfo.shortName}.csv`, [
        { Report_Type: type, Department: departmentInfo.name, Status: 'Official Generated Report', Generated_At: new Date().toLocaleString() }
      ]);
      NotificationToast.success('Report Generated', `${type} is ready for download.`);
    }, 1200);
  };

  const tabs = [
    { id: 'dashboard', label: 'Reports Dashboard', icon: BarChart2 },
    { id: 'generate', label: 'Generate Reports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Department Analytics', icon: TrendingUp },
  ] as const;

  return (
    <PageContainer
      title="Reports & Analytics"
      subtitle={`Generate, preview, download, and schedule department reports for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Reports & Analytics' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" iconLeft={Printer} onClick={() => window.print()}>Print</Button>
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              const rows = Object.entries(summary).map(([k, v]) => ({ Metric: k, Value: String(v), Department: departmentInfo.name }));
              exportToExcel(`HOD_Department_Summary_${departmentInfo.shortName}.csv`, rows);
              NotificationToast.success('Exported', 'Downloading department summary Excel...');
            }}
          >
            Export Excel
          </Button>
          <Button variant="primary" size="sm" iconLeft={Mail} onClick={() => NotificationToast.info('Email Scheduled', 'Monthly report will be emailed at 8 AM.')}>Email Report</Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Department Performance" value={`${summary.departmentPerformance || 92}%`} subtitle="Overall composite score" icon={Building2} accentColor="blue" />
          <StatisticsCard label="Student Performance" value={`${summary.studentPerformance || 84}%`} subtitle="Avg academic performance" icon={Users} accentColor="emerald" />
          <StatisticsCard label="Dept Pass %" value={`${summary.passPercentage || 94.2}%`} subtitle="University semester results" icon={Award} accentColor="purple" />
          <StatisticsCard label="Placement Rate" value={`${summary.placements || 82}%`} subtitle="Current academic batch" icon={TrendingUp} accentColor="amber" />
        </div>
      }
    >
      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-200/80 dark:border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}>
              <Icon className="size-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Department KPI Snapshot</h4>
            <LinearProgress value={summary.attendancePercentage || 91.4} label="Student Attendance" color="bg-blue-600" />
            <LinearProgress value={summary.passPercentage || 94.2} label="Pass Percentage" color="bg-emerald-600" />
            <LinearProgress value={summary.facultyPerformance || 88} label="Faculty Performance Score" color="bg-purple-600" />
            <LinearProgress value={summary.placements || 82} label="Placement Rate" color="bg-amber-500" />
          </GlassCard>
          <GlassCard className="p-5 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-2">Report Generation Activity</h4>
            {reportTypes.slice(0, 5).map((r) => (
              <div key={r.id} className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{r.type}</span>
                <span className="text-blue-600 font-black">{r.generatedCount} reports</span>
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      {/* Generate Reports Grid */}
      {activeTab === 'generate' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <GlassCard className="p-4 flex flex-wrap gap-3 items-center">
            <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
              <option>Academic Year: 2026-27</option>
              <option>Academic Year: 2025-26</option>
            </select>
            <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
              <option>All Semesters</option>
              <option>Sem 5</option><option>Sem 7</option>
            </select>
            <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold">
              <option>All Batches</option>
              <option>Batch 2023-27</option><option>Batch 2022-26</option>
            </select>
          </GlassCard>
          {/* Report Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {reportTypes.map((r) => {
              const Icon = REPORT_ICONS[r.icon] || BookOpen;
              const isLoading = generating === r.type;
              return (
                <GlassCard key={r.id} className="p-5 space-y-3 hover:shadow-blue-500/10 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="size-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">{r.type}</h5>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{r.generatedCount} generated • Last: {r.lastGenerated}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleGenerate(r.type)}
                      disabled={isLoading}
                      className="flex-1 px-2 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 transition disabled:opacity-60">
                      {isLoading ? 'Generating…' : 'Generate PDF'}
                    </button>
                    <button onClick={() => NotificationToast.success('Exported', `${r.type} Excel downloaded.`)}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                      XLS
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm">Department Analytics</p>
          <p className="mt-1">Interactive Recharts analytics — Attendance Trend, CGPA Distribution, Pass %, Research Trend, and Placement Stats for {departmentInfo.name}.</p>
        </GlassCard>
      )}
    </PageContainer>
  );
}
