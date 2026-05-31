import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, DollarSign, Filter, Plus, Search, Send } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { feeRecords, studentAnalytics } from "@/mock/adminData";

export function AdminFees() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees Management"
        desc="Track fee collection, pending dues, payment history and scholarship tracking."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Record Payment
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: "₹84.7L", tone: "success" as const },
          { label: "Pending Dues", value: "₹12.5L", tone: "warn" as const },
          { label: "Overdue", value: "₹3.2L", tone: "danger" as const },
          { label: "Scholarships", value: "₹4.8L", tone: "info" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              This Semester
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search payments by student, fee type..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Paid", "Pending", "Overdue"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
            <Filter className="size-4" /> Filters
          </button>
          <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
            <Download className="size-4" /> Export
          </button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Revenue Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={studentAnalytics}>
                <defs>
                  <linearGradient id="fees-revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="fees"
                  stroke="#4F46E5"
                  fill="url(#fees-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold">Fee Reminders</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Tuition Fee Due", students: "142 students", days: "3 days" },
              { label: "Hostel Fee Due", students: "48 students", days: "5 days" },
              { label: "Lab Fee Due", students: "89 students", days: "7 days" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-gradient-soft border">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{item.students}</span>
                  <button className="px-2 py-1 rounded text-xs bg-gradient-primary text-white flex items-center gap-1">
                    <Send className="size-3" /> Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Student Name",
                  "Fee Type",
                  "Amount",
                  "Due Date",
                  "Payment Status",
                  "Actions",
                ].map((column) => (
                  <th
                    key={column}
                    className="text-left py-3 px-4 font-semibold text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {feeRecords.map((record, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{record.student}</td>
                  <td className="py-3 px-4">
                    <Badge tone="info">{record.feeType}</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{record.amount}</td>
                  <td className="py-3 px-4 text-muted-foreground">{record.dueDate}</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        record.status === "Paid"
                          ? "success"
                          : record.status === "Overdue"
                            ? "danger"
                            : "warn"
                      }
                    >
                      {record.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                      View
                    </button>
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
