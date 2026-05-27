import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Filter } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { facultyNotificationItems } from "@/mock/facultyData";

export function FacultyNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        desc="View and manage notifications for assignments, classes, meetings, and system updates."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Notifications",
            value: facultyNotificationItems.length.toString(),
            tone: "info" as const,
          },
          { label: "Unread", value: "2", tone: "warn" as const },
          { label: "High Priority", value: "2", tone: "danger" as const },
          { label: "This Week", value: "4", tone: "info" as const },
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
        <div className="flex flex-wrap gap-2">
          {["All", "Unread", "High Priority", "Medium Priority", "Low Priority"].map(
            (filter, index) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${index === 0 ? "bg-gradient-primary text-white" : "border hover:bg-accent"}`}
              >
                {filter}
              </button>
            ),
          )}
          <button className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
            <Filter className="size-4" /> More Filters
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notification Cards</h3>
          <button className="text-sm text-primary hover:underline">Mark all as read</button>
        </div>
        <div className="space-y-2">
          {facultyNotificationItems.map((notification, index) => (
            <div
              key={notification.title}
              className={`flex items-start gap-4 p-4 rounded-xl border hover:bg-accent/50 transition ${index < 2 ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <div
                className={`size-2 rounded-full mt-2 shrink-0 ${index < 2 ? "bg-primary" : "bg-muted"}`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <Badge
                    tone={
                      notification.priority === "High"
                        ? "danger"
                        : notification.priority === "Medium"
                          ? "warn"
                          : "info"
                    }
                  >
                    {notification.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {notification.type} • {notification.time}
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg border text-xs hover:bg-accent transition flex items-center gap-1">
                <Check className="size-3" /> Mark Read
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Settings</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Assignment reminders", enabled: true },
              { label: "Class notifications", enabled: true },
              { label: "Meeting reminders", enabled: true },
              { label: "Student messages", enabled: false },
              { label: "System updates", enabled: true },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-3 rounded-xl border"
              >
                <span className="text-sm">{setting.label}</span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${setting.enabled ? "bg-emerald-500" : "bg-muted"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${setting.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Notification Categories</h3>
          <div className="space-y-2">
            {[
              { category: "Assignment", count: 5, unread: 1 },
              { category: "Class", count: 3, unread: 0 },
              { category: "Meeting", count: 2, unread: 1 },
              { category: "System", count: 4, unread: 0 },
            ].map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.category}</span>
                  {item.unread > 0 && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.count} total</span>
                  <Badge tone="warn">{item.unread} unread</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
