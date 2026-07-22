import React, { useState } from 'react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { getDepartmentDashboardData } from '../services/hodDashboardService';

import { DepartmentHeader } from '../components/shared/DepartmentHeader';
import { DepartmentCard } from '../components/shared/DepartmentCard';
import { HODKPICardGrid } from '../components/dashboard/HODKPICardGrid';
import { HODAnalyticsSuite } from '../components/dashboard/HODAnalyticsSuite';
import { HODLowAttentionAlerts } from '../components/dashboard/HODLowAttentionAlerts';
import { HODPendingApprovalsWorkbench } from '../components/dashboard/HODPendingApprovalsWorkbench';
import { HODAIInsightsPanel } from '../components/dashboard/HODAIInsightsPanel';
import { HODDepartmentCalendar } from '../components/dashboard/HODDepartmentCalendar';
import { HODRightSidebar } from '../components/dashboard/HODRightSidebar';
import { HODQuickActionModal } from '../components/dashboard/HODQuickActionModal';
import { HODExportModal } from '../components/dashboard/HODExportModal';

import {
  Download,
  Plus,
  Sparkles,
  ChevronDown,
  Megaphone,
  FileText,
  Calendar,
  UserPlus,
  GraduationCap,
} from 'lucide-react';

export function HODDashboardPage() {
  const { departmentCode, departmentInfo, academicYear } = useHODDepartment();

  // Load department-isolated metrics and datasets
  const dashboardData = getDepartmentDashboardData(departmentCode);

  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [activeActionType, setActiveActionType] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleOpenAction = (type: string) => {
    setActiveActionType(type);
    setShowQuickMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <DepartmentHeader
        title="Department Command Center"
        subtitle={`Real-time analytics, critical alerts, and workflow authorizations for ${departmentInfo.name}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="size-4 text-blue-600" /> Export Dashboard
            </button>

            {/* Quick Actions Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" /> Quick Actions <ChevronDown className="size-3.5" />
              </button>

              {showQuickMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs font-semibold">
                  <button
                    onClick={() => handleOpenAction('announcement')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <Megaphone className="size-4 text-blue-500" /> Create Announcement
                  </button>
                  <button
                    onClick={() => handleOpenAction('report')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <FileText className="size-4 text-purple-500" /> Generate Department Report
                  </button>
                  <button
                    onClick={() => handleOpenAction('event')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <Calendar className="size-4 text-emerald-500" /> Schedule Department Event
                  </button>
                  <button
                    onClick={() => handleOpenAction('student')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <UserPlus className="size-4 text-amber-500" /> Quick Enroll Student
                  </button>
                  <button
                    onClick={() => handleOpenAction('faculty')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <GraduationCap className="size-4 text-indigo-500" /> Assign Faculty Workload
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Department Main Info Banner */}
      <DepartmentCard info={departmentInfo} academicYear={academicYear} />

      {/* 20 Animated KPI Cards Grid */}
      <HODKPICardGrid kpiCards={dashboardData.kpiCards} />

      {/* Critical Low Attention Alerts */}
      <HODLowAttentionAlerts alerts={dashboardData.alerts} />

      {/* AI Predictive Insights Panel */}
      <HODAIInsightsPanel />

      {/* Main Grid: Analytics Suite & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Multi-Tab Analytics Suite & Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <HODAnalyticsSuite
            enrollmentTrend={dashboardData.enrollmentTrend}
            sectionDistribution={dashboardData.sectionDistribution}
            dailyAttendanceData={dashboardData.dailyAttendanceData}
            passPercentageBySem={dashboardData.passPercentageBySem}
            facultyWorkloadData={dashboardData.facultyWorkloadData}
          />

          <HODPendingApprovalsWorkbench initialApprovals={dashboardData.pendingApprovals} />
        </div>

        {/* Right 1 Column: Department Schedule & Right Sidebar Widgets */}
        <div className="space-y-6">
          <HODDepartmentCalendar />
          <HODRightSidebar />
        </div>
      </div>

      {/* Quick Action Dialog Popup */}
      <HODQuickActionModal
        isOpen={Boolean(activeActionType)}
        onClose={() => setActiveActionType(null)}
        actionType={activeActionType || ''}
      />

      {/* Dashboard Export Dialog Popup */}
      <HODExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
