import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2, Filter, AlertCircle, History, Mail, Calendar, Send } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementNotifications, markPlacementNotificationRead, fetchNotificationHistory, type PlacementNotification, type NotificationHistoryItem } from "@/services/placementService";
import { toast } from "sonner";

export function PlacementNotifications() {
  const [activeTab, setActiveTab] = useState<"inbox" | "history">("inbox");
  const [notifications, setNotifications] = useState<PlacementNotification[]>([]);
  const [historyLogs, setHistoryLogs] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifsRes, historyRes] = await Promise.all([
        fetchPlacementNotifications(),
        fetchNotificationHistory(),
      ]);
      setNotifications(notifsRes || []);
      setHistoryLogs(historyRes || []);
    } catch (err) {
      console.warn("Failed to load notifications data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markPlacementNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (id === "all" || n.id === id ? { ...n, unread: false } : n))
      );
      toast.success(id === "all" ? "All notifications marked as read" : "Marked as read");
    } catch (err: any) {
      toast.error("Failed to update notification state");
    }
  };

  const categories = ["All", "Drive", "Interview", "Offer", "Deadline", "Resume"];

  const filteredNotifications = notifications.filter(
    (n) => filterType === "All" || n.type.toLowerCase() === filterType.toLowerCase()
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Communication Center 🔔"
        desc="Manage recruitment announcements, Outlook & College Email alerts, read status tracking, and dispatch history."
        actions={
          <button
            onClick={() => handleMarkRead("all")}
            disabled={unreadCount === 0}
            className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition disabled:opacity-50"
          >
            <CheckCheck className="size-4" /> Mark All as Read
          </button>
        }
      />

      {/* Main Tabs */}
      <div className="flex border-b gap-4">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "inbox"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="size-4" /> Alerts Inbox ({unreadCount} unread)
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="size-4" /> Dispatch History & Audit Log
        </button>
      </div>

      {activeTab === "inbox" && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 grid place-items-center font-bold">
                <Bell className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">In-App & Email Alerts</h3>
                <p className="text-xs text-muted-foreground">{unreadCount} unread notifications</p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="size-4 text-muted-foreground shrink-0 ml-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterType(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    filterType === cat
                      ? "bg-gradient-primary text-white shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading alerts inbox...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="size-12 text-muted-foreground/40 mb-3" />
              <h4 className="font-bold text-base">No Notifications Found</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                You are all caught up! No alerts match your selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => notif.unread && handleMarkRead(notif.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer hover:shadow-sm ${
                    notif.unread
                      ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                      : "bg-background/40 hover:bg-accent/40"
                  }`}
                >
                  <div className={`size-3 rounded-full shrink-0 mt-1.5 ${notif.unread ? "bg-blue-600 animate-pulse" : "bg-muted"}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm ${notif.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                        {notif.title}
                      </span>
                      <Badge tone={notif.type === "Offer" ? "success" : notif.type === "Deadline" ? "warn" : "info"} className="text-[10px] shrink-0">
                        {notif.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <div>
              <h3 className="font-bold text-base">Dispatch History Log</h3>
              <p className="text-xs text-muted-foreground">Audit trail of recruitment announcements sent to eligible candidates.</p>
            </div>
            <Badge tone="info">Strict Eligibility Filter Active</Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading notification history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Title & Announcement</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company & Role</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Channels</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Eligible Recipients</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Sent Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-accent/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-foreground">{log.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">ID: {log.id}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <div>{log.company}</div>
                        <div className="text-muted-foreground text-[10px]">{log.role}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {log.channels.map((ch) => (
                            <Badge key={ch} tone={ch === "Outlook" ? "info" : ch === "College Email" ? "success" : "warn"} className="text-[9px]">
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-600">{log.eligible_count}</span>
                        <span className="text-muted-foreground text-[10px]"> / {log.total_students} students</span>
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
