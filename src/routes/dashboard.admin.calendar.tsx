import { createFileRoute } from "@tanstack/react-router";
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { academicEvents } from "@/lib/admin-data";

export const Route = createFileRoute("/dashboard/admin/calendar")({
  component: AcademicCalendar,
});

function AcademicCalendar() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Calendar"
        desc="Manage academic events, exam schedules, holidays and important dates."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Event
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Monthly Calendar View</h3>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-xs font-semibold text-muted-foreground py-2">{day}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2;
              const isCurrentMonth = day > 0 && day <= 30;
              const hasEvent = [15, 20, 28, 5, 10].includes(day);
              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm ${isCurrentMonth ? "hover:bg-accent cursor-pointer" : "text-muted-foreground"} ${hasEvent ? "bg-blue-50 border border-blue-200" : ""}`}
                >
                  {day > 0 && day <= 30 ? day : ""}
                  {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1" />}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            {[
              { label: "Total Events", value: academicEvents.length.toString(), tone: "info" as const },
              { label: "Upcoming", value: academicEvents.filter(e => e.status === "Upcoming").length.toString(), tone: "success" as const },
              { label: "Pending Approval", value: academicEvents.filter(e => e.status === "Pending Approval").length.toString(), tone: "warn" as const },
              { label: "Approved", value: academicEvents.filter(e => e.status === "Approved").length.toString(), tone: "success" as const },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Badge tone={stat.tone}>{stat.value}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {academicEvents.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                {event.date.split("-")[2]}
              </div>
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><CalendarIcon className="size-3" /> {event.date}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {event.type}</span>
                </div>
              </div>
              <Badge tone={event.status === "Approved" ? "success" : event.status === "Pending Approval" ? "warn" : "info"}>
                {event.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Semester Timeline</h3>
          </div>
          <div className="space-y-3">
            {[
              { phase: "Semester 6 Start", date: "Jan 15, 2026", status: "Completed" },
              { phase: "Mid-Semester Exams", date: "Jun 15, 2026", status: "Upcoming" },
              { phase: "Semester Break", date: "Jul 1-15, 2026", status: "Upcoming" },
              { phase: "Final Exams", date: "Nov 20, 2026", status: "Upcoming" },
              { phase: "Semester End", date: "Dec 15, 2026", status: "Upcoming" },
            ].map(item => (
              <div key={item.phase} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <div>
                  <div className="text-sm font-medium">{item.phase}</div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
                <Badge tone={item.status === "Completed" ? "success" : "info"}>{item.status}</Badge>
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
              { name: "Republic Day", date: "Jan 26, 2026" },
              { name: "Holi", date: "Mar 14, 2026" },
              { name: "Good Friday", date: "Apr 18, 2026" },
              { name: "Independence Day", date: "Aug 15, 2026" },
              { name: "Diwali", date: "Oct 20, 2026" },
              { name: "Christmas", date: "Dec 25, 2026" },
            ].map(holiday => (
              <div key={holiday.name} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
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
