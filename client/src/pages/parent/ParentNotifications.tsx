import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

export function ParentNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/parent-module/student-data');
      if (res.data?.success && res.data?.data?.notifications) {
        setNotifications(res.data.data.notifications);
      }
    } catch (err) {
      console.error('Error loading parent notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'Unread') return n.unread;
    if (filterType === 'High Priority') return n.priority === 'High';
    if (filterType === 'Medium Priority') return n.priority === 'Medium';
    if (filterType === 'Low Priority') return n.priority === 'Low' || n.priority === 'Info';
    return true;
  });

  const unreadNotifications = notifications.filter((n) => n.unread);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        desc="View school announcements, exam notifications, fee reminders, and event updates."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Notifications',
            value: loading ? '...' : notifications.length.toString(),
            tone: 'info' as const,
          },
          {
            label: 'Unread',
            value: loading ? '...' : unreadNotifications.length.toString(),
            tone: 'warn' as const,
          },
          {
            label: 'High Priority',
            value: loading
              ? '...'
              : notifications.filter((n) => n.priority === 'High').length.toString(),
            tone: 'danger' as const,
          },
          {
            label: 'This Week',
            value: loading ? '...' : notifications.length.toString(),
            tone: 'info' as const,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {['All', 'Unread', 'High Priority', 'Medium Priority', 'Low Priority'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${filterType === filter ? 'bg-gradient-primary text-white' : 'border hover:bg-accent'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notification Cards</h3>
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm animate-pulse">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              All caught up! No notifications.
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-xl border hover:bg-accent/50 transition ${notification.unread ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50' : 'bg-white dark:bg-card'}`}
              >
                {notification.unread && (
                  <div className="size-2 rounded-full mt-2 shrink-0 bg-primary" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{notification.title}</div>
                    <Badge
                      tone={
                        notification.priority === 'High'
                          ? 'danger'
                          : notification.priority === 'Medium'
                            ? 'warn'
                            : 'info'
                      }
                    >
                      {notification.priority || 'Low'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.type} • {notification.time}
                  </div>
                </div>
                {notification.unread && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="px-3 py-1.5 rounded-lg border text-xs hover:bg-accent transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Check className="size-3" /> Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Settings</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Exam notifications', enabled: true },
              { label: 'Fee reminders', enabled: true },
              { label: 'Attendance alerts', enabled: true },
              { label: 'School announcements', enabled: false },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-3 rounded-xl border"
              >
                <span className="text-sm">{setting.label}</span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${setting.enabled ? 'bg-emerald-500' : 'bg-muted'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${setting.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Notification Categories</h3>
          <div className="space-y-2">
            {[
              {
                category: 'Alert',
                count: notifications.filter((n) => n.type === 'Alert').length,
                unread: notifications.filter((n) => n.type === 'Alert' && n.unread).length,
              },
              {
                category: 'Fees',
                count: notifications.filter((n) => n.type === 'Fees').length,
                unread: notifications.filter((n) => n.type === 'Fees' && n.unread).length,
              },
              {
                category: 'Academic',
                count: notifications.filter((n) => n.type === 'Academic').length,
                unread: notifications.filter((n) => n.type === 'Academic' && n.unread).length,
              },
              {
                category: 'Attendance',
                count: notifications.filter((n) => n.type === 'Attendance').length,
                unread: notifications.filter((n) => n.type === 'Attendance' && n.unread).length,
              },
            ].map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.category}</span>
                  {item.unread > 0 && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.count} total</span>
                  <Badge tone={item.unread > 0 ? 'warn' : 'info'}>{item.unread} unread</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
