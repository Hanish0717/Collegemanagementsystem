import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Plus, Play, Video } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { onlineClasses } from "@/mock/facultyData";
import api from "@/lib/api";

export function FacultyClasses() {
  const [classes, setClasses] = useState<any[]>(onlineClasses);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Data Structures");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [platform, setPlatform] = useState("Google Meet");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/api/faculty-module/classes");
        if (res.data?.success && res.data?.data) {
          const dbClasses = res.data.data.map((c: any, index: number) => ({
            id: c._id || String(index),
            title: `${c.subject} Class (Sec ${c.section || 'A'})`,
            subject: c.subject,
            date: c.day || "Monday",
            time: c.time,
            status: "Scheduled"
          }));
          if (dbClasses.length > 0) {
            setClasses(dbClasses);
          }
        }
      } catch (err) {
        console.error("Error loading faculty classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Class "${title}" scheduled successfully! Meeting link: ${meetingLink || 'https://meet.google.com/abc-defg-hij'}`);
      setClasses(prev => [
        {
          id: String(prev.length + 1),
          title,
          subject,
          date,
          time,
          status: "Scheduled"
        },
        ...prev
      ]);
      setTitle("");
      setDate("");
      setTime("");
      setMeetingLink("");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Online Classes"
        desc="Schedule and conduct online classes, manage meeting links, and track attendance."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Scheduled Classes", value: classes.length.toString(), tone: "info" as const },
          { label: "Upcoming", value: classes.filter(c => c.status === "Scheduled").length.toString(), tone: "success" as const },
          { label: "Completed", value: "12", tone: "info" as const },
          { label: "Avg Attendance", value: "87%", tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              This Month
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Scheduled Classes</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <Card key={cls.id} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-cyan text-white grid place-items-center">
                  <Video className="size-5" />
                </div>
                <Badge tone="success">{cls.status}</Badge>
              </div>
              <h3 className="font-semibold text-sm">{cls.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{cls.subject}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="size-3" />
                  <span className="text-muted-foreground">{cls.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{cls.time}</span>
                </div>
              </div>
              <button 
                onClick={() => alert(`Starting class: ${cls.title}. Redirecting to stream platform...`)}
                className="mt-4 w-full px-3 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-1"
              >
                <Play className="size-3" /> Start Class
              </button>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Schedule New Class</h3>
          <form onSubmit={handleSchedule} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <input 
              placeholder="Class title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
              required
            />
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm" 
                required
              />
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm" 
                required
              />
            </div>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {["Google Meet", "Zoom", "Microsoft Teams", "Other"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input 
              placeholder="Meeting link (Optional)" 
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
            />
            <button type="submit" disabled={loading} className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              {loading ? "Scheduling..." : "Schedule Class"}
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Recent Class History</h3>
          <div className="space-y-2">
            {[
              {
                title: "Data Structures Live Session",
                date: "2026-05-20",
                attendance: "42/45",
                status: "Completed",
              },
              {
                title: "Algorithm Discussion",
                date: "2026-05-18",
                attendance: "38/45",
                status: "Completed",
              },
              {
                title: "Database Q&A",
                date: "2026-05-15",
                attendance: "40/45",
                status: "Completed",
              },
              {
                title: "Web Development Tutorial",
                date: "2026-05-12",
                attendance: "35/45",
                status: "Completed",
              },
            ].map((cls) => (
              <div
                key={cls.title}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center">
                  <Video className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{cls.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {cls.date} • {cls.attendance}
                  </div>
                </div>
                <Badge tone="success">{cls.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
