import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  MessageSquare,
  Plus,
  Send,
  Smartphone,
  Inbox,
  Bell,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  Users,
  Wallet,
  Building2,
  Bus,
  Briefcase,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  fetchBroadcasts,
  createBroadcast,
  fetchAudienceCounts,
  type AdminNotification,
  type BroadcastNotification
} from "@/services/adminService";

export const notificationTemplates = [
  {
    name: "Fee Reminder",
    type: "Email",
    subject: "Fee Payment Reminder",
    content: "Dear student, your fee payment is due on {date}. Please ensure timely payment.",
  },
  {
    name: "Attendance Warning",
    type: "SMS",
    subject: "Low Attendance Alert",
    content: "Your attendance is below 75%. Please attend classes regularly.",
  },
  {
    name: "Event Announcement",
    type: "WhatsApp",
    subject: "Upcoming Event",
    content: "Join us for {event} on {date}. Register now!",
  },
];

export function AdminNotifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"inbox" | "broadcasting">("inbox");

  // Operational Inbox Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("Unread"); // Default to Unread so read notifications vanish!

  // Broadcasting Form State
  const [broadcastType, setBroadcastType] = useState<"Email" | "SMS" | "WhatsApp">("Email");
  const [subject, setSubject] = useState("");
  const [audienceType, setAudienceType] = useState("All Students");
  const [message, setMessage] = useState("");

  // Queries
  const {
    data: notifications = [],
    isLoading: isNotifsLoading,
    isError: isNotifsError,
    error: notifsError,
  } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: fetchAdminNotifications,
  });

  const {
    data: broadcasts = [],
    isLoading: isBroadcastsLoading,
  } = useQuery({
    queryKey: ["adminBroadcasts"],
    queryFn: fetchBroadcasts,
    enabled: activeTab === "broadcasting",
  });

  const {
    data: audienceCounts,
  } = useQuery({
    queryKey: ["adminAudienceCounts"],
    queryFn: fetchAudienceCounts,
    enabled: activeTab === "broadcasting",
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAdminNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      toast.success("Notification marked as read");
    },
    onError: () => toast.error("Failed to mark notification as read"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAdminNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (id: string) => deleteAdminNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      toast.success("Notification deleted");
    },
    onError: () => toast.error("Failed to delete notification"),
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: (payload: { title: string; type: string; audience: string; content: string }) =>
      createBroadcast(payload),
    onSuccess: (newBroadcast) => {
      queryClient.invalidateQueries({ queryKey: ["adminBroadcasts"] });
      toast.success(`Broadcast sent via ${newBroadcast.type}!`);
      setSubject("");
      setMessage("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to send broadcast");
    },
  });

  // Categories list for Operational Inbox
  const categories = [
    { name: "Academic", icon: BookOpen, tone: "info" as const },
    { name: "Students", icon: Users, tone: "success" as const },
    { name: "Faculty", icon: Users, tone: "info" as const },
    { name: "Fees", icon: Wallet, tone: "warn" as const },
    { name: "Hostel", icon: Building2, tone: "warn" as const },
    { name: "Transport", icon: Bus, tone: "info" as const },
    { name: "Placement", icon: Briefcase, tone: "success" as const },
    { name: "Library", icon: BookOpen, tone: "info" as const },
  ];

  // Dynamic calculations for unread counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.name] = notifications.filter(
        (n) => n.category === cat.name && n.unread
      ).length;
    });
    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || n.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Unread" && n.unread) ||
        (selectedStatus === "Read" && !n.unread);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [notifications, search, selectedCategory, selectedStatus]);

  // Dynamic Broadcast Stats from Database
  const stats = useMemo(() => {
    const total = broadcasts.length;
    const email = broadcasts.filter((b) => b.type === "Email").length;
    const sms = broadcasts.filter((b) => b.type === "SMS").length;
    const whatsapp = broadcasts.filter((b) => b.type === "WhatsApp").length;
    return [
      { label: "Total Sent", value: total, tone: "success" as const },
      { label: "Email Sent", value: email, tone: "info" as const },
      { label: "SMS Sent", value: sms, tone: "info" as const },
      { label: "WhatsApp Sent", value: whatsapp, tone: "info" as const },
    ];
  }, [broadcasts]);

  // Handler for Template Select
  const handleSelectTemplate = (templateName: string) => {
    const template = notificationTemplates.find((t) => t.name === templateName);
    if (template) {
      setSubject(template.subject);
      setMessage(template.content);
      setBroadcastType(template.type as any);
    }
  };

  // Handler for Send Broadcast Form Submit
  const handleSendBroadcast = () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject line");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter message content");
      return;
    }

    sendBroadcastMutation.mutate({
      title: subject,
      type: broadcastType,
      audience: audienceType,
      content: message,
    });
  };

  const unreadTotal = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeTab === "inbox" ? "Notifications Feed" : "Notification Broadcasting"}
        desc={
          activeTab === "inbox"
            ? "Real-time updates and operational alerts from academic, hostel, library, and other modules."
            : "Send broadcast notifications via email, SMS and WhatsApp to students, faculty and staff."
        }
        actions={
          activeTab === "inbox" ? (
            <button
              onClick={() => setActiveTab("broadcasting")}
              className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2"
            >
              <Plus className="size-4" /> New Broadcast
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("inbox")}
              className="px-4 py-2.5 rounded-xl border text-sm hover:bg-accent transition flex items-center gap-2"
            >
              <Inbox className="size-4" /> Back to Inbox
            </button>
          )
        }
      />

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 pb-2 text-sm font-semibold transition border-b-2 px-1 ${
            activeTab === "inbox"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Inbox className="size-4" />
          Operational Inbox
          {unreadTotal > 0 && (
            <span className="size-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadTotal}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("broadcasting")}
          className={`flex items-center gap-2 pb-2 text-sm font-semibold transition border-b-2 px-1 ${
            activeTab === "broadcasting"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="size-4" />
          Broadcasting Control
        </button>
      </div>

      {activeTab === "inbox" ? (
        /* ================= OPERATIONAL INBOX ================= */
        <div className="space-y-6">
          {/* Category Counts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = categoryCounts[cat.name] || 0;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? "All" : cat.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                    isSelected
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-card hover:bg-accent/40"
                  }`}
                >
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <span className="text-xs font-semibold mt-2 truncate w-full">{cat.name}</span>
                  {count > 0 && (
                    <Badge tone={cat.tone} className="mt-1 text-[10px] px-1.5 py-0">
                      {count} unread
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters Bar */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search operational alerts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border bg-background/60 px-4 py-2 text-sm cursor-pointer outline-none focus:border-primary"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border bg-background/60 px-4 py-2 text-sm cursor-pointer outline-none focus:border-primary"
              >
                <option value="All">All Status</option>
                <option value="Unread">Unread (Default)</option>
                <option value="Read">Read</option>
              </select>
            </div>
          </Card>

          {/* Inbox Feed Card */}
          <Card>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                Operational Alerts Feed
                {filteredNotifications.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({filteredNotifications.length} items)
                  </span>
                )}
              </h3>
              {unreadTotal > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs text-primary hover:underline cursor-pointer disabled:opacity-50"
                >
                  {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
                </button>
              )}
            </div>

            {isNotifsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="size-8 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Loading operational alerts...</span>
              </div>
            ) : isNotifsError ? (
              <div className="py-12 text-center space-y-3">
                <AlertCircle className="size-8 mx-auto text-rose-500" />
                <p className="text-sm text-muted-foreground">
                  {notifsError instanceof Error ? notifsError.message : "Failed to load notifications."}
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {notifications.length === 0
                    ? "All clear! No operational notifications in the feed."
                    : "No alerts match your search or filter settings."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((n) => {
                  const catConfig = categories.find((c) => c.name === n.category);
                  const Icon = catConfig?.icon || Bell;
                  const tone = catConfig?.tone || "info";

                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.unread) markReadMutation.mutate(n.id);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border hover:bg-accent/40 transition cursor-pointer ${
                        n.unread ? "bg-indigo-500/5 border-indigo-500/20" : ""
                      }`}
                    >
                      <div
                        className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                          n.unread ? "bg-gradient-primary text-white" : "bg-accent text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-medium truncate ${n.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {n.unread && (
                              <span className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                            )}
                            <Badge tone={tone}>{n.category}</Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotifMutation.mutate(n.id);
                              }}
                              disabled={deleteNotifMutation.isPending}
                              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                              title="Delete Alert"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {n.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* ================= BROADCASTING CONTROL ================= */
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <Badge tone={stat.tone} className="mt-3">
                  All Time
                </Badge>
              </Card>
            ))}
          </div>

          {/* Form Composer Card */}
          <Card>
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
              <button
                onClick={() => setBroadcastType("Email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                  broadcastType === "Email"
                    ? "bg-gradient-primary text-white"
                    : "border hover:bg-accent"
                }`}
              >
                <Mail className="size-4" /> Email
              </button>
              <button
                onClick={() => setBroadcastType("SMS")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                  broadcastType === "SMS"
                    ? "bg-gradient-primary text-white"
                    : "border hover:bg-accent"
                }`}
              >
                <Smartphone className="size-4" /> SMS
              </button>
              <button
                onClick={() => setBroadcastType("WhatsApp")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                  broadcastType === "WhatsApp"
                    ? "bg-gradient-primary text-white"
                    : "border hover:bg-accent"
                }`}
              >
                <MessageSquare className="size-4" /> WhatsApp
              </button>
            </div>

            <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  placeholder="Subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary outline-none"
                />
                <select
                  value={audienceType}
                  onChange={(e) => setAudienceType(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="All Students">All Students</option>
                  <option value="All Faculty">All Faculty</option>
                  <option value="Computer Science Dept">Computer Science Dept</option>
                  <option value="Electronics Dept">Electronics Dept</option>
                  <option value="Mechanical Dept">Mechanical Dept</option>
                  <option value="Civil Dept">Civil Dept</option>
                </select>
              </div>

              <select
                onChange={(e) => handleSelectTemplate(e.target.value)}
                defaultValue=""
                className="rounded-lg border bg-background px-3 py-2 text-sm w-full outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Select a template...
                </option>
                {notificationTemplates.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Message content..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="schedule" className="rounded" />
                  <label htmlFor="schedule" className="text-sm">
                    Schedule for later
                  </label>
                </div>
                <button
                  onClick={handleSendBroadcast}
                  disabled={sendBroadcastMutation.isPending}
                  className="px-6 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="size-4" />
                  {sendBroadcastMutation.isPending ? "Sending..." : "Send Now"}
                </button>
              </div>
            </div>
          </Card>

          {/* Double Column Info panels */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold mb-4 text-base">Message Templates</h3>
              <div className="space-y-2">
                {notificationTemplates.map((template) => (
                  <div
                    key={template.name}
                    onClick={() => handleSelectTemplate(template.name)}
                    className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">{template.name}</div>
                      <Badge tone="info">{template.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{template.subject}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4 text-base">Audience Selection Counts</h3>
              <div className="space-y-3">
                {[
                  { label: "All Students", count: audienceCounts?.students ?? 0 },
                  { label: "All Faculty", count: audienceCounts?.faculty ?? 0 },
                  { label: "Computer Science Dept", count: audienceCounts?.departments?.CSE ?? 0 },
                  { label: "Electronics Dept", count: audienceCounts?.departments?.ECE ?? 0 },
                  { label: "Mechanical Dept", count: audienceCounts?.departments?.MECH ?? 0 },
                  { label: "Civil Dept", count: audienceCounts?.departments?.CIVIL ?? 0 },
                ].map((audience) => (
                  <label
                    key={audience.label}
                    onClick={() => setAudienceType(audience.label)}
                    className={`flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${
                      audienceType === audience.label ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="audienceSelectRadio"
                        checked={audienceType === audience.label}
                        onChange={() => {}}
                        className="rounded-full text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-foreground">{audience.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {audience.count}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Broadcasts List */}
          <Card>
            <h3 className="font-semibold mb-4 text-base">Recent Broadcasts</h3>
            {isBroadcastsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 text-primary animate-spin" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No recent broadcasts found in the database logs.
              </div>
            ) : (
              <div className="space-y-2">
                {broadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="flex items-center gap-4 p-3 rounded-xl border hover:bg-accent/40 transition"
                  >
                    <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                      {broadcast.type.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{broadcast.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {broadcast.audience} • {broadcast.time}
                      </div>
                    </div>
                    <Badge tone="success">{broadcast.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
