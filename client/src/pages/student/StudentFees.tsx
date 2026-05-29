import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, DollarSign } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { feeRecords } from "@/mock/studentData";
import api from "@/lib/api";

export function StudentFees() {
  const [fees, setFees] = useState<any[]>(feeRecords);
  const [history, setHistory] = useState<any[]>([
    { type: "Tuition Fee", amount: "$2,500", date: "2026-01-15", status: "Paid" },
    { type: "Hostel Fee", amount: "$800", date: "2026-02-15", status: "Paid" },
    { type: "Lab Fee", amount: "$500", date: "2026-03-15", status: "Paid" },
    { type: "Library Fee", amount: "$200", date: "2026-04-15", status: "Paid" },
  ]);
  const [stats, setStats] = useState([
    { label: "Total Due", value: "$1,250", tone: "warn" as const },
    { label: "Overdue", value: "$800", tone: "danger" as const },
    { label: "Paid This Year", value: "$8,500", tone: "success" as const },
    { label: "Next Due", value: "May 25", tone: "info" as const },
  ]);

  const [selectedFeeType, setSelectedFeeType] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchFees = async () => {
    try {
      const profileStr = localStorage.getItem("cms_student_profile");
      if (!profileStr) return;
      const profile = JSON.parse(profileStr);
      if (!profile || !profile._id) return;

      const res = await api.get(`/api/fees/student/${profile._id}`);
      if (res.data?.success && res.data?.data) {
        const { fees: dbFees, summary } = res.data.data;

        if (dbFees && dbFees.length > 0) {
          const mappedFees = dbFees.map((f: any) => ({
            feeType: f.feeType.charAt(0).toUpperCase() + f.feeType.slice(1) + " Fee",
            amount: `$${f.totalAmount}`,
            dueDate: new Date(f.dueDate).toISOString().split('T')[0],
            status: f.paymentStatus.charAt(0).toUpperCase() + f.paymentStatus.slice(1)
          }));
          setFees(mappedFees);

          const paidFees = dbFees.filter((f: any) => f.paidAmount > 0).map((f: any) => ({
            type: f.feeType.charAt(0).toUpperCase() + f.feeType.slice(1) + " Fee",
            amount: `$${f.paidAmount}`,
            date: new Date(f.updatedAt || Date.now()).toISOString().split('T')[0],
            status: "Paid"
          }));
          setHistory(paidFees);
        }

        if (summary) {
          setStats([
            { label: "Total Due", value: `$${summary.totalRemaining}`, tone: "warn" as const },
            { label: "Overdue", value: `$${summary.totalRemaining > 0 && summary.overdueCount > 0 ? summary.totalRemaining : 0}`, tone: "danger" as const },
            { label: "Paid This Year", value: `$${summary.totalPaid}`, tone: "success" as const },
            { label: "Next Due", value: dbFees.find((f: any) => f.paymentStatus !== "paid") ? new Date(dbFees.find((f: any) => f.paymentStatus !== "paid").dueDate).toLocaleDateString() : "None", tone: "info" as const },
          ]);
        }
      }
    } catch (err) {
      console.error("Error loading fees data:", err);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      alert("Online payment simulation successful! Once approved by the administrator, your record will update.");
    }, 1500);
  };

  const pendingFeesList = fees.filter(f => f.status !== "Paid");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Payments"
        desc="View fee structure, payment history, and make online payments."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map(stat => (
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
              {fees.map((record, index) => (
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
          <form onSubmit={handlePayment} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select
              value={selectedFeeType}
              onChange={(e) => setSelectedFeeType(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Choose Fee to Pay --</option>
              {pendingFeesList.map(f => <option key={f.feeType} value={f.feeType}>{f.feeType} - {f.amount}</option>)}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Card number" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input required placeholder="MM/YY" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input required placeholder="CVV" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input required placeholder="Cardholder name" className="rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <button
              type="submit"
              disabled={paymentLoading || !selectedFeeType}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {paymentLoading ? "Processing..." : "Pay Now"}
            </button>
          </form>
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
          {history.length > 0 ? (
            history.map((payment, i) => (
              <div key={payment.date + i} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
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
            ))
          ) : (
            <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
              No payments made yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
