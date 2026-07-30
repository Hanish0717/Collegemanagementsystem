import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Eye, Plus, Search, X, Loader2, Info } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchEvents,
  fetchEventStats,
  createEvent,
  updateEventStatus,
  deleteEvent,
  EventItem,
} from "@/services/eventService";

export function AdminEvents() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Form states for creating event
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("Event");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newOrganizer, setNewOrganizer] = useState("");

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin", "events", "stats"],
    queryFn: fetchEventStats,
  });

  const { data: eventsList = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ["admin", "events", "list", { search, statusFilter, typeFilter }],
    queryFn: () =>
      fetchEvents({
        search: search || undefined,
        status: statusFilter !== "All Status" ? statusFilter : undefined,
        type: typeFilter !== "All Types" ? typeFilter : undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast.success("Event created and notifications broadcasted successfully!");
      setIsCreateOpen(false);
      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewType("Event");
      setNewDate("");
      setNewTime("");
      setNewVenue("");
      setNewOrganizer("");
      // Refetch queries
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create event");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateEventStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Event successfully ${variables.status.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update event status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete event");
    },
  });

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newType || !newDate || !newVenue) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createMutation.mutate({
      title: newTitle,
      description: newDescription,
      type: newType,
      date: newDate,
      time: newTime || undefined,
      venue: newVenue,
      organizer: newOrganizer || undefined,
      status: "Approved", // Approved immediately by admins
    });
  };

  const handleApprove = (id: string) => {
    statusMutation.mutate({ id, status: "Approved" });
  };

  const handleReject = (id: string) => {
    statusMutation.mutate({ id, status: "Rejected" });
  };

  // Filter events client-side for sections
  const pendingEvents = eventsList.filter((e) => e.status === "Pending Approval");
  const approvedEvents = eventsList.filter((e) => e.status === "Approved");
  const upcomingEvents = eventsList.filter(
    (e) => e.status === "Approved" && new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Approvals"
        desc="Review and approve event requests, manage upcoming events and track event status."
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2"
          >
            <Plus className="size-4" /> Create Event
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Requests",
            value: isStatsLoading ? "..." : stats?.pendingCount.toString() || "0",
            tone: "warn" as const,
          },
          {
            label: "Approved Events",
            value: isStatsLoading ? "..." : stats?.approvedCount.toString() || "0",
            tone: "success" as const,
          },
          {
            label: "Upcoming Events",
            value: isStatsLoading ? "..." : stats?.upcomingCount.toString() || "0",
            tone: "info" as const,
          },
          {
            label: "Total Events",
            value: isStatsLoading ? "..." : stats?.totalEvents.toString() || "0",
            tone: "info" as const,
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

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search events by title, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none cursor-pointer focus:border-primary"
          >
            {["All Status", "Pending Approval", "Approved", "Rejected"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none cursor-pointer focus:border-primary"
          >
            {["All Types", "Exam", "Event", "Meeting", "Lecture"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Pending Requests Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pending Approval Requests</h3>
          <Badge tone="warn">
            {isEventsLoading ? "..." : `${pendingEvents.length} pending`}
          </Badge>
        </div>
        <div className="space-y-3">
          {isEventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending events</div>
          ) : (
            pendingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-12 rounded-xl bg-gradient-violet text-white grid place-items-center text-xs font-semibold shrink-0">
                  {event.type.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" /> {event.date}
                    </span>
                    <span>{event.type}</span>
                    <span>{event.venue}</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleApprove(event.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs flex items-center gap-1 hover:bg-emerald-600 transition"
                  >
                    <Check className="size-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(event.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs flex items-center gap-1 hover:bg-rose-600 transition"
                  >
                    <X className="size-3" /> Reject
                  </button>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1 hover:bg-accent transition"
                  >
                    <Eye className="size-3" /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Approved and Upcoming Columns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Approved Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Approved Events</h3>
            <Badge tone="success">
              {isEventsLoading ? "..." : `${approvedEvents.length} approved`}
            </Badge>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {isEventsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : approvedEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No approved events</div>
            ) : (
              approvedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0">
                    {event.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.date} • {event.venue}</div>
                  </div>
                  <Badge tone="success">Approved</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Events</h3>
            <Badge tone="info">
              {isEventsLoading ? "..." : `${upcomingEvents.length} upcoming`}
            </Badge>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {isEventsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No upcoming events</div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center text-xs font-semibold shrink-0">
                    {event.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.date} • {event.venue}</div>
                  </div>
                  <Badge tone="info">Upcoming</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Analytics */}
      <Card>
        <h3 className="font-semibold mb-4">Event Analytics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Events This Month",
              value: isStatsLoading ? "..." : stats?.thisMonthCount.toString() || "0",
              tone: "info" as const,
            },
            {
              label: "Events This Semester",
              value: isStatsLoading ? "..." : stats?.thisSemesterCount.toString() || "0",
              tone: "info" as const,
            },
            {
              label: "Approval Rate",
              value: isStatsLoading ? "..." : stats?.approvalRate || "100%",
              tone: "success" as const,
            },
            {
              label: "Avg Processing Time",
              value: isStatsLoading ? "..." : stats?.avgProcessingTime || "2.3 days",
              tone: "info" as const,
            },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xl font-bold mt-2">{stat.value}</div>
              <Badge tone={stat.tone} className="mt-2">
                Metric
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl border">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Create New Event</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Tech Fest 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details about the event, agenda, topics covered..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Event Type *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none cursor-pointer focus:border-primary"
                  >
                    <option value="Event">Event</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Lecture">Lecture</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Time (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 4:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seminar Hall A"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Organizer (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Department of CSE (defaults to College Administration)"
                  value={newOrganizer}
                  onChange={(e) => setNewOrganizer(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border rounded-xl text-sm hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-gradient-primary text-white rounded-xl text-sm glow-primary flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
                >
                  {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl border">
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Event Details</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-base font-bold text-foreground">{selectedEvent.title}</h4>
                <Badge
                  tone={
                    selectedEvent.status === "Approved"
                      ? "success"
                      : selectedEvent.status === "Rejected"
                        ? "danger"
                        : "warn"
                  }
                  className="shrink-0"
                >
                  {selectedEvent.status}
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-accent/40 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">Type:</span>{" "}
                  <span className="text-foreground font-semibold">{selectedEvent.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Date:</span>{" "}
                  <span className="text-foreground font-semibold">{selectedEvent.date}</span>
                </div>
                {selectedEvent.time && (
                  <div>
                    <span className="text-muted-foreground font-medium">Time:</span>{" "}
                    <span className="text-foreground font-semibold">{selectedEvent.time}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground font-medium">Venue:</span>{" "}
                  <span className="text-foreground font-semibold">{selectedEvent.venue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Organizer:</span>{" "}
                  <span className="text-foreground font-semibold">
                    {selectedEvent.organizer || "College Administration"}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description
                </h5>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this event?")) {
                      deleteMutation.mutate(selectedEvent.id);
                      setSelectedEvent(null);
                    }
                  }}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Delete Event
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-gradient-primary text-white rounded-xl text-sm glow-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
