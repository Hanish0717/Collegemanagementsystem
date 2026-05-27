import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { events } from "@/mock/studentData";

export function StudentEvents() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Registration"
        desc="View upcoming events, register for competitions, and track event participation."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: events.length.toString(), tone: "info" as const },
          {
            label: "Registered",
            value: events.filter((e) => e.status === "Registered").length.toString(),
            tone: "success" as const,
          },
          { label: "Upcoming", value: "2", tone: "info" as const },
          { label: "This Month", value: "1", tone: "info" as const },
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-cyan text-white grid place-items-center">
                  <Calendar className="size-5" />
                </div>
                <Badge tone={event.status === "Registered" ? "success" : "warn"}>
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
              {event.status === "Not Registered" && (
                <button className="mt-4 w-full px-3 py-2 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:opacity-90 transition">
                  Register Now
                </button>
              )}
            </Card>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Registered Events</h3>
        <div className="space-y-2">
          {events
            .filter((e) => e.status === "Registered")
            .map((event) => (
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
            ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">Event Categories</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: "Technical Events", count: 5, icon: "💻" },
            { category: "Cultural Events", count: 3, icon: "🎭" },
            { category: "Sports", count: 4, icon: "⚽" },
            { category: "Workshops", count: 6, icon: "📚" },
          ].map((item) => (
            <div key={item.category} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.category}</span>
              </div>
              <div className="text-xs text-muted-foreground">{item.count} events available</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
