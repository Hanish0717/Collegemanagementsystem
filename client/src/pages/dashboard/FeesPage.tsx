import { useState } from "react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { fees } from "@/mock/mockData";
import { Wallet, AlertCircle, CheckCircle2, Download, X } from "lucide-react";
import { toast } from "sonner";

export function FeesPage() {
  const [localFees, setLocalFees] = useState(fees);
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payMethod, setPayMethod] = useState("Cash");

  const handleDownloadInvoice = (fee: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download invoice.");
      return;
    }
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
            <div style="font-size: 14px; color: #666; margin-top: 5px;">Hostel Fee Payment Invoice</div>
          </div>
          <div class="details">
            <div class="field"><span class="label">Invoice No:</span> ${fee.id}</div>
            <div class="field"><span class="label">Payment Date:</span> ${fee.date}</div>
            <div class="field"><span class="label">Student Name:</span> ${fee.student}</div>
            <div class="field"><span class="label">Room Number:</span> ${fee.roomNumber || 'N/A'}</div>
            <div class="field"><span class="label">Room Type:</span> ${fee.roomType || 'N/A'}</div>
            <div class="field"><span class="label">Payment Status:</span> ${fee.status}</div>
          </div>
          <table class="receipt-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Room Reference</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${fee.feeType || 'Hostel Accommodation Fee'}</td>
                <td style="color: #555; font-size: 13px;">Room ${fee.roomNumber || ''} &middot; ${fee.roomType || ''}</td>
                <td style="text-align: right;">₹${fee.amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td>Total Paid</td>
                <td></td>
                <td style="text-align: right;">₹${fee.amount.toLocaleString('en-IN')}</td>
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

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;

    setLocalFees(
      localFees.map((f) =>
        f.id === payTarget.id ? { ...f, status: "Paid" } : f
      )
    );
    toast.success(`Recorded payment of ₹${payTarget.amount.toLocaleString('en-IN')} for ${payTarget.student} via ${payMethod}!`);
    setPayTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Fees" desc="Track collections, dues and invoices." />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Collected"
          value="₹1.24Cr"
          change="+12.5%"
          icon={Wallet}
          gradient="bg-gradient-primary"
        />
        <StatCard label="Pending" value="₹18.4L" icon={AlertCircle} gradient="bg-gradient-violet" />
        <StatCard
          label="Paid Invoices"
          value="3,240"
          change="+8%"
          icon={CheckCircle2}
          gradient="bg-gradient-cyan"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {localFees.slice(0, 3).map((f) => (
          <Card key={f.id} className="gradient-border">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-mono">{f.id}</div>
                <div className="font-semibold mt-1">{f.student}</div>
                <div className="text-xs text-muted-foreground">{f.date}</div>
              </div>
              <Badge
                tone={f.status === "Paid" ? "success" : f.status === "Pending" ? "warn" : "danger"}
              >
                {f.status}
              </Badge>
            </div>
            <div className="mt-4 text-2xl font-bold text-gradient">
              ₹{f.amount.toLocaleString('en-IN')}
            </div>
            <button
              onClick={() => {
                if (f.status === "Paid") {
                  handleDownloadInvoice(f);
                } else {
                  setPayTarget(f);
                }
              }}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary text-white text-sm py-2 glow-primary cursor-pointer hover:opacity-95 transition"
            >
              {f.status === "Paid" ? (
                <>
                  <Download className="size-4" /> Invoice
                </>
              ) : (
                "Pay Now"
              )}
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b font-semibold">Payment History</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              {["Invoice", "Student", "Amount", "Date", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localFees.map((f) => (
              <tr key={f.id} className="border-t hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{f.id}</td>
                <td className="px-5 py-3 font-medium">{f.student}</td>
                <td className="px-5 py-3 font-semibold">₹{f.amount.toLocaleString('en-IN')}</td>
                <td className="px-5 py-3 text-muted-foreground">{f.date}</td>
                <td className="px-5 py-3">
                  <Badge
                    tone={
                      f.status === "Paid" ? "success" : f.status === "Pending" ? "warn" : "danger"
                    }
                  >
                    {f.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  {f.status === "Paid" ? (
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
            ))}
          </tbody>
        </table>
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
                <div><span className="text-muted-foreground">Student Name:</span> <span className="font-semibold">{payTarget.student}</span></div>
                <div><span className="text-muted-foreground">Invoice ID:</span> <span className="font-semibold font-mono text-xs">{payTarget.id}</span></div>
                {payTarget.roomNumber && (
                  <div><span className="text-muted-foreground">Room:</span> <span className="font-semibold">{payTarget.roomNumber} &mdash; {payTarget.roomType}</span></div>
                )}
                {payTarget.feeType && (
                  <div><span className="text-muted-foreground">Fee Type:</span> <span className="font-semibold">{payTarget.feeType}</span></div>
                )}
                <div><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-indigo">₹{payTarget.amount.toLocaleString('en-IN')}</span></div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Payment Mode</label>
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
