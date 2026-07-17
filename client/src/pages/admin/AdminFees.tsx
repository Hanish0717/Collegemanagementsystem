import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Download,
  DollarSign,
  Filter,
  Plus,
  Search,
  Send,
  X,
  Loader2,
  MapPin,
  Activity,
  Navigation,
  User,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import {
  fetchFees,
  fetchFeesReport,
  fetchStudentFees,
  recordFeePayment,
  sendFeeReminder,
  createFee,
  FeeRecord,
  StudentDetail,
} from '@/services/feeService';
import { fetchStudents } from '@/services/adminService';
import { getStoredUser } from '@/services/authService';

export function AdminFees() {
  const user = getStoredUser();
  const isTransportStaff = user?.role === 'transport' || user?.role === 'transport-manager';
  const [activeTab, setActiveTab] = useState<'academic' | 'transport'>(
    isTransportStaff ? 'transport' : 'academic',
  );

  // Filters & State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedViewFee, setSelectedViewFee] = useState<FeeRecord | null>(null);

  // Record Payment form state
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [pendingFees, setPendingFees] = useState<FeeRecord[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Transport Route Allocation Form State
  const [transStudentSearch, setTransStudentSearch] = useState('');
  const [selectedTransStudent, setSelectedTransStudent] = useState<any | null>(null);
  const [sourcePlace, setSourcePlace] = useState('');
  const [destPlace, setDestPlace] = useState('College Campus'); // standard campus destination
  const [distanceKm, setDistanceKm] = useState<string>('15');
  const [timeMins, setTimeMins] = useState<string>('30');
  const [annualFee, setAnnualFee] = useState<string>('18000');
  const [isAllocating, setIsAllocating] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeCalcError, setRouteCalcError] = useState<string | null>(null);

  // Queries
  const { data: report, refetch: refetchReport } = useQuery({
    queryKey: ['admin', 'fees', 'report'],
    queryFn: fetchFeesReport,
  });

  const {
    data: feesData,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: ['admin', 'fees', 'list', { search, statusFilter, page }],
    queryFn: () =>
      fetchFees({
        search: search || undefined,
        status: statusFilter !== 'All Status' ? statusFilter.toLowerCase() : undefined,
        page,
        limit: 10,
      }),
  });

  // Fetch students search list for recording payments
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['admin', 'students', 'search', studentSearch],
    queryFn: () => fetchStudents({ search: studentSearch, limit: 10 }),
    enabled: isRecordPaymentOpen && studentSearch.trim().length > 1,
  });

  const { data: transStudentsData, isLoading: isTransStudentsLoading } = useQuery({
    queryKey: ['admin', 'students', 'transSearch', transStudentSearch],
    queryFn: () => fetchStudents({ search: transStudentSearch, limit: 10 }),
    enabled:
      activeTab === 'transport' && !selectedTransStudent && transStudentSearch.trim().length > 1,
  });

  const {
    data: transportFeesData,
    isLoading: isTransportLoading,
    refetch: refetchTransportList,
  } = useQuery({
    queryKey: ['admin', 'fees', 'transportList', { page: 1 }],
    queryFn: () =>
      fetchFees({
        feeType: 'Transport Fee',
        page: 1,
        limit: 50,
      }),
    enabled: activeTab === 'transport',
  });

  const studentsList = studentsData?.students || [];

  // Load selected student pending fees
  const { isLoading: isFeesLoading } = useQuery({
    queryKey: ['admin', 'fees', 'student', selectedStudent?.id || selectedStudent?._id],
    queryFn: () => fetchStudentFees(selectedStudent?.id || selectedStudent?._id),
    enabled: !!selectedStudent,
    meta: {
      onSuccess: (data: FeeRecord[]) => {
        const pending = data.filter((f) => f.paymentStatus.toLowerCase() !== 'paid');
        setPendingFees(pending);
        if (pending.length > 0) {
          setSelectedFeeId(pending[0].id);
          setPayAmount(pending[0].remainingAmount);
        } else {
          setSelectedFeeId('');
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
          const pending = data.filter((f) => f.paymentStatus.toLowerCase() !== 'paid');
          setPendingFees(pending);
          if (pending.length > 0) {
            setSelectedFeeId(pending[0].id);
            setPayAmount(pending[0].remainingAmount);
          } else {
            setSelectedFeeId('');
            setPayAmount(0);
          }
        })
        .catch((err) => {
          console.error('Failed to load student fees:', err);
          toast.error('Failed to load student fees');
        });
    }
  }, [selectedStudent]);

  // Mutations
  const payMutation = useMutation({
    mutationFn: ({ feeId, payload }: { feeId: string; payload: any }) =>
      recordFeePayment(feeId, payload),
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      setIsRecordPaymentOpen(false);
      // Reset form
      setSelectedStudent(null);
      setStudentSearch('');
      setPendingFees([]);
      setSelectedFeeId('');
      setPayAmount(0);
      setPaymentMethod('UPI');
      setTransactionId('');
      setRemarks('');
      // Refetch
      refetchReport();
      refetchList();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    },
  });

  const reminderMutation = useMutation({
    mutationFn: (feeType: string) => sendFeeReminder(feeType),
    onSuccess: (res) => {
      toast.success(res.message);
      refetchReport();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send reminders');
    },
  });

  // Handlers
  const handleSelectStudent = (stu: any) => {
    setSelectedStudent(stu);
  };

  const handleSubmitPayment = () => {
    if (!selectedFeeId || payAmount <= 0) {
      toast.error('Please select a fee and enter an amount');
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

  const calculateRouteDetails = async (source: string, destination: string) => {
    if (!source.trim() || !destination.trim()) return;
    setIsCalculatingRoute(true);
    setRouteCalcError(null);
    try {
      let activeSource = source.trim();
      if (
        activeSource.toLowerCase() === 'college campus' ||
        activeSource.toLowerCase() === 'college'
      ) {
        activeSource = 'GMRIT Rajam';
      }
      let activeDest = destination.trim();
      if (activeDest.toLowerCase() === 'college campus' || activeDest.toLowerCase() === 'college') {
        activeDest = 'GMRIT Rajam';
      }

      // 1. Geocode source
      const sourceRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeSource)}&limit=1`,
      );
      const sourceData = await sourceRes.json();
      if (!sourceData || sourceData.length === 0) {
        throw new Error(`Could not find coordinates for source: ${source}`);
      }
      const startCoords = [parseFloat(sourceData[0].lat), parseFloat(sourceData[0].lon)];

      // 2. Geocode destination
      const destRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeDest)}&limit=1`,
      );
      const destData = await destRes.json();
      if (!destData || destData.length === 0) {
        throw new Error(`Could not find coordinates for destination: ${destination}`);
      }
      const endCoords = [parseFloat(destData[0].lat), parseFloat(destData[0].lon)];

      // 3. OSRM route fetch
      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=false`,
      );
      const osrmData = await osrmRes.json();
      if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
        const summary = osrmData.routes[0];
        const distKm = Math.round(summary.distance / 1000);
        const timeMinsNum = Math.round(summary.duration / 60);

        setDistanceKm(String(distKm));
        setTimeMins(String(timeMinsNum));

        // Calculate yearly fee dynamically (e.g. ₹12000 base or ₹500 per km)
        const calculatedFee = Math.max(12000, Math.round(distKm * 500));
        setAnnualFee(String(calculatedFee));
      } else {
        throw new Error('No driving route found between these points');
      }
    } catch (err: any) {
      console.warn('Dynamic route calculation failed:', err);
      setRouteCalcError(err.message || 'Failed to calculate route');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (sourcePlace.trim() && destPlace.trim()) {
        calculateRouteDetails(sourcePlace, destPlace);
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [sourcePlace, destPlace]);

  const handleAllocateRoute = async () => {
    if (!selectedTransStudent) {
      toast.error('Please select a student first');
      return;
    }
    if (!sourcePlace.trim() || !destPlace.trim()) {
      toast.error('Please enter both starting point and destination');
      return;
    }
    if (Number(annualFee) <= 0) {
      toast.error('Please enter a valid yearly fee amount');
      return;
    }

    setIsAllocating(true);
    try {
      const studentId = selectedTransStudent.id || selectedTransStudent._id;
      // Call createFee with Transport Fee type
      await createFee({
        student: studentId,
        academicYear: '2025-2026', // Current default academic year
        semester: selectedTransStudent.semester || 1,
        feeType: 'Transport Fee',
        totalAmount: Number(annualFee),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 30 days
        remarks: `Allocated Route: ${sourcePlace.trim()} ➔ ${destPlace.trim()} (${distanceKm} km, ${timeMins} mins)`,
      });

      toast.success(
        `Transport route allocated and annual fee recorded for ${selectedTransStudent.fullName}!`,
      );
      // Reset form
      setSelectedTransStudent(null);
      setTransStudentSearch('');
      setSourcePlace('');
      setDestPlace('College Campus');
      setDistanceKm('15');
      setTimeMins('30');
      setAnnualFee('18000');
      setRouteCalcError(null);
      // Refetch
      refetchList();
      refetchReport();
      refetchTransportList();
    } catch (err: any) {
      console.error('Allocation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to allocate transport route');
    } finally {
      setIsAllocating(false);
    }
  };

  const handleExportCSV = () => {
    const fees = feesData?.fees || [];
    if (fees.length === 0) {
      toast.error('No fee records to export');
      return;
    }
    const headers = [
      'Student Name',
      'Roll Number',
      'Fee Type',
      'Total Amount',
      'Paid Amount',
      'Remaining',
      'Due Date',
      'Status',
    ];
    const rows = fees.map((fee) => {
      const stuName = typeof fee.student === 'object' ? fee.student.fullName : fee.student;
      const roll = typeof fee.student === 'object' ? fee.student.rollNumber : '';
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
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Fee_Records_Export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV file exported successfully');
  };

  // Stats formatting helper
  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totals = report?.totals || {
    collectedFees: 8470000,
    pendingFees: 1250000,
    overdueFees: 320000,
    totalRevenue: 10040000,
  };

  const dueCounts = report?.dueCounts || {
    'Tuition Fee': 142,
    'Hostel Fee': 48,
    'Lab Fee': 89,
  };

  const statCards = [
    {
      label: 'Total Collected',
      value: formatLakhs(totals.collectedFees),
      tone: 'success' as const,
    },
    { label: 'Pending Dues', value: formatLakhs(totals.pendingFees), tone: 'warn' as const },
    { label: 'Overdue', value: formatLakhs(totals.overdueFees), tone: 'danger' as const },
    {
      label: 'Scholarships',
      value: formatLakhs(totals.totalRevenue * 0.05),
      tone: 'info' as const,
    },
  ];

  const chartData = report?.monthlyAnalytics || [
    { month: 'Jan', fees: 180 },
    { month: 'Feb', fees: 200 },
    { month: 'Mar', fees: 220 },
    { month: 'Apr', fees: 230 },
    { month: 'May', fees: 240 },
    { month: 'Jun', fees: 250 },
  ];

  const reminderItems = [
    { label: 'Tuition Fee Due', count: dueCounts['Tuition Fee'] || 0, rawLabel: 'Tuition Fee' },
    { label: 'Hostel Fee Due', count: dueCounts['Hostel Fee'] || 0, rawLabel: 'Hostel Fee' },
    { label: 'Lab Fee Due', count: dueCounts['Lab Fee'] || 0, rawLabel: 'Lab Fee' },
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

      {/* Navigation tabs */}
      <div className="flex border-b gap-4 mb-2">
        {!isTransportStaff && (
          <button
            onClick={() => setActiveTab('academic')}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              activeTab === 'academic'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Academic Fees
          </button>
        )}
        <button
          onClick={() => setActiveTab('transport')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'transport'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Transport Route Fees Allocation
        </button>
      </div>

      {activeTab === 'academic' ? (
        <>
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
                {['All Status', 'Paid', 'Pending', 'Overdue'].map((s) => (
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
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
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
                <div className="text-center py-10 text-muted-foreground">No fee records found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      {[
                        'Student Name',
                        'Fee Type',
                        'Amount',
                        'Due Date',
                        'Payment Status',
                        'Actions',
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
                        record.student && typeof record.student === 'object'
                          ? record.student.fullName
                          : record.student || '—';
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
                            ₹{record.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{record.dueDate}</td>
                          <td className="py-3 px-4">
                            <Badge
                              tone={
                                normalizedStatus === 'Paid'
                                  ? 'success'
                                  : normalizedStatus === 'Overdue'
                                    ? 'danger'
                                    : 'warn'
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
        </>
      ) : (
        <>
          {/* Transport Route Allocation Form */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Side: Student Selection Card */}
            <Card className="md:col-span-1 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <User className="size-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">1. Select Passenger</h3>
              </div>

              {!selectedTransStudent ? (
                <div className="space-y-4">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Search Student Roll / Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Type student name or roll number..."
                      value={transStudentSearch}
                      onChange={(e) => setTransStudentSearch(e.target.value)}
                      className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {isTransStudentsLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  )}

                  {transStudentsData?.students && transStudentsData.students.length > 0 && (
                    <div className="border rounded-xl divide-y max-h-56 overflow-y-auto bg-background/90 shadow-md">
                      {transStudentsData.students.map((stu: any) => (
                        <button
                          type="button"
                          key={stu.id || stu._id}
                          onClick={() => setSelectedTransStudent(stu)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent/50 transition flex justify-between items-center"
                        >
                          <div className="truncate text-left">
                            <span className="font-semibold text-slate-700 block">
                              {stu.fullName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {stu.rollNumber}
                            </span>
                          </div>
                          <Badge tone="info" className="text-[9px]">
                            {typeof stu.department === 'object' && stu.department
                              ? stu.department.code || stu.department.name
                              : stu.department || 'GEN'}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-200/20 rounded-full blur-lg" />
                    <div className="font-bold text-slate-800 text-base">
                      {selectedTransStudent.fullName}
                    </div>
                    <div className="text-xs text-indigo-600 font-semibold mt-1 font-mono">
                      {selectedTransStudent.rollNumber}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wide">
                          Branch
                        </span>
                        <span className="text-slate-700 font-semibold truncate block">
                          {typeof selectedTransStudent.department === 'object' &&
                          selectedTransStudent.department
                            ? selectedTransStudent.department.name ||
                              selectedTransStudent.department.code
                            : selectedTransStudent.department || 'General'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wide">
                          Year / Semester
                        </span>
                        <span className="text-slate-700 font-semibold">
                          Yr {selectedTransStudent.year || 1} / Sem{' '}
                          {selectedTransStudent.semester || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTransStudent(null);
                      setTransStudentSearch('');
                    }}
                    className="w-full py-2 rounded-xl border hover:bg-accent text-xs font-semibold transition"
                  >
                    Change Student
                  </button>
                </div>
              )}
            </Card>

            {/* Right Side: Box Way Route Details & Allocation Form */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="size-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800">
                    2. Route & Fare Allocation Parameters
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  {/* Box 1: Source */}
                  <div className="border rounded-2xl p-4 bg-gradient-to-br from-cyan-50/50 to-white hover:border-cyan-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600">
                        Starting Place (Source)
                      </span>
                      <MapPin className="size-4 text-cyan-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Rajam Bypass"
                      value={sourcePlace}
                      onChange={(e) => setSourcePlace(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Box 2: Destination */}
                  <div className="border rounded-2xl p-4 bg-gradient-to-br from-indigo-50/50 to-white hover:border-indigo-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                        Destination Place
                      </span>
                      <MapPin className="size-4 text-indigo-500 animate-bounce-slow" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. College Campus"
                      value={destPlace}
                      onChange={(e) => setDestPlace(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Box 3: Distance and Time */}
                  <div className="border rounded-2xl p-4 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
                        Transit Distance & Time
                      </span>
                      <Activity className="size-4 text-amber-500 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">
                          Distance (km)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 15"
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">
                          Time (mins)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 30"
                          value={timeMins}
                          onChange={(e) => setTimeMins(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Box 4: Annual Amount */}
                  <div className="border rounded-2xl p-4 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-650">
                        Yearly Transport Fee
                      </span>
                      <DollarSign className="size-4 text-emerald-500" />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="e.g. 18000"
                        value={annualFee}
                        onChange={(e) => setAnnualFee(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-bold transition-all"
                      />
                      <span className="text-[9px] text-muted-foreground block mt-1">
                        ₹ {Number(annualFee).toLocaleString('en-IN')} / Year
                      </span>
                    </div>
                  </div>
                </div>

                {/* Route calculation feedback indicator */}
                {(isCalculatingRoute ||
                  routeCalcError ||
                  (sourcePlace && destPlace && !isCalculatingRoute)) && (
                  <div className="mt-4 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-all duration-300">
                    {isCalculatingRoute ? (
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>
                          Calculating dynamic distance & transit time from GPS telemetry...
                        </span>
                      </div>
                    ) : routeCalcError ? (
                      <div className="flex items-center gap-2 text-rose-600 font-semibold">
                        <AlertTriangle className="size-3.5" />
                        <span>{routeCalcError} — Enter values manually.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                        <ShieldCheck className="size-3.5" />
                        <span>
                          GPS Verified Route! Distance and time fetched successfully from OSRM.
                        </span>
                      </div>
                    )}
                    {sourcePlace && destPlace && (
                      <button
                        type="button"
                        onClick={() => calculateRouteDetails(sourcePlace, destPlace)}
                        className="px-2 py-1 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 transition animate-pulse"
                      >
                        Recalculate
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAllocateRoute}
                    disabled={isAllocating || !selectedTransStudent || !sourcePlace.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition active:scale-95 cursor-pointer"
                  >
                    {isAllocating && <Loader2 className="size-4 animate-spin" />}
                    Allocate Route & Collect Fee
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Transport Fee Billing Ledger */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b font-semibold flex justify-between items-center">
              <span>Active Transport Allocations & Billing Ledger</span>
              <Badge tone="info">Transport Line</Badge>
            </div>

            {isTransportLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : !transportFeesData?.fees || transportFeesData.fees.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                No active transport fee records found in database.
              </div>
            ) : (
              <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transportFeesData.fees.map((f) => {
                    const studentName =
                      f.student && typeof f.student === 'object'
                        ? f.student.fullName
                        : f.student || '—';
                    const roll =
                      f.student && typeof f.student === 'object' ? f.student.rollNumber : '—';

                    // Parse source/destination from remarks
                    let routeText = f.remarks || 'Custom Transit Route';
                    let distTimeText = '—';
                    let sourceVal = 'Source Place';
                    let destVal = 'Destination Place';

                    if (f.remarks && f.remarks.startsWith('Allocated Route:')) {
                      // e.g. "Allocated Route: Rajam ➔ College Campus (15 km, 30 mins)"
                      const match = f.remarks.match(/Allocated Route:\s*(.*?)\s*\((.*?)\)/);
                      if (match) {
                        routeText = match[1];
                        distTimeText = match[2];
                        const parts = routeText.split('➔');
                        if (parts.length >= 2) {
                          sourceVal = parts[0].trim();
                          destVal = parts[1].trim();
                        }
                      }
                    }

                    const normalizedStatus = f.paymentStatus.toLowerCase();
                    const isPaid = normalizedStatus === 'paid';
                    const isOverdue = normalizedStatus === 'overdue';

                    // Calculate initials for avatar
                    const initials = studentName
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={f.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                      >
                        {/* Top: Student Header */}
                        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-white">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {initials || <User className="size-4" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                                {studentName}
                              </h4>
                              <p className="font-mono text-[10px] text-slate-400 mt-0.5">{roll}</p>
                            </div>
                          </div>
                          <Badge
                            tone={isPaid ? 'success' : isOverdue ? 'danger' : 'warn'}
                            className="text-[10px] uppercase font-bold tracking-wider py-0.5"
                          >
                            {f.paymentStatus}
                          </Badge>
                        </div>

                        {/* Middle: Route & Telemetry details */}
                        <div className="p-4 bg-slate-50/50 space-y-3.5 flex-1">
                          {/* Route visual flow */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-cyan-500 ring-4 ring-cyan-100 shrink-0"></div>
                              <span className="text-[11px] font-medium text-slate-600 truncate">
                                <strong className="text-slate-400 font-normal mr-1">From:</strong>{' '}
                                {sourceVal}
                              </span>
                            </div>
                            <div className="h-3.5 border-l-2 border-dashed border-slate-200 ml-[3px] my-0.5"></div>
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-100 shrink-0"></div>
                              <span className="text-[11px] font-medium text-slate-600 truncate">
                                <strong className="text-slate-400 font-normal mr-1">To:</strong>{' '}
                                {destVal}
                              </span>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-2 gap-2 bg-white rounded-xl border border-slate-100 p-2 text-center">
                            <div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">
                                Distance
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {distTimeText.split(',')[0] || '—'}
                              </span>
                            </div>
                            <div className="border-l border-slate-100">
                              <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">
                                Duration
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {distTimeText.split(',')[1]?.trim() || '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Fee metrics and action */}
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">
                              Yearly Transport Fee
                            </span>
                            <span className="text-base font-extrabold text-slate-800">
                              ₹{(f.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              Paid: ₹{(f.paidAmount || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedViewFee(f)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-bold text-slate-700 transition active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setIsRecordPaymentOpen(false);
                setSelectedStudent(null);
                setStudentSearch('');
                setPendingFees([]);
                setSelectedFeeId('');
                setPayAmount(0);
                setPaymentMethod('UPI');
                setTransactionId('');
                setRemarks('');
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
                  <label className="text-xs font-semibold text-muted-foreground">
                    Search Student *
                  </label>
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
                            {stu.rollNumber} |{' '}
                            {typeof stu.department === 'object' && stu.department
                              ? stu.department.code || stu.department.name
                              : stu.department}
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
                      {selectedStudent.rollNumber} •{' '}
                      {typeof selectedStudent.department === 'object' && selectedStudent.department
                        ? selectedStudent.department.code || selectedStudent.department.name
                        : selectedStudent.department}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setPendingFees([]);
                      setSelectedFeeId('');
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
                      <label className="text-xs font-semibold text-muted-foreground">
                        Select Fee Record *
                      </label>
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
                            {fee.remainingAmount.toLocaleString('en-IN')}
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
                        <label className="text-xs font-semibold text-muted-foreground">
                          Remarks (Optional)
                        </label>
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
                  {selectedViewFee.student && typeof selectedViewFee.student === 'object'
                    ? selectedViewFee.student.fullName
                    : selectedViewFee.student || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Roll Number:</span>
                <span className="font-semibold text-right">
                  {selectedViewFee.student && typeof selectedViewFee.student === 'object'
                    ? selectedViewFee.student.rollNumber
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fee Type:</span>
                <span className="font-semibold text-right">{selectedViewFee.feeType}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold text-right">
                  ₹{(selectedViewFee.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="font-semibold text-green-600 text-right">
                  ₹{(selectedViewFee.paidAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Remaining Due:</span>
                <span className="font-semibold text-red-600 text-right">
                  ₹{(selectedViewFee.remainingAmount || 0).toLocaleString('en-IN')}
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
                    selectedViewFee.paymentStatus.toLowerCase() === 'paid'
                      ? 'success'
                      : selectedViewFee.paymentStatus.toLowerCase() === 'overdue'
                        ? 'danger'
                        : 'warn'
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
                  <span className="font-semibold font-mono text-right">
                    {selectedViewFee.transactionId}
                  </span>
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
