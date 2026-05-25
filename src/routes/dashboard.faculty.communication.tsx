import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Paperclip, Send, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { communications } from "@/lib/faculty-data";

export const Route = createFileRoute("/dashboard/faculty/communication")({
  component: CommunicationPortal,
});

function CommunicationPortal() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Portal"
        desc="Message students, manage discussions, and send announcements to your classes."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Messages", value: "156", tone: "info" as const },
          { label: "Unread", value: "3", tone: "warn" as const },
          { label: "Active Threads", value: "12", tone: "success" as const },
          { label: "Announcements", value: "8", tone: "info" as const },
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
            <h3 className="font-semibold">Recent Conversations</h3>
          </div>
          <div className="space-y-2">
            {communications.map(comm => (
              <div key={comm.id} className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${comm.unread ? "bg-blue-50 border-blue-200" : ""}`}>
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {comm.student.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comm.student}</span>
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
              {["Select Student", "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Reddy", "Vikram Singh"].map(s => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Subject" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <textarea placeholder="Type your message..." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <div className="flex items-center justify-between">
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
          <h3 className="font-semibold">Broadcast Announcement</h3>
        </div>
        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
            {["Select Audience", "All Students", "Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(a => <option key={a}>{a}</option>)}
          </select>
          <input placeholder="Announcement title" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Announcement content..." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Send email notification</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Send SMS notification</span>
            </label>
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-violet text-white text-sm font-medium">
            Broadcast Announcement
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Recent Announcements</h3>
        <div className="space-y-2">
          {[
            { title: "Mid-term exam schedule released", audience: "All Students", time: "2d ago", status: "Sent" },
            { title: "Assignment deadline extended", audience: "Data Structures", time: "3d ago", status: "Sent" },
            { title: "Class rescheduled for Friday", audience: "Algorithms", time: "5d ago", status: "Sent" },
            { title: "Study materials uploaded", audience: "Database Systems", time: "1w ago", status: "Sent" },
          ].map(announcement => (
            <div key={announcement.title} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center">
                <Users className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{announcement.title}</div>
                <div className="text-xs text-muted-foreground">{announcement.audience} • {announcement.time}</div>
              </div>
              <Badge tone="success">{announcement.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
