import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Check, Eye, Plus, Search, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { academicEvents } from "@/lib/admin-data";

export const Route = createFileRoute("/dashboard/admin/events")({
  component: EventApprovals,
});

function EventApprovals() {
  const pendingEvents = academicEvents.filter(e => e.status === "Pending Approval");
  const approvedEvents = academicEvents.filter(e => e.status === "Approved");
  const upcomingEvents = academicEvents.filter(e => e.status === "Upcoming");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Approvals"
        desc="Review and approve event requests, manage upcoming events and track event status."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Create Event
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Pending Requests", value: pendingEvents.length.toString(), tone: "warn" as const },
          { label: "Approved Events", value: approvedEvents.length.toString(), tone: "success" as const },
          { label: "Upcoming Events", value: upcomingEvents.length.toString(), tone: "info" as const },
          { label: "Total Events", value: academicEvents.length.toString(), tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search events by title, type..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Pending Approval", "Approved", "Upcoming"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Types", "Exam", "Event", "Meeting", "Lecture"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pending Approval Requests</h3>
          <Badge tone="warn">{pendingEvents.length} pending</Badge>
        </div>
        <div className="space-y-3">
          {pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending events</div>
          ) : (
            pendingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-12 rounded-xl bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                  {event.type.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="size-3" /> {event.date}</span>
                    <span>{event.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs flex items-center gap-1 hover:bg-emerald-600 transition">
                    <Check className="size-3" /> Approve
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs flex items-center gap-1 hover:bg-rose-600 transition">
                    <X className="size-3" /> Reject
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 hover:bg-accent transition">
                    <Eye className="size-3" /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Approved Events</h3>
            <Badge tone="success">{approvedEvents.length} approved</Badge>
          </div>
          <div className="space-y-2">
            {approvedEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {event.type.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">{event.date}</div>
                </div>
                <Badge tone="success">Approved</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Events</h3>
            <Badge tone="info">{upcomingEvents.length} upcoming</Badge>
          </div>
          <div className="space-y-2">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center text-xs font-semibold">
                  {event.type.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">{event.date}</div>
                </div>
                <Badge tone="info">Upcoming</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Event Analytics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Events This Month", value: "8", tone: "info" as const },
            { label: "Events This Semester", value: "24", tone: "info" as const },
            { label: "Approval Rate", value: "92%", tone: "success" as const },
            { label: "Avg Processing Time", value: "2.3 days", tone: "info" as const },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xl font-bold mt-2">{stat.value}</div>
              <Badge tone={stat.tone} className="mt-2">Metric</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
