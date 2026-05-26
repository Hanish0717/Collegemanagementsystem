import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Send } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { leaveRequests } from "@/mock/studentData";



export function StudentLeave() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        desc="Apply for leave, track leave balance, and view leave history."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Leave Balance", value: "5 days", tone: "info" as const },
          { label: "Sick Leave", value: "2 days", tone: "info" as const },
          { label: "Casual Leave", value: "2 days", tone: "info" as const },
          { label: "Earned Leave", value: "1 day", tone: "info" as const },
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
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["Sick Leave", "Casual Leave", "Earned Leave"].map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                <input type="date" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                <input type="date" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <textarea placeholder="Reason for leave..." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-sm">Attach medical certificate</span>
              </label>
              <input type="file" className="text-sm" />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Send className="size-4" /> Submit Request
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-indigo" />
            <h3 className="font-semibold">Leave Balance Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              { type: "Sick Leave", total: "5 days", used: "3 days", remaining: "2 days" },
              { type: "Casual Leave", total: "4 days", used: "2 days", remaining: "2 days" },
              { type: "Earned Leave", total: "3 days", used: "2 days", remaining: "1 day" },
            ].map(item => (
              <div key={item.type} className="p-4 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.type}</span>
                  <Badge tone="info">{item.remaining}</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-primary h-2 rounded-full" style={{ width: `${(parseInt(item.used) / parseInt(item.total)) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Used: {item.used}</span>
                  <span>Total: {item.total}</span>
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
              {leaveRequests.map(leave => (
                <tr key={leave.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{leave.type}</td>
                  <td className="py-3 px-4">{leave.from}</td>
                  <td className="py-3 px-4">{leave.to}</td>
                  <td className="py-3 px-4 font-medium">{leave.days}</td>
                  <td className="py-3 px-4">
                    <Badge tone={leave.status === "Approved" ? "success" : "warn"}>{leave.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
