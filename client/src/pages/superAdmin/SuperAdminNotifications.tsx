import { createFileRoute } from "@tanstack/react-router";
import { Archive, Bell, CheckCircle, ShieldAlert, Wrench, Trash2, Check, Eye } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  toggleNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  saveNotificationCategories,
  NotificationItem
} from "@/services/superAdminService";
import { Skeleton } from "@/components/ui/skeleton";

const notificationTypes = [
  {
    title: "System Alerts",
    desc: "Platform health, uptime and service status messages.",
    icon: Bell,
    tone: "info" as const,
    key: "system",
  },
  {
    title: "Approval Notifications",
    desc: "Admin access, course changes and department approval requests.",
    icon: CheckCircle,
    tone: "warn" as const,
    key: "approval",
  },
  {
    title: "Security Warnings",
    desc: "Failed login attempts, suspicious sessions and audit warnings.",
    icon: ShieldAlert,
    tone: "danger" as const,
    key: "security",
  },
  {
    title: "Maintenance Notifications",
    desc: "Planned maintenance windows and service updates.",
    icon: Wrench,
    tone: "info" as const,
    key: "maintenance",
  },
  {
    title: "Automation Alerts",
    desc: "Automation runs, trigger failures and workflow delivery reports.",
    icon: Archive,
    tone: "success" as const,
    key: "automation",
  },
];

export function SuperAdminNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["superAdminNotifications"],
    queryFn: fetchNotifications,
  });

  const feed = data?.feed || [];
  const categories = (data?.categories as any) || {
    system: true,
    approval: true,
    security: true,
    maintenance: true,
    automation: true,
  };

  const toggleReadMutation = useMutation({
    mutationFn: ({ id, unread }: { id: string; unread: boolean }) => toggleNotificationRead(id, unread),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["superAdminStats"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update notification");
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["superAdminStats"] });
      toast.success("All notifications marked as read");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to mark notifications read");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["superAdminStats"] });
      toast.success("Notification dismissed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to dismiss notification");
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["superAdminStats"] });
      toast.success("Notification feed cleared");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to clear notifications");
    }
  });

  const saveCatsMutation = useMutation({
    mutationFn: saveNotificationCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminNotifications"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to save category preference");
    }
  });

  const handleToggleCategory = (key: string, title: string) => {
    const nextVal = !categories[key];
    const updated = { ...categories, [key]: nextVal };
    saveCatsMutation.mutate(updated);
    toast.success(`${title} notifications are now ${nextVal ? "enabled" : "muted"}`);
  };

  const handleDismiss = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleRead = (id: string, currentUnread: boolean) => {
    toggleReadMutation.mutate({ id, unread: !currentUnread });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      clearAllMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Notifications"
        desc="Review system alerts, approvals, security warnings, maintenance messages and automation alerts."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {notificationTypes.map((item) => {
          const isEnabled = categories[item.key] !== false;
          return (
            <Card
              key={item.title}
              onClick={() => handleToggleCategory(item.key, item.title)}
              className="hover:-translate-y-1 transition cursor-pointer relative group"
            >
              <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center mb-4">
                <item.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
              <Badge tone={isEnabled ? item.tone : "warn"} className="mt-4">
                {isEnabled ? "Enabled" : "Muted"}
              </Badge>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="font-semibold">Notification Feed</h3>
          <div className="flex gap-2">
            {feed.some((n) => n.unread) && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-accent flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Check className="size-3.5" /> Mark all read
              </button>
            )}
            {feed.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Trash2 className="size-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : feed.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              All caught up! No recent notifications found.
            </div>
          ) : (
            feed.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border hover:bg-accent/50 transition group ${notification.unread ? "bg-indigo-50/40 border-indigo-200 dark:bg-indigo-950/10 dark:border-indigo-950/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {notification.unread && <span className="size-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />}
                      {notification.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{notification.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleRead(notification.id, notification.unread)}
                        disabled={toggleReadMutation.isPending}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition disabled:opacity-50"
                        title={notification.unread ? "Mark as Read" : "Mark as Unread"}
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition disabled:opacity-50"
                        title="Dismiss Notification"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
