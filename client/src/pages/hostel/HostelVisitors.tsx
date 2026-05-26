import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { UserCheck, Plus, Search, Shield, Clock, Phone, LogOut } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { visitorLogs } from "@/mock/hostelData";



export function HostelVisitors() {
  const visitorAnalytics = [
    { day: "Mon", visitors: 25 },
    { day: "Tue", visitors: 32 },
    { day: "Wed", visitors: 28 },
    { day: "Thu", visitors: 35 },
    { day: "Fri", visitors: 40 },
    { day: "Sat", visitors: 55 },
    { day: "Sun", visitors: 48 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Logs"
        desc="Track visitor entries, exits, and manage visitor registration."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Register Visitor
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors Today", value: "18", tone: "info" as const },
          { label: "Currently Inside", value: "8", tone: "success" as const },
          { label: "Checked Out", value: "10", tone: "warn" as const },
          { label: "Pending Approval", value: "3", tone: "danger" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Today</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search by visitor name, student name..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Inside", "Checked Out", "Pending"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Today", "This Week", "This Month"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Visitor Entry Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Visitor Name", "Student Name", "Entry Time", "Exit Time", "Contact Number", "Status"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {visitorLogs.map(log => (
                  <tr key={log.visitorName} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{log.visitorName}</td>
                    <td className="py-3 px-4">{log.studentName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{log.entryTime}</td>
                    <td className="py-3 px-4 text-muted-foreground">{log.exitTime || <span className="text-muted-foreground">-</span>}</td>
                    <td className="py-3 px-4 text-muted-foreground">{log.contactNumber}</td>
                    <td className="py-3 px-4">
                      <Badge tone={log.status === "Inside" ? "success" : "warn"}>{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="size-5 text-indigo" />
            <h3 className="font-semibold">Security Verification</h3>
          </div>
          <div className="space-y-2">
            {[
              { visitor: "Ramesh Gupta", status: "Verified", time: "09:30 AM" },
              { visitor: "Sunita Devi", status: "Verified", time: "10:15 AM" },
              { visitor: "Mohan Singh", status: "Verified", time: "11:00 AM" },
              { visitor: "Kavita Sharma", status: "Pending", time: "02:00 PM" },
            ].map(verification => (
              <div key={verification.visitor} className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft">
                <div>
                  <div className="text-sm font-medium">{verification.visitor}</div>
                  <div className="text-xs text-muted-foreground">{verification.time}</div>
                </div>
                <Badge tone={verification.status === "Verified" ? "success" : "warn"}>{verification.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Visitor Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={visitorAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="visitors" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Visitor Approval Section</h3>
          </div>
          <div className="space-y-2">
            {[
              { visitor: "Rajesh Kumar", student: "Vikram Singh", purpose: "Family Visit", time: "10 min ago" },
              { visitor: "Meena Devi", student: "Anjali Gupta", purpose: "Parent Meeting", time: "25 min ago" },
              { visitor: "Suresh Patel", student: "Rahul Sharma", purpose: "Delivery", time: "45 min ago" },
            ].map(approval => (
              <div key={approval.visitor} className="p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{approval.visitor}</div>
                    <div className="text-xs text-muted-foreground">{approval.student} • {approval.purpose}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition">Approve</button>
                    <button className="px-2 py-1 rounded text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 transition">Reject</button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{approval.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <LogOut className="size-5 text-indigo" />
          <h3 className="font-semibold">Recent Visitor Logs</h3>
        </div>
        <div className="space-y-2">
          {[
            { visitor: "Ramesh Gupta", student: "Rahul Sharma", action: "Checked Out", time: "11:45 AM" },
            { visitor: "Mohan Singh", student: "Amit Kumar", action: "Checked Out", time: "01:30 PM" },
            { visitor: "Rajesh Verma", student: "Vikram Singh", action: "Checked Out", time: "05:00 PM" },
            { visitor: "Sunita Devi", student: "Priya Patel", action: "Entered", time: "10:15 AM" },
            { visitor: "Kavita Sharma", student: "Sneha Reddy", action: "Entered", time: "02:00 PM" },
          ].map(log => (
            <div key={log.visitor} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                {log.visitor.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{log.visitor}</div>
                <div className="text-xs text-muted-foreground">{log.student} • {log.time}</div>
              </div>
              <Badge tone={log.action === "Entered" ? "success" : "warn"}>{log.action}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
