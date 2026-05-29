import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle, Clock, Send } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { leaveApplications } from "@/mock/facultyData";
import api from "@/lib/api";

export function FacultyLeave() {
  const [history, setHistory] = useState<any[]>(leaveApplications);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/api/faculty-module/leave");
      if (res.data?.success && res.data?.data) {
        const dbLeaves = res.data.data.map((l: any) => ({
          id: l._id,
          type: l.type,
          from: new Date(l.from).toISOString().split('T')[0],
          to: new Date(l.to).toISOString().split('T')[0],
          days: l.days,
          status: l.status
        }));
        if (dbLeaves.length > 0) {
          setHistory(dbLeaves);
        }
      }
    } catch (err) {
      console.error("Error loading faculty leave requests:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      alert("Please fill in all fields.");
      return;
    }
    const diffTime = Math.abs(new Date(toDate).getTime() - new Date(fromDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    setLoading(true);
    try {
      const res = await api.post("/api/faculty-module/leave", {
        type: leaveType,
        from: fromDate,
        to: toDate,
        days: diffDays,
        reason
      });
      if (res.data?.success) {
        alert("Leave request submitted successfully!");
        setFromDate("");
        setToDate("");
        setReason("");
        fetchLeaves();
      }
    } catch (err: any) {
      console.error("Error submitting leave request:", err);
      alert(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const usedSick = history.filter(l => l.type === "Sick Leave" && l.status === "Approved").reduce((sum, l) => sum + l.days, 0);
  const usedCasual = history.filter(l => l.type === "Casual Leave" && l.status === "Approved").reduce((sum, l) => sum + l.days, 0);
  const usedEarned = history.filter(l => l.type === "Earned Leave" && l.status === "Approved").reduce((sum, l) => sum + l.days, 0);

  const remainingSick = Math.max(0, 10 - usedSick);
  const remainingCasual = Math.max(0, 8 - usedCasual);
  const remainingEarned = Math.max(0, 15 - usedEarned);
  const totalRemaining = remainingSick + remainingCasual + remainingEarned;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Application"
        desc="Apply for leave, track leave balance, and view leave history."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Leave Balance", value: `${totalRemaining} days`, tone: "info" as const },
          { label: "Sick Leave Available", value: `${remainingSick} days`, tone: "info" as const },
          { label: "Casual Leave Available", value: `${remainingCasual} days`, tone: "info" as const },
          { label: "Earned Leave Available", value: `${remainingEarned} days`, tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Available</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {["Sick Leave", "Casual Leave", "Earned Leave"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reason</label>
              <textarea
                placeholder="Reason for leave..."
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              <Send className="size-4" /> {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-indigo" />
            <h3 className="font-semibold">Leave Balance Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              { type: "Sick Leave", total: 10, used: usedSick, remaining: remainingSick },
              { type: "Casual Leave", total: 8, used: usedCasual, remaining: remainingCasual },
              { type: "Earned Leave", total: 15, used: usedEarned, remaining: remainingEarned },
            ].map(item => (
              <div key={item.type} className="p-4 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.type}</span>
                  <Badge tone="info">{item.remaining} days remaining</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-primary h-2 rounded-full" style={{ width: `${(item.used / item.total) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Used: {item.used} days</span>
                  <span>Total: {item.total} days</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Leave History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Leave Type", "From", "To", "Days", "Status"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((leave, index) => (
                <tr key={leave.id || index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{leave.type}</td>
                  <td className="py-3 px-4">{leave.from}</td>
                  <td className="py-3 px-4">{leave.to}</td>
                  <td className="py-3 px-4 font-medium">{leave.days}</td>
                  <td className="py-3 px-4">
                    <Badge tone={leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "danger" : "warn"}>{leave.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Upcoming Holidays</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Republic Day", date: "Jan 26, 2026" },
            { name: "Holi", date: "Mar 14, 2026" },
            { name: "Good Friday", date: "Apr 18, 2026" },
            { name: "Independence Day", date: "Aug 15, 2026" },
          ].map(holiday => (
            <div key={holiday.name} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-primary" />
                <span className="text-sm font-medium">{holiday.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">{holiday.date}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
