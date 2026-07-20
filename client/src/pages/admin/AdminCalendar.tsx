import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Save } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

export function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalEvents: 0,
    upcomingCount: 0,
    pendingCount: 0,
    approvedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Academic');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('College Administration');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/api/events'),
        api.get('/api/events/stats'),
      ]);

      if (listRes.data?.success && listRes.data?.data) {
        setEvents(listRes.data.data);
      }
      if (statsRes.data?.success && statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading events in admin calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !venue) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/events', {
        title,
        description,
        type,
        date,
        time: time || null,
        venue,
        organizer,
        status: 'Approved',
      });

      if (res.data?.success) {
        alert('New academic event published successfully!');
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setVenue('');
        setOrganizer('College Administration');
        setShowAddForm(false);
        fetchData();
      }
    } catch (err: any) {
      console.error('Error publishing event:', err);
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Academic Calendar" desc="Loading academic timeline..." />
        <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Calendar"
        desc="Manage academic events, exam schedules, holidays and important dates."
        actions={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2"
          >
            <Plus className="size-4" /> {showAddForm ? 'Hide Form' : 'Add Event'}
          </button>
        }
      />

      {showAddForm && (
        <Card>
          <h3 className="font-semibold mb-4">Publish New Event</h3>
          <form
            onSubmit={handleAddEvent}
            className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Event Title *</label>
                <input
                  placeholder="e.g. Mid-Term Examination"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Event Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {['Academic', 'Cultural', 'Sports', 'Holiday', 'Conference', 'Placement'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
              <textarea
                placeholder="Details about the event, syllabus, schedule, or guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Time (Optional)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Venue *</label>
                <input
                  placeholder="e.g. Block A Auditorum"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Organizer</label>
              <input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="size-4" /> {submitting ? 'Publishing...' : 'Publish Event'}
            </button>
          </form>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Monthly Calendar View</h3>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2;
              const isCurrentMonth = day > 0 && day <= 30;
              const hasEvent = events.some((e) => {
                const dateNum = new Date(e.date).getDate();
                const isThisMonth = new Date(e.date).getMonth() === new Date().getMonth();
                return isThisMonth && dateNum === day;
              });
              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm ${isCurrentMonth ? 'hover:bg-accent cursor-pointer' : 'text-muted-foreground'} ${hasEvent ? 'bg-blue-50 border border-blue-200' : ''}`}
                >
                  {day > 0 && day <= 30 ? day : ''}
                  {hasEvent && <div className="size-1.5 rounded-full bg-primary mx-auto mt-1" />}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            {[
              {
                label: 'Total Events',
                value: String(stats.totalEvents || 0),
                tone: 'info' as const,
              },
              {
                label: 'Upcoming',
                value: String(stats.upcomingCount || 0),
                tone: 'success' as const,
              },
              {
                label: 'Pending Approval',
                value: String(stats.pendingCount || 0),
                tone: 'warn' as const,
              },
              {
                label: 'Approved & Live',
                value: String(stats.approvedCount || 0),
                tone: 'success' as const,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
              >
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Badge tone={stat.tone}>{stat.value}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Upcoming Events</h3>
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {new Date(event.date).getDate()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="size-3" />{' '}
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {event.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {event.venue}
                    </span>
                  </div>
                </div>
                <Badge
                  tone={
                    event.status === 'Approved'
                      ? 'success'
                      : event.status === 'Pending Approval'
                        ? 'warn'
                        : 'info'
                  }
                >
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
            No events found in database calendar.
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Semester Timeline</h3>
          </div>
          <div className="space-y-3">
            {[
              { phase: 'Semester 6 Start', date: 'Jan 15, 2026', status: 'Completed' },
              { phase: 'Mid-Semester Exams', date: 'Jun 15, 2026', status: 'Upcoming' },
              { phase: 'Semester Break', date: 'Jul 1-15, 2026', status: 'Upcoming' },
              { phase: 'Final Exams', date: 'Nov 20, 2026', status: 'Upcoming' },
              { phase: 'Semester End', date: 'Dec 15, 2026', status: 'Upcoming' },
            ].map((item) => (
              <div
                key={item.phase}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
              >
                <div>
                  <div className="text-sm font-medium">{item.phase}</div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
                <Badge tone={item.status === 'Completed' ? 'success' : 'info'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="size-5 text-indigo" />
            <h3 className="font-semibold">Holidays List</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Republic Day', date: 'Jan 26, 2026' },
              { name: 'Holi', date: 'Mar 14, 2026' },
              { name: 'Good Friday', date: 'Apr 18, 2026' },
              { name: 'Independence Day', date: 'Aug 15, 2026' },
              { name: 'Diwali', date: 'Oct 20, 2026' },
              { name: 'Christmas', date: 'Dec 25, 2026' },
            ].map((holiday) => (
              <div
                key={holiday.name}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <span className="text-sm font-medium">{holiday.name}</span>
                <span className="text-xs text-muted-foreground">{holiday.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
