import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, DollarSign } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { feeRecords } from "@/mock/studentData";

export function StudentFees() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Payments"
        desc="View fee structure, payment history, and make online payments."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Due", value: "₹45,000", tone: "warn" as const },
          { label: "Overdue", value: "₹35,000", tone: "danger" as const },
          { label: "Paid This Year", value: "₹1,00,000", tone: "success" as const },
          { label: "Next Due", value: "May 25", tone: "info" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Fee Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Fee Type", "Amount", "Due Date", "Status"].map((column) => (
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
                  <td className="py-3 px-4 font-medium">{record.feeType}</td>
                  <td className="py-3 px-4 font-medium">{record.amount}</td>
                  <td className="py-3 px-4">{record.dueDate}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="size-5 text-indigo" />
            <h3 className="font-semibold">Make Payment</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {feeRecords
                .filter((f) => f.status !== "Paid")
                .map((f) => (
                  <option key={f.feeType}>
                    {f.feeType} - {f.amount}
                  </option>
                ))}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                placeholder="Card number"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                placeholder="MM/YY"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                placeholder="CVV"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                placeholder="Cardholder name"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Pay Now
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold">Payment Methods</h3>
          </div>
          <div className="space-y-3">
            {[
              { method: "Credit Card", icon: "💳", status: "Active" },
              { method: "Debit Card", icon: "💳", status: "Active" },
              { method: "Net Banking", icon: "🏦", status: "Active" },
              { method: "UPI", icon: "📱", status: "Active" },
            ].map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.method}</span>
                </div>
                <Badge tone="success">{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Payment History</h3>
        <div className="space-y-2">
          {[
            { type: "Tuition Fee", amount: "$2,500", date: "2026-01-15", status: "Paid" },
            { type: "Hostel Fee", amount: "$800", date: "2026-02-15", status: "Paid" },
            { type: "Lab Fee", amount: "$500", date: "2026-03-15", status: "Paid" },
            { type: "Library Fee", amount: "$200", date: "2026-04-15", status: "Paid" },
          ].map((payment) => (
            <div
              key={payment.date}
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
            >
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                {payment.type.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{payment.type}</div>
                <div className="text-xs text-muted-foreground">{payment.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{payment.amount}</div>
                <Badge tone="success">{payment.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
