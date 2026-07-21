import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Award,
  Search,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Printer,
  DollarSign,
  FileText,
  Calendar,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Download,
  Mail,
  Shield,
  FileSpreadsheet,
  Grid,
  CreditCard as CardIcon,
  Search as SearchIcon,
  History,
  TrendingUp,
  Receipt,
  Eye,
  Check,
  Building,
  Hash
} from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  fetchIDCardStats,
  searchIDCardStudents,
  fetchIDCardStudentProfile,
  createIDCardRequest,
  approveRejectIDCardRequest,
  collectIDCardPayment,
  reprintIDCard,
  updateIDCardStatus,
  reportMissingIDCard,
  fetchIDCardHistory,
  fetchIDCardPaymentHistory,
  handoverIDCard
} from '@/services/libraryService';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export function LibrarianIdCards() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'requests' | 'payments' | 'history'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReprintModal, setShowReprintModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Handover & Acknowledgment States
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverAcknowledged, setHandoverAcknowledged] = useState(false);
  const [showAcknowledgmentForm, setShowAcknowledgmentForm] = useState(false);

  // Verification Checklist States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyRequest, setVerifyRequest] = useState<any>(null);
  const [verifiedDetails, setVerifiedDetails] = useState(false);
  const [verifiedPhoto, setVerifiedPhoto] = useState(false);
  const [verifiedDept, setVerifiedDept] = useState(false);
  const [verifiedMembership, setVerifiedMembership] = useState(false);
  const [verifiedFees, setVerifiedFees] = useState(false);
  const [verifiedDuplicate, setVerifiedDuplicate] = useState(false);
  const [verifiedFines, setVerifiedFines] = useState(false);

  const resetChecklist = () => {
    setVerifiedDetails(false);
    setVerifiedPhoto(false);
    setVerifiedDept(false);
    setVerifiedMembership(false);
    setVerifiedFees(false);
    setVerifiedDuplicate(false);
    setVerifiedFines(false);
  };

  // Form states
  const [reprintRemarks, setReprintRemarks] = useState('Damaged/Scratched physical card replacement');
  const [missingRemarks, setMissingRemarks] = useState('Lost on campus grounds');
  const [duplicateReason, setDuplicateReason] = useState('Lost Card');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<any>(null);
  const [latestReceipt, setLatestReceipt] = useState<any>(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['idCardStats'],
    queryFn: fetchIDCardStats,
    refetchInterval: 10000 // Refresh stats every 10s
  });

  const { data: studentProfile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['idCardStudentProfile', selectedStudentId],
    queryFn: () => selectedStudentId ? fetchIDCardStudentProfile(selectedStudentId) : null,
    enabled: !!selectedStudentId
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['idCardHistory'],
    queryFn: fetchIDCardHistory
  });

  const { data: paymentHistory, isLoading: paymentsLoading } = useQuery({
    queryKey: ['idCardPaymentHistory'],
    queryFn: fetchIDCardPaymentHistory
  });

  // Debounced search for student profile
  useEffect(() => {
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchIDCardStudents(searchQuery);
        setSearchResults(data);
        if (data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data[0].id);
        }
      } catch (error) {
        toast.error('Error searching students');
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Mutations
  const issueMutation = useMutation({
    mutationFn: (payload: { studentId: string; requestType: string; reason?: string }) => createIDCardRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      await queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
      await queryClient.invalidateQueries({ queryKey: ['idCardStudentProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['idCardStudentProfile', selectedStudentId] });
      toast.success('Active Student ID Card generated & profile stored successfully!');
      setShowIssueModal(false);
      if (selectedStudentId) {
        refetchProfile();
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to issue ID Card');
    }
  });

  const approveRejectMutation = useMutation({
    mutationFn: ({ requestId, status, rejectionReason }: { requestId: string; status: 'Approved' | 'Rejected'; rejectionReason?: string }) => 
      approveRejectIDCardRequest(requestId, { status, rejectionReason }),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      await queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
      await queryClient.invalidateQueries({ queryKey: ['idCardStudentProfile'] });
      if (selectedStudentId) {
        await queryClient.invalidateQueries({ queryKey: ['idCardStudentProfile', selectedStudentId] });
        refetchProfile();
      }
      toast.success(variables.status === 'Approved' ? 'Request Approved & Active ID Card generated successfully!' : 'Request rejected.');
      setShowRejectModal(false);
      setRejectionReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to process request');
    }
  });

  const paymentMutation = useMutation({
    mutationFn: (payload: { requestId: string; amount: number; paymentMethod: string; transactionId?: string }) => 
      collectIDCardPayment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      queryClient.invalidateQueries({ queryKey: ['idCardPaymentHistory'] });
      toast.success('Payment recorded successfully!');
      setLatestReceipt(data.receipt);
      setShowPaymentModal(false);
      setTransactionId('');
      if (selectedStudentId) refetchProfile();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to collect payment');
    }
  });

  const reprintMutation = useMutation({
    mutationFn: (payload: { cardId: string; remarks?: string }) => reprintIDCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
      toast.success('Reprint command logged successfully!');
      setShowReprintModal(false);
      if (selectedStudentId) refetchProfile();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to trigger reprint');
    }
  });

  const blockMutation = useMutation({
    mutationFn: ({ cardId, status, remarks }: { cardId: string; status: 'Active' | 'Blocked' | 'Lost'; remarks?: string }) => 
      updateIDCardStatus(cardId, { status, remarks }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
      toast.success(`Card status updated to ${variables.status}!`);
      if (selectedStudentId) refetchProfile();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update card status');
    }
  });

  const reportMissingMutation = useMutation({
    mutationFn: (payload: { studentId: string; cardId: string; remarks?: string }) => reportMissingIDCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
      toast.success('Card reported missing successfully!');
      setShowMissingModal(false);
      if (selectedStudentId) refetchProfile();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to report missing card');
    }
  });

  const handoverMutation = useMutation({
    mutationFn: (cardId: string) => handoverIDCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
      queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
      toast.success('Card handed over and physically delivered successfully!');
      setShowHandoverModal(false);
      setHandoverAcknowledged(false);
      if (selectedStudentId) refetchProfile();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record card handover');
    }
  });

  const handlePrintCard = (cardNo: string) => {
    window.print();
    toast.success(`Sent print request for card: ${cardNo}`);
  };

  const handleExportData = (type: 'pdf' | 'excel', dataset: string) => {
    toast.success(`Exporting ${dataset} as ${type.toUpperCase()}...`);
    // Simulate export file download
    const element = document.createElement("a");
    const file = new Blob([`Dummy data export for ${dataset}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${dataset}_export_${Date.now()}.${type === 'excel' ? 'csv' : 'pdf'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Safe stat accessors
  const stats = statsData?.stats || {
    totalStudents: 0,
    totalIssued: 0,
    pendingCards: 0,
    lostCards: 0,
    duplicateIssued: 0,
    expiredCards: 0,
    todayRequests: 0,
    todayPrinted: 0,
    totalAmountCollected: 0,
    pendingPayments: 0
  };

  const charts = statsData?.charts || {
    monthlyIssued: [],
    pendingVsIssued: [],
    departmentWise: [],
    paymentCollection: []
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Student ID Card Management 🪪"
        desc="Administer card generation, printing, tracking, duplicate collections, and activity logs."
      />

      {/* Tabs */}
      <div className="flex border-b border-sidebar-border space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Reports
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'search'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Issue & Search Profile
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approval ({stats.pendingCards})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Receipts & Fees
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Audit History
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Total Students</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{stats.totalStudents}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Active ID Cards</div>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.totalIssued}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending Requests</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">{stats.pendingCards}</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-red-800 uppercase tracking-wider">Lost ID Cards</div>
                  <div className="text-2xl font-bold text-red-900 mt-1">{stats.lostCards}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Duplicates Issued</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{stats.duplicateIssued}</div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Expired ID Cards</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{stats.expiredCards}</div>
                </div>
                <div className="bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Today's Requests</div>
                  <div className="text-2xl font-bold text-sky-900 mt-1">{stats.todayRequests}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Today Printed</div>
                  <div className="text-2xl font-bold text-indigo-900 mt-1">{stats.todayPrinted}</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Total Collected</div>
                  <div className="text-2xl font-bold text-teal-900 mt-1">₹{stats.totalAmountCollected}</div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Pending Payments</div>
                  <div className="text-2xl font-bold text-rose-900 mt-1">₹{stats.pendingPayments}</div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart 1: Monthly Cards Issued */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Monthly ID Cards Issued
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.monthlyIssued}>
                      <defs>
                        <linearGradient id="issuedColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#issuedColor)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 2: Pending vs Issued (Pie) */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CardIcon className="h-5 w-5 text-emerald-500" />
                    Pending Requests vs Active Cards
                  </h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.pendingVsIssued}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {charts.pendingVsIssued.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 3: Department-wise ID Cards */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Building className="h-5 w-5 text-violet-500" />
                    Department-wise Active Cards
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.departmentWise}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="department" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 4: Payment Collection Report */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Fee Collection Trend (Duplicate/Lost Replacement)
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.paymentCollection}>
                      <defs>
                        <linearGradient id="paymentColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#paymentColor)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search inputs */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students using ID, Roll Number, Name, Department, Mobile or Registration..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {isSearching && (
                <div className="flex items-center justify-center pr-3">
                  <RefreshCw className="animate-spin h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Results list */}
              <div className="lg:col-span-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm h-[500px] overflow-y-auto">
                <div className="p-3 border-b border-gray-200 bg-gray-50 font-semibold text-sm text-gray-700">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 p-4 text-center">
                    <SearchIcon className="h-8 w-8 mb-2" />
                    <span>Search above to view student matches</span>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-150">
                    {searchResults.map((std) => (
                      <button
                        key={std.id}
                        onClick={() => setSelectedStudentId(std.id)}
                        className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
                          selectedStudentId === std.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={std.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'}
                          alt={std.fullName}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{std.fullName}</div>
                          <div className="text-xs text-gray-500">{std.rollNumber} • {std.department}</div>
                          <div className="mt-1">
                            {std.idCard ? (
                              <Badge variant={std.idCard.status === 'Active' ? 'success' : 'danger'}>
                                {std.idCard.status}
                              </Badge>
                            ) : (
                              <Badge variant="warning">No ID Issued</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Details and Live Print Layout Card */}
              <div className="lg:col-span-2 space-y-6">
                {profileLoading && (
                  <div className="h-96 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
                    Loading student profile details...
                  </div>
                )}

                {!selectedStudentId && !profileLoading && (
                  <div className="h-96 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 text-center bg-white shadow-sm">
                    <User className="h-12 w-12 mb-3 text-gray-300" />
                    <h3 className="font-semibold text-gray-700">No Student Selected</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                      Select a student from the search results side panel to view full details, digital ID card previews, status history, and actions.
                    </p>
                  </div>
                )}

                {selectedStudentId && studentProfile && (
                  <div className="space-y-6">
                    {/* Student Info Card */}
                    <Card>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <img
                          src={studentProfile.student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'}
                          alt={studentProfile.student.fullName}
                          className="h-20 w-20 rounded-lg object-cover border border-gray-300 shadow-sm"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{studentProfile.student.fullName}</h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                            <div><span className="font-medium text-gray-400">Roll Number:</span> {studentProfile.student.rollNumber}</div>
                            <div><span className="font-medium text-gray-400">Admission No:</span> {studentProfile.student.admissionNumber}</div>
                            <div><span className="font-medium text-gray-400">Department:</span> {studentProfile.student.department}</div>
                            <div><span className="font-medium text-gray-400">Year / Sem:</span> Year {studentProfile.student.year}, Sem {studentProfile.student.semester}</div>
                            <div><span className="font-medium text-gray-400">Email:</span> {studentProfile.student.email}</div>
                            <div><span className="font-medium text-gray-400">Mobile:</span> {studentProfile.student.phoneNumber}</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Handover Delivery Section */}
                      {(() => {
                        const activeCard = studentProfile.idCards.find((c: any) => c.status === 'Active');
                        if (!activeCard) return null;
                        
                        const isDelivered = activeCard.delivery_status === 'Delivered';
                        return (
                          <div className="mt-4 p-4 rounded-xl border border-gray-150 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Physical Card Delivery Status</span>
                              <div className="flex items-center gap-2">
                                {isDelivered ? (
                                  <>
                                    <CheckCircle className="h-5 w-5 text-emerald-600 animate-pulse" />
                                    <div>
                                      <span className="font-semibold text-emerald-700 text-sm">Delivered & Handed Over</span>
                                      <span className="text-xs text-gray-400 block">Received on: {new Date(activeCard.delivered_at).toLocaleString()}</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                                    <div>
                                      <span className="font-semibold text-amber-700 text-sm">Pending Handover (Awaiting student signature)</span>
                                      <span className="text-xs text-gray-400 block">Physical card has not been delivered to student yet.</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              {!isDelivered && (
                                <button
                                  onClick={() => {
                                    setHandoverAcknowledged(false);
                                    setShowHandoverModal(true);
                                  }}
                                  className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                                >
                                  <Check className="h-4 w-4" /> Issue / Handover Card
                                </button>
                              )}
                              <button
                                onClick={() => setShowAcknowledgmentForm(true)}
                                className="flex-1 sm:flex-initial bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <FileText className="h-4 w-4" /> ID Card Form
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action buttons panel */}
                      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-150">
                        {/* If no active ID card issued */}
                        {!studentProfile.idCards.some((c: any) => c.status === 'Active') ? (
                          <button
                            onClick={() => setShowIssueModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Plus className="h-4 w-4" /> Issue New Card
                          </button>
                        ) : (
                          <>
                            {/* Has active ID card */}
                            {(() => {
                              const activeCard = studentProfile.idCards.find((c: any) => c.status === 'Active');
                              return (
                                <>
                                  <button
                                    onClick={() => handlePrintCard(activeCard.card_number)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                                  >
                                    <Printer className="h-4 w-4" /> Print ID Card
                                  </button>
                                  <button
                                    onClick={() => setShowReprintModal(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                                  >
                                    <RefreshCw className="h-4 w-4" /> Reprint Card
                                  </button>
                                  <button
                                    onClick={() => {
                                      blockMutation.mutate({
                                        cardId: activeCard.id,
                                        status: 'Blocked',
                                        remarks: 'Librarian Administrative Block'
                                      });
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                                  >
                                    <Lock className="h-4 w-4" /> Block Card
                                  </button>
                                  <button
                                    onClick={() => setShowMissingModal(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                                  >
                                    <AlertTriangle className="h-4 w-4" /> Report Lost
                                  </button>
                                  <button
                                    onClick={() => setShowDuplicateModal(true)}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                                  >
                                    <Plus className="h-4 w-4" /> Request Duplicate
                                  </button>
                                </>
                              );
                            })()}
                          </>
                        )}

                        {/* If card is currently Blocked */}
                        {studentProfile.idCards.some((c: any) => c.status === 'Blocked') && (
                          <button
                            onClick={() => {
                              const blockedCard = studentProfile.idCards.find((c: any) => c.status === 'Blocked');
                              blockMutation.mutate({
                                cardId: blockedCard.id,
                                status: 'Active',
                                remarks: 'Librarian administrative unblock'
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Unlock className="h-4 w-4" /> Unblock / Re-Activate
                          </button>
                        )}
                      </div>
                    </Card>

                    {/* ID Card Real Mockup Grid */}
                    {studentProfile.idCards.some((c: any) => c.status === 'Active') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Side */}
                        <div className="relative bg-gradient-to-br from-blue-900 to-indigo-950 text-white w-full h-[220px] rounded-2xl shadow-xl p-4 overflow-hidden border border-blue-800 flex flex-col justify-between">
                          {/* Background Glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                          
                          {/* Header */}
                          <div className="flex items-center gap-2 border-b border-blue-800/60 pb-2">
                            <div className="bg-white p-1 rounded-md">
                              <Award className="h-5 w-5 text-blue-900" />
                            </div>
                            <div>
                              <div className="text-xs font-bold tracking-widest uppercase">Apex Technology Institute</div>
                              <div className="text-[8px] tracking-wider text-blue-300">STUDENT ID CARD</div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="flex gap-4 items-center flex-1 my-3">
                            <img
                              src={studentProfile.student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'}
                              alt="Student"
                              className="w-[70px] h-[85px] rounded-md object-cover border-2 border-blue-400/50 shadow-md"
                            />
                            <div className="flex-1 space-y-1 text-xs">
                              <div className="text-[14px] font-bold truncate tracking-wide text-white">{studentProfile.student.fullName}</div>
                              <div className="text-blue-200 font-medium">Roll: {studentProfile.student.rollNumber}</div>
                              <div className="text-blue-300">Dept: {studentProfile.student.department}</div>
                              <div className="text-blue-300">Valid Till: {new Date(studentProfile.idCards.find((c: any) => c.status === 'Active').expiry_date).toLocaleDateString()}</div>
                            </div>
                            
                            {/* QR Code */}
                            <div className="bg-white p-1.5 rounded-lg shadow-inner">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=55x55&data=${encodeURIComponent(studentProfile.idCards.find((c: any) => c.status === 'Active').qr_code || '')}`}
                                alt="QR Code"
                                className="h-[55px] w-[55px]"
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center text-[9px] text-blue-300 border-t border-blue-800/40 pt-1.5">
                            <div>Card No: {studentProfile.idCards.find((c: any) => c.status === 'Active').card_number}</div>
                            <div className="font-semibold text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" /> ACTIVE
                            </div>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="relative bg-gradient-to-br from-indigo-950 to-slate-900 text-white w-full h-[220px] rounded-2xl shadow-xl p-4 overflow-hidden border border-indigo-900 flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
                          
                          {/* Instructions */}
                          <div className="space-y-1.5 text-[8.5px] text-slate-300 leading-relaxed">
                            <div className="font-bold text-white uppercase text-[10px] tracking-wide mb-1">Terms & Conditions</div>
                            <div>• This card is non-transferable and must be displayed on demand.</div>
                            <div>• Loss of card must be reported immediately to the Library Administrator.</div>
                            <div>• A duplicate card will be issued on payment of ₹150 replacement fee.</div>
                            <div>• Return this card upon completion or termination of course duration.</div>
                          </div>

                          {/* Signature & Barcode */}
                          <div className="flex justify-between items-end gap-4 mt-2">
                            {/* Barcode representation */}
                            <div className="flex flex-col items-start gap-1">
                              <div className="bg-white p-1 rounded flex flex-col items-center justify-center">
                                {/* Barcode Lines mockup */}
                                <div className="flex items-center h-[35px] w-[130px] bg-white gap-[1.5px] px-1">
                                  {[3,1,2,4,1,3,2,1,4,2,3,1,2,4,1,2,3,1,4,2].map((w, idx) => (
                                    <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
                                  ))}
                                </div>
                                <div className="text-[7.5px] font-mono text-black tracking-widest mt-0.5">
                                  {studentProfile.idCards.find((c: any) => c.status === 'Active').barcode}
                                </div>
                              </div>
                            </div>

                            {/* Authority Signature Sign */}
                            <div className="text-center pb-1">
                              <div className="font-serif italic text-xs text-slate-300 select-none">M. K. Sharma</div>
                              <div className="border-t border-slate-600 pt-0.5 text-[7px] uppercase tracking-wider text-slate-400 font-bold">Librarian / Principal</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Student History Logs panels */}
                    <Card>
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <History className="h-5 w-5 text-gray-500" />
                        ID Card issuance & request log trail
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-2">Date</th>
                              <th className="px-4 py-2">Event / Type</th>
                              <th className="px-4 py-2">Reason / Details</th>
                              <th className="px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150">
                            {/* Map Requests */}
                            {studentProfile.requests.map((r: any) => (
                              <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-2 font-medium">Request: {r.request_type}</td>
                                <td className="px-4 py-2">{r.reason || 'N/A'}</td>
                                <td className="px-4 py-2">
                                  <Badge variant={
                                    r.status === 'Approved' || r.status === 'Printed' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'
                                  }>
                                    {r.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}

                            {/* Map payments */}
                            {studentProfile.payments.map((p: any) => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{new Date(p.payment_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 font-medium">Replacement Payment</td>
                                <td className="px-4 py-2">₹{p.amount} collected ({p.payment_method})</td>
                                <td className="px-4 py-2">
                                  <Badge variant={p.payment_status === 'Paid' ? 'success' : 'warning'}>
                                    {p.payment_status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}

                            {/* Map missing reports */}
                            {studentProfile.missingLogs.map((m: any) => (
                              <tr key={m.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{new Date(m.reported_date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 font-medium text-red-600">Missing Reported</td>
                                <td className="px-4 py-2">{m.remarks || 'Lost'}</td>
                                <td className="px-4 py-2">
                                  <Badge variant="danger">{m.status}</Badge>
                                </td>
                              </tr>
                            ))}

                            {studentProfile.requests.length === 0 &&
                             studentProfile.payments.length === 0 &&
                             studentProfile.missingLogs.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center py-4 text-gray-400">
                                  No historical requests, payments, or missing reports for this student.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Pending Requests List */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  ID Card Requests Awaiting HOD / Librarian Approval
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportData('pdf', 'pending_requests')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <Download className="h-4 w-4" /> PDF Report
                  </button>
                  <button
                    onClick={() => handleExportData('excel', 'pending_requests')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Export CSV
                  </button>
                </div>
              </div>

              {historyLoading ? (
                <div className="text-center py-8 text-gray-400">Loading pending requests...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Student Roll</th>
                        <th className="px-4 py-3">Request Type</th>
                        <th className="px-4 py-3">Submission Date</th>
                        <th className="px-4 py-3">Reason / Remarks</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {/* Filter history logs that correspond to pending requests */}
                      {historyData
                        ?.filter((log: any) => log.status === 'Pending' || (log.type === 'Request Update' && log.description.includes('Pending')))
                        ?.map((log: any) => {
                          const studentRollDisplay = log.rollNumber || log.studentName || log.description.split('for ')[1]?.split(' was')[0] || 'Student';
                          const isDuplicate = log.requestType === 'Duplicate' || log.description.includes('Duplicate');
                          return (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold text-gray-800">
                                {studentRollDisplay}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={isDuplicate ? 'warning' : 'primary'}>{log.requestType || (isDuplicate ? 'Duplicate' : 'Regular')}</Badge>
                              </td>
                              <td className="px-4 py-3">{new Date(log.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3">{log.remarks || 'None'}</td>
                              <td className="px-4 py-3">
                                <Badge variant={isDuplicate ? 'warning' : 'success'}>
                                  {isDuplicate ? '₹150 (Pending)' : 'Waived'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setVerifyRequest(log);
                                      resetChecklist();
                                      setShowVerifyModal(true);
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg flex items-center gap-0.5 text-xs font-semibold cursor-pointer"
                                  >
                                    <Check className="h-4 w-4" /> Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(log);
                                      setShowRejectModal(true);
                                    }}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 p-1.5 rounded-lg flex items-center gap-0.5 text-xs font-semibold cursor-pointer"
                                  >
                                    <XCircle className="h-4 w-4" /> Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                      {(!historyData || historyData.filter((log: any) => log.status === 'Pending' || (log.type === 'Request Update' && log.description.includes('Pending'))).length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-gray-400">
                            No pending ID card approval requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Payment Logs */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-500" />
                  ID Card Replacements Payment History & Receipts
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportData('pdf', 'payments')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <Download className="h-4 w-4" /> PDF Report
                  </button>
                  <button
                    onClick={() => handleExportData('excel', 'payments')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Export CSV
                  </button>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading payment history logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Amt Charged</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Transaction Ref</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Payment Date</th>
                        <th className="px-4 py-3">Receipt No</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {paymentHistory?.map((pay: any) => (
                        <tr key={pay.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-800">{pay.studentName}</td>
                          <td className="px-4 py-3">{pay.rollNumber}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">₹{pay.amount}</td>
                          <td className="px-4 py-3">{pay.paymentMethod}</td>
                          <td className="px-4 py-3 font-mono text-xs">{pay.transactionId || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <Badge variant={pay.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                              {pay.paymentStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {pay.receiptNumber ? (
                              <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">
                                {pay.receiptNumber}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Pending Collect</span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {(!paymentHistory || paymentHistory.length === 0) && (
                        <tr>
                          <td colSpan={8} className="text-center py-6 text-gray-400">
                            No duplicate card replacement payments collected yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Audit Log Trail */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  ID Card Lifecycle Complete Audit History Log Trail
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportData('pdf', 'audit_logs')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <Download className="h-4 w-4" /> PDF Report
                  </button>
                  <button
                    onClick={() => handleExportData('excel', 'audit_logs')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 text-xs flex items-center gap-1 font-medium"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Export CSV
                  </button>
                </div>
              </div>

              {historyLoading ? (
                <div className="text-center py-8 text-gray-400">Loading audit history list...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Event Type</th>
                        <th className="px-4 py-3">Detailed Activity Description</th>
                        <th className="px-4 py-3">Remarks / Reason</th>
                        <th className="px-4 py-3">Authorized By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {historyData?.map((log: any) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs">{new Date(log.date).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={
                              log.type === 'Print' ? 'success' : log.type === 'Missing Report' ? 'danger' : 'warning'
                            }>
                              {log.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-medium">{log.description}</td>
                          <td className="px-4 py-3">{log.remarks || 'None'}</td>
                          <td className="px-4 py-3 font-semibold text-xs text-gray-600">{log.user}</td>
                        </tr>
                      ))}

                      {(!historyData || historyData.length === 0) && (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-gray-400">
                            No administrative audit events recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      {/* 1. Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Issue Student ID Card</h3>
            <p className="text-sm text-gray-500">
              Confirm generation of a new active ID Card profile. The card will expire in 4 years and be set to Active status.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!selectedStudentId) {
                    toast.error('No student selected. Please search and select a student first.');
                    return;
                  }
                  try {
                    await createIDCardRequest({
                      studentId: selectedStudentId,
                      requestType: 'New',
                      reason: 'Initial card issuance'
                    });
                    toast.success('ID Card request submitted & sent to Pending Approval!');
                    setShowIssueModal(false);
                    await queryClient.invalidateQueries({ queryKey: ['idCardStats'] });
                    await queryClient.invalidateQueries({ queryKey: ['idCardHistory'] });
                    await queryClient.invalidateQueries({ queryKey: ['idCardStudentProfile'] });
                    await queryClient.invalidateQueries({ queryKey: ['idCardStudentProfile', selectedStudentId] });
                    refetchProfile();
                    setActiveTab('requests');
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || err.message || 'Failed to issue ID Card');
                  }
                }}
                disabled={issueMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                {issueMutation.isPending ? 'Generating...' : 'Confirm Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reprint Modal */}
      {showReprintModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Confirm Card Reprint</h3>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Reprint Reason</label>
              <textarea
                value={reprintRemarks}
                onChange={(e) => setReprintRemarks(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReprintModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const activeCard = studentProfile?.idCards?.find((c: any) => c.status === 'Active');
                  if (activeCard) {
                    reprintMutation.mutate({
                      cardId: activeCard.id,
                      remarks: reprintRemarks
                    });
                  }
                }}
                disabled={reprintMutation.isPending}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {reprintMutation.isPending ? 'Printing...' : 'Log Reprint'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Report Missing Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Report ID Card Missing</h3>
            <p className="text-sm text-gray-500">
              This will deactivate the current active card and mark it as Lost.
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Remarks</label>
              <input
                type="text"
                value={missingRemarks}
                onChange={(e) => setMissingRemarks(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMissingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const activeCard = studentProfile?.idCards?.find((c: any) => c.status === 'Active');
                  if (activeCard && selectedStudentId) {
                    reportMissingMutation.mutate({
                      studentId: selectedStudentId,
                      cardId: activeCard.id,
                      remarks: missingRemarks
                    });
                  }
                }}
                disabled={reportMissingMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {reportMissingMutation.isPending ? 'Deactivating...' : 'Report Lost'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Request Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Request Duplicate ID Card</h3>
            <p className="text-sm text-gray-500">
              Requesting a duplicate card will generate a pending card request and set a ₹150 replacement charge.
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Reason for Duplicate</label>
              <select
                value={duplicateReason}
                onChange={(e) => setDuplicateReason(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Lost Card">Lost Card</option>
                <option value="Physical Damage">Physical Damage</option>
                <option value="Theft">Stolen / Theft</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedStudentId) {
                    try {
                      // 1. Create duplicate request
                      const reqData = await createIDCardRequest({
                        studentId: selectedStudentId,
                        requestType: 'Duplicate',
                        reason: duplicateReason
                      });
                      
                      // 2. Clear state and show payment collection modal
                      setShowDuplicateModal(false);
                      setSelectedPaymentRequest(reqData);
                      setShowPaymentModal(true);
                    } catch (err: any) {
                      toast.error('Failed to create duplicate request');
                    }
                  }
                }}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Payment Modal (Duplicate Payment Collection workflow) */}
      {showPaymentModal && selectedPaymentRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Collect Duplicate Replacement Fee</h3>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between text-blue-900 text-sm">
              <span>Card Replacement Fee:</span>
              <span className="font-bold">₹150.00</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR Code">UPI / QR Code</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Netbanking">Netbanking</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Transaction Ref / ID</label>
                <input
                  type="text"
                  placeholder="e.g. TXN987654321"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  paymentMutation.mutate({
                    requestId: selectedPaymentRequest.id,
                    amount: 150.00,
                    paymentMethod,
                    transactionId
                  });
                }}
                disabled={paymentMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {paymentMutation.isPending ? 'Processing...' : 'Collect Payment & Auto-Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Reject Reason Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Reject ID Card Request</h3>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Reason for Rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejecting the student's request..."
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  approveRejectMutation.mutate({
                    requestId: selectedRequest.id,
                    status: 'Rejected',
                    rejectionReason
                  });
                }}
                disabled={approveRejectMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {approveRejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Printable Receipt modal popup */}
      {latestReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 justify-between">
              <div className="flex items-center gap-1">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <span className="font-bold text-gray-800">Duplicate Replacement Receipt</span>
              </div>
              <button onClick={() => setLatestReceipt(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="border border-gray-200 p-4 rounded-xl space-y-3 bg-gray-50 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Receipt Number:</span>
                <span className="font-mono font-bold text-gray-800">{latestReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date Issued:</span>
                <span className="text-gray-800">{new Date(latestReceipt.generated_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Collected:</span>
                <span className="font-bold text-emerald-600">₹150.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status:</span>
                <span className="font-bold text-emerald-600">PAID</span>
              </div>
              <div className="border-t pt-2 mt-2 text-xs text-center text-gray-400">
                Librarian Office • Apex Technology Institute
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                  toast.success('Sent receipt to printer');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                onClick={() => setLatestReceipt(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 8. Verification Checklist Modal */}
      {showVerifyModal && verifyRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-gray-800">Verification Checklist</span>
              </div>
              <button 
                onClick={() => setShowVerifyModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
              <div><span className="font-semibold">Student ID / Roll:</span> {verifyRequest.description.split('for ')[1]?.split(' was')[0]}</div>
              <div className="mt-1"><span className="font-semibold">Request Date:</span> {new Date(verifyRequest.date).toLocaleDateString()}</div>
              <div><span className="font-semibold">Remarks:</span> {verifyRequest.remarks || 'No remarks provided'}</div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirm All Verification Checks:</div>
              
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedDetails} 
                  onChange={(e) => setVerifiedDetails(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">Student Personal Details (Name, Roll, Aadhaar) match ERP records</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedPhoto} 
                  onChange={(e) => setVerifiedPhoto(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">Student photograph quality, clarity, and dimensions are acceptable</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedDept} 
                  onChange={(e) => setVerifiedDept(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">Academic course registration & Department details are current</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedMembership} 
                  onChange={(e) => setVerifiedMembership(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">Library Membership records are clean & registered</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedFees} 
                  onChange={(e) => setVerifiedFees(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">Tuition fee payment status checked (No outstanding dues)</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedDuplicate} 
                  onChange={(e) => setVerifiedDuplicate(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">Duplicate card request charges (if replacement) cleared/waived</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={verifiedFines} 
                  onChange={(e) => setVerifiedFines(e.target.checked)} 
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <span className="text-xs text-gray-600">No active library fines or overdue books pending</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  approveRejectMutation.mutate({
                    requestId: verifyRequest.requestId || verifyRequest.id,
                    status: 'Approved'
                  });
                  setShowVerifyModal(false);
                }}
                disabled={
                  !(verifiedDetails && verifiedPhoto && verifiedDept && verifiedMembership && verifiedFees && verifiedDuplicate && verifiedFines) || 
                  approveRejectMutation.isPending
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {approveRejectMutation.isPending ? 'Approving & Generating...' : 'Verify & Generate Active ID Card'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. Handover Card Modal */}
      {showHandoverModal && selectedStudentId && studentProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600 animate-bounce" />
                <span className="font-bold text-gray-800 text-lg">Confirm Card Handover</span>
              </div>
              <button 
                onClick={() => setShowHandoverModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const activeCard = studentProfile.idCards.find((c: any) => c.status === 'Active');
              const latestRequest = studentProfile.requests?.[0];
              const isDuplicate = latestRequest?.request_type === 'Duplicate';
              const paymentStatus = latestRequest?.payment_status;
              const isPaymentOk = !isDuplicate || paymentStatus === 'Paid' || paymentStatus === 'Waived';

              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2 text-sm text-gray-700">
                    <div><span className="font-semibold text-gray-500">Student:</span> {studentProfile.student.fullName}</div>
                    <div><span className="font-semibold text-gray-500">Roll Number:</span> {studentProfile.student.rollNumber}</div>
                    <div><span className="font-semibold text-gray-500">Department:</span> {studentProfile.student.department}</div>
                    <div><span className="font-semibold text-gray-500">Card Number:</span> <span className="font-mono font-bold text-indigo-600">{activeCard?.card_number}</span></div>
                    <div>
                      <span className="font-semibold text-gray-500">Payment Clearance:</span>{' '}
                      {isPaymentOk ? (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250 text-xs">CLEARED</span>
                      ) : (
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-250 text-xs">PENDING (₹150 DUE)</span>
                      )}
                    </div>
                  </div>

                  {!isPaymentOk && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Outstanding Replacement Dues!</span> This replacement card requires payment verification. Please collect payment from the payment register page or student portal before handing over.
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer font-medium">
                      <input 
                        type="checkbox" 
                        checked={handoverAcknowledged} 
                        onChange={(e) => setHandoverAcknowledged(e.target.checked)} 
                        className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
                      />
                      <span className="text-xs text-gray-600">
                        I confirm that the student is physically present, has verified the credentials printed on the card, and has signed the acknowledgment receipt.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button
                      onClick={() => setShowHandoverModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (activeCard) {
                          handoverMutation.mutate(activeCard.id);
                        }
                      }}
                      disabled={!isPaymentOk || !handoverAcknowledged || handoverMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                    >
                      {handoverMutation.isPending ? 'Confirming...' : 'Confirm Handover'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 10. Printable ID Card Application & Handover Acknowledgment Form */}
      {showAcknowledgmentForm && selectedStudentId && studentProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-gray-800 text-lg">ID Card Form & Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                    toast.success('Sent form to printer');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print Form
                </button>
                <button 
                  onClick={() => setShowAcknowledgmentForm(false)} 
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print Area Div */}
            <div className="print-area bg-white border p-8 rounded-xl space-y-6 text-black text-sm">
              {/* Header */}
              <div className="text-center border-b pb-4 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight uppercase">Apex Technology Institute</h1>
                <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Library & Information Sciences Division</p>
                <p className="text-xs text-gray-400">Main Campus, Academic Block A, Level 1</p>
                <div className="mt-2 text-md font-bold uppercase underline">Student ID Card Application & Handover Acknowledgment Form</div>
              </div>

              {/* Date / Metadata */}
              <div className="flex justify-between text-xs font-semibold border-b pb-2">
                <span>FORM ID: ATI/ID/{studentProfile.student.rollNumber}/{new Date().getFullYear()}</span>
                <span>DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              {/* Student Profile Info */}
              <div className="space-y-2">
                <h3 className="font-bold border-b pb-1 text-xs uppercase tracking-wider text-indigo-700">1. Student Details (From ERP Registrar)</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                  <div><span className="font-semibold text-gray-500">Student Name:</span> <span className="font-bold text-gray-900">{studentProfile.student.fullName}</span></div>
                  <div><span className="font-semibold text-gray-500">Roll Number:</span> <span className="font-bold font-mono text-gray-900">{studentProfile.student.rollNumber}</span></div>
                  <div><span className="font-semibold text-gray-500">Admission No:</span> <span className="font-mono text-gray-900">{studentProfile.student.admissionNumber || 'N/A'}</span></div>
                  <div><span className="font-semibold text-gray-500">Department / Branch:</span> <span className="text-gray-900">{studentProfile.student.department} / CSE</span></div>
                  <div><span className="font-semibold text-gray-500">Current Semester:</span> <span className="text-gray-900">Semester {studentProfile.student.semester} (Year {studentProfile.student.year})</span></div>
                  <div><span className="font-semibold text-gray-500">Mobile Number:</span> <span className="text-gray-900">{studentProfile.student.phoneNumber}</span></div>
                  <div><span className="font-semibold text-gray-500">Email Address:</span> <span className="text-gray-900">{studentProfile.student.email}</span></div>
                  <div><span className="font-semibold text-gray-500">Blood Group:</span> <span className="font-bold text-red-600">{studentProfile.student.bloodGroup || 'O+'}</span></div>
                </div>
              </div>

              {/* Card Issuance info */}
              {(() => {
                const activeCard = studentProfile.idCards.find((c: any) => c.status === 'Active');
                const latestRequest = studentProfile.requests?.[0];
                return (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-bold border-b pb-1 text-xs uppercase tracking-wider text-indigo-700">2. Identity Card Parameters</h3>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                        <div><span className="font-semibold text-gray-500">Card Number:</span> <span className="font-mono font-bold text-indigo-600">{activeCard?.card_number || 'AWAITING ISSUE'}</span></div>
                        <div>
                          <span className="font-semibold text-gray-500">Card Class / Type:</span>{' '}
                          <span className="font-bold text-gray-900">
                            {activeCard?.card_type === 'Duplicate' ? 'Duplicate (Replacement)' : 'Regular (First-time Issue)'}
                          </span>
                        </div>
                        <div><span className="font-semibold text-gray-500">Card Status:</span> <span className="font-semibold text-emerald-600">{activeCard?.status || 'Pending'}</span></div>
                        <div><span className="font-semibold text-gray-500">Delivery Status:</span> <span className="font-semibold text-indigo-600">{activeCard?.delivery_status || 'Pending Handover'}</span></div>
                        <div><span className="font-semibold text-gray-500">Issue Date:</span> <span className="text-gray-900">{activeCard ? new Date(activeCard.issue_date).toLocaleDateString() : 'N/A'}</span></div>
                        <div><span className="font-semibold text-gray-500">Expiration Date:</span> <span className="text-gray-900">{activeCard ? new Date(activeCard.expiry_date).toLocaleDateString() : 'N/A'}</span></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold border-b pb-1 text-xs uppercase tracking-wider text-indigo-700">3. Administrative Verification Checklist Clearance</h3>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✔</span> <span>Personal Details Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✔</span> <span>Academic Year Active Status Check</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✔</span> <span>Library Registration Database Synced</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✔</span> <span>Photograph Clarity & Dimensions Checked</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✔</span> <span>Tuition Fee Dues Checked (No Arrears)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-600">✔</span>{' '}
                          <span>
                            Replacement Fees: {latestRequest?.request_type === 'Duplicate' ? 'Paid (₹150)' : 'Waived (New Issue)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Terms / Declaration */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold border-b pb-1 uppercase tracking-wider text-indigo-700">4. Terms & Handover Declaration</h3>
                <p className="text-gray-600 leading-relaxed text-justify">
                  I hereby declare that the personal credentials shown above are true, accurate, and correspond exactly to my official identity records. I acknowledge receipt of my physical smart card ID. I agree to abide by the library's student code of conduct, non-transferability guidelines, and library lending parameters. I agree to bear the replacement charge of ₹150 in case of loss or damage, and will immediately surrender the card if I withdraw or graduate from the institute.
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-t border-black pt-2 mx-4"></div>
                  <span className="font-semibold text-gray-700 block">Student Signature</span>
                  <span className="text-[10px] text-gray-400">(Sign on receipt of card)</span>
                </div>
                <div className="space-y-1">
                  <div className="border-t border-black pt-2 mx-4"></div>
                  <span className="font-semibold text-gray-700 block">Librarian Signature</span>
                  <span className="text-[10px] text-gray-400">(Verification Authority Stamp)</span>
                </div>
                <div className="space-y-1">
                  <div className="border-t border-black pt-2 mx-4"></div>
                  <span className="font-semibold text-gray-700 block">Academic Office HOD</span>
                  <span className="text-[10px] text-gray-400">(Countersigned Registrar)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4 no-print">
              <button
                onClick={() => setShowAcknowledgmentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default LibrarianIdCards;
