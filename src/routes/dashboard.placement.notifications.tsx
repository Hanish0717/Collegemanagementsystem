import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Archive, Bell, Zap } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { placementNotifications } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/placement/notifications")({
  component: PlacementNotifications,
});

function PlacementNotifications() {
  const [selectedNotif, setSelectedNotif] = useState<string | null>(null);
  const [archived, setArchived] = useState<string[]>([]);

  const unreadCount = placementNotifications.filter(n => n.unread && !archived.includes(n.id)).length;
  const activeNotifications = placementNotifications.filter(n => !archived.includes(n.id));

  const typeColors: Record<string, string> = {
    Drive: "from-blue-500 to-cyan-500",
    Interview: "from-purple-500 to-pink-500",
    Offer: "from-emerald-500 to-cyan-500",
    Deadline: "from-amber-500 to-orange-500",
    Resume: "from-indigo-500 to-blue-500",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Notifications"
        desc="Manage placement alerts, reminders and announcements."
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl mb-1">📬</div>
          <div className="text-2xl font-bold">{activeNotifications.length}</div>
          <div className="text-xs text-muted-foreground">Total Notifications</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">🔔</div>
          <div className="text-2xl font-bold text-amber-600">{unreadCount}</div>
          <div className="text-xs text-muted-foreground">Unread</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-2xl font-bold">{Math.round((unreadCount / activeNotifications.length) * 100)}%</div>
          <div className="text-xs text-muted-foreground">Unread Rate</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-primary text-white whitespace-nowrap">
            All ({activeNotifications.length})
          </button>
          {["Drive", "Interview", "Offer", "Deadline", "Resume"].map(type => (
            <button
              key={type}
              className="px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap hover:border-primary transition"
            >
              {type} ({activeNotifications.filter(n => n.type === type).length})
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {activeNotifications.map(notif => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl cursor-pointer hover:border-primary transition border hover:bg-accent/50 ${
              notif.unread ? "border-blue-200 bg-blue-50" : ""
            }`}
            onClick={() => setSelectedNotif(selectedNotif === notif.id ? null : notif.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`size-12 rounded-lg bg-gradient-to-br ${typeColors[notif.type]} text-white grid place-items-center shrink-0`}>
                {notif.type === "Drive" && "🎯"}
                {notif.type === "Interview" && "📅"}
                {notif.type === "Offer" && "✓"}
                {notif.type === "Deadline" && "⏰"}
                {notif.type === "Resume" && "📄"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{notif.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {notif.unread && (
                      <div className="size-2.5 rounded-full bg-blue-600" />
                    )}
                    <Badge className="text-[10px]">{notif.type}</Badge>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedNotif === notif.id && (
                  <div className="mt-3 p-3 bg-background rounded-lg border text-sm space-y-2">
                    <p className="text-muted-foreground">
                      {notif.type === "Drive" && "A new recruitment drive has been added. Check eligibility and apply before deadline."}
                      {notif.type === "Interview" && "Your interview has been scheduled. Please confirm availability and prepare accordingly."}
                      {notif.type === "Offer" && "Congratulations! You have received an offer. Review terms and accept within 5 business days."}
                      {notif.type === "Deadline" && "Application deadline is approaching. Submit your application before the specified date and time."}
                      {notif.type === "Resume" && "Your resume requires verification. Upload an updated version for approval."}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:shadow-lg transition">
                        Take Action
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setArchived([...archived, notif.id]);
                        }}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-accent transition"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setArchived([...archived, notif.id]);
                }}
                className="p-2 rounded-lg hover:bg-accent transition shrink-0"
              >
                <Archive className="size-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Types & Description */}
      <Card>
        <h3 className="font-semibold mb-4">Notification Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { type: "Drive", desc: "New recruitment drives and registration deadlines", icon: "🎯" },
            { type: "Interview", desc: "Interview scheduling and reminders", icon: "📅" },
            { type: "Offer", desc: "Job offers and acceptance notifications", icon: "✓" },
            { type: "Deadline", desc: "Important deadline reminders and alerts", icon: "⏰" },
            { type: "Resume", desc: "Resume verification and update requests", icon: "📄" },
            { type: "Training", desc: "Training program and assessment schedules", icon: "📚" },
          ].map(nt => (
            <div key={nt.type} className="p-3 rounded-lg border">
              <div className="flex items-start gap-2">
                <span className="text-xl">{nt.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{nt.type}</div>
                  <div className="text-xs text-muted-foreground mt-1">{nt.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <h3 className="font-semibold mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { name: "Drive Notifications", desc: "Get notified when new drives are added", enabled: true },
            { name: "Interview Reminders", desc: "Reminders before scheduled interviews", enabled: true },
            { name: "Deadline Alerts", desc: "Alerts for approaching deadlines", enabled: true },
            { name: "Offer Notifications", desc: "Notifications for received offers", enabled: true },
            { name: "Training Announcements", desc: "Updates on training programs", enabled: false },
            { name: "Weekly Summary", desc: "Weekly placement activity summary", enabled: true },
          ].map(pref => (
            <div key={pref.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition">
              <div>
                <div className="font-medium text-sm">{pref.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{pref.desc}</div>
              </div>
              <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                pref.enabled ? "bg-emerald-500" : "bg-muted"
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  pref.enabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Channels */}
      <Card>
        <h3 className="font-semibold mb-4">Notification Channels</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { channel: "Email Notifications", enabled: true },
            { channel: "SMS Alerts", enabled: false },
            { channel: "Push Notifications", enabled: true },
            { channel: "Dashboard Alerts", enabled: true },
          ].map(ch => (
            <div key={ch.channel} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition">
              <div className="font-medium text-sm">{ch.channel}</div>
              <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                ch.enabled ? "bg-emerald-500" : "bg-muted"
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  ch.enabled ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
            <Zap className="size-4" /> Mark All as Read
          </button>
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
            <Archive className="size-4" /> Archive All
          </button>
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
            <Trash2 className="size-4" /> Clear Old Notifications
          </button>
        </div>
      </Card>
    </div>
  );
}
