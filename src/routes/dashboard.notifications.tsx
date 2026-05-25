import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { notifications } from "@/lib/mock-data";
import { Bell, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" desc="Stay on top of every alert across the campus." />

      <Card className="bg-gradient-primary text-white border-0 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative flex items-center gap-4">
          <div className="size-12 rounded-xl bg-white/20 grid place-items-center"><AlertTriangle className="size-6" /></div>
          <div className="flex-1">
            <div className="font-semibold">Mid-term exam schedule released</div>
            <div className="text-sm opacity-90">All students must download hall tickets before June 10.</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-white text-foreground text-sm font-medium">View</button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { i: Info, l: "Info", c: "bg-gradient-cyan", n: 12 },
          { i: AlertTriangle, l: "Alerts", c: "bg-gradient-violet", n: 4 },
          { i: CheckCircle2, l: "Completed", c: "bg-gradient-primary", n: 28 },
        ].map(s=>(
          <Card key={s.l}>
            <div className="flex items-center gap-3">
              <div className={`size-11 rounded-xl ${s.c} text-white grid place-items-center`}><s.i className="size-5" /></div>
              <div>
                <div className="text-2xl font-bold">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.l} this week</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">All Notifications</h3>
          <button className="text-xs text-indigo hover:underline">Mark all as read</button>
        </div>
        <div className="space-y-2">
          {notifications.map((n,i)=>(
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${n.unread ? "bg-gradient-soft" : ""}`}>
              <div className="size-9 rounded-lg bg-gradient-primary text-white grid place-items-center"><Bell className="size-4" /></div>
              <div className="flex-1">
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.time}</div>
              </div>
              <Badge tone="info">{n.type}</Badge>
              {n.unread && <span className="size-2 rounded-full bg-gradient-primary" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
