import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Paperclip, Send, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { communications } from "@/lib/parent-data";

export const Route = createFileRoute("/dashboard/parent/communication")({
  component: ParentCommunication,
});

function ParentCommunication() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication"
        desc="Communicate with teachers, view school announcements, and manage parent-teacher meetings."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Messages", value: communications.length.toString(), tone: "info" as const },
          { label: "Unread", value: "1", tone: "warn" as const },
          { label: "Active Threads", value: "3", tone: "success" as const },
          { label: "Meetings", value: "2", tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-indigo" />
            <h3 className="font-semibold">Teacher Communications</h3>
          </div>
          <div className="space-y-2">
            {communications.map(comm => (
              <div key={comm.id} className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${comm.unread ? "bg-blue-50 border-blue-200" : ""}`}>
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {comm.teacher.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comm.teacher}</span>
                    {comm.unread && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{comm.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">{comm.message}</div>
                </div>
                <span className="text-xs text-muted-foreground">{comm.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Send Message</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["Select Teacher", "Dr. Rajesh Kumar", "Prof. Emily Chen", "Dr. Marco Rossi"].map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Subject" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <textarea placeholder="Type your message..." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Paperclip className="size-4 text-muted-foreground" />
                <span className="text-sm">Attach file</span>
              </label>
              <input type="file" className="text-sm" />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Send className="size-4" /> Send Message
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">School Announcements</h3>
        </div>
        <div className="space-y-2">
          {[
            { title: "Parent-teacher meeting scheduled", date: "May 30, 2026", type: "Meeting" },
            { title: "Mid-term exam results released", date: "May 28, 2026", type: "Exam" },
            { title: "Annual day celebration invitation", date: "June 15, 2026", type: "Event" },
            { title: "Summer vacation dates announced", date: "June 20, 2026", type: "Holiday" },
          ].map(announcement => (
            <div key={announcement.title} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center">
                <Users className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{announcement.title}</div>
                <div className="text-xs text-muted-foreground">{announcement.type} • {announcement.date}</div>
              </div>
              <Badge tone="info">{announcement.type}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Parent-Teacher Meeting Schedule</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { teacher: "Dr. Rajesh Kumar", subject: "Data Structures", date: "May 30, 2026", time: "10:00 AM" },
            { teacher: "Prof. Emily Chen", subject: "Algorithms", date: "May 30, 2026", time: "11:30 AM" },
            { teacher: "Dr. Marco Rossi", subject: "Database Systems", date: "May 31, 2026", time: "02:00 PM" },
          ].map(meeting => (
            <div key={meeting.teacher} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-sm font-medium">{meeting.teacher}</div>
              <div className="text-xs text-muted-foreground">{meeting.subject}</div>
              <div className="mt-2 text-xs text-muted-foreground">{meeting.date} • {meeting.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
