import { useState, useEffect } from "react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { Wallet, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export function FeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({
    totalRevenue: 0,
    collectedFees: 0,
    pendingFees: 0,
    overdueFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payMethod, setPayMethod] = useState("Credit/Debit Card");
  const [payAmount, setPayAmount] = useState<string>("");

  const fetchData = async () => {
    try {
      const [listRes, reportRes] = await Promise.all([
        api.get("/api/fees?limit=50"),
        api.get("/api/fees/report")
      ]);

      if (listRes.data?.success && listRes.data?.data?.fees) {
        setFees(listRes.data.data.fees);
      }
      if (reportRes.data?.success && reportRes.data?.data?.totals) {
        setTotals(reportRes.data.data.totals);
      }
    } catch (err) {
      console.error("Error loading fees database stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (payTarget) {
      setPayAmount(String(payTarget.remainingAmount || (payTarget.totalAmount - payTarget.paidAmount) || 0));
    }
  }, [payTarget]);

  const handleDownloadInvoice = (fee: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download invoice.");
      return;
    }
    const studentName = typeof fee.student === "object" ? fee.student.fullName : fee.student;
    const amountVal = fee.totalAmount || fee.amount || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${fee.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #4F46E5; padding-bottom: 25px; margin-bottom: 25px; }
            .title { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .details { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .field { font-size: 14px; margin-bottom: 8px; }
            .label { font-weight: bold; color: #666; }
            .receipt-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .receipt-table th { background-color: #F3F4F6; text-align: left; padding: 12px; }
            .receipt-table td { border-bottom: 1px solid #E5E7EB; padding: 12px; }
            .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; border-top: 1px dashed #E5E7EB; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">COLLEGE MANAGEMENT SYSTEM</div>
            <div style="font-size: 14px; color: #666; margin-top: 5px;">Academic Fee Invoice</div>
          </div>
          <div class="details">
            <div class="field"><span class="label">Invoice No:</span> ${fee.id}</div>
            <div class="field"><span class="label">Due Date:</span> ${fee.dueDate || fee.due_date || ""}</div>
            <div class="field"><span class="label">Student Name:</span> ${studentName || ""}</div>
            <div class="field"><span class="label">Semester:</span> ${fee.semester || ""}</div>
            <div class="field"><span class="label">Payment Status:</span> ${fee.paymentStatus || fee.status || ""}</div>
          </div>
          <table class="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${fee.feeType || 'College Tuition/Academic Fee'}</td>
                <td style="text-align: right;">₹${(amountVal).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td>Total Paid</td>
                <td style="text-align: right;">₹${(fee.paidAmount || fee.paid_amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for the payment. This is a system-generated receipt.
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success(`Generating invoice print view for ${fee.id}...`);
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;

    try {
      const res = await api.post(`/api/fees/pay/${payTarget.id}`, {
        amount: Number(payAmount),
        paymentMethod: payMethod,
        transactionId: "TXN" + Math.floor(100000 + Math.random() * 900000),
        remarks: "Received from college payment admin portal"
      });

      if (res.data?.success) {
        toast.success("Payment recorded successfully in database!");
        setPayTarget(null);
        fetchData();
      }
    } catch (err: any) {
      console.error("Payment registration failed:", err);
      toast.error(err.response?.data?.message || "Failed to submit fee payment");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fees & Billings" desc="Loading billing information..." />
        <div className="p-8 text-center text-muted-foreground">Loading fee ledger...</div>
      </div>
    );
  }

  // Format currency helpers
  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const paidCount = fees.filter(f => f.paymentStatus?.toLowerCase() === "paid").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Fees" desc="Track collections, dues and invoices." />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Collected"
          value={formatLakhs(totals.collectedFees)}
          change=""
          icon={Wallet}
          gradient="bg-gradient-primary"
        />
        <StatCard 
          label="Pending Balance" 
          value={formatLakhs(totals.pendingFees)} 
          icon={AlertCircle} 
          gradient="bg-gradient-violet" 
        />
        <StatCard
          label="Paid Invoices"
          value={String(paidCount)}
          change=""
          icon={CheckCircle2}
          gradient="bg-gradient-cyan"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {fees.slice(0, 3).map((f) => {
          const studentName = (f.student && typeof f.student === "object") ? f.student.fullName : (f.student || "—");
          return (
            <Card key={f.id} className="gradient-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-mono">{f.id}</div>
                  <div className="font-semibold mt-1">{studentName}</div>
                  <div className="text-xs text-muted-foreground">Due: {f.dueDate}</div>
                </div>
                <Badge
                  tone={f.paymentStatus === "paid" || f.paymentStatus === "Paid" ? "success" : f.paymentStatus === "overdue" || f.paymentStatus === "Overdue" ? "danger" : "warn"}
                >
                  {f.paymentStatus}
                </Badge>
              </div>
              <div className="mt-4 text-2xl font-bold text-gradient">
                ₹{(f.totalAmount || 0).toLocaleString('en-IN')}
              </div>
              <button
                onClick={() => {
                  if (f.paymentStatus === "paid" || f.paymentStatus === "Paid") {
                    handleDownloadInvoice(f);
                  } else {
                    setPayTarget(f);
                  }
                }}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-white text-sm py-2 glow-primary cursor-pointer hover:opacity-95 transition"
              >
                {f.paymentStatus === "paid" || f.paymentStatus === "Paid" ? (
                  <>
                    <Download className="size-4" /> Invoice
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
            </Card>
          );
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b font-semibold">Payment History & Ledger</div>
        {fees.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                {["Invoice", "Student", "Amount", "Paid Amount", "Due Date", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => {
                const studentName = (f.student && typeof f.student === "object") ? f.student.fullName : (f.student || "—");
                const isPaid = f.paymentStatus === "paid" || f.paymentStatus === "Paid";
                return (
                  <tr key={f.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{f.id}</td>
                    <td className="px-5 py-3 font-medium">{studentName}</td>
                    <td className="px-5 py-3 font-semibold">₹{(f.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">₹{(f.paidAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-muted-foreground">{f.dueDate}</td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          isPaid ? "success" : f.paymentStatus === "overdue" || f.paymentStatus === "Overdue" ? "danger" : "warn"
                        }
                      >
                        {f.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isPaid ? (
                        <button
                          onClick={() => handleDownloadInvoice(f)}
                          className="text-indigo text-xs font-medium hover:underline cursor-pointer"
                        >
                          Download
                        </button>
                      ) : (
                        <button
                          onClick={() => setPayTarget(f)}
                          className="text-indigo text-xs font-semibold hover:underline cursor-pointer"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-muted-foreground border-t">No student bills found in database.</div>
        )}
      </Card>

      {/* Pay Now confirmation modal */}
      {payTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleConfirmPay}
            className="bg-background rounded-2xl border max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Make Fee Payment</h3>
              <button
                type="button"
                onClick={() => setPayTarget(null)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-accent/40 p-3 rounded-lg border text-sm space-y-1">
                <div><span className="text-muted-foreground">Student:</span> <span className="font-semibold">{typeof payTarget.student === "object" ? payTarget.student.fullName : payTarget.student}</span></div>
                <div><span className="text-muted-foreground">Invoice ID:</span> <span className="font-semibold font-mono text-xs">{payTarget.id}</span></div>
                <div><span className="text-muted-foreground">Total Fee:</span> <span className="font-semibold">₹{(payTarget.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                <div><span className="text-muted-foreground">Remaining:</span> <span className="font-bold text-indigo">₹{(payTarget.remainingAmount || (payTarget.totalAmount - payTarget.paidAmount) || 0).toLocaleString('en-IN')}</span></div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium font-semibold">Payment Mode</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                >
                  {["Credit/Debit Card", "UPI Payment", "Net Banking", "Cash"].map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium font-semibold">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="p-6 bg-gradient-soft border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayTarget(null)}
                className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
