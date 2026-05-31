import { useState } from "react";
import { AlertCircle, Clock, BookMarked, DollarSign, Plus, Archive, Send } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchIssuedBooks,
  fetchLibraryNotifications,
  createLibraryNotification,
  markNotificationAsRead,
  archiveLibraryNotification,
  fetchLibrarySettings,
  updateLibrarySettings,
  LibrarySetting
} from "@/services/libraryService";
import { toast } from "sonner";

interface NotifItem {
  id: string;
  title: string;
  time: string;
  type: string;
  unread: boolean;
  urgency: "high" | "medium" | "low";
}

export function LibrarianNotifications() {
  const { data: issuedBooks, isLoading: isIssuedLoading } = useQuery({
    queryKey: ["allIssuedBooks"],
    queryFn: () => fetchIssuedBooks(),
  });

  const { data: dbNotifications, isLoading: isNotifsLoading, refetch: refetchNotifs } = useQuery({
    queryKey: ["libraryNotifications"],
    queryFn: () => fetchLibraryNotifications(),
  });

  const { data: dbSettings, refetch: refetchSettings } = useQuery({
    queryKey: ["librarySettings"],
    queryFn: () => fetchLibrarySettings(),
  });

  const [filterType, setFilterType] = useState("All");
  const [archivedCount, setArchivedCount] = useState(0);
  const [archivedOverdueIds, setArchivedOverdueIds] = useState<string[]>([]);

  // New Notification Form state
  const [notifType, setNotifType] = useState("DueReminder");
  const [notifTemplate, setNotifTemplate] = useState("default");
  const [notifSubject, setNotifSubject] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  const addNotifMutation = useMutation({
    mutationFn: (payload: { title: string; message: string; type: string; urgency: string }) =>
      createLibraryNotification(payload),
    onSuccess: () => {
      toast.success("Broadcast alert dispatched to all active members successfully!");
      setNotifSubject("");
      setNotifMessage("");
      setNotifTemplate("default");
      refetchNotifs();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to dispatch notification");
    },
  });

  const isSending = addNotifMutation.isPending;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      toast.success("Notification marked as read.");
      refetchNotifs();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to mark read");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveLibraryNotification(id),
    onSuccess: () => {
      toast.success("Notification successfully archived.");
      refetchNotifs();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to archive notification");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: LibrarySetting[]) => updateLibrarySettings(updatedSettings),
    onSuccess: () => {
      toast.success("Updated preferences successfully!");
      refetchSettings();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update settings");
    },
  });

  // Load database notifications (overdues)
  const overdueAlerts: NotifItem[] = (issuedBooks || [])
    .filter((issue) => issue.status === "overdue")
    .map((issue) => ({
      id: `db-od-${issue._id}`,
      title: `Book '${
        typeof issue.book === "object" && issue.book ? issue.book.title : "Resource"
      }' is overdue from student ${
        typeof issue.student === "object" && issue.student ? issue.student.fullName : ""
      }`,
      time: issue.dueDate ? `Due since ${new Date(issue.dueDate).toLocaleDateString()}` : "Overdue",
      type: "Overdue",
      unread: true,
      urgency: "high",
    }));

  const broadcastAlerts: NotifItem[] = (dbNotifications || []).map((n) => ({
    id: n.id,
    title: n.title,
    time: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recently",
    type: n.type,
    unread: n.unread,
    urgency: n.urgency as "high" | "medium" | "low",
  }));

  const notifications = [
    ...overdueAlerts.filter((o) => !archivedOverdueIds.includes(o.id)),
    ...broadcastAlerts,
  ];

  const settings = dbSettings || [
    { title: "Due Date Reminders", enabled: true, desc: "Get notified when books are due within 3 days" },
    { title: "Overdue Alerts", enabled: true, desc: "Critical alerts for overdue books" },
    { title: "New Arrivals", enabled: true, desc: "Notify about newly added books" },
    { title: "Fine Reminders", enabled: true, desc: "Payment reminders for pending fines" },
    { title: "System Updates", enabled: false, desc: "Maintenance and system notifications" },
  ];

  const notificationTypes = {
    DueReminder: { label: "Due Reminders", icon: Clock, color: "from-amber-500" },
    Overdue: { label: "Overdue Alerts", icon: AlertCircle, color: "from-rose-500" },
    NewArrival: { label: "New Arrivals", icon: BookMarked, color: "from-emerald-500" },
    FinePayment: { label: "Fine Payments", icon: DollarSign, color: "from-cyan-500" },
    SystemNotification: { label: "System Announcements", icon: Plus, color: "from-violet-500" },
  };

  const templates = {
    default: { subject: "", message: "" },
    due: {
      subject: "Reminder: Library Book Return Due Date",
      message:
        "Hello Student, this is a reminder that the library book currently issued to you is due for return within the next 48 hours. Please avoid penalty charges by returning it on time.",
    },
    overdue: {
      subject: "URGENT: Library Book Return Overdue Notice",
      message:
        "Attention, the library book issued to your card has exceeded its due date. Please return the resource to the counter immediately to clear your status.",
    },
    newBook: {
      subject: "New Catalog Resource Added to Central Library",
      message:
        "Greetings, we have successfully expanded our physical catalog with new books. Stop by the department shelves to check out our latest publications.",
    },
  };

  const handleTemplateChange = (val: string) => {
    setNotifTemplate(val);
    if (val === "default") {
      setNotifSubject("");
      setNotifMessage("");
    } else {
      const selectedTpl = templates[val as keyof typeof templates];
      setNotifSubject(selectedTpl.subject);
      setNotifMessage(selectedTpl.message);
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifSubject.trim() || !notifMessage.trim()) {
      toast.error("Please fill in both the Subject and Message body.");
      return;
    }

    addNotifMutation.mutate({
      title: notifSubject,
      message: notifMessage,
      type: notifType,
      urgency: notifType === "Overdue" ? "high" : notifType === "DueReminder" ? "medium" : "low",
    });
  };

  const handleMarkRead = (id: string) => {
    if (id.startsWith("db-od-")) {
      toast.success("Overdue notices cannot be marked read directly.");
    } else {
      markReadMutation.mutate(id);
    }
  };

  const handleArchive = (id: string) => {
    if (id.startsWith("db-od-")) {
      setArchivedOverdueIds((prev) => [...prev, id]);
      setArchivedCount((prev) => prev + 1);
      toast.success("Notification successfully archived.");
    } else {
      archiveMutation.mutate(id);
      setArchivedCount((prev) => prev + 1);
    }
  };

  const handleToggleSetting = (index: number) => {
    const updated = [...settings];
    updated[index].enabled = !updated[index].enabled;
    updateSettingsMutation.mutate(updated);
  };

  const filteredNotifications =
    filterType === "All" ? notifications : notifications.filter((n) => n.type === filterType);

  const isLoading = isIssuedLoading || isNotifsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader title="Notifications" desc="Library alerts, reminders and system notifications." />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Notifications"
        desc="Library alerts, reminders and system notifications."
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">
              {notifications.filter((n) => n.unread).length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Unread Alerts</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">
              {notifications.filter((n) => n.urgency === "high").length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">High Priority Alerts</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient">{archivedCount}</div>
            <div className="text-xs text-muted-foreground mt-2">Archived Cards</div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Dispatch Panel */}
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">Dispatch Custom Alert</h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Alert Category
                  </label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    {Object.entries(notificationTypes).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Prebuilt Template
                  </label>
                  <select
                    value={notifTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    <option value="default">No template (Custom text)</option>
                    <option value="due">Book Due Date Notice</option>
                    <option value="overdue">Overdue Notice</option>
                    <option value="newBook">New Catalog Arrivals Announcement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Subject / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return reminder details..."
                  value={notifSubject}
                  onChange={(e) => setNotifSubject(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Message Body *
                </label>
                <textarea
                  required
                  placeholder="Type broadcast text body here..."
                  rows={4}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !notifSubject.trim() || !notifMessage.trim()}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
              >
                {isSending ? (
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {isSending ? "Dispatching..." : "Send BroadCast Notification"}
              </button>
            </form>
          </Card>

          {/* Filter Tabs */}
          <Card>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                "All",
                "DueReminder",
                "Overdue",
                "NewArrival",
                "FinePayment",
                "SystemNotification",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                    filterType === type
                      ? "bg-gradient-primary text-white"
                      : "bg-background border text-muted-foreground hover:border-primary"
                  }`}
                >
                  {type === "All"
                    ? "All Alerts"
                    : notificationTypes[type as keyof typeof notificationTypes]?.label || type}
                </button>
              ))}
            </div>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="text-center py-8 text-muted-foreground">
                No active notifications found.
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const typeInfo =
                  notificationTypes[notification.type as keyof typeof notificationTypes];
                const IconComponent = typeInfo?.icon || AlertCircle;

                return (
                  <Card
                    key={notification.id}
                    className={`border-l-4 relative ${
                      notification.urgency === "high"
                        ? "border-l-rose-500"
                        : notification.urgency === "medium"
                          ? "border-l-amber-500"
                          : "border-l-emerald-500"
                    } hover:-translate-x-1 transition`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`size-12 rounded-xl bg-gradient-to-br ${typeInfo?.color || "from-slate-500"} to-transparent text-white grid place-items-center shrink-0`}
                      >
                        <IconComponent className="size-5" />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-snug">{notification.title}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>

                    {/* Action Buttons and Badge - Unified Container */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 sm:gap-2 border-t pt-3">
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={!notification.unread}
                        className="px-3 py-1.5 rounded-lg text-xs border text-muted-foreground hover:bg-gradient-soft transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                      >
                        {notification.unread ? "Mark Read" : "Read"}
                      </button>

                      {/* Badge + Status Indicator - Right aligned */}
                      <div className="flex items-center gap-2 shrink-0">
                        {notification.unread && (
                          <div className="size-2 rounded-full bg-gradient-primary" />
                        )}
                        <Badge
                          tone={
                            notification.urgency === "high"
                              ? "danger"
                              : notification.urgency === "medium"
                                ? "warn"
                                : "success"
                          }
                        >
                          {notification.urgency}
                        </Badge>
                        <button
                          onClick={() => handleArchive(notification.id)}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-rose-100 transition shrink-0 ml-1 cursor-pointer"
                        >
                          <Archive className="size-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <h3 className="font-semibold mb-4 text-gradient">Channel Preferences</h3>
            <div className="space-y-4">
              {settings.map((setting, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-soft transition"
                >
                  <div className="pr-2">
                    <div className="font-semibold text-xs leading-snug">{setting.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{setting.desc}</div>
                  </div>
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={() => handleToggleSetting(i)}
                      className="rounded accent-violet-600 size-4 cursor-pointer"
                    />
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Categories Info */}
          <Card>
            <h3 className="font-semibold mb-3">Audience Outreach</h3>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="p-2 bg-gradient-soft border rounded-lg">
                <div className="font-medium text-foreground">📅 Due Reminder Digests</div>
                <p className="mt-0.5">
                  Automated notice dispatched 48 hours prior to borrow expiration.
                </p>
              </div>
              <div className="p-2 bg-gradient-soft border rounded-lg">
                <div className="font-medium text-foreground">⚠️ Overdue Escalation Rules</div>
                <p className="mt-0.5">
                  Fines begin tracking immediately at ₹5/day after due date has passed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
