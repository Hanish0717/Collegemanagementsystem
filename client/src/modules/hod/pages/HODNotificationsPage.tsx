import React, { useState } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { PageContainer } from '../components/shared/PageContainer';
import { GlassCard } from '../components/shared/GlassCard';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import {
  Bell, AlertTriangle, Calendar, Award, Briefcase, Heart, BookOpen,
  CheckCircle2, Archive, Trash2, Search, Filter, MailOpen,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  read: boolean;
}

const SEED_NOTIFICATIONS: NotificationItem[] = [
  { id: 'N-001', type: 'Attendance Alert', title: 'Critical Shortage: Chirag Reddy', message: 'Attendance dropped to 68% — immediate intervention required.', time: '10 mins ago', priority: 'High', read: false },
  { id: 'N-002', type: 'Faculty Leave', title: 'Leave Request: Prof. Sneha Verma', message: 'Casual leave for 2 days (July 22–23) pending your approval.', time: '35 mins ago', priority: 'Normal' as any, read: false },
  { id: 'N-003', type: 'Research Reminder', title: 'Scopus Paper Submission Deadline', message: 'Dr. Vikram Rathore — submission deadline for IEEE TAI is July 25, 2026.', time: '2 hours ago', priority: 'Medium', read: false },
  { id: 'N-004', type: 'Result Published', title: 'Sem 5 Internal Exam 2 Results Published', message: 'Marks for 16 subjects have been uploaded. Pass % = 94.2%.', time: '4 hours ago', priority: 'Medium', read: true },
  { id: 'N-005', type: 'Event Reminder', title: 'Upcoming: AI Symposium (Aug 15)', message: 'Final participant registration closes tomorrow at 5 PM.', time: '6 hours ago', priority: 'High', read: true },
  { id: 'N-006', type: 'Meeting Reminder', title: 'Mentoring Meeting: Chirag Reddy', message: 'Scheduled session with Prof. Sneha Verma on July 28, 2026.', time: '1 day ago', priority: 'Low', read: true },
  { id: 'N-007', type: 'System Announcement', title: 'NAAC Peer Team Visit — August 10, 2026', message: 'All department HODs are requested to prepare accreditation portfolios.', time: '2 days ago', priority: 'High', read: false },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  'Attendance Alert': AlertTriangle,
  'Faculty Leave': Briefcase,
  'Research Reminder': BookOpen,
  'Result Published': Award,
  'Event Reminder': Calendar,
  'Meeting Reminder': Heart,
  'System Announcement': Bell,
};

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

export function HODNotificationsPage() {
  const { departmentInfo } = useHODDepartment();
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || n.type === filter || (filter === 'Unread' && !n.read);
    return matchesSearch && matchesFilter;
  });

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const FILTER_TYPES = ['All', 'Unread', 'Attendance Alert', 'Faculty Leave', 'Research Reminder', 'Result Published', 'Event Reminder', 'Meeting Reminder', 'System Announcement'];

  return (
    <PageContainer
      title="Notification Center"
      subtitle={`Department alerts, reminders, and system announcements for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Notifications' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" iconLeft={MailOpen} onClick={markAllRead}>Mark All Read</Button>
          <Button variant="outline" size="sm" iconLeft={Archive} onClick={() => NotificationToast.info('Archived', 'All read notifications archived.')}>Archive Read</Button>
        </div>
      }
    >
      {/* Search + Filter Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Bell className="size-4" />
            <span className="text-blue-600 font-black">{unreadCount}</span> Unread
          </div>
        </div>
        {/* Type filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {FILTER_TYPES.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <GlassCard className="p-12 text-center">
            <Bell className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="font-extrabold text-slate-900 dark:text-white text-sm">No notifications found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter.</p>
          </GlassCard>
        )}
        {filtered.map(n => {
          const Icon = TYPE_ICONS[n.type] || Bell;
          return (
            <GlassCard key={n.id}
              className={`p-4 flex items-start gap-4 transition-all hover:shadow-md ${!n.read ? 'border-l-4 border-blue-500' : ''}`}>
              <div className={`shrink-0 size-10 rounded-2xl flex items-center justify-center ${!n.read ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className={`size-5 ${!n.read ? 'text-blue-600' : 'text-slate-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className={`text-xs font-extrabold ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</h5>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${PRIORITY_COLORS[n.priority]}`}>{n.priority}</span>
                  {!n.read && <span className="size-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{n.type} • {n.time}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} title="Mark as read"
                    className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition">
                    <CheckCircle2 className="size-4" />
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)} title="Delete"
                  className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 transition">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </PageContainer>
  );
}
