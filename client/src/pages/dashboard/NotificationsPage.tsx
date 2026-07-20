import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import {
  Bell,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  BookOpen,
  Clock,
  DollarSign,
  BookMarked,
  Briefcase,
  Home,
  Bus,
  Award,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchStudentNotifications,
  markStudentNotificationRead,
  markAllStudentNotificationsRead,
  deleteStudentNotification,
} from '@/services/studentNotificationService';

const TYPE_ICON: Record<string, any> = {
  Academic: BookOpen,
  Attendance: Clock,
  Fees: DollarSign,
  Library: BookMarked,
  Placement: Briefcase,
  Hostel: Home,
  Transport: Bus,
  Faculty: Award,
  General: Bell,
};

const TYPE_TONE: Record<string, 'info' | 'warn' | 'danger' | 'success'> = {
  Academic: 'info',
  Attendance: 'warn',
  Fees: 'danger',
  Library: 'info',
  Placement: 'success',
  Hostel: 'info',
  Transport: 'warn',
  Faculty: 'info',
  General: 'info',
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const {
    data: notificationsList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['studentNotifications'],
    queryFn: fetchStudentNotifications,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => markStudentNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentNotifications'] });
      toast.success('Notification marked as read');
    },
    onError: () => toast.error('Failed to update notification'),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllStudentNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentNotifications'] });
      toast.success('All notifications marked as read!');
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudentNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentNotifications'] });
      toast.success('Notification deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete'),
  });

  const unreadCount = notificationsList.filter((n) => n.unread).length;
  const alertCount = notificationsList.filter((n) => n.priority === 'High' && n.unread).length;
  const completedCount = notificationsList.filter((n) => !n.unread).length;

  const filteredNotifications = useMemo(() => {
    return notificationsList.filter((n) => {
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === 'All' || n.type === selectedType;
      const matchStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Unread' && n.unread) ||
        (selectedStatus === 'Read' && !n.unread);
      return matchSearch && matchType && matchStatus;
    });
  }, [notificationsList, search, selectedType, selectedStatus]);

  const allTypes = useMemo(() => {
    const types = new Set(notificationsList.map((n) => n.type).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [notificationsList]);

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" desc="Stay on top of every alert across the campus." />

      {/* Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          {
            icon: Info,
            label: 'Info',
            sublabel: 'this week',
            value: notificationsList.length,
            gradient: 'bg-gradient-cyan',
          },
          {
            icon: AlertTriangle,
            label: 'Alerts',
            sublabel: 'this week',
            value: alertCount,
            gradient: 'bg-gradient-violet',
          },
          {
            icon: CheckCircle2,
            label: 'Completed',
            sublabel: 'this week',
            value: completedCount,
            gradient: 'bg-gradient-primary',
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div
                className={`size-11 rounded-xl ${s.gradient} text-white grid place-items-center`}
              >
                <s.icon className="size-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">
                  {s.label} {s.sublabel}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Types' : t}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {['All', 'Unread', 'Read'].map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Status' : s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            All Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center size-5 rounded-full bg-indigo-500 text-white text-xs">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={() => readAllMutation.mutate()}
              disabled={readAllMutation.isPending}
              className="text-xs text-indigo-500 hover:underline cursor-pointer disabled:opacity-50"
            >
              {readAllMutation.isPending ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        ) : isError ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="size-8 mx-auto text-rose-500" />
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load notifications.'}
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="size-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {notificationsList.length === 0
                ? 'No notifications yet. They will appear here when events occur.'
                : 'No notifications match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((n) => {
              const IconComponent = TYPE_ICON[n.type] || Bell;
              const tone = TYPE_TONE[n.type] || 'info';
              const isHighPriority = n.priority === 'High';
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.unread) readMutation.mutate(n.id);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${
                    n.unread ? 'bg-indigo-500/5 border-indigo-500/20' : ''
                  }`}
                >
                  <div
                    className={`size-10 rounded-lg ${
                      isHighPriority ? 'bg-gradient-primary' : 'bg-gradient-cyan'
                    } text-white grid place-items-center shrink-0`}
                  >
                    <IconComponent className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium truncate ${n.unread ? 'font-semibold' : ''}`}
                      >
                        {n.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {n.unread && <span className="size-2 rounded-full bg-indigo-500" />}
                        <Badge tone={tone}>{n.type || 'General'}</Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(n.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-rose-500 transition cursor-pointer disabled:opacity-50"
                          title="Delete notification"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {n.time || 'Just now'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
