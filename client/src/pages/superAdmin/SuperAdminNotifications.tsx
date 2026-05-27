import { createFileRoute } from "@tanstack/react-router";
import { Archive, Bell, CheckCircle, ShieldAlert, Wrench } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { superAdminNotifications } from "@/mock/superAdminData";

const notificationTypes = [
  {
    title: "System Alerts",
    desc: "Platform health, uptime and service status messages.",
    icon: Bell,
    tone: "info" as const,
  },
  {
    title: "Approval Notifications",
    desc: "Admin access, course changes and department approval requests.",
    icon: CheckCircle,
    tone: "warn" as const,
  },
  {
    title: "Security Warnings",
    desc: "Failed login attempts, suspicious sessions and audit warnings.",
    icon: ShieldAlert,
    tone: "danger" as const,
  },
  {
    title: "Maintenance Notifications",
    desc: "Planned maintenance windows and service updates.",
    icon: Wrench,
    tone: "info" as const,
  },
  {
    title: "Automation Alerts",
    desc: "Automation runs, trigger failures and workflow delivery reports.",
    icon: Archive,
    tone: "success" as const,
  },
];

export function SuperAdminNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Notifications"
        desc="Review system alerts, approvals, security warnings, maintenance messages and automation alerts."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {notificationTypes.map((item) => (
          <Card key={item.title} className="hover:-translate-y-1 transition">
            <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center mb-4">
              <item.icon className="size-5" />
            </div>
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
            <Badge tone={item.tone} className="mt-4">
              Enabled
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Notification Feed</h3>
        <div className="space-y-2">
          {superAdminNotifications
            .concat([
              {
                id: "SAN-005",
                title: "Automation alert: Attendance notification completed",
                type: "Automation",
                time: "2d ago",
                unread: false,
              },
              {
                id: "SAN-006",
                title: "Approval required for new department settings",
                type: "Approval",
                time: "2d ago",
                unread: false,
              },
            ])
            .map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border hover:bg-accent/50 transition ${notification.unread ? "bg-blue-50 border-blue-200" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </div>
                  <Badge
                    tone={
                      notification.type === "Security"
                        ? "danger"
                        : notification.type === "Approval"
                          ? "warn"
                          : notification.type === "Automation"
                            ? "success"
                            : "info"
                    }
                  >
                    {notification.type}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
