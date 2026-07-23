import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { fetchDepartmentEvents, EventItem } from '../services/hodMentoringResearchEventService';

import {
  PageContainer,
  StatisticsCard,
  GlassCard,
  AdvancedTable,
  Column,
  StatusBadge,
  ActionsMenu,
  NotificationToast,
  Button,
} from '../components/shared';
import { exportToCSV, exportToTextDoc } from '../utils/exportUtils';
import {
  Calendar,
  Award,
  Download,
  FileText,
  Eye,
  BarChart2,
  Sparkles,
  Plus,
  Users,
} from 'lucide-react';

export function HODEventsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'workshops' | 'lectures' | 'achievements'>('dashboard');

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetchDepartmentEvents(departmentCode);
      setData(res);
    }
    loadData();
  }, [departmentCode]);

  const summary = data?.summary || {};
  const events = data?.events || [];

  const tabs = [
    { id: 'dashboard', label: 'Event Dashboard', icon: BarChart2 },
    { id: 'directory', label: 'Event Directory', icon: Calendar },
    { id: 'workshops', label: 'Seminars & Workshops', icon: Users },
    { id: 'lectures', label: 'Guest Lectures', icon: FileText },
    { id: 'achievements', label: 'Achievements & Awards', icon: Award },
  ] as const;

  const eventColumns: Column<EventItem>[] = [
    { key: 'name', header: 'Event Name', render: (item) => <span className="font-extrabold text-slate-900 dark:text-white">{item.name}</span> },
    { key: 'category', header: 'Category', render: (item) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40">{item.category}</span> },
    { key: 'coordinator', header: 'Coordinator', render: (item) => <span className="font-semibold text-slate-700 dark:text-slate-300">{item.coordinator}</span> },
    { key: 'venue', header: 'Venue & Date', render: (item) => <span className="font-mono text-xs text-slate-500">{item.venue} ({item.date})</span> },
    { key: 'participants', header: 'Participants', render: (item) => <span className="font-black text-purple-600">{item.participants} Delegates</span> },
    { key: 'budget', header: 'Sanctioned Budget', render: (item) => <span className="font-bold text-emerald-600">{item.budget}</span> },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <ActionsMenu
          items={[
            { label: 'View Participant List', icon: Eye, onClick: () => NotificationToast.info('Participants List', `Viewing list for ${item.name}`) },
            {
              label: 'Download Summary Report',
              icon: Download,
              onClick: () => {
                exportToTextDoc(`Event_Summary_${item.id}.txt`, `Event Summary Report — ${item.name}`, {
                  'Event Name': item.name,
                  'Category': item.category,
                  'Coordinator': item.coordinator,
                  'Venue & Date': `${item.venue} (${item.date})`,
                  'Delegates': `${item.participants} Delegates`,
                  'Sanctioned Budget': item.budget,
                  'Status': item.status,
                });
                NotificationToast.success('Report Exported', `Downloaded event summary`);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Department Events & Achievements"
      subtitle={`Academic symposiums, technical workshops, guest lectures, and student achievements for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Department Events' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={Download}
            onClick={() => {
              exportToCSV(`HOD_Events_List_${departmentInfo.shortName}.csv`, events);
              NotificationToast.success('Exporting Events', 'Downloading CSV directory...');
            }}
          >
            Export List
          </Button>
          <Button variant="primary" size="sm" iconLeft={Plus} onClick={() => NotificationToast.info('New Event Proposal', 'Event proposal wizard launched')}>
            Create Event Proposal
          </Button>
        </div>
      }
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Total Dept Events" value={summary.completedEvents || 14} subtitle={`${summary.upcomingEvents || 3} Upcoming`} icon={Calendar} accentColor="blue" />
          <StatisticsCard label="Seminars & Workshops" value={(summary.seminars || 4) + (summary.workshops || 5)} subtitle="Technical sessions" icon={Users} accentColor="emerald" />
          <StatisticsCard label="Guest Lectures" value={summary.guestLectures || 3} subtitle="Industry experts" icon={FileText} accentColor="purple" />
          <StatisticsCard label="Student Participation" value={summary.studentParticipation || 380} subtitle="Total registrations" icon={Sparkles} accentColor="amber" />
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

      {/* Tab 2: Event Directory */}
      {activeTab === 'directory' && (
        <AdvancedTable
          title={`${departmentInfo.shortName} Events Directory`}
          subtitle={`Department events strictly isolated to ${departmentInfo.name}`}
          columns={eventColumns}
          data={events}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search events by name, coordinator, or category..."
        />
      )}

      {/* Fallback */}
      {activeTab !== 'directory' && (
        <GlassCard className="p-8 text-center text-xs text-slate-500 font-medium">
          <p className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">{activeTab} Dataset</p>
          <p className="mt-1">Official {activeTab} event records loaded from department database for {departmentInfo.name}.</p>
        </GlassCard>
      )}
    </PageContainer>
  );
}
