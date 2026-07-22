import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Calendar, Users } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import api from '@/lib/api';

export function StudentEvents() {
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/api/events');
        if (res.data?.success && res.data?.data) {
          const mapped = res.data.data.map((e: any) => ({
            id: e.id,
            title: e.title,
            type: e.type,
            date: new Date(e.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            status: e.status === 'Approved' ? 'Not Registered' : 'Closed',
          }));
          setEventsList(mapped);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = (eventId: string, title: string) => {
    alert(`Registered successfully for ${title}!`);
    setEventsList((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return { ...e, status: 'Registered' };
        }
        return e;
      }),
    );
  };

  const registeredEvents = eventsList.filter((e) => e.status === 'Registered');

  // Group categories dynamically
  const categoriesMap: Record<string, number> = {};
  eventsList.forEach((e) => {
    const t = e.type || 'Other';
    categoriesMap[t] = (categoriesMap[t] || 0) + 1;
  });

  const categories = Object.keys(categoriesMap).map((type) => ({
    category: type,
    count: categoriesMap[type],
    icon: type.toLowerCase().includes('tech')
      ? '💻'
      : type.toLowerCase().includes('cult')
        ? '🎭'
        : type.toLowerCase().includes('sport')
          ? '⚽'
          : '📚',
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Event Registration" desc="Loading upcoming events..." />
        <div className="p-8 text-center text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Registration"
        desc="View upcoming events, register for competitions, and track event participation."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: eventsList.length.toString(), tone: 'info' as const },
          {
            label: 'Registered',
            value: registeredEvents.length.toString(),
            tone: 'success' as const,
          },
          {
            label: 'Upcoming',
            value: eventsList.filter((e) => e.status !== 'Closed').length.toString(),
            tone: 'info' as const,
          },
          {
            label: 'Closed Events',
            value: eventsList.filter((e) => e.status === 'Closed').length.toString(),
            tone: 'warn' as const,
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
        <h3 className="font-semibold mb-4">Available Events</h3>
        {eventsList.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsList.map((event) => (
              <Card key={event.id} className="hover:-translate-y-1 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-gradient-cyan text-white grid place-items-center">
                    <Calendar className="size-5" />
                  </div>
                  <Badge
                    tone={
                      event.status === 'Registered'
                        ? 'success'
                        : event.status === 'Closed'
                          ? 'danger'
                          : 'info'
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm">{event.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{event.type}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="size-3" />
                    <span className="text-muted-foreground">{event.date}</span>
                  </div>
                </div>
                {event.status === 'Not Registered' && (
                  <button
                    onClick={() => handleRegister(event.id, event.title)}
                    className="mt-4 w-full px-3 py-2 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:opacity-90 transition"
                  >
                    Register Now
                  </button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
            No events found in the database.
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Registered Events</h3>
        <div className="space-y-2">
          {registeredEvents.length > 0 ? (
            registeredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center">
                  <Calendar className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {event.type} • {event.date}
                  </div>
                </div>
                <Badge tone="success">Registered</Badge>
              </div>
            ))
          ) : (
            <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-xs">
              You haven't registered for any events yet.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">Event Categories</h3>
        </div>
        {categories.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((item) => (
              <div key={item.category} className="p-4 rounded-xl bg-gradient-soft border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.count} events available</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-xs">
            No categories available.
          </div>
        )}
      </Card>
    </div>
  );
}
