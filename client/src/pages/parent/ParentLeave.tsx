import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle, Clock, Send } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { leaveHistory as mockLeaveHistory } from "@/mock/parentData";
import api from "@/lib/api";

export function ParentLeave() {
  const [history, setHistory] = useState<any[]>(mockLeaveHistory);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/api/parent-module/leave");
      if (res.data?.success && res.data?.data) {
        const dbLeaves = res.data.data.map((l: any) => ({
          date: new Date(l.from).toISOString().split('T')[0],
          reason: l.reason || "",
          appliedOn: new Date(l.createdAt).toISOString().split('T')[0],
          status: l.status,
          remarks: l.remarks || (l.status === "Approved" ? "Approved by Faculty" : "Awaiting approval"),
          days: l.days,
          type: l.type
        }));
        if (dbLeaves.length > 0) {
          setHistory(dbLeaves);
        }
      }
    } catch (err) {
      console.error("Error loading child leave requests:", err);
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
      const res = await api.post("/api/parent-module/leave", {
        type: leaveType,
        from: fromDate,
        to: toDate,
        days: diffDays,
        reason
      });
      if (res.data?.success) {
        alert("Leave request submitted successfully for your child!");
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

  const approvedLeaves = history.filter(l => l.status === "Approved");
  const pendingLeaves = history.filter(l => l.status === "Pending" || l.status === "pending");

  const usedSick = history.filter(l => l.type === "Sick Leave" && l.status === "Approved").reduce((sum, l) => sum + (l.days || 0), 0);
  const usedCasual = history.filter(l => l.type === "Casual Leave" && l.status === "Approved").reduce((sum, l) => sum + (l.days || 0), 0);
  const usedEarned = history.filter(l => l.type === "Earned Leave" && l.status === "Approved").reduce((sum, l) => sum + (l.days || 0), 0);

  const remainingSick = Math.max(0, 5 - usedSick);
  const remainingCasual = Math.max(0, 4 - usedCasual);
  const remainingEarned = Math.max(0, 3 - usedEarned);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Status"
        desc="View child's leave requests, approval status, and leave history."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: history.length.toString(), tone: "info" as const },
          { label: "Approved", value: approvedLeaves.length.toString(), tone: "success" as const },
          { label: "Pending", value: pendingLeaves.length.toString(), tone: "warn" as const },
          { label: "Total Days Taken", value: String(approvedLeaves.reduce((sum, l) => sum + (l.days || 0), 0)), tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold mb-4">Apply for Child's Leave</h3>
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
                placeholder="Reason for child's leave..."
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
              <Send className="size-4" /> {loading ? "Submitting..." : "Submit Leave"}
            </button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Leave History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Leave Date", "Reason", "Applied On", "Approval Status", "Remarks"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((leave, index) => (
                  <tr key={index} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{leave.date}</td>
                    <td className="py-3 px-4">{leave.reason}</td>
                    <td className="py-3 px-4">{leave.appliedOn}</td>
                    <td className="py-3 px-4">
                      <Badge tone={leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "danger" : "warn"}>{leave.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{leave.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="size-5 text-indigo" />
            <h3 className="font-semibold">Approved Leaves</h3>
          </div>
          <div className="space-y-2">
            {approvedLeaves.map((leave, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {leave.date.slice(5, 10)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{leave.date}</div>
                  <div className="text-xs text-muted-foreground">{leave.reason}</div>
                </div>
                <Badge tone="success">Approved</Badge>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Pending Leaves</h3>
          </div>
          <div className="space-y-2">
            {pendingLeaves.map((leave, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                  {leave.date.slice(5, 10)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{leave.date}</div>
                  <div className="text-xs text-muted-foreground">{leave.reason}</div>
                </div>
                <Badge tone="warn">Pending</Badge>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Leave Analytics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Sick Leave", taken: `${usedSick} days`, remaining: `${remainingSick} days` },
            { label: "Casual Leave", taken: `${usedCasual} day(s)`, remaining: `${remainingCasual} days` },
            { label: "Earned Leave", taken: `${usedEarned} days`, remaining: `${remainingEarned} days` },
            { label: "Total Leave Balance", taken: `${usedSick + usedCasual + usedEarned} days`, remaining: `${remainingSick + remainingCasual + remainingEarned} days` },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Taken: {item.taken}</span>
                <Badge tone="info">{item.remaining} left</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
