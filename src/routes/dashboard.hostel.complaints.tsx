import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Plus, Search, CheckCircle, Clock, AlertOctagon, TrendingUp } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { complaints, complaintStatusData } from "@/lib/hostel-data";

export const Route = createFileRoute("/dashboard/hostel/complaints")({
  component: ComplaintManagement,
});

function ComplaintManagement() {
  const complaintAnalytics = [
    { category: "Maintenance", count: 45 },
    { category: "Mess", count: 32 },
    { category: "Security", count: 18 },
    { category: "Electrical", count: 28 },
    { category: "Other", count: 20 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaint Management"
        desc="Track, manage, and resolve student complaints efficiently."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> New Complaint
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: "233", tone: "info" as const },
          { label: "Resolved", value: "156", tone: "success" as const },
          { label: "In Progress", value: "45", tone: "warn" as const },
          { label: "Pending", value: "32", tone: "danger" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search by complaint ID, student name..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Categories", "Maintenance", "Mess", "Security", "Electrical", "Other"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Priority", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Resolved", "In Progress", "Pending", "Escalated"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Complaint List</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Complaint ID", "Student Name", "Category", "Title", "Priority", "Status", "Actions"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {complaints.map(complaint => (
                  <tr key={complaint.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{complaint.id}</td>
                    <td className="py-3 px-4">{complaint.studentName}</td>
                    <td className="py-3 px-4"><Badge tone="info">{complaint.category}</Badge></td>
                    <td className="py-3 px-4">{complaint.title}</td>
                    <td className="py-3 px-4">
                      <Badge tone={complaint.priority === "High" ? "danger" : complaint.priority === "Medium" ? "warn" : "success"}>
                        {complaint.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={complaint.status === "Resolved" ? "success" : complaint.status === "In Progress" ? "warn" : complaint.status === "Escalated" ? "danger" : "info"}>
                        {complaint.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Complaint Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={complaintAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Pending Complaints</h3>
          </div>
          <div className="space-y-2">
            {complaints.filter(c => c.status === "Pending").map(complaint => (
              <div key={complaint.id} className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{complaint.title}</div>
                    <div className="text-xs text-muted-foreground">{complaint.studentName} • {complaint.category}</div>
                  </div>
                  <Badge tone={complaint.priority === "High" ? "danger" : "warn"}>{complaint.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertOctagon className="size-5 text-indigo" />
            <h3 className="font-semibold">Escalation Alerts</h3>
          </div>
          <div className="space-y-2">
            {complaints.filter(c => c.status === "Escalated").map(complaint => (
              <div key={complaint.id} className="p-3 rounded-xl border bg-rose-50 border-rose-200 hover:bg-accent/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{complaint.title}</div>
                    <div className="text-xs text-muted-foreground">{complaint.studentName} • {complaint.category}</div>
                  </div>
                  <Badge tone="danger">Escalated</Badge>
                </div>
                <div className="text-xs text-rose-600 mt-1">Requires immediate attention</div>
              </div>
            ))}
            {complaints.filter(c => c.status === "Escalated").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">No escalated complaints</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="size-5 text-indigo" />
          <h3 className="font-semibold">Resolution Timeline</h3>
        </div>
        <div className="space-y-2">
          {[
            { id: "CMP-003", title: "Unauthorized entry", resolvedIn: "2 hours", by: "Security Team" },
            { id: "CMP-007", title: "AC not working", resolvedIn: "4 hours", by: "Maintenance" },
            { id: "CMP-008", title: "Water leakage", resolvedIn: "6 hours", by: "Maintenance" },
            { id: "CMP-009", title: "Food quality issue", resolvedIn: "1 day", by: "Mess Manager" },
          ].map(resolution => (
            <div key={resolution.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                {resolution.id.split("-")[1]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{resolution.title}</div>
                <div className="text-xs text-muted-foreground">Resolved in {resolution.resolvedIn} by {resolution.by}</div>
              </div>
              <Badge tone="success">Resolved</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
