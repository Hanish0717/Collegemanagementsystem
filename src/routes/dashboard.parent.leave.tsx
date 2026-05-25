import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { leaveHistory } from "@/lib/parent-data";

export const Route = createFileRoute("/dashboard/parent/leave")({
  component: LeaveStatus,
});

function LeaveStatus() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Status"
        desc="View child's leave requests, approval status, and leave history."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: leaveHistory.length.toString(), tone: "info" as const },
          { label: "Approved", value: leaveHistory.filter(l => l.status === "Approved").length.toString(), tone: "success" as const },
          { label: "Pending", value: leaveHistory.filter(l => l.status === "Pending").length.toString(), tone: "warn" as const },
          { label: "This Month", value: "1", tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
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
              {leaveHistory.map(leave => (
                <tr key={leave.date} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{leave.date}</td>
                  <td className="py-3 px-4">{leave.reason}</td>
                  <td className="py-3 px-4">{leave.appliedOn}</td>
                  <td className="py-3 px-4">
                    <Badge tone={leave.status === "Approved" ? "success" : "warn"}>{leave.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{leave.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="size-5 text-indigo" />
            <h3 className="font-semibold">Approved Leaves</h3>
          </div>
          <div className="space-y-2">
            {leaveHistory.filter(l => l.status === "Approved").map(leave => (
              <div key={leave.date} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
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
            {leaveHistory.filter(l => l.status === "Pending").map(leave => (
              <div key={leave.date} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
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
            { label: "Sick Leave", taken: "2 days", remaining: "3 days" },
            { label: "Casual Leave", taken: "1 day", remaining: "4 days" },
            { label: "Earned Leave", taken: "0 days", remaining: "5 days" },
            { label: "Total This Year", taken: "3 days", remaining: "12 days" },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Taken: {item.taken}</span>
                <Badge tone="info">{item.remaining}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
