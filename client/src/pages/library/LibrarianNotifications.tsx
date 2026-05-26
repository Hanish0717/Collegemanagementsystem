import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Clock, BookMarked, DollarSign, Plus, Archive } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { libraryNotifications } from "@/mock/mockData";



export function LibrarianNotifications() {
  const [filterType, setFilterType] = useState("All");
  const [archivedCount, setArchivedCount] = useState(0);

  const notificationTypes = {
    DueReminder: { label: "Due Reminders", icon: Clock, color: "from-amber-500" },
    Overdue: { label: "Overdue", icon: AlertCircle, color: "from-rose-500" },
    NewArrival: { label: "New Arrivals", icon: BookMarked, color: "from-emerald-500" },
    FinePayment: { label: "Fine Payments", icon: DollarSign, color: "from-cyan-500" },
    SystemNotification: { label: "System", icon: Plus, color: "from-violet-500" },
  };

  const filteredNotifications = filterType === "All"
    ? libraryNotifications
    : libraryNotifications.filter(n => n.type === filterType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        desc="Library alerts, reminders and system notifications."
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">{libraryNotifications.filter(n => n.unread).length}</div>
            <div className="text-xs text-muted-foreground mt-2">Unread</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{libraryNotifications.filter(n => n.urgency === "high").length}</div>
            <div className="text-xs text-muted-foreground mt-2">High Priority</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold">{archivedCount}</div>
            <div className="text-xs text-muted-foreground mt-2">Archived</div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "DueReminder", "Overdue", "NewArrival", "FinePayment", "SystemNotification"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                filterType === type
                  ? "bg-gradient-primary text-white"
                  : "bg-background border text-muted-foreground hover:border-primary"
              }`}
            >
              {type === "All" ? "All" : notificationTypes[type as keyof typeof notificationTypes]?.label || type}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map(notification => {
          const typeInfo = notificationTypes[notification.type as keyof typeof notificationTypes];
          const IconComponent = typeInfo?.icon || AlertCircle;

          return (
            <Card key={notification.id} className={`border-l-4 relative ${
              notification.urgency === "high" ? "border-l-rose-500" :
              notification.urgency === "medium" ? "border-l-amber-500" :
              "border-l-emerald-500"
            } hover:-translate-x-1 transition`}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`size-12 rounded-xl bg-gradient-to-br ${typeInfo?.color} to-transparent text-white grid place-items-center shrink-0`}>
                  <IconComponent className="size-5" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>

              {/* Action Buttons and Badge - Unified Container */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4 sm:gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs border text-muted-foreground hover:bg-gradient-soft transition whitespace-nowrap">
                  Mark Read
                </button>

                {/* Badge + Status Indicator - Right aligned */}
                <div className="flex items-center gap-2 shrink-0">
                  {notification.unread && (
                    <div className="size-2 rounded-full bg-gradient-primary" />
                  )}
                  <Badge tone={
                    notification.urgency === "high" ? "danger" :
                    notification.urgency === "medium" ? "warn" :
                    "success"
                  }>
                    {notification.urgency}
                  </Badge>
                  <button
                    onClick={() => setArchivedCount(prev => prev + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-rose-100 transition shrink-0 ml-1"
                  >
                    <Archive className="size-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Notification Categories */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">📅 Due Reminders</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Books due within 3 days</p>
            <p>• Daily recap at 9 AM</p>
            <p>• Sent to 234 active members</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">⚠️ Overdue Alerts</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• 8 books currently overdue</p>
            <p>• Escalation notices sent</p>
            <p>• Follow-up required</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">📚 New Arrivals</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• 12 new books added</p>
            <p>• 5 subjects covered</p>
            <p>• Announced to all members</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">💰 Fine Collections</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• ₹2,840 collected this month</p>
            <p>• 3 payments pending</p>
            <p>• Payment reminder sent</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">🔧 System Events</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Inventory audit completed</p>
            <p>• Backups scheduled daily</p>
            <p>• Maintenance: Sundays 2-4 PM</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">⚙️ Preferences</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Customize notification types</p>
            <p>• Set delivery frequency</p>
            <p>• Enable email alerts</p>
          </div>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <h3 className="font-semibold mb-4">Notification Settings</h3>
        <div className="space-y-4">
          {[
            { title: "Due Date Reminders", enabled: true, desc: "Get notified when books are due within 3 days" },
            { title: "Overdue Alerts", enabled: true, desc: "Critical alerts for overdue books" },
            { title: "New Arrivals", enabled: true, desc: "Notify about newly added books" },
            { title: "Fine Reminders", enabled: true, desc: "Payment reminders for pending fines" },
            { title: "System Updates", enabled: false, desc: "Maintenance and system notifications" },
          ].map((setting, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-soft transition">
              <div>
                <div className="font-medium text-sm">{setting.title}</div>
                <div className="text-xs text-muted-foreground">{setting.desc}</div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="rounded"
                />
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
