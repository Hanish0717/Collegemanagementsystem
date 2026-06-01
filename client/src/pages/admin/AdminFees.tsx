import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, DollarSign, Filter, Plus, Search, Send, X, Loader2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchFees,
  fetchFeesReport,
  fetchStudentFees,
  recordFeePayment,
  sendFeeReminder,
  FeeRecord,
  StudentDetail,
} from "@/services/feeService";
import { fetchStudents } from "@/services/adminService";

export function AdminFees() {
  // Filters & State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedViewFee, setSelectedViewFee] = useState<FeeRecord | null>(null);

  // Record Payment form state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [pendingFees, setPendingFees] = useState<FeeRecord[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");

  // Queries
  const { data: report, refetch: refetchReport } = useQuery({
    queryKey: ["admin", "fees", "report"],
    queryFn: fetchFeesReport,
  });

  const { data: feesData, isLoading: isListLoading, refetch: refetchList } = useQuery({
    queryKey: ["admin", "fees", "list", { search, statusFilter, page }],
    queryFn: () =>
      fetchFees({
        search: search || undefined,
        status: statusFilter !== "All Status" ? statusFilter.toLowerCase() : undefined,
        page,
        limit: 10,
      }),
  });

  // Fetch students search list for recording payments
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["admin", "students", "search", studentSearch],
    queryFn: () => fetchStudents({ search: studentSearch, limit: 10 }),
    enabled: isRecordPaymentOpen && studentSearch.trim().length > 1,
  });

  const studentsList = studentsData?.students || [];

  // Load selected student pending fees
  const { isLoading: isFeesLoading } = useQuery({
    queryKey: ["admin", "fees", "student", selectedStudent?.id || selectedStudent?._id],
    queryFn: () => fetchStudentFees(selectedStudent?.id || selectedStudent?._id),
    enabled: !!selectedStudent,
    meta: {
      onSuccess: (data: FeeRecord[]) => {
        const pending = data.filter(
          (f) => f.paymentStatus.toLowerCase() !== "paid"
        );
        setPendingFees(pending);
        if (pending.length > 0) {
          setSelectedFeeId(pending[0].id);
          setPayAmount(pending[0].remainingAmount);
        } else {
          setSelectedFeeId("");
          setPayAmount(0);
        }
      },
    },
  });

  // Keep manual effect for custom react-query v5 onSuccess workaround
  useEffect(() => {
    if (selectedStudent) {
      const studentId = selectedStudent.id || selectedStudent._id;
      fetchStudentFees(studentId)
        .then((data) => {
          const pending = data.filter(
            (f) => f.paymentStatus.toLowerCase() !== "paid"
          );
          setPendingFees(pending);
          if (pending.length > 0) {
            setSelectedFeeId(pending[0].id);
            setPayAmount(pending[0].remainingAmount);
          } else {
            setSelectedFeeId("");
            setPayAmount(0);
          }
        })
        .catch((err) => {
          console.error("Failed to load student fees:", err);
          toast.error("Failed to load student fees");
        });
    }
  }, [selectedStudent]);

  // Mutations
  const payMutation = useMutation({
    mutationFn: ({ feeId, payload }: { feeId: string; payload: any }) =>
      recordFeePayment(feeId, payload),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      setIsRecordPaymentOpen(false);
      // Reset form
      setSelectedStudent(null);
      setStudentSearch("");
      setPendingFees([]);
      setSelectedFeeId("");
      setPayAmount(0);
      setPaymentMethod("UPI");
      setTransactionId("");
      setRemarks("");
      // Refetch
      refetchReport();
      refetchList();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to record payment");
    },
  });

  const reminderMutation = useMutation({
    mutationFn: (feeType: string) => sendFeeReminder(feeType),
    onSuccess: (res) => {
      toast.success(res.message);
      refetchReport();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send reminders");
    },
  });

  // Handlers
  const handleSelectStudent = (stu: any) => {
    setSelectedStudent(stu);
  };

  const handleSubmitPayment = () => {
    if (!selectedFeeId || payAmount <= 0) {
      toast.error("Please select a fee and enter an amount");
      return;
    }
    payMutation.mutate({
      feeId: selectedFeeId,
      payload: {
        payAmount,
        paymentMethod,
        transactionId: transactionId || undefined,
        remarks: remarks || undefined,
      },
    });
  };

  const handleExportCSV = () => {
    const fees = feesData?.fees || [];
    if (fees.length === 0) {
      toast.error("No fee records to export");
      return;
    }
    const headers = ["Student Name", "Roll Number", "Fee Type", "Total Amount", "Paid Amount", "Remaining", "Due Date", "Status"];
    const rows = fees.map((fee) => {
      const stuName = typeof fee.student === "object" ? fee.student.fullName : fee.student;
      const roll = typeof fee.student === "object" ? fee.student.rollNumber : "";
      return [
        stuName,
        roll,
        fee.feeType,
        fee.totalAmount,
        fee.paidAmount,
        fee.remainingAmount,
        fee.dueDate,
        fee.paymentStatus,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fee_Records_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file exported successfully");
  };

  // Stats formatting helper
  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const totals = report?.totals || {
    collectedFees: 8470000,
    pendingFees: 1250000,
    overdueFees: 320000,
    totalRevenue: 10040000,
  };

  const dueCounts = report?.dueCounts || {
    "Tuition Fee": 142,
    "Hostel Fee": 48,
    "Lab Fee": 89,
  };

  const statCards = [
    { label: "Total Collected", value: formatLakhs(totals.collectedFees), tone: "success" as const },
    { label: "Pending Dues", value: formatLakhs(totals.pendingFees), tone: "warn" as const },
    { label: "Overdue", value: formatLakhs(totals.overdueFees), tone: "danger" as const },
    { label: "Scholarships", value: formatLakhs(totals.totalRevenue * 0.05), tone: "info" as const },
  ];

  const chartData = report?.monthlyAnalytics || [
    { month: "Jan", fees: 180 },
    { month: "Feb", fees: 200 },
    { month: "Mar", fees: 220 },
    { month: "Apr", fees: 230 },
    { month: "May", fees: 240 },
    { month: "Jun", fees: 250 },
  ];

  const reminderItems = [
    { label: "Tuition Fee Due", count: dueCounts["Tuition Fee"] || 0, rawLabel: "Tuition Fee" },
    { label: "Hostel Fee Due", count: dueCounts["Hostel Fee"] || 0, rawLabel: "Hostel Fee" },
    { label: "Lab Fee Due", count: dueCounts["Lab Fee"] || 0, rawLabel: "Lab Fee" },
  ];

  const feesList = feesData?.fees || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees Management"
        desc="Track fee collection, pending dues, payment history and scholarship tracking."
        actions={
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2"
          >
            <Plus className="size-4" /> Record Payment
          </button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              This Semester
            </Badge>
          </Card>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search payments by student, fee type..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none cursor-pointer"
          >
            {["All Status", "Paid", "Pending", "Overdue"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
            <Filter className="size-4" /> Filters
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition"
          >
            <Download className="size-4" /> Export
          </button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Analytics Chart */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Revenue Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
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

        {/* Reminders section */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold">Fee Reminders</h3>
          </div>
          <div className="space-y-3">
            {reminderItems.map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-gradient-soft border">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{item.count} students</span>
                  <button
                    disabled={reminderMutation.isPending || item.count === 0}
                    onClick={() => reminderMutation.mutate(item.rawLabel)}
                    className="px-2 py-1 rounded text-xs bg-gradient-primary text-white flex items-center gap-1 disabled:opacity-50"
                  >
                    {reminderMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Send className="size-3" />
                    )}
                    Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <h3 className="font-semibold mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          {isListLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : feesList.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No fee records found.
            </div>
          ) : (
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
                {feesList.map((record) => {
                  const studentName =
                    typeof record.student === "object"
                      ? record.student.fullName
                      : record.student;
                  const normalizedStatus =
                    record.paymentStatus.charAt(0).toUpperCase() +
                    record.paymentStatus.slice(1).toLowerCase();

                  return (
                    <tr key={record.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium">{studentName}</td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{record.feeType}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        ₹{record.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {record.dueDate}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            normalizedStatus === "Paid"
                              ? "success"
                              : normalizedStatus === "Overdue"
                              ? "danger"
                              : "warn"
                          }
                        >
                          {normalizedStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedViewFee(record)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {feesData?.pagination && feesData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 border-t pt-4">
            <span className="text-xs text-muted-foreground">
              Page {feesData.pagination.currentPage} of {feesData.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-accent disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= feesData.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-accent disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsRecordPaymentOpen(false);
                setSelectedStudent(null);
                setStudentSearch("");
                setPendingFees([]);
                setSelectedFeeId("");
                setPayAmount(0);
                setPaymentMethod("UPI");
                setTransactionId("");
                setRemarks("");
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Record Student Payment</h3>

            <div className="space-y-4">
              {/* Step 1: Search Student */}
              {!selectedStudent ? (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Search Student *</label>
                  <div className="relative mt-1.5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Type student name or roll number..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {isStudentsLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  )}

                  {studentsList.length > 0 && (
                    <div className="mt-2 border rounded-xl divide-y max-h-40 overflow-y-auto bg-background/90 shadow-lg">
                      {studentsList.map((stu: any) => (
                        <button
                          type="button"
                          key={stu.id || stu._id}
                          onClick={() => handleSelectStudent(stu)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent/50 transition flex justify-between items-center"
                        >
                          <span className="font-medium">{stu.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {stu.rollNumber} | {typeof stu.department === "object" && stu.department ? (stu.department.code || stu.department.name) : stu.department}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-accent/40 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">{selectedStudent.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedStudent.rollNumber} • {typeof selectedStudent.department === "object" && selectedStudent.department ? (selectedStudent.department.code || selectedStudent.department.name) : selectedStudent.department}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setPendingFees([]);
                      setSelectedFeeId("");
                    }}
                    className="text-xs text-red-500 hover:underline font-semibold"
                  >
                    Change Student
                  </button>
                </div>
              )}

              {/* Step 2: Select Pending Fee & Details */}
              {selectedStudent && (
                <>
                  {isFeesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  ) : pendingFees.length === 0 ? (
                    <p className="text-sm text-yellow-600 font-medium text-center py-2">
                      No pending or partial fee records found for this student.
                    </p>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Select Fee Record *</label>
                      <select
                        value={selectedFeeId}
                        onChange={(e) => {
                          const feeId = e.target.value;
                          setSelectedFeeId(feeId);
                          const fee = pendingFees.find((f) => f.id === feeId);
                          if (fee) setPayAmount(fee.remainingAmount);
                        }}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none cursor-pointer focus:border-primary"
                      >
                        <option value="">Select a pending fee</option>
                        {pendingFees.map((fee) => (
                          <option key={fee.id} value={fee.id}>
                            {fee.feeType} (Due: {fee.dueDate}) - Remaining: ₹
                            {fee.remainingAmount.toLocaleString("en-IN")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedFeeId && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Payment Amount (₹) *
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={pendingFees.find((f) => f.id === selectedFeeId)?.remainingAmount}
                            value={payAmount}
                            onChange={(e) => setPayAmount(Number(e.target.value))}
                            className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground">
                            Payment Method *
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none cursor-pointer focus:border-primary"
                          >
                            <option value="UPI">UPI (GPay/PhonePe)</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                          Transaction ID / Reference (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. TXN12345678"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Remarks (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Paid in full"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm outline-none focus:border-primary"
                        />
                      </div>

                      <button
                        disabled={payMutation.isPending}
                        onClick={handleSubmitPayment}
                        className="w-full py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition disabled:opacity-50"
                      >
                        {payMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                        Record Payment
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Details Receipt Modal */}
      {selectedViewFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedViewFee(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Payment Receipt Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Student Name:</span>
                <span className="font-semibold text-right">
                  {typeof selectedViewFee.student === "object"
                    ? selectedViewFee.student.fullName
                    : selectedViewFee.student}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Roll Number:</span>
                <span className="font-semibold text-right">
                  {typeof selectedViewFee.student === "object"
                    ? selectedViewFee.student.rollNumber
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fee Type:</span>
                <span className="font-semibold text-right">{selectedViewFee.feeType}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold text-right">
                  ₹{selectedViewFee.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="font-semibold text-green-600 text-right">
                  ₹{selectedViewFee.paidAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Remaining Due:</span>
                <span className="font-semibold text-red-600 text-right">
                  ₹{selectedViewFee.remainingAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-semibold text-right">{selectedViewFee.dueDate}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  tone={
                    selectedViewFee.paymentStatus.toLowerCase() === "paid"
                      ? "success"
                      : selectedViewFee.paymentStatus.toLowerCase() === "overdue"
                      ? "danger"
                      : "warn"
                  }
                >
                  {selectedViewFee.paymentStatus.toUpperCase()}
                </Badge>
              </div>
              {selectedViewFee.paymentMethod && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold text-right">{selectedViewFee.paymentMethod}</span>
                </div>
              )}
              {selectedViewFee.transactionId && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-semibold font-mono text-right">{selectedViewFee.transactionId}</span>
                </div>
              )}
              {selectedViewFee.remarks && (
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Remarks:</span>
                  <span className="font-semibold text-right">{selectedViewFee.remarks}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedViewFee(null)}
              className="w-full mt-4 py-2 border rounded-xl hover:bg-accent text-sm font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
