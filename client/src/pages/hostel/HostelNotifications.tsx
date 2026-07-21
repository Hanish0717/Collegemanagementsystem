import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Search,
  Check,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Shield,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchSystemNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  fetchHostelFees,
} from "@/services/hostelService";

export function HostelNotifications() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedPriority, setSelectedPriority] = useState("All Priority");
  const [selectedStatus, setSelectedStatus] = useState("Unread");

  // Queries
  const {
    data: notificationsList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchSystemNotifications,
  });

  const { data: feesList = [] } = useQuery({
    queryKey: ["fees-lookup"],
    queryFn: () => fetchHostelFees({ status: "Pending" }),
  });

  // Mutations
  const readMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      toast.success("All notifications marked as read!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      toast.success("Notification deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete notification");
    },
  });

  // Filters mapping
  const filteredNotifications = useMemo(() => {
    return notificationsList.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = selectedType === "All Types" || n.type === selectedType || (selectedType === "Emergency" && n.type === "Alert");

      // In db we don't have explicit priority, we map based on type or let it match all
      const matchesPriority = selectedPriority === "All Priority" || 
        (selectedPriority === "High" && (n.type === "Alert" || n.type === "Emergency")) ||
        (selectedPriority === "Medium" && n.type === "Maintenance") ||
        (selectedPriority === "Low" && n.type === "Info");

      const matchesStatus = selectedStatus === "All Status" || 
        (selectedStatus === "Unread" && n.unread) || 
        (selectedStatus === "Read" && !n.unread);

      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });
  }, [notificationsList, search, selectedType, selectedPriority, selectedStatus]);

  // Counts
  const totalCount = notificationsList.length;
  const unreadCount = notificationsList.filter((n) => n.unread).length;
  const highPriorityCount = notificationsList.filter((n) => n.type === "Alert" || n.type === "Emergency").length;
  const thisWeekCount = notificationsList.filter((n) => {
    if (!n.created_at) return false;
    const diff = Date.now() - new Date(n.created_at).getTime();
    return diff < 7 * 24 * 3600 * 1000;
  }).length;

  const typeCounts = useMemo(() => {
    const counts = { Fee: 0, Complaint: 0, Policy: 0, Mess: 0, Emergency: 0 };
    notificationsList.forEach((n) => {
      if (n.type === "Fee") counts.Fee++;
      else if (n.type === "Complaint") counts.Complaint++;
      else if (n.type === "Policy") counts.Policy++;
      else if (n.type === "Mess") counts.Mess++;
      else if (n.type === "Alert" || n.type === "Emergency") counts.Emergency++;
    });
    return counts;
  }, [notificationsList]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        desc="Manage hostel announcements, fee reminders, and alerts."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Notifications", value: String(totalCount), tone: "info" as const },
          { label: "Unread", value: String(unreadCount), tone: "warn" as const },
          { label: "High Priority", value: String(highPriorityCount), tone: "danger" as const },
          { label: "This Week", value: String(thisWeekCount), tone: "success" as const },
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
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Types", "Fee", "Complaint", "Policy", "Mess", "Emergency"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Priority", "High", "Medium", "Low"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Status", "Unread", "Read"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                className="text-xs text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading notifications...</span>
            </div>
          ) : isError ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
              <AlertCircle className="size-8 mx-auto text-rose-500" />
              <p>{error instanceof Error ? error.message : "Failed to load notifications."}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground">
              No notifications found matching the criteria.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const isHigh = notification.type === "Alert" || notification.type === "Emergency";
                const isMed = notification.type === "Maintenance" || notification.type === "Complaint";
                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (notification.unread) {
                        readMutation.mutate(notification.id);
                      }
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${notification.unread ? "bg-indigo/5 border-indigo/20" : ""}`}
                  >
                    <div
                      className={`size-10 rounded-lg ${isHigh ? "bg-gradient-primary" : isMed ? "bg-gradient-violet" : "bg-gradient-cyan"} text-white grid place-items-center shrink-0`}
                    >
                      {notification.type === "Fee" && <DollarSign className="size-4" />}
                      {notification.type === "Complaint" && <MessageSquare className="size-4" />}
                      {notification.type === "Policy" && <Shield className="size-4" />}
                      {notification.type === "Mess" && <Bell className="size-4" />}
                      {notification.type === "Alert" && <AlertTriangle className="size-4" />}
                      {notification.type === "Emergency" && <AlertTriangle className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{notification.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge tone={isHigh ? "danger" : isMed ? "warn" : "success"}>
                            {isHigh ? "High" : isMed ? "Medium" : "Low"}
                          </Badge>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(notification.id);
                            }}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                            title="Delete notification"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {notification.type} • {notification.time || "Recently"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Types</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Fee Reminders", count: typeCounts.Fee, icon: DollarSign, value: "Fee" },
              { label: "Complaint Updates", count: typeCounts.Complaint, icon: MessageSquare, value: "Complaint" },
              { label: "Policy Changes", count: typeCounts.Policy, icon: Shield, value: "Policy" },
              { label: "Mess Alerts", count: typeCounts.Mess, icon: Bell, value: "Mess" },
              { label: "Emergency", count: typeCounts.Emergency, icon: AlertTriangle, value: "Emergency" },
            ].map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSelectedType(filter.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${selectedType === filter.value ? "bg-accent/60 border-primary" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <filter.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{filter.label}</span>
                </div>
                <Badge tone="info">{filter.count}</Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold">Pending Fee Reminders</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {feesList.slice(0, 3).map((reminder) => (
              <div
                key={reminder.id}
                className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{reminder.studentName}</div>
                    <div className="text-xs text-muted-foreground">Due: {reminder.dueDate}</div>
                  </div>
                  <Badge tone="danger">Pending</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Amount: {reminder.feeAmount}</div>
              </div>
            ))}
            {feesList.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No pending fee collections
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-indigo" />
            <h3 className="font-semibold">Recent Alerts</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notificationsList
              .filter((n) => n.type === "Alert" || n.type === "Emergency")
              .slice(0, 3)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl border bg-rose-500/5 border-rose-500/10 hover:bg-accent/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-rose-600">{alert.title}</div>
                      <div className="text-xs text-muted-foreground">{alert.time || "Recently"}</div>
                    </div>
                    <Badge tone="danger">Alert</Badge>
                  </div>
                </div>
              ))}
            {notificationsList.filter((n) => n.type === "Alert" || n.type === "Emergency").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No recent alert alerts
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="size-5 text-indigo" />
          <h3 className="font-semibold">Announcements & Notifications History</h3>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notificationsList.slice(0, 5).map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
            >
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center">
                <Bell className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{announcement.title}</div>
                <div className="text-xs text-muted-foreground">
                  {announcement.type} • {announcement.time || "Recently"}
                </div>
              </div>
              <Badge tone="info">{announcement.type}</Badge>
            </div>
          ))}
          {notificationsList.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No history logs available
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
