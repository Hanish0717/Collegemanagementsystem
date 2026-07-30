import { useState } from "react";
import {
  MessageSquare,
  Mail,
  Send,
  Bell,
  Smartphone,
  CheckCircle,
  Clock,
  Plus,
  ClipboardList,
  BarChart2,
  AlertTriangle,
  Radio,
  FileText,
  Megaphone,
} from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function AdminCommunication() {
  const [activeTab, setActiveTab] = useState<"broadcast" | "circulars" | "emergency" | "polls">("broadcast");

  const [polls, setPolls] = useState([
    { id: "POLL-01", question: "Rate the quality of online study materials", responses: 482, status: "Active", deadline: "2026-07-25" },
    { id: "POLL-02", question: "Preferences for the winter vacation schedule", responses: 914, status: "Closed", deadline: "2026-07-10" }
  ]);

  const [circulars, setCirculars] = useState([
    { id: "CIR-301", title: "R23 Curriculum Revision Guidelines for CSE & AIML", dept: "Academic Council", date: "Jul 22, 2026", target: "CSE, AIML Faculty" },
    { id: "CIR-302", title: "Mid-Term Examination Hall Ticket Issuance Policy", dept: "Exam Cell", date: "Jul 20, 2026", target: "All Students" },
    { id: "CIR-303", title: "Annual Campus R&D Innovation Grant Proposals", dept: "Research Cell", date: "Jul 18, 2026", target: "All Faculty" },
  ]);

  const [broadcastLogs, setBroadcastLogs] = useState([
    { id: "MSG-101", subject: "Odd Term Examinations Fee Deadline", target: "All Students", channel: "Portal Circular", sentCount: 5240, status: "Delivered", time: "2 hours ago" },
    { id: "MSG-102", subject: "Syllabus Audit Meeting - Dean Office", target: "All Faculty", channel: "Email & Push", sentCount: 342, status: "Delivered", time: "1 day ago" },
    { id: "MSG-103", subject: "Attendance Defaulter Warning Notice", target: "CSE Parents", channel: "SMS Broadcast", sentCount: 34, status: "Sent", time: "3 days ago" }
  ]);

  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("All Students");
  const [comChannel, setComChannel] = useState("Email & Push");

  // Emergency Alert Form
  const [emergencyText, setEmergencyText] = useState("");

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject.trim() || !msgBody.trim()) {
      toast.error("Subject and Message body are required!");
      return;
    }

    const countMap: Record<string, number> = {
      "All Students": 5240,
      "All Faculty": 342,
      "Parents Group": 5120,
      "Alumni Network": 8420
    };

    const count = countMap[targetAudience] || 100;

    const newLog = {
      id: `MSG-${100 + broadcastLogs.length + 1}`,
      subject: msgSubject,
      target: targetAudience,
      channel: comChannel,
      sentCount: count,
      status: "Delivered",
      time: "Just now"
    };

    setBroadcastLogs([newLog, ...broadcastLogs]);
    toast.success(`Broadcast successfully queued! Dispatching via ${comChannel} to ${count.toLocaleString()} recipients.`);
    setMsgSubject("");
    setMsgBody("");
  };

  const handleEmergencyAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyText.trim()) {
      toast.error("Please enter the emergency alert broadcast text.");
      return;
    }
    toast.error(`EMERGENCY BROADCAST DISPATCHED TO ALL CAMPUS PORTALS: "${emergencyText}"`);
    setEmergencyText("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Communication Hub"
        desc="Broadcast announcements, publish official circular directives, send parent SMS alerts, and dispatch emergency campus notifications."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: "broadcast", label: "Announcement Center", icon: Bell },
          { id: "circulars", label: "Department Circulars", icon: FileText },
          { id: "emergency", label: "Emergency Alerts", icon: AlertTriangle },
          { id: "polls", label: "Polls & Surveys", icon: BarChart2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-bold dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "broadcast" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="SMS Alerts Sent"
              value="14,842 text alerts"
              change="99.9% delivery rate"
              icon={Smartphone}
              gradient="bg-gradient-primary"
            />
            <StatCard
              label="Official Emails Sent"
              value="28,420 mails"
              change="0.02% bounce rate"
              icon={Mail}
              gradient="bg-gradient-violet"
            />
            <StatCard
              label="WhatsApp Notifications"
              value="5,240 messages"
              change="Direct-to-parent integration"
              icon={MessageSquare}
              gradient="bg-gradient-cyan"
            />
            <StatCard
              label="Active Portal Circulars"
              value="12 active"
              change="3 academic, 9 general notices"
              icon={Bell}
              gradient="bg-gradient-primary"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="font-semibold mb-3">Compose Institutional Broadcast</h3>
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Target Audience Group</label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    >
                      <option value="All Students">All Students (5,240)</option>
                      <option value="All Faculty">All Faculty (342)</option>
                      <option value="Parents Group">Parents Group (5,120)</option>
                      <option value="Alumni Network">Alumni Network (8,420)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Communication Channel</label>
                    <select
                      value={comChannel}
                      onChange={(e) => setComChannel(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                    >
                      <option value="Email & Push">Email &amp; App Push</option>
                      <option value="SMS Broadcast">SMS Broadcast Alert</option>
                      <option value="WhatsApp Channel">WhatsApp API Hook</option>
                      <option value="Portal Circular">Portal Circular Posting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Announcement Subject / Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for Mid-Term Examinations Odd Semester"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Message Body Content *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type the announcement details here..."
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Send className="size-3.5" /> Dispatch Broadcast Notice
                  </button>
                </div>
              </form>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-3">API Server Integration</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span>SMS Gateway (Twilio/DND API)</span>
                    <Badge tone="success">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Email Relay (SMTP/AWS SES)</span>
                    <Badge tone="success">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>WhatsApp Business API</span>
                    <Badge tone="success">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>App Push Node (FCM Engine)</span>
                    <Badge tone="success">Online</Badge>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900 rounded-xl text-[10px] text-blue-700 dark:text-blue-300 leading-normal mt-4">
                <strong>System Sync:</strong> All circular postings automatically inject directly into the Student, Faculty, and Parent dashboard timeline widgets.
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold mb-3">Recent Communication Journal</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Log ID</th>
                    <th className="text-left pb-2">Subject / Message Details</th>
                    <th className="text-left pb-2">Target Audience</th>
                    <th className="text-left pb-2">Channel</th>
                    <th className="text-center pb-2">Recipients Count</th>
                    <th className="text-center pb-2">Status</th>
                    <th className="text-right pb-2">Time Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {broadcastLogs.map(row => (
                    <tr key={row.id}>
                      <td className="py-2.5 font-mono font-bold text-slate-400">{row.id}</td>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{row.subject}</td>
                      <td className="py-2.5 font-semibold">{row.target}</td>
                      <td className="py-2.5 font-medium">{row.channel}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-blue-600">{row.sentCount.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <Badge tone="success">{row.status}</Badge>
                      </td>
                      <td className="py-2.5 text-right text-slate-400 font-semibold">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* DEPARTMENT CIRCULARS */}
      {activeTab === "circulars" && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="size-4 text-blue-600" /> Department Circulars & Executive Policy Bulletins
          </h3>
          <div className="space-y-3">
            {circulars.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">{c.title}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dept: {c.dept} • Target: <strong className="text-slate-800 dark:text-slate-200">{c.target}</strong> • Issued: {c.date}
                  </p>
                </div>
                <button
                  onClick={() => toast.success(`Downloaded official circular ${c.id}`)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  View Circular
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* EMERGENCY ALERTS */}
      {activeTab === "emergency" && (
        <Card className="p-5 border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10">
          <div className="flex items-center gap-2 mb-4 text-rose-600">
            <AlertTriangle className="size-6" />
            <h3 className="font-black text-base text-rose-900 dark:text-rose-200">High-Priority Emergency Broadcast Station</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            Dispatches instant high-priority red alert banners across ALL active student, faculty, and parent portal dashboards.
          </p>
          <form onSubmit={handleEmergencyAlert} className="space-y-4">
            <textarea
              required
              rows={4}
              placeholder="e.g. CAMPUS EMERGENCY NOTICE: Unexpected inclement weather holiday declared for Jul 30, 2026. All afternoon classes suspended."
              value={emergencyText}
              onChange={(e) => setEmergencyText(e.target.value)}
              className="w-full p-3 rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 text-xs focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg cursor-pointer flex items-center gap-2 transition"
              >
                <Radio className="size-4" /> DISPATCH EMERGENCY RED ALERT
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* POLLS & SURVEYS */}
      {activeTab === "polls" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-3">Institutional Feedback Surveys &amp; Student Polls</h3>
            <div className="space-y-3.5">
              {polls.map(poll => (
                <div key={poll.id} className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{poll.id}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{poll.question}</span>
                    </div>
                    <div className="text-slate-500 font-semibold">Total Submissions: {poll.responses} responses</div>
                    <div className="text-[10px] text-slate-400 font-bold">Closing Deadline: {poll.deadline}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={poll.status === "Active" ? "success" : "default"}>{poll.status}</Badge>
                    {poll.status === "Active" && (
                      <button
                        onClick={() => {
                          setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, status: "Closed" } : p));
                          toast.info("Feedback Poll status closed.");
                        }}
                        className="px-2 py-0.5 bg-slate-950 text-white rounded text-[10px] font-semibold cursor-pointer"
                      >
                        Close Poll
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-3">Launch New Student Poll</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const question = (form.elements.namedItem("question") as HTMLInputElement).value;
                const deadline = (form.elements.namedItem("deadline") as HTMLInputElement).value;

                if (!question.trim() || !deadline) {
                  toast.error("Please specify both question and deadline date!");
                  return;
                }

                const newPoll = {
                  id: `POLL-0${polls.length + 1}`,
                  question,
                  responses: 0,
                  status: "Active",
                  deadline
                };
                setPolls([...polls, newPoll]);
                toast.success("New institutional feedback survey dispatched to student portals!");
                form.reset();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Poll Question / Title</label>
                <input
                  name="question"
                  type="text"
                  required
                  placeholder="e.g. Preferences for the new library hours"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Closing Date</label>
                <input
                  name="deadline"
                  type="date"
                  required
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                Publish Feedback Poll
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminCommunication;
