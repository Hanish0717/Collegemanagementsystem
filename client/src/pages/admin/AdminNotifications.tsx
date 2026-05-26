import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Plus, Send, Smartphone } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { adminNotifications, notificationTemplates } from "@/mock/adminData";



export function AdminNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Broadcasting"
        desc="Send broadcast notifications via email, SMS and WhatsApp to students, faculty and staff."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> New Broadcast
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Sent", value: "1,248", tone: "success" as const },
          { label: "Email Sent", value: "856", tone: "info" as const },
          { label: "SMS Sent", value: "234", tone: "info" as const },
          { label: "WhatsApp Sent", value: "158", tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">This Month</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-4 border-b pb-4 mb-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm">
            <Mail className="size-4" /> Email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-accent transition">
            <Smartphone className="size-4" /> SMS
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-accent transition">
            <MessageSquare className="size-4" /> WhatsApp
          </button>
        </div>

        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="Subject line" className="rounded-lg border bg-background px-3 py-2 text-sm" />
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {["All Students", "All Faculty", "Specific Department", "Custom Selection"].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <select className="rounded-lg border bg-background px-3 py-2 text-sm">
            {notificationTemplates.map(t => <option key={t.name}>{t.name}</option>)}
          </select>
          <textarea placeholder="Message content..." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="schedule" className="rounded" />
              <label htmlFor="schedule" className="text-sm">Schedule for later</label>
            </div>
            <button className="px-6 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center gap-2">
              <Send className="size-4" /> Send Now
            </button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Message Templates</h3>
          <div className="space-y-2">
            {notificationTemplates.map(template => (
              <div key={template.name} className="p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{template.name}</div>
                  <Badge tone="info">{template.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{template.subject}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Audience Selection</h3>
          <div className="space-y-3">
            {[
              { label: "All Students", count: "2,847" },
              { label: "All Faculty", count: "156" },
              { label: "Computer Science Dept", count: "820" },
              { label: "Electronics Dept", count: "640" },
              { label: "Mechanical Dept", count: "580" },
              { label: "Business Dept", count: "420" },
            ].map(audience => (
              <label key={audience.label} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm font-medium">{audience.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{audience.count}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Recent Broadcasts</h3>
        <div className="space-y-2">
          {[
            { title: "Fee Payment Reminder", type: "Email", audience: "142 students", time: "2h ago", status: "Delivered" },
            { title: "Low Attendance Alert", type: "SMS", audience: "47 students", time: "5h ago", status: "Delivered" },
            { title: "Tech Fest 2026 Announcement", type: "WhatsApp", audience: "All Students", time: "1d ago", status: "Delivered" },
            { title: "Exam Schedule Update", type: "Email", audience: "All Faculty", time: "2d ago", status: "Delivered" },
          ].map(broadcast => (
            <div key={broadcast.title} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                {broadcast.type.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{broadcast.title}</div>
                <div className="text-xs text-muted-foreground">{broadcast.audience} • {broadcast.time}</div>
              </div>
              <Badge tone="success">{broadcast.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
