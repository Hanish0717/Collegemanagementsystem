import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  DollarSign,
  Download,
  Search,
  AlertTriangle,
  Receipt,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchHostelFees,
  payHostelFee,
  fetchDashboardCharts,
  fetchFeePayments,
} from "@/services/hostelService";
import generateReceiptPdf from "@/lib/receiptPdf";

export function HostelFees() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedTime, setSelectedTime] = useState("This Month");

  // Modal / Interaction State
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [historyTarget, setHistoryTarget] = useState<any>(null);
  const [recentPayment, setRecentPayment] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const receiptRef = useRef<HTMLDivElement | null>(null);

  // Queries
  const {
    data: feesList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["fees", search, selectedStatus, selectedTime],
    queryFn: () =>
      fetchHostelFees({
        search,
        status: selectedStatus,
        timeRange: selectedTime,
      }),
  });

  const { data: dashboardCharts } = useQuery({
    queryKey: ["hostel-charts"],
    queryFn: fetchDashboardCharts,
  });

  useEffect(() => {
    const channel = supabase
      .channel("hostel-fees-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hostel_fees" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["fees"] });
          queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
          queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
          queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: paymentHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ["fee-payments", historyTarget?.id],
    queryFn: () => fetchFeePayments(historyTarget.id).then((r: any) => r.payments),
    enabled: !!historyTarget,
  });

  // Mutations
  const payMutation = useMutation({
    mutationFn: ({ feeId, amount, method }: { feeId: string; amount: number; method: string }) =>
      payHostelFee(feeId, amount, method),
    // Optimistic update: update cached fee row immediately
    onMutate: async ({ feeId, amount }) => {
      await queryClient.cancelQueries({ queryKey: ["fees"] });
      const previous = queryClient.getQueryData<any[]>(["fees", search, selectedStatus, selectedTime]);

      queryClient.setQueriesData({ queryKey: ["fees"] }, (oldData: any) => {
        if (!oldData) return oldData;
        // oldData can be an array or an object, handle array case (list queries)
        if (Array.isArray(oldData)) {
          return oldData.map((f) => {
            if (f.id !== feeId) return f;
            const paid = Number(f.paidAmount || 0) + Number(amount || 0);
            const raw = Number(f.rawAmount || 0);
            const pending = Math.max(0, raw - paid);
            const status = paid >= raw ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending';
            return {
              ...f,
              paidAmount: paid,
              pendingAmount: pending,
              paymentStatus: status,
            };
          });
        }
        return oldData;
      });

      return { previous };
    },
    onError: (err: any, variables, context: any) => {
      // rollback
      if (context?.previous) {
        queryClient.setQueryData(["fees", search, selectedStatus, selectedTime], context.previous);
      }
      toast.error(err.message || "Failed to record payment");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // If server returned the updated fee, merge it into cache for immediate consistency
      const updatedFee = data?.data;
      if (updatedFee) {
        queryClient.setQueriesData({ queryKey: ["fees"] }, (oldData: any) => {
          if (!oldData) return oldData;
          if (Array.isArray(oldData)) {
            return oldData.map((f) => (f.id === updatedFee.id ? { ...f, ...updatedFee } : f));
          }
          return oldData;
        });
      }
      // show receipt modal if server returned payment
      const payment = data?.payment || null;
      if (payment) {
        setRecentPayment(payment);
        setShowReceiptModal(true);
      }
      toast.success("Payment recorded successfully!");
      setPaymentTarget(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });

  // Calculations
  const {
    totalCollected,
    pendingDues,
    overdueCount,
    collectionRate,
    totalStudentsCount,
    paidStudentsCount,
    pendingStudentsCount,
    overdueStudentsCount,
  } = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let overdueVal = 0;
    let overdueC = 0;
    let paidC = 0;
    let pendingC = 0;

    feesList.forEach((f) => {
      collected += f.paidAmount;
      pending += f.pendingAmount || 0;
      if (f.paymentStatus === "Paid") {
        paidC++;
      } else if (f.paymentStatus === "Overdue") {
        overdueC++;
        overdueVal += f.pendingAmount || 0;
      } else {
        pendingC++;
      }
    });

    const total = feesList.length;
    const rate = total > 0 ? (collected / (collected + pending || 1)) * 100 : 0;

    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

    return {
      totalCollected: formatter.format(collected),
      pendingDues: formatter.format(pending),
      overdueCount: formatter.format(overdueVal),
      collectionRate: `${rate.toFixed(1)}%`,
      totalStudentsCount: total,
      paidStudentsCount: paidC,
      pendingStudentsCount: pendingC,
      overdueStudentsCount: overdueC,
    };
  }, [feesList]);

  const handleDownloadInvoice = (fee: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${fee.receiptNumber || "N/A"}</title>
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
            <div style="font-size: 14px; color: #666; margin-top: 5px;">Hostel Fee Payment Receipt</div>
          </div>
          <div class="details">
            <div class="field"><span class="label">Receipt No:</span> ${fee.receiptNumber || "N/A"}</div>
            <div class="field"><span class="label">Payment Date:</span> ${new Date().toLocaleDateString()}</div>
            <div class="field"><span class="label">Student Name:</span> ${fee.studentName}</div>
            <div class="field"><span class="label">Room Number:</span> ${fee.roomNumber}</div>
            <div class="field"><span class="label">Payment Status:</span> ${fee.paymentStatus}</div>
            <div class="field"><span class="label">Payment Method:</span> ${fee.paymentMethod || "Online"}</div>
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
                <td>Hostel Accommodation and Mess Charges</td>
                <td style="text-align: right;">${fee.feeAmount}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td>Total Paid</td>
                <td style="text-align: right;">${fee.feeAmount}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for your payment. For any queries, contact the Hostel Office.
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
  };

  const handleExportCSV = () => {
    if (feesList.length === 0) {
      toast.error("No fee data to export");
      return;
    }
    const headers = ["Student Name", "Room Number", "Fee Amount", "Due Date", "Status", "Receipt No", "Payment Method"];
    const rows = feesList.map(f => [
      f.studentName,
      f.roomNumber,
      f.feeAmount,
      f.dueDate,
      f.paymentStatus,
      f.receiptNumber || "N/A",
      f.paymentMethod || "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hostel_Fees_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTarget) return;

    payMutation.mutate({
      feeId: paymentTarget.id,
      amount: paymentTarget.rawAmount,
      method: paymentMethod,
    });
  };

  const handlePrintPayment = (payment: any, fee?: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const studentName = fee?.studentName || payment.resident_name || "Resident";
    const roomNumber = fee?.roomNumber || payment.room_number || "-";
    const amountStr = `₹${Number(payment.amount_paid || payment.amount || 0).toLocaleString('en-IN')}`;
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${payment.receiptNumber || payment.receipt_number || 'N/A'}</title>
          <style>body{font-family:sans-serif;padding:30px;color:#333} .header{border-bottom:2px solid #4F46E5;padding-bottom:20px;margin-bottom:20px}.title{font-size:20px;font-weight:700;color:#4F46E5}</style>
        </head>
        <body>
          <div class="header"><div class="title">COLLEGE MANAGEMENT SYSTEM</div><div style="font-size:13px;color:#666;margin-top:4px">Hostel Fee Payment Receipt</div></div>
          <div><strong>Receipt:</strong> ${payment.receiptNumber || payment.receipt_number || 'N/A'}</div>
          <div><strong>Student:</strong> ${studentName}</div>
          <div><strong>Room:</strong> ${roomNumber}</div>
          <div><strong>Amount Paid:</strong> ${amountStr}</div>
          <div><strong>Payment Date:</strong> ${new Date(payment.payment_date || payment.paymentDate || Date.now()).toLocaleString()}</div>
          <div style="margin-top:20px;font-size:12px;color:#777">Thank you for your payment.</div>
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleViewReceipt = async (fee: any) => {
    try {
      const { payments } = await fetchFeePayments(fee.id, { page: 1, limit: 1 });
      if (!payments || payments.length === 0) {
        // Fallback: generate printable invoice from fee data if no payment history exists
        handleDownloadInvoice(fee);
        return;
      }
      const payment = payments[0];
      setRecentPayment(payment);
      setShowReceiptModal(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load receipt');
    }
  };

  const feeAnalyticsFallback = [
    { month: "Jan", collected: 75000, pending: 15000 },
    { month: "Feb", collected: 78000, pending: 12000 },
    { month: "Mar", collected: 82000, pending: 8000 },
    { month: "Apr", collected: 85000, pending: 5000 },
    { month: "May", collected: 89500, pending: 500 },
  ];
  const feeAnalytics = dashboardCharts?.feeCollectionData || feeAnalyticsFallback;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Fee Tracking"
        desc="Manage hostel fee collection, pending dues, and payment history."
        actions={
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Download className="size-4" /> Export Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: totalCollected, tone: "success" as const },
          { label: "Pending Dues", value: pendingDues, tone: "warn" as const },
          { label: "Overdue", value: overdueCount, tone: "danger" as const },
          { label: "Collection Rate", value: collectionRate, tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              This Month
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search by student name or room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Status", "Paid", "Pending", "Overdue"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["This Month", "Last Month", "This Semester"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Payment History</h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading fee records...</span>
            </div>
          ) : isError ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
              <AlertCircle className="size-8 mx-auto text-rose-500" />
              <p>{error instanceof Error ? error.message : "Failed to load fee tracking details."}</p>
            </div>
          ) : feesList.length === 0 ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground">
              No fee records found matching the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {[
                      "Student Name",
                      "Room Number",
                      "Fee Amount",
                      "Due Date",
                      "Payment Status",
                      "Receipt / Action",
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
                  {feesList.map((fee) => (
                    <tr key={fee.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium">{fee.studentName}</td>
                      <td className="py-3 px-4">{fee.roomNumber}</td>
                      <td className="py-3 px-4">{fee.feeAmount}</td>
                      <td className="py-3 px-4 text-muted-foreground">{fee.dueDate}</td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            fee.paymentStatus === "Paid"
                              ? "success"
                              : fee.paymentStatus === "Overdue"
                                ? "danger"
                                : "warn"
                          }
                        >
                          {fee.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {fee.paymentStatus === "Paid" ? (
                            <button
                              onClick={() => handleDownloadInvoice(fee)}
                              className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt className="size-3" /> Receipt
                            </button>
                          ) : (
                            <button
                              onClick={() => setPaymentTarget(fee)}
                              className="px-2 py-1 rounded text-xs bg-indigo text-white hover:opacity-90 transition flex items-center gap-1 cursor-pointer font-medium"
                            >
                              <Check className="size-3" /> Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => setHistoryTarget(fee)}
                            className="px-2 py-1 rounded text-xs border hover:bg-accent transition flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="size-3" /> History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {feesList
              .filter((f) => f.paymentStatus !== "Paid")
              .slice(0, 5)
              .map((fee) => (
                <div
                  key={fee.id}
                  className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition cursor-pointer"
                  onClick={() => setPaymentTarget(fee)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{fee.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        Room {fee.roomNumber} • Due: {fee.dueDate}
                      </div>
                    </div>
                    <Badge tone={fee.paymentStatus === "Overdue" ? "danger" : "warn"}>
                      {fee.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1.5">Amount: {fee.feeAmount}</div>
                </div>
              ))}
            {feesList.filter((f) => f.paymentStatus !== "Paid").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                All fees have been collected!
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award className="size-5 text-indigo" />
            <h3 className="font-semibold">Scholarship Allocation Details</h3>
          </div>
          <div className="space-y-2">
            {[
              {
                student: "Rahul Sharma",
                scholarship: "Merit Scholarship",
                amount: "₹25,000",
                status: "Active",
              },
              {
                student: "Priya Patel",
                scholarship: "Need-based Aid",
                amount: "₹18,000",
                status: "Active",
              },
              {
                student: "Sneha Reddy",
                scholarship: "Sports Scholarship",
                amount: "₹12,000",
                status: "Active",
              },
            ].map((scholarship) => (
              <div
                key={scholarship.student}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div>
                  <div className="text-sm font-medium">{scholarship.student}</div>
                  <div className="text-xs text-muted-foreground">{scholarship.scholarship}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{scholarship.amount}</div>
                  <Badge
                    tone={scholarship.status === "Active" ? "success" : "warn"}
                    className="mt-1"
                  >
                    {scholarship.status}
                  </Badge>
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
            { label: "Total Students Listed", value: String(totalStudentsCount), icon: "👥" },
            { label: "Paid Students", value: String(paidStudentsCount), icon: "✅" },
            { label: "Pending Students", value: String(pendingStudentsCount), icon: "⏳" },
            { label: "Overdue Students", value: String(overdueStudentsCount), icon: "⚠️" },
          ].map((summary) => (
            <div key={summary.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-2xl mb-2">{summary.icon}</div>
              <div className="text-xs text-muted-foreground">{summary.label}</div>
              <div className="text-xl font-bold mt-1">{summary.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Record Payment Modal */}
      {paymentTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-background rounded-2xl border max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base font-sans">Receive Fee Payment</h3>
              <button
                type="button"
                onClick={() => setPaymentTarget(null)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-accent/40 p-3 rounded-lg border text-sm space-y-1">
                <div><span className="text-muted-foreground">Student Name:</span> <span className="font-semibold">{paymentTarget.studentName}</span></div>
                <div><span className="text-muted-foreground">Room Number:</span> <span className="font-semibold">{paymentTarget.roomNumber}</span></div>
                <div><span className="text-muted-foreground">Amount Due:</span> <span className="font-bold text-emerald-600">{paymentTarget.feeAmount}</span></div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
                >
                  {["Cash", "Online UPI", "Net Banking", "Cheque", "Demand Draft"].map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 bg-gradient-soft border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentTarget(null)}
                className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Payment History Modal */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background rounded-2xl border max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Payment History — {historyTarget.studentName}</h3>
              <button onClick={() => setHistoryTarget(null)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"><X className="size-4" /></button>
            </div>
            <div className="p-4">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="size-8 text-primary animate-spin" /></div>
              ) : paymentHistory.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No payments recorded for this fee.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        {['Date', 'Amount', 'Method', 'Txn ID', 'Receipt', 'Action'].map((c) => (
                          <th key={c} className="text-left py-3 px-4 font-semibold text-muted-foreground">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paymentHistory.map((p: any) => (
                        <tr key={p.id} className="hover:bg-accent/50 transition">
                          <td className="py-3 px-4">{new Date(p.paymentDate || p.payment_date || Date.now()).toLocaleString()}</td>
                          <td className="py-3 px-4">₹{Number(p.amountPaid).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">{p.paymentMethod || p.payment_method || '—'}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{p.transactionId || p.transaction_id || '—'}</td>
                          <td className="py-3 px-4">{p.receiptNumber || p.receipt_number || '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => handlePrintPayment(p, historyTarget)} className="px-2 py-1 rounded text-xs border hover:bg-accent transition">Print</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setHistoryTarget(null)} className="px-4 py-2 rounded-xl border bg-background">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Receipt Modal (auto-open after payment) */}
      {showReceiptModal && recentPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background rounded-2xl border max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Payment Receipt</h3>
              <button onClick={() => { setShowReceiptModal(false); setRecentPayment(null); }} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"><X className="size-4" /></button>
            </div>
            <div ref={receiptRef} className="p-6 space-y-3">
              <div className="text-sm text-muted-foreground">Receipt No</div>
              <div className="text-lg font-semibold">{recentPayment.receipt_number || recentPayment.receiptNumber || 'N/A'}</div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Student</div>
                  <div className="font-medium">{recentPayment.resident_name || recentPayment.student_name || 'Resident'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">₹{Number(recentPayment.amount_paid || recentPayment.amount || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Transaction ID</div>
                  <div className="text-xs text-muted-foreground break-all">{recentPayment.transaction_id || recentPayment.transactionId || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Method</div>
                  <div className="text-xs text-muted-foreground">{recentPayment.payment_method || recentPayment.paymentMethod || '—'}</div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handlePrintPayment(recentPayment)}
                  className="px-4 py-2 rounded-xl border hover:bg-accent"
                >
                  Print
                </button>
                <button
                  onClick={async () => {
                    try {
                      const filename = `Hostel_Receipt_${recentPayment.receipt_number || recentPayment.receiptNumber || recentPayment.id}.pdf`;
                      await generateReceiptPdf(receiptRef.current, filename);
                      toast.success("PDF downloaded");
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to generate PDF");
                    }
                  }}
                  className="px-4 py-2 rounded-xl border hover:bg-accent flex items-center gap-2"
                >
                  <Download className="size-4" /> Download PDF
                </button>
                <button
                  onClick={async () => {
                    const text = recentPayment.transaction_id || recentPayment.transactionId || '';
                    try {
                      await navigator.clipboard.writeText(text);
                      toast.success('Transaction ID copied');
                    } catch (e) {
                      toast.error('Copy failed');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-primary text-white"
                >
                  Copy Txn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
