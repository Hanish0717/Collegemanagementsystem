import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Filter, Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchFacultyNotifications,
  markFacultyNotificationRead,
  markAllFacultyNotificationsRead,
  fetchFacultyNotificationSettings,
  updateFacultyNotificationSetting,
  type FacultyNotification,
  type FacultyNotificationSetting,
} from "@/services/facultyService";

export function FacultyNotifications() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<"All" | "Unread" | "High" | "Medium" | "Low">("All");

  // Queries
  const {
    data: notifications = [],
    isLoading: isNotifsLoading,
    isError: isNotifsError,
    error: notifsError,
  } = useQuery({
    queryKey: ["facultyNotifications"],
    queryFn: fetchFacultyNotifications,
  });

  const {
    data: settings = [],
    isLoading: isSettingsLoading,
  } = useQuery({
    queryKey: ["facultyNotificationSettings"],
    queryFn: fetchFacultyNotificationSettings,
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markFacultyNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facultyNotifications"] });
      toast.success("Notification marked as read");
    },
    onError: () => toast.error("Failed to mark notification as read"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllFacultyNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facultyNotifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateFacultyNotificationSetting(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facultyNotificationSettings"] });
      toast.success("Notification preference updated");
    },
    onError: () => toast.error("Failed to update notification setting"),
  });

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => n.unread);
  }, [notifications]);

  // Filters setup
  const filters = [
    { label: "All", value: "All" as const },
    { label: "Unread", value: "Unread" as const },
    { label: "High Priority", value: "High" as const },
    { label: "Medium Priority", value: "Medium" as const },
    { label: "Low Priority", value: "Low" as const },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return n.unread;
      if (activeFilter === "High") return n.priority === "High";
      if (activeFilter === "Medium") return n.priority === "Medium";
      if (activeFilter === "Low") return n.priority === "Low";
      return true;
    });
  }, [notifications, activeFilter]);

  // Calculate dynamic category counts
  const categorySummary = useMemo(() => {
    const categories = ["Assignment", "Class", "Meeting", "System"];
    return categories.map((cat) => {
      const catNotifs = notifications.filter((n) => n.type === cat);
      return {
        category: cat,
        count: catNotifs.length,
        unread: catNotifs.filter((n) => n.unread).length,
      };
    });
  }, [notifications]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        desc="View and manage notifications for assignments, classes, meetings, and system updates."
      />

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Notifications",
            value: notifications.length.toString(),
            tone: "info" as const,
          },
          {
            label: "Unread",
            value: unreadNotifications.length.toString(),
            tone: "warn" as const,
          },
          {
            label: "High Priority",
            value: unreadNotifications.filter((n) => n.priority === "High").length.toString(),
            tone: "danger" as const,
          },
          {
            label: "This Week",
            value: notifications.length.toString(),
            tone: "info" as const,
          },
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

      {/* Filters Card */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeFilter === f.value
                  ? "bg-gradient-primary text-white"
                  : "border hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent transition flex items-center gap-2 cursor-pointer">
            <Filter className="size-4" /> More Filters
          </button>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h3 className="font-semibold text-base">Notification Cards</h3>
          {unreadNotifications.length > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="text-sm text-primary hover:underline cursor-pointer disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {isNotifsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading notifications...</span>
          </div>
        ) : isNotifsError ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="size-8 mx-auto text-rose-500" />
            <p className="text-sm text-muted-foreground">
              {notifsError instanceof Error ? notifsError.message : "Failed to load notifications."}
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            All caught up! No notifications match the selected filter.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-xl border hover:bg-accent/50 transition ${
                  notification.unread
                    ? "bg-blue-50/50 border-blue-200/40 dark:bg-blue-950/20 dark:border-blue-800/30"
                    : "bg-card"
                }`}
              >
                {notification.unread ? (
                  <div className="size-2 rounded-full mt-2 shrink-0 bg-primary animate-pulse" />
                ) : (
                  <div className="size-2 rounded-full mt-2 shrink-0 bg-muted-foreground/30" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-sm ${notification.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </div>
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
                {notification.unread && (
                  <button
                    onClick={() => markReadMutation.mutate(notification.id)}
                    disabled={markReadMutation.isPending}
                    className="px-3 py-1.5 rounded-lg border text-xs hover:bg-accent transition flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Check className="size-3" /> Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Double Column Settings & Categories */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Settings Panel */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold text-base">Notification Settings</h3>
          </div>

          {isSettingsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-xl border"
                >
                  <span className="text-sm text-foreground">{setting.label}</span>
                  <button
                    onClick={() =>
                      updateSettingMutation.mutate({ id: setting.id, enabled: !setting.enabled })
                    }
                    disabled={updateSettingMutation.isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer disabled:opacity-50 ${
                      setting.enabled ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        setting.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Categories Summary Panel */}
        <Card>
          <h3 className="font-semibold mb-4 text-base">Notification Categories</h3>
          <div className="space-y-2">
            {categorySummary.map((item) => (
              <div
                key={item.category}
                onClick={() => {
                  if (item.category === "Assignment") setActiveFilter("All"); // Quick action
                }}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  {item.unread > 0 && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.count} total</span>
                  <Badge tone={item.unread > 0 ? "warn" : "info"}>{item.unread} unread</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
