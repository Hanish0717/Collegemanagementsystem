import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Paperclip, Send, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function ParentCommunication() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        let dbData: any = null;
        const cached = localStorage.getItem("cms_parent_child_data");
        if (cached) {
          dbData = JSON.parse(cached);
        } else {
          const res = await api.get("/api/parent-module/student-data");
          if (res.data?.success && res.data?.data) {
            dbData = res.data.data;
            localStorage.setItem("cms_parent_child_data", JSON.stringify(dbData));
          }
        }
        if (dbData && dbData.notifications) {
          setAnnouncements(dbData.notifications);
        }
      } catch (err) {
        console.error("Error loading parent announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !subject || !message) {
      alert("Please fill in all fields.");
      return;
    }
    alert(`Message successfully sent to ${selectedTeacher}! We will notify you when they reply.`);
    setSubject("");
    setMessage("");
    setSelectedTeacher("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Communication" desc="Loading communications..." />
        <div className="p-8 text-center text-muted-foreground">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication"
        desc="Communicate with teachers, view school announcements, and manage parent-teacher meetings."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Announcements",
            value: announcements.length.toString(),
            tone: "info" as const,
          },
          { label: "Unread Alerts", value: announcements.filter(a => a.unread).length.toString(), tone: "warn" as const },
          { label: "Active Threads", value: "0", tone: "success" as const },
          { label: "Meetings Today", value: "0", tone: "info" as const },
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

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-indigo" />
            <h3 className="font-semibold">Recent Alerts & Communications</h3>
          </div>
          <div className="space-y-2">
            {announcements.length > 0 ? (
              announcements.slice(0, 5).map((comm, idx) => (
                <div
                  key={comm.id || idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${comm.unread ? "bg-blue-50/50 border-blue-200" : ""}`}
                >
                  <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {comm.type ? comm.type.slice(0, 2) : "AL"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{comm.type || "Alert"}</span>
                      {comm.unread && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{comm.title}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{comm.time || "Recent"}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No teacher communications found.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Send Message to Faculty</h3>
          <form onSubmit={handleSendMessage} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select Teacher</option>
              {["Dr. Rajesh Kumar", "Prof. Emily Chen", "Dr. Marco Rossi"].map(
                (t) => (
                  <option key={t} value={t}>{t}</option>
                ),
              )}
            </select>
            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
            <textarea
              placeholder="Type your message..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              required
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Paperclip className="size-4 text-muted-foreground" />
                <span className="text-sm">Attach file</span>
              </label>
              <input type="file" className="text-sm" />
            </div>
            <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Send className="size-4" /> Send Message
            </button>
          </form>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">School Announcements</h3>
        </div>
        <div className="space-y-2">
          {announcements.length > 0 ? (
            announcements.map((announcement, idx) => (
              <div
                key={announcement.id || idx}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center">
                  <Users className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{announcement.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {announcement.type} • {announcement.time || "Recent"}
                  </div>
                </div>
                <Badge tone="info">{announcement.type}</Badge>
              </div>
            ))
          ) : (
            <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
              No school announcements available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
