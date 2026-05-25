import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Download, Search, AlertTriangle, Receipt, TrendingUp, Award } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { hostelFees, feeCollectionData } from "@/lib/hostel-data";

export const Route = createFileRoute("/dashboard/hostel/fees")({
  component: FeeTracking,
});

function FeeTracking() {
  const feeAnalytics = [
    { month: "Jan", collected: 75000, pending: 15000 },
    { month: "Feb", collected: 78000, pending: 12000 },
    { month: "Mar", collected: 82000, pending: 8000 },
    { month: "Apr", collected: 85000, pending: 5000 },
    { month: "May", collected: 89500, pending: 500 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Fee Tracking"
        desc="Manage hostel fee collection, pending dues, and payment history."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Export Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: "$89.5K", tone: "success" as const },
          { label: "Pending Dues", value: "$4.5K", tone: "warn" as const },
          { label: "Overdue", value: "$1.2K", tone: "danger" as const },
          { label: "Collection Rate", value: "95%", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">This Month</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search by student name, room number..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Paid", "Pending", "Overdue"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["This Month", "Last Month", "This Semester"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Student Name", "Room Number", "Fee Amount", "Due Date", "Payment Status", "Receipt"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {hostelFees.map(fee => (
                  <tr key={fee.studentName} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{fee.studentName}</td>
                    <td className="py-3 px-4">{fee.roomNumber}</td>
                    <td className="py-3 px-4">{fee.feeAmount}</td>
                    <td className="py-3 px-4 text-muted-foreground">{fee.dueDate}</td>
                    <td className="py-3 px-4">
                      <Badge tone={fee.paymentStatus === "Paid" ? "success" : fee.paymentStatus === "Overdue" ? "danger" : "warn"}>
                        {fee.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {fee.paymentStatus === "Paid" && (
                        <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition flex items-center gap-1">
                          <Receipt className="size-3" /> Download
                        </button>
                      )}
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
            <h3 className="font-semibold">Fee Collection Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="collected" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-indigo" />
            <h3 className="font-semibold">Payment Reminders</h3>
          </div>
          <div className="space-y-2">
            {hostelFees.filter(f => f.paymentStatus !== "Paid").map(fee => (
              <div key={fee.studentName} className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{fee.studentName}</div>
                    <div className="text-xs text-muted-foreground">{fee.roomNumber} • Due: {fee.dueDate}</div>
                  </div>
                  <Badge tone={fee.paymentStatus === "Overdue" ? "danger" : "warn"}>{fee.paymentStatus}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Amount: {fee.feeAmount}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award className="size-5 text-indigo" />
            <h3 className="font-semibold">Scholarship Details</h3>
          </div>
          <div className="space-y-2">
            {[
              { student: "Rahul Sharma", scholarship: "Merit Scholarship", amount: "$2,000", status: "Active" },
              { student: "Priya Patel", scholarship: "Need-based Aid", amount: "$1,500", status: "Active" },
              { student: "Sneha Reddy", scholarship: "Sports Scholarship", amount: "$1,000", status: "Active" },
              { student: "Vikram Singh", scholarship: "Academic Excellence", amount: "$2,500", status: "Pending" },
            ].map(scholarship => (
              <div key={scholarship.student} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <div>
                  <div className="text-sm font-medium">{scholarship.student}</div>
                  <div className="text-xs text-muted-foreground">{scholarship.scholarship}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{scholarship.amount}</div>
                  <Badge tone={scholarship.status === "Active" ? "success" : "warn"} className="mt-1">{scholarship.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="size-5 text-indigo" />
          <h3 className="font-semibold">Fee Collection Summary</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: "396", icon: "👥" },
            { label: "Paid Students", value: "320", icon: "✅" },
            { label: "Pending Students", value: "65", icon: "⏳" },
            { label: "Overdue Students", value: "11", icon: "⚠️" },
          ].map(summary => (
            <div key={summary.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-2xl mb-2">{summary.icon}</div>
              <div className="text-xs text-muted-foreground">{summary.label}</div>
              <div className="text-xl font-bold mt-1">{summary.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
