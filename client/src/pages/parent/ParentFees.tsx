import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, DollarSign, Download } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { feeRecords } from "@/mock/parentData";



export function ParentFees() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Details"
        desc="View fee structure, payment history, and pending dues."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Due", value: "$1,250", tone: "warn" as const },
          { label: "Overdue", value: "$800", tone: "danger" as const },
          { label: "Paid This Year", value: "$8,500", tone: "success" as const },
          { label: "Next Due", value: "May 25", tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Fee Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Fee Type", "Amount", "Due Date", "Payment Status", "Receipt"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {feeRecords.map((record, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{record.feeType}</td>
                  <td className="py-3 px-4 font-medium">{record.amount}</td>
                  <td className="py-3 px-4">{record.dueDate}</td>
                  <td className="py-3 px-4">
                    <Badge tone={record.status === "Paid" ? "success" : record.status === "Overdue" ? "danger" : "warn"}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {record.receipt !== "-" ? (
                      <button className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Download className="size-3" /> {record.receipt}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">{record.receipt}</span>
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
          <AlertTriangle className="size-5 text-amber-600" />
          <h3 className="font-semibold">Fee Reminders</h3>
        </div>
        <div className="space-y-2">
          {feeRecords.filter(f => f.status !== "Paid").map((record, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
              <div>
                <div className="text-sm font-medium">{record.feeType}</div>
                <div className="text-xs text-muted-foreground">Due: {record.dueDate}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{record.amount}</div>
                <Badge tone={record.status === "Overdue" ? "danger" : "warn"}>{record.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Scholarship Details</h3>
        <div className="p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Scholarship Type</div>
              <div className="text-sm font-medium mt-1">Merit Scholarship</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Discount</div>
              <div className="text-sm font-medium mt-1">10% on Tuition Fee</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Valid Until</div>
              <div className="text-sm font-medium mt-1">Semester 6</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge tone="success" className="mt-1">Active</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
