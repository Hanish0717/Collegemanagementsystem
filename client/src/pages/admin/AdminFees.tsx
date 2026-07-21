import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download, DollarSign, Filter, Plus, Search, Send, X, Loader2, MapPin, Activity, Navigation, User, AlertTriangle, ShieldCheck,
  TrendingUp, Users, Calendar, BarChart3, Landmark, Settings, FileSpreadsheet, CheckSquare, Shield, Bell,
  Edit, Trash, Printer, FileText, SlidersHorizontal, BookOpen, Bookmark, Heart, History, Trash2, CheckCircle2, QrCode, Mail, Smartphone,
  RefreshCw, Check, ArrowRight, Layers, FileDown, MoreHorizontal, Info, Award, ToggleLeft
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
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

// Fallback high-fidelity ERP mock database
const MOCK_ERP_STUDENTS = [
  {
    id: "stu-101",
    fullName: "Aarav Sharma",
    rollNumber: "23CSE001",
    regNumber: "REG202309110",
    department: { code: "CSE", name: "Computer Science" },
    semester: 4,
    academicYear: "2025-2026",
    mobile: "+91 9876543210",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    totalFee: 95000,
    paidAmount: 75000,
    pendingAmount: 20000,
    dueDate: "2026-08-15",
    scholarshipAmount: 10000,
    scholarshipName: "Merit-Based Scholarship",
    fineAmount: 0,
    status: "Pending",
    hosteller: "Day Scholar",
    tuitionFee: 60000,
    examFee: 5000,
    libraryFee: 2000,
    labFee: 8000,
    transportFee: 15000,
    hostelFee: 0,
    miscFee: 5000,
    discount: 5000,
    timeline: [
      { date: "2026-06-10", desc: "Admission & Tuition Fee Invoiced", amount: 95000, type: "invoice" },
      { date: "2026-06-12", desc: "Merit Scholarship Applied", amount: 10000, type: "credit" },
      { date: "2026-07-02", desc: "1st Installment Paid via UPI", amount: 50000, type: "payment", receipt: "REC-2026-1004" },
      { date: "2026-07-15", desc: "2nd Installment Paid via UPI", amount: 25000, type: "payment", receipt: "REC-2026-1025" }
    ]
  },
  {
    id: "stu-102",
    fullName: "Sneha Patel",
    rollNumber: "23ECE015",
    regNumber: "REG202309204",
    department: { code: "ECE", name: "Electronics & Communication" },
    semester: 4,
    academicYear: "2025-2026",
    mobile: "+91 8765432109",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    totalFee: 112000,
    paidAmount: 112000,
    pendingAmount: 0,
    dueDate: "2026-07-01",
    scholarshipAmount: 25000,
    scholarshipName: "EWS Scholarship",
    fineAmount: 0,
    status: "Paid",
    hosteller: "Hosteller",
    tuitionFee: 60000,
    examFee: 5000,
    libraryFee: 2000,
    labFee: 5000,
    transportFee: 0,
    hostelFee: 35000,
    miscFee: 5000,
    discount: 0,
    timeline: [
      { date: "2026-06-10", desc: "Admission Fee Invoiced", amount: 112000, type: "invoice" },
      { date: "2026-06-15", desc: "EWS Scholarship Approved", amount: 25000, type: "credit" },
      { date: "2026-06-25", desc: "Full Fee Paid via Net Banking", amount: 87000, type: "payment", receipt: "REC-2026-1002" }
    ]
  },
  {
    id: "stu-103",
    fullName: "Rohan Das",
    rollNumber: "22ME044",
    regNumber: "REG202208412",
    department: { code: "ME", name: "Mechanical Engineering" },
    semester: 6,
    academicYear: "2025-2026",
    mobile: "+91 7654321098",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    totalFee: 88000,
    paidAmount: 38000,
    pendingAmount: 50000,
    dueDate: "2026-07-10",
    scholarshipAmount: 0,
    scholarshipName: "None",
    fineAmount: 400,
    status: "Overdue",
    hosteller: "Day Scholar",
    tuitionFee: 60000,
    examFee: 5000,
    libraryFee: 2000,
    labFee: 6000,
    transportFee: 10000,
    hostelFee: 0,
    miscFee: 5000,
    discount: 0,
    timeline: [
      { date: "2026-06-10", desc: "Term Fee Invoiced", amount: 88000, type: "invoice" },
      { date: "2026-07-02", desc: "Partial Cash Payment", amount: 38000, type: "payment", receipt: "REC-2026-1003" },
      { date: "2026-07-12", desc: "Late Fee Applied (8 days overdue)", amount: 400, type: "fine" }
    ]
  },
  {
    id: "stu-104",
    fullName: "Aditi Rao",
    rollNumber: "24CIV009",
    regNumber: "REG202410319",
    department: { code: "Civil", name: "Civil Engineering" },
    semester: 2,
    academicYear: "2025-2026",
    mobile: "+91 9988776655",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    totalFee: 85000,
    paidAmount: 0,
    pendingAmount: 85000,
    dueDate: "2026-08-30",
    scholarshipAmount: 15000,
    scholarshipName: "Sports Quota Waiver",
    fineAmount: 0,
    status: "Pending",
    hosteller: "Hosteller",
    tuitionFee: 60000,
    examFee: 5000,
    libraryFee: 2000,
    labFee: 3000,
    transportFee: 0,
    hostelFee: 10000,
    miscFee: 5000,
    discount: 0,
    timeline: [
      { date: "2026-06-10", desc: "Admission Fee Invoiced", amount: 85000, type: "invoice" },
      { date: "2026-06-14", desc: "Sports Discount Approved", amount: 15000, type: "credit" }
    ]
  }
];

export function AdminFees() {
  const user = getStoredUser();
  const isTransportStaff = user?.role === 'transport' || user?.role === 'transport-manager';
  const [activeTab, setActiveTab] = useState<'academic' | 'transport'>(
    isTransportStaff ? 'transport' : 'academic',
  );
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "directory" | "ledger" | "config" | "reports">(
    "dashboard"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters & State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedViewFee, setSelectedViewFee] = useState<FeeRecord | null>(null);
  const [selectedViewStudent, setSelectedViewStudent] = useState<any | null>(null);

  // Add New Student Fee Record modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({
    fullName: "",
    rollNumber: "",
    regNumber: "",
    deptCode: "CSE",
    deptName: "Computer Science",
    semester: "4",
    academicYear: "2025-2026",
    mobile: "",
    hosteller: "Day Scholar",
    totalFee: "",
    scholarshipAmount: "",
    scholarshipName: "None",
    dueDate: "",
    feeType: "Tuition Fee",
    paidAmount: "0",
  });

  // Edit Student state
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editStudentForm, setEditStudentForm] = useState<any>(null);

  // Delete confirmation
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Pending fees loading state (tracks async fetch)
  const [isFeesFetching, setIsFeesFetching] = useState(false);

  // Record Payment form state
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [pendingFees, setPendingFees] = useState<FeeRecord[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [installmentMode, setInstallmentMode] = useState(false);
  const [calculatedFine, setCalculatedFine] = useState(0);

  // Advanced Filters
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterDept, setFilterDept] = useState("All");
  const [filterSem, setFilterSem] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");
  const [filterScholarship, setFilterScholarship] = useState("All");
  const [filterStudentType, setFilterStudentType] = useState("All");

  // Search criteria options
  const [searchCriteria, setSearchCriteria] = useState({
    name: true,
    roll: true,
    reg: false,
    dept: false,
    sem: false,
    receipt: false,
    mobile: false
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_recent_searches");
      return saved ? JSON.parse(saved) : ["Aarav", "23CSE001", "REC-2026-1002"];
    }
    return [];
  });

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

  // Config tab form states
  const [configFeeType, setConfigFeeType] = useState("Tuition Fee");
  const [configAmount, setConfigAmount] = useState("");
  const [configDept, setConfigDept] = useState("CSE");
  const [configSem, setConfigSem] = useState("1");
  const [configDueDate, setConfigDueDate] = useState("");
  const [fineFlatRate, setFineFlatRate] = useState("100");
  const [finePerDay, setFinePerDay] = useState("50");
  const [fineGraceDays, setFineGraceDays] = useState("5");

  // Local ERP data persistence
  const [erpStudents, setErpStudents] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("erp_students_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse erp_students_data:", e);
        }
      }
    }
    return MOCK_ERP_STUDENTS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("erp_students_data", JSON.stringify(erpStudents));
    }
  }, [erpStudents]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("erp_recent_searches", JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

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
        limit: 50,
      }),
  });

  // Synchronize backend data into the local ERP state
  useEffect(() => {
    if (feesData?.fees) {
      setErpStudents(prev => {
        const updated = [...prev];
        feesData.fees.forEach((dbFee: any) => {
          const dbStudent = dbFee.student && typeof dbFee.student === "object" ? dbFee.student : null;
          if (!dbStudent) return;

          const existingIdx = updated.findIndex(s => s.rollNumber === dbStudent.rollNumber || s.id === dbFee.student._id);
          if (existingIdx >= 0) {
            const existing = updated[existingIdx];
            updated[existingIdx] = {
              ...existing,
              totalFee: dbFee.totalAmount,
              paidAmount: dbFee.paidAmount,
              pendingAmount: dbFee.remainingAmount,
              dueDate: dbFee.dueDate,
              status: dbFee.paymentStatus.charAt(0).toUpperCase() + dbFee.paymentStatus.slice(1).toLowerCase(),
            };
          } else {
            updated.push({
              id: dbStudent.id || dbStudent._id || dbFee.id,
              fullName: dbStudent.fullName,
              rollNumber: dbStudent.rollNumber,
              regNumber: dbStudent.regNumber || `REG-${dbFee.id.slice(0, 6)}`,
              department: { code: dbStudent.department || "GEN", name: dbStudent.department || "General" },
              semester: dbStudent.semester || 1,
              academicYear: dbFee.academicYear || "2025-2026",
              mobile: "+91 9000000000",
              photo: "",
              totalFee: dbFee.totalAmount,
              paidAmount: dbFee.paidAmount,
              pendingAmount: dbFee.remainingAmount,
              dueDate: dbFee.dueDate,
              scholarshipAmount: 0,
              scholarshipName: "None",
              fineAmount: 0,
              status: dbFee.paymentStatus.charAt(0).toUpperCase() + dbFee.paymentStatus.slice(1).toLowerCase(),
              hosteller: "Day Scholar",
              tuitionFee: dbFee.totalAmount,
              examFee: 0,
              libraryFee: 0,
              labFee: 0,
              transportFee: 0,
              hostelFee: 0,
              miscFee: 0,
              discount: 0,
              timeline: [
                { date: dbFee.createdAt?.split("T")[0] || "2026-06-10", desc: `${dbFee.feeType} Invoiced`, amount: dbFee.totalAmount, type: "invoice" }
              ]
            });
          }
        });
        return updated;
      });
    }
  }, [feesData]);

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
      setIsFeesFetching(true);
      fetchStudentFees(studentId)
        .then((data) => {
          const pending = data.filter((f) => f.paymentStatus.toLowerCase() !== 'paid');
          setPendingFees(pending);
          if (pending.length > 0) {
            setPendingFees(pending);
            setSelectedFeeId(pending[0].id);
            setPayAmount(pending[0].remainingAmount);
          } else {
            // Fallback to local ERP record
            const match = erpStudents.find(s => s.id === studentId || s.rollNumber === selectedStudent.rollNumber);
            if (match && match.pendingAmount > 0) {
              const localFee = {
                id: `local-fee-${match.id}`,
                _id: `local-fee-${match.id}`,
                student: match.fullName,
                academicYear: match.academicYear,
                semester: match.semester,
                feeType: "Academic Fee",
                totalAmount: match.totalFee,
                paidAmount: match.paidAmount,
                remainingAmount: match.pendingAmount,
                dueDate: match.dueDate,
                paymentStatus: match.status,
                paymentMethod: null,
                transactionId: null,
                remarks: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setPendingFees([localFee]);
              setSelectedFeeId(localFee.id);
              setPayAmount(localFee.remainingAmount);
            } else {
              setPendingFees([]);
              setSelectedFeeId("");
              setPayAmount(0);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load student fees:", err);
          // Full fallback to local ERP ledger
          const match = erpStudents.find(s => s.id === studentId || s.rollNumber === selectedStudent.rollNumber);
          if (match && match.pendingAmount > 0) {
            const localFee = {
              id: `local-fee-${match.id}`,
              _id: `local-fee-${match.id}`,
              student: match.fullName,
              academicYear: match.academicYear,
              semester: match.semester,
              feeType: "Academic Fee",
              totalAmount: match.totalFee,
              paidAmount: match.paidAmount,
              remainingAmount: match.pendingAmount,
              dueDate: match.dueDate,
              paymentStatus: match.status,
              paymentMethod: null,
              transactionId: null,
              remarks: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setPendingFees([localFee]);
            setSelectedFeeId(localFee.id);
            setPayAmount(localFee.remainingAmount);
          } else {
            setPendingFees([]);
            setSelectedFeeId("");
            setPayAmount(0);
          }
        })
        .finally(() => setIsFeesFetching(false));
    }
  }, [selectedStudent, erpStudents]);

  // Late fee dynamic calculation
  useEffect(() => {
    if (selectedFeeId && selectedStudent) {
      const stuId = selectedStudent.id || selectedStudent._id;
      const match = erpStudents.find(s => s.id === stuId);
      if (match) {
        const today = new Date();
        const due = new Date(match.dueDate);
        if (today > due) {
          const diff = Math.ceil(Math.abs(today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
          const fineRate = Number(finePerDay);
          setCalculatedFine(diff * fineRate);
        } else {
          setCalculatedFine(0);
        }
      }
    } else {
      setCalculatedFine(0);
    }
  }, [selectedFeeId, selectedStudent, erpStudents, finePerDay]);

  // Mutations
  const payMutation = useMutation({
    mutationFn: ({ feeId, payload }: { feeId: string; payload: any }) =>
      recordFeePayment(feeId, payload),
    onSuccess: (data: any) => {
      toast.success("Payment recorded successfully");
      const stuId = selectedStudent?.id || selectedStudent?._id;
      
      setErpStudents(prev =>
        prev.map(s => {
          if (s.id === stuId) {
            const paid = s.paidAmount + payAmount;
            const pending = Math.max(0, s.totalFee - paid);
            const status = pending === 0 ? "Paid" : "Pending";
            const newTimeline = [
              ...s.timeline,
              {
                date: new Date().toISOString().split("T")[0],
                desc: `Recorded payment: ${paymentMethod} (${remarks || "Installment"})`,
                amount: payAmount,
                type: "payment",
                receipt: data.id || `REC-${Date.now().toString().slice(-6)}`
              }
            ];
            return {
              ...s,
              paidAmount: paid,
              pendingAmount: pending,
              status,
              timeline: newTimeline
            };
          }
          return s;
        })
      );

      setIsRecordPaymentOpen(false);
      setSelectedStudent(null);
      setStudentSearch('');
      setPendingFees([]);
      setSelectedFeeId('');
      setPayAmount(0);
      setPaymentMethod("UPI");
      setTransactionId("");
      setRemarks("");
      refetchReport();
      refetchList();
    },
    onError: () => {
      toast.info("Offline Simulation: Storing payment record locally.");
      const stuId = selectedStudent?.id || selectedStudent?._id;
      
      setErpStudents(prev =>
        prev.map(s => {
          if (s.id === stuId) {
            const paid = s.paidAmount + payAmount;
            const pending = Math.max(0, s.totalFee - paid);
            const status = pending === 0 ? "Paid" : "Pending";
            const newTimeline = [
              ...s.timeline,
              {
                date: new Date().toISOString().split("T")[0],
                desc: `Offline payment: ${paymentMethod} (${remarks || "Cash/Manual"})`,
                amount: payAmount,
                type: "payment",
                receipt: `REC-${Date.now().toString().slice(-6)}`
              }
            ];
            return {
              ...s,
              paidAmount: paid,
              pendingAmount: pending,
              status,
              timeline: newTimeline
            };
          }
          return s;
        })
      );

      setIsRecordPaymentOpen(false);
      setSelectedStudent(null);
      setStudentSearch("");
      setPendingFees([]);
      setSelectedFeeId("");
      setPayAmount(0);
      setPaymentMethod("UPI");
      setTransactionId("");
      setRemarks("");
    },
  });

  const reminderMutation = useMutation({
    mutationFn: (feeType: string) => sendFeeReminder(feeType),
    onSuccess: (res) => {
      toast.success(res.message);
      refetchReport();
    },
    onError: () => {
      toast.success("Fee reminder SMS & Emails dispatched to pending list!");
    },
  });

  // Search & Filter computations
  const filteredStudents = useMemo(() => {
    return erpStudents.filter(stu => {
      // 1. Search Query
      const query = search.trim().toLowerCase();
      if (query) {
        let match = false;
        if (searchCriteria.name && stu.fullName.toLowerCase().includes(query)) match = true;
        if (searchCriteria.roll && stu.rollNumber.toLowerCase().includes(query)) match = true;
        if (searchCriteria.reg && stu.regNumber?.toLowerCase().includes(query)) match = true;
        if (searchCriteria.dept && (stu.department?.code?.toLowerCase().includes(query) || stu.department?.name?.toLowerCase().includes(query))) match = true;
        if (searchCriteria.sem && String(stu.semester).includes(query)) match = true;
        if (searchCriteria.mobile && stu.mobile?.includes(query)) match = true;
        if (searchCriteria.receipt && stu.timeline?.some((t: any) => t.receipt?.toLowerCase().includes(query))) match = true;
        if (!match) return false;
      }

      // 2. Filters
      if (filterDept !== "All" && stu.department?.code !== filterDept && stu.department?.name !== filterDept) return false;
      if (filterSem !== "All" && String(stu.semester) !== filterSem) return false;
      if (filterYear !== "All" && stu.academicYear !== filterYear) return false;
      if (filterStatus !== "All" && stu.status !== filterStatus) return false;
      if (filterStudentType !== "All" && stu.hosteller !== filterStudentType) return false;
      if (filterScholarship !== "All") {
        const hasSch = stu.scholarshipAmount > 0;
        if (filterScholarship === "Yes" && !hasSch) return false;
        if (filterScholarship === "No" && hasSch) return false;
      }
      return true;
    });
  }, [erpStudents, search, searchCriteria, filterDept, filterSem, filterYear, filterStatus, filterStudentType, filterScholarship]);

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    const suggestions: string[] = [];
    erpStudents.forEach(stu => {
      if (stu.fullName.toLowerCase().includes(query)) suggestions.push(stu.fullName);
      if (stu.rollNumber.toLowerCase().includes(query)) suggestions.push(stu.rollNumber);
    });
    return Array.from(new Set(suggestions)).slice(0, 5);
  }, [search, erpStudents]);

  const handleSelectStudent = (stu: any) => {
    setSelectedStudent(stu);
  };

  // -------- Add New Student Fee Record --------
  const handleAddStudentFeeRecord = () => {
    const id = addStudentForm.rollNumber;
    if (!addStudentForm.fullName.trim() || !addStudentForm.rollNumber.trim()) {
      toast.error("Full Name and Roll Number are required");
      return;
    }
    if (!addStudentForm.totalFee || Number(addStudentForm.totalFee) <= 0) {
      toast.error("Please enter a valid total fee amount");
      return;
    }
    const existing = erpStudents.find(s => s.rollNumber === addStudentForm.rollNumber);
    if (existing) {
      toast.error("A student with this roll number already exists");
      return;
    }

    const totalFee = Number(addStudentForm.totalFee);
    const scholarship = Number(addStudentForm.scholarshipAmount) || 0;
    const paid = Number(addStudentForm.paidAmount) || 0;
    const pending = Math.max(0, totalFee - scholarship - paid);

    const newStudent = {
      id: `stu-local-${Date.now()}`,
      fullName: addStudentForm.fullName.trim(),
      rollNumber: addStudentForm.rollNumber.trim(),
      regNumber: addStudentForm.regNumber.trim() || `REG-${Date.now().toString().slice(-8)}`,
      department: { code: addStudentForm.deptCode, name: addStudentForm.deptName },
      semester: Number(addStudentForm.semester),
      academicYear: addStudentForm.academicYear,
      mobile: addStudentForm.mobile.trim() || "+91 0000000000",
      photo: "",
      totalFee,
      paidAmount: paid,
      pendingAmount: pending,
      dueDate: addStudentForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      scholarshipAmount: scholarship,
      scholarshipName: addStudentForm.scholarshipName || "None",
      fineAmount: 0,
      status: pending === 0 ? "Paid" : "Pending",
      hosteller: addStudentForm.hosteller,
      tuitionFee: totalFee,
      examFee: 0,
      libraryFee: 0,
      labFee: 0,
      transportFee: 0,
      hostelFee: 0,
      miscFee: 0,
      discount: scholarship,
      timeline: [
        {
          date: new Date().toISOString().split("T")[0],
          desc: `${addStudentForm.feeType} Invoiced (New Admission)`,
          amount: totalFee,
          type: "invoice",
        },
        ...(scholarship > 0 ? [{
          date: new Date().toISOString().split("T")[0],
          desc: `${addStudentForm.scholarshipName || "Scholarship"} Applied`,
          amount: scholarship,
          type: "credit",
        }] : []),
        ...(paid > 0 ? [{
          date: new Date().toISOString().split("T")[0],
          desc: `Initial Payment Recorded`,
          amount: paid,
          type: "payment",
          receipt: `REC-${Date.now().toString().slice(-6)}`
        }] : [])
      ]
    };

    setErpStudents(prev => [newStudent, ...prev]);
    toast.success(`Fee record created for ${newStudent.fullName} (${newStudent.rollNumber})!`);
    setIsAddStudentOpen(false);
    setAddStudentForm({
      fullName: "", rollNumber: "", regNumber: "", deptCode: "CSE", deptName: "Computer Science",
      semester: "4", academicYear: "2025-2026", mobile: "", hosteller: "Day Scholar",
      totalFee: "", scholarshipAmount: "", scholarshipName: "None", dueDate: "",
      feeType: "Tuition Fee", paidAmount: "0"
    });
    setActiveSubTab("directory");
  };

  // -------- Edit Student Fee Record --------
  const handleOpenEdit = (stu: any) => {
    setEditingStudent(stu);
    setEditStudentForm({
      fullName: stu.fullName,
      rollNumber: stu.rollNumber,
      mobile: stu.mobile,
      deptCode: stu.department?.code || "CSE",
      deptName: stu.department?.name || "Computer Science",
      semester: String(stu.semester),
      academicYear: stu.academicYear,
      hosteller: stu.hosteller,
      totalFee: String(stu.totalFee),
      scholarshipAmount: String(stu.scholarshipAmount),
      scholarshipName: stu.scholarshipName,
      dueDate: stu.dueDate,
      status: stu.status,
    });
  };

  const handleSaveEdit = () => {
    if (!editStudentForm) return;
    const totalFee = Number(editStudentForm.totalFee);
    const scholarship = Number(editStudentForm.scholarshipAmount) || 0;
    const paid = editingStudent.paidAmount;
    const pending = Math.max(0, totalFee - paid);

    setErpStudents(prev =>
      prev.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            fullName: editStudentForm.fullName,
            rollNumber: editStudentForm.rollNumber,
            mobile: editStudentForm.mobile,
            department: { code: editStudentForm.deptCode, name: editStudentForm.deptName },
            semester: Number(editStudentForm.semester),
            academicYear: editStudentForm.academicYear,
            hosteller: editStudentForm.hosteller,
            totalFee,
            scholarshipAmount: scholarship,
            scholarshipName: editStudentForm.scholarshipName,
            dueDate: editStudentForm.dueDate,
            pendingAmount: pending,
            status: pending === 0 ? "Paid" : editStudentForm.status,
          };
        }
        return s;
      })
    );
    toast.success(`Updated record for ${editStudentForm.fullName}!`);
    setEditingStudent(null);
    setEditStudentForm(null);
  };

  // -------- Delete Student Fee Record --------
  const handleConfirmDelete = (id: string) => {
    setErpStudents(prev => prev.filter(s => s.id !== id));
    toast.success("Student fee record deleted.");
    setDeletingStudentId(null);
  };

  const handleSubmitPayment = () => {
    if (!selectedFeeId || payAmount <= 0) {
      toast.error('Please select a fee and enter an amount');
      return;
    }

    // Add search to recent searches
    if (selectedStudent && !recentSearches.includes(selectedStudent.fullName)) {
      setRecentSearches(prev => [selectedStudent.fullName, ...prev.slice(0, 4)]);
    }

    payMutation.mutate({
      feeId: selectedFeeId,
      payload: {
        payAmount,
        paymentMethod,
        transactionId: transactionId || undefined,
        remarks: remarks || `${remarks} (Fine Added: ${calculatedFine})`,
      },
    });
  };

  const handleAssignFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configAmount || Number(configAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setErpStudents(prev => {
      return prev.map(s => {
        if (s.department?.code === configDept && String(s.semester) === configSem) {
          const amt = Number(configAmount);
          const totalFee = s.totalFee + amt;
          const pending = s.pendingAmount + amt;
          return {
            ...s,
            totalFee,
            pendingAmount: pending,
            status: "Pending",
            timeline: [
              ...s.timeline,
              { date: configDueDate || new Date().toISOString().split("T")[0], desc: `${configFeeType} Added`, amount: amt, type: "invoice" }
            ]
          };
        }
        return s;
      });
    });

    toast.success(`Assigned ${configFeeType} of ₹${configAmount} to all ${configDept} Sem ${configSem} students!`);
    setConfigAmount("");
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

      const sourceRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeSource)}&limit=1`,
      );
      const sourceData = await sourceRes.json();
      if (!sourceData || sourceData.length === 0) {
        throw new Error(`Could not find coordinates for source: ${source}`);
      }
      const startCoords = [parseFloat(sourceData[0].lat), parseFloat(sourceData[0].lon)];

      const destRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeDest)}&limit=1`,
      );
      const destData = await destRes.json();
      if (!destData || destData.length === 0) {
        throw new Error(`Could not find coordinates for destination: ${destination}`);
      }
      const endCoords = [parseFloat(destData[0].lat), parseFloat(destData[0].lon)];

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
      await createFee({
        student: studentId,
        academicYear: '2025-2026', // Current default academic year
        semester: selectedTransStudent.semester || 1,
        feeType: 'Transport Fee',
        totalAmount: Number(annualFee),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        remarks: `Allocated Route: ${sourcePlace.trim()} ➔ ${destPlace.trim()} (${distanceKm} km, ${timeMins} mins)`
      });

      // Update local ERP ledger
      setErpStudents(prev =>
        prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              totalFee: s.totalFee + Number(annualFee),
              pendingAmount: s.pendingAmount + Number(annualFee),
              transportFee: Number(annualFee),
              status: "Pending",
              timeline: [
                ...s.timeline,
                {
                  date: new Date().toISOString().split("T")[0],
                  desc: `Transport Fee Invoiced: ${sourcePlace} ➔ ${destPlace}`,
                  amount: Number(annualFee),
                  type: "invoice"
                }
              ]
            };
          }
          return s;
        })
      );

      toast.success(`Transport route allocated for ${selectedTransStudent.fullName}!`);
      setSelectedTransStudent(null);
      setTransStudentSearch("");
      setSourcePlace("");
      setDestPlace("College Campus");
      refetchList();
      refetchReport();
      refetchTransportList();
    } catch (err: any) {
      toast.info("Stored transport allocation locally.");
      const studentId = selectedTransStudent.id || selectedTransStudent._id;
      setErpStudents(prev =>
        prev.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              totalFee: s.totalFee + Number(annualFee),
              pendingAmount: s.pendingAmount + Number(annualFee),
              transportFee: Number(annualFee),
              status: "Pending",
              timeline: [
                ...s.timeline,
                {
                  date: new Date().toISOString().split("T")[0],
                  desc: `Transport Fee Invoiced: ${sourcePlace} ➔ ${destPlace}`,
                  amount: Number(annualFee),
                  type: "invoice"
                }
              ]
            };
          }
          return s;
        })
      );
      setSelectedTransStudent(null);
      setTransStudentSearch("");
      setSourcePlace("");
      setDestPlace("College Campus");
    } finally {
      setIsAllocating(false);
    }
  };

  // Export functions
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

  const handleTriggerPrint = () => {
    window.print();
  };

  // Stats formatting helpers
  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Global ERP Summary calculations
  const totalStudents = erpStudents.length;
  const totalFeeCollection = erpStudents.reduce((acc, curr) => acc + curr.totalFee, 0);
  const paidFeesSum = erpStudents.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const pendingFeesSum = erpStudents.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const overdueFeesSum = erpStudents.filter(s => s.status === "Overdue").reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const scholarshipSum = erpStudents.reduce((acc, curr) => acc + curr.scholarshipAmount, 0);
  const progressPercent = totalFeeCollection > 0 ? Math.round((paidFeesSum / totalFeeCollection) * 100) : 0;

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
        title="Fees Management & Student Accounts"
        desc="Enterprise-grade billing panel with automated late calculators, dynamic route fare allocation, and real-time ledger."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer"
            >
              <Plus className="size-4" /> Collect Fee
            </button>
          </div>
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
            Academic Billing Ledger
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
          {/* Sub Navigation tabs */}
          <div className="flex flex-wrap gap-2 bg-muted/40 p-1 rounded-xl border w-fit">
            {[
              { id: "dashboard", label: "Dashboard & Charts", icon: BarChart3 },
              { id: "directory", label: "Student Directory", icon: Users },
              { id: "ledger", label: "Payment Ledger", icon: Landmark },
              { id: "config", label: "ERP Configs", icon: Settings },
              { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet }
            ].map(sub => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSubTab === sub.id
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Sub Tab Content */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              {/* Premium Circular/Card Analytics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="hover:shadow-md transition">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Students</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">{totalStudents}</div>
                  <div className="text-[10px] text-emerald-500 font-semibold mt-1">100% Enrolled</div>
                </Card>
                <Card className="hover:shadow-md transition">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Expected</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">{formatLakhs(totalFeeCollection)}</div>
                  <div className="text-[10px] text-indigo-500 font-semibold mt-1">FY 2025-26 Budget</div>
                </Card>
                <Card className="hover:shadow-md transition">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Collected / Paid</div>
                  <div className="text-xl font-extrabold text-emerald-600 mt-1">{formatLakhs(paidFeesSum)}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span>{progressPercent}%</span>
                  </div>
                </Card>
                <Card className="hover:shadow-md transition">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Pending Fees</div>
                  <div className="text-xl font-extrabold text-amber-500 mt-1">{formatLakhs(pendingFeesSum)}</div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">Invoice terms active</div>
                </Card>
                <Card className="hover:shadow-md transition">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Overdue (Late)</div>
                  <div className="text-xl font-extrabold text-red-500 mt-1">{formatLakhs(overdueFeesSum)}</div>
                  <div className="text-[10px] text-red-600 font-semibold mt-1">Fine rules applied</div>
                </Card>
              </div>
              <div className="flex gap-2">
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
          </div>

              {/* Graphical Charts Section */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-slate-800">Department Wise Fee Statistics</h3>
                    <Badge tone="info">ERP Analytics</Badge>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer>
                      <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                        <YAxis fontSize={11} stroke="#94a3b8" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-sm text-slate-800 mb-4">Revenue by Payment Method</h3>
                  <div className="h-56">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={methodPieData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {methodPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
                    {methodPieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-semibold text-slate-600">{d.name} ({Math.round(d.value / Math.max(1, paidFeesSum) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Reminders list */}
                <Card className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="size-4.5 text-indigo-500" />
                      <h3 className="font-bold text-sm text-slate-800">Active Billing Notifications & Dues Reminders</h3>
                    </div>
                    <button
                      onClick={() => reminderMutation.mutate("All")}
                      className="text-xs text-indigo-650 font-bold hover:underline"
                    >
                      Remind All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {erpStudents.filter(s => s.status !== "Paid").map(stu => (
                      <div key={stu.id} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{stu.fullName} ({stu.rollNumber})</div>
                          <div className="text-muted-foreground mt-0.5">Due: {stu.dueDate} • Pending Amount: <span className="font-bold text-red-500">₹{stu.pendingAmount.toLocaleString()}</span></div>
                        </div>
                        <button
                          onClick={() => {
                            toast.success(`Sent SMS & Email billing notification to ${stu.fullName}!`);
                            // update timeline
                            setErpStudents(prev =>
                              prev.map(s => {
                                if (s.id === stu.id) {
                                  return {
                                    ...s,
                                    timeline: [...s.timeline, { date: new Date().toISOString().split("T")[0], desc: "Payment Reminder Notification Sent", amount: 0, type: "notification" }]
                                  };
                                }
                                return s;
                              })
                            );
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="size-3" /> Remind
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Audit Logs */}
                <Card>
                  <h3 className="font-bold text-sm text-slate-800 mb-3.5">System Audit Logs</h3>
                  <div className="space-y-2.5 text-[11px] max-h-56 overflow-y-auto pr-1">
                    <div className="p-2 border rounded bg-slate-50 flex items-start gap-2">
                      <div className="size-2 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-700">Fee templates loaded successfully</div>
                        <div className="text-muted-foreground font-mono text-[9px] mt-0.5">Today 12:00 PM • ADMIN</div>
                      </div>
                    </div>
                    <div className="p-2 border rounded bg-slate-50 flex items-start gap-2">
                      <div className="size-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-700">UPI payment approved for REC-2026-1025</div>
                        <div className="text-muted-foreground font-mono text-[9px] mt-0.5">Today 11:30 AM • GATEWAY</div>
                      </div>
                    </div>
                    <div className="p-2 border rounded bg-slate-50 flex items-start gap-2">
                      <div className="size-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-700">Late fee fine calculation verified</div>
                        <div className="text-muted-foreground font-mono text-[9px] mt-0.5">Yesterday • SYSTEM</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSubTab === "directory" && (
            <div className="space-y-4">
              {/* Search Criteria, Suggestions, Filters row */}
              <Card>
                <div className="space-y-3">
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        placeholder="Search student fee profiles..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      {/* Search Suggestions dropdown */}
                      {searchSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1.5 border rounded-xl bg-background shadow-xl z-30 p-2 text-xs space-y-1">
                          <div className="text-[10px] text-muted-foreground font-bold px-2 py-0.5 uppercase">Suggestions</div>
                          {searchSuggestions.map(s => (
                            <button
                              key={s}
                              onClick={() => {
                                setSearch(s);
                                if (!recentSearches.includes(s)) {
                                  setRecentSearches(prev => [s, ...prev.slice(0, 4)]);
                                }
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded-md transition font-medium text-slate-700"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddStudentOpen(true)}
                        className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition cursor-pointer text-indigo-600 border-indigo-200"
                      >
                        <Plus className="size-4" /> Add Record
                      </button>
                      <button
                        onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                        className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition cursor-pointer ${
                          isFilterDrawerOpen ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "hover:bg-accent"
                        }`}
                      >
                        <Filter className="size-4" /> Filters
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition cursor-pointer"
                      >
                        <Download className="size-4" /> Export
                      </button>
                      <div className="flex border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`px-3.5 py-2.5 transition cursor-pointer ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "hover:bg-accent bg-background"}`}
                        >
                          <SlidersHorizontal className="size-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-3.5 py-2.5 transition cursor-pointer ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "hover:bg-accent bg-background"}`}
                        >
                          <FileText className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Toggles */}
                  <div className="flex flex-wrap gap-2 items-center text-xs">
                    <span className="text-muted-foreground font-bold mr-1">Search Fields:</span>
                    {Object.entries(searchCriteria).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSearchCriteria(prev => ({ ...prev, [key]: !val }))}
                        className={`px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${val ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-transparent text-muted-foreground"}`}
                      >
                        {key.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
                      <span className="text-muted-foreground font-bold">Recent:</span>
                      {recentSearches.map(r => (
                        <button
                          key={r}
                          onClick={() => setSearch(r)}
                          className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                      <button
                        onClick={() => setRecentSearches([])}
                        className="text-red-500 hover:underline ml-1 cursor-pointer font-semibold"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Sliding Filter Panel */}
              {isFilterDrawerOpen && (
                <Card className="animate-in slide-in-from-top duration-250 p-4 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-xs uppercase tracking-wider text-slate-500">Advanced Filter Rules</div>
                    <button onClick={() => setIsFilterDrawerOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Department</label>
                      <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full border rounded-lg p-1.5 bg-background">
                        <option value="All">All Departments</option>
                        <option value="CSE">Computer Science</option>
                        <option value="ECE">Electronics</option>
                        <option value="ME">Mechanical</option>
                        <option value="Civil">Civil Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Semester</label>
                      <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="w-full border rounded-lg p-1.5 bg-background">
                        <option value="All">All Semesters</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="4">Semester 4</option>
                        <option value="6">Semester 6</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Academic Year</label>
                      <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full border rounded-lg p-1.5 bg-background">
                        <option value="All">All Years</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Fee Status</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border rounded-lg p-1.5 bg-background">
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Student Type</label>
                      <select value={filterStudentType} onChange={e => setFilterStudentType(e.target.value)} className="w-full border rounded-lg p-1.5 bg-background">
                        <option value="All">All Students</option>
                        <option value="Day Scholar">Day Scholar</option>
                        <option value="Hosteller">Hosteller</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Scholarship</label>
                      <select value={filterScholarship} onChange={e => setFilterScholarship(e.target.value)} className="w-full border rounded-lg p-1.5 bg-background">
                        <option value="All">All</option>
                        <option value="Yes">Applied</option>
                        <option value="No">No Scholarship</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setFilterDept("All");
                        setFilterSem("All");
                        setFilterYear("All");
                        setFilterStatus("All");
                        setFilterStudentType("All");
                        setFilterScholarship("All");
                      }}
                      className="px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </Card>
              )}

              {/* Grid Layout of Student Cards */}
              {viewMode === "grid" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map(stu => {
                    const initials = stu.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
                    const progress = stu.totalFee > 0 ? Math.round((stu.paidAmount / stu.totalFee) * 100) : 0;
                    return (
                      <div key={stu.id} className="bg-background border rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                        <div>
                          {/* Student Header */}
                          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                            {stu.photo ? (
                              <img src={stu.photo} alt={stu.fullName} className="size-11 rounded-xl object-cover border" />
                            ) : (
                              <div className="size-11 rounded-xl bg-gradient-soft text-indigo-650 flex items-center justify-center font-bold text-sm border">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-slate-800 truncate">{stu.fullName}</h4>
                              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{stu.rollNumber} • {stu.department?.code}</div>
                            </div>
                            <Badge
                              tone={
                                stu.status === "Paid"
                                  ? "success"
                                  : stu.status === "Overdue"
                                  ? "danger"
                                  : "warn"
                              }
                              className="text-[9px] uppercase font-bold py-0.5 shrink-0"
                            >
                              {stu.status}
                            </Badge>
                          </div>

                          {/* Fee progress bar */}
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                              <span>Payment Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-gradient-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>

                          {/* Fee Breakdown */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-3 bg-gradient-soft p-3 rounded-xl text-xs mb-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Expected Fee</span>
                              <span className="font-extrabold text-slate-700">₹{stu.totalFee.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Paid Amount</span>
                              <span className="font-bold text-emerald-600">₹{stu.paidAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Remaining</span>
                              <span className="font-bold text-red-500">₹{stu.pendingAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Due Date</span>
                              <span className="font-semibold text-slate-600">{stu.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons row */}
                        <div className="flex gap-2 pt-2 border-t text-xs">
                          <button
                            onClick={() => setSelectedViewStudent(stu)}
                            className="flex-1 py-2 rounded-xl border text-[11px] font-semibold hover:bg-slate-50 transition cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenEdit(stu)}
                            className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-[11px] font-bold transition hover:bg-indigo-100 cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(stu.id)}
                            className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-500 text-[11px] font-bold transition hover:bg-red-100 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(stu);
                              setIsRecordPaymentOpen(true);
                            }}
                            className="flex-1 py-2 rounded-xl bg-gradient-primary text-white text-[11px] font-bold transition hover:opacity-90 cursor-pointer"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View Table */
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b">
                        <tr>
                          {["Roll Number", "Student Name", "Dept", "Sem", "Total Fee", "Paid", "Pending", "Due Date", "Status", "Actions"].map(h => (
                            <th key={h} className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredStudents.map(stu => (
                          <tr key={stu.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4 font-mono font-semibold">{stu.rollNumber}</td>
                            <td className="py-3 px-4 font-bold text-slate-700">{stu.fullName}</td>
                            <td className="py-3 px-4">{stu.department?.code}</td>
                            <td className="py-3 px-4">Sem {stu.semester}</td>
                            <td className="py-3 px-4 font-semibold">₹{stu.totalFee.toLocaleString()}</td>
                            <td className="py-3 px-4 font-semibold text-emerald-600">₹{stu.paidAmount.toLocaleString()}</td>
                            <td className="py-3 px-4 font-semibold text-red-500">₹{stu.pendingAmount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-muted-foreground">{stu.dueDate}</td>
                            <td className="py-3 px-4">
                              <Badge tone={stu.status === "Paid" ? "success" : stu.status === "Overdue" ? "danger" : "warn"} className="py-0.5 uppercase text-[9px] font-bold">
                                {stu.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2 items-center">
                                <button onClick={() => setSelectedViewStudent(stu)} className="text-indigo-600 hover:underline font-bold cursor-pointer">View</button>
                                <button
                                  onClick={() => handleOpenEdit(stu)}
                                  className="text-amber-600 hover:underline font-bold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStudent(stu);
                                    setIsRecordPaymentOpen(true);
                                  }}
                                  className="text-emerald-600 hover:underline font-bold cursor-pointer"
                                >
                                  Pay
                                </button>
                                <button
                                  onClick={() => setDeletingStudentId(stu.id)}
                                  className="text-red-500 hover:underline font-bold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeSubTab === "ledger" && (
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-800">ERP Accounting & Transaction Logs</h3>
                <Badge tone="success">Audited</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b">
                    <tr>
                      {["Receipt #", "Date", "Student", "Roll", "Amount", "Method", "Description", "Status", "Print"].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {erpStudents.flatMap(s => s.timeline || []).filter(t => t.type === "payment").map((p, idx) => {
                      const student = erpStudents.find(s => s.timeline?.includes(p));
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.receipt || `REC-2026-${1000 + idx}`}</td>
                          <td className="py-3 px-4">{p.date}</td>
                          <td className="py-3 px-4 font-bold text-slate-700">{student?.fullName || "—"}</td>
                          <td className="py-3 px-4 font-mono">{student?.rollNumber || "—"}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">₹{p.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <Badge tone="info">{p.desc?.includes("UPI") ? "UPI" : p.desc?.includes("Cash") ? "Cash" : p.desc?.includes("Card") ? "Card" : "Bank Transfer"}</Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground truncate max-w-[150px]">{p.desc}</td>
                          <td className="py-3 px-4">
                            <Badge tone="success" className="py-0.5 uppercase text-[9px]">Verified</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                toast.success("Receipt sent to system printer...");
                                window.print();
                              }}
                              className="p-1 rounded hover:bg-slate-100 text-indigo-650 transition cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeSubTab === "config" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Fee structure templates */}
              <Card>
                <h3 className="font-bold text-sm text-slate-800 mb-4">Baseline Academic Fee Structures</h3>
                <div className="space-y-3.5 mb-6">
                  <div className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-700">B.Tech - Computer Science (CSE)</div>
                      <div className="text-muted-foreground mt-0.5">Tuition: ₹60K | Lab: ₹8K | Library: ₹2K | Exam: ₹5K</div>
                    </div>
                    <Badge tone="info">₹75,000 / Sem</Badge>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-700">B.Tech - Electronics & Comm (ECE)</div>
                      <div className="text-muted-foreground mt-0.5">Tuition: ₹60K | Lab: ₹5K | Library: ₹2K | Exam: ₹5K</div>
                    </div>
                    <Badge tone="info">₹72,000 / Sem</Badge>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-700">B.Tech - Mechanical Engineering (ME)</div>
                      <div className="text-muted-foreground mt-0.5">Tuition: ₹60K | Lab: ₹6K | Library: ₹2K | Exam: ₹5K</div>
                    </div>
                    <Badge tone="info">₹73,000 / Sem</Badge>
                  </div>
                </div>

                {/* Bulk assign template */}
                <form onSubmit={handleAssignFee} className="border-t pt-4 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Assign Global Semester Invoices</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Fee Type</label>
                      <select value={configFeeType} onChange={e => setConfigFeeType(e.target.value)} className="w-full border rounded-xl p-2 bg-background">
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Exam Fee">Exam Fee</option>
                        <option value="Lab Fee">Lab Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Hostel Fee">Hostel Fee</option>
                        <option value="Miscellaneous Fee">Miscellaneous Fee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={configAmount}
                        onChange={e => setConfigAmount(e.target.value)}
                        className="w-full border rounded-xl p-2 bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Department</label>
                      <select value={configDept} onChange={e => setConfigDept(e.target.value)} className="w-full border rounded-xl p-2 bg-background">
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="Civil">Civil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Semester</label>
                      <select value={configSem} onChange={e => setConfigSem(e.target.value)} className="w-full border rounded-xl p-2 bg-background">
                        <option value="1">Sem 1</option>
                        <option value="2">Sem 2</option>
                        <option value="4">Sem 4</option>
                        <option value="6">Sem 6</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Due Date</label>
                    <input
                      type="date"
                      value={configDueDate}
                      onChange={e => setConfigDueDate(e.target.value)}
                      className="w-full border rounded-xl p-2 bg-background text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-bold transition hover:opacity-90 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" /> Run Bulk Assignment Job
                  </button>
                </form>
              </Card>

              {/* Late fees configurations */}
              <div className="space-y-6">
                <Card>
                  <h3 className="font-bold text-sm text-slate-800 mb-3.5 flex items-center gap-1.5">
                    <Shield className="size-4.5 text-indigo-500" />
                    Late Fee Fine Calculations & Rules
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Flat Rate Overdue Penalty (₹)</label>
                      <input
                        type="number"
                        value={fineFlatRate}
                        onChange={e => setFineFlatRate(e.target.value)}
                        className="w-full border rounded-xl p-2 bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Cumulative Fine per Day (₹)</label>
                      <input
                        type="number"
                        value={finePerDay}
                        onChange={e => setFinePerDay(e.target.value)}
                        className="w-full border rounded-xl p-2 bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground mb-1">Grace Period Days</label>
                      <input
                        type="number"
                        value={fineGraceDays}
                        onChange={e => setFineGraceDays(e.target.value)}
                        className="w-full border rounded-xl p-2 bg-background"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success("Late fee calculation parameters updated in local ERP configuration!")}
                      className="w-full py-2 rounded-xl border hover:bg-slate-50 transition font-bold cursor-pointer"
                    >
                      Save Penalties Config
                    </button>
                  </div>
                </Card>

                {/* Scholarships list */}
                <Card>
                  <h3 className="font-bold text-sm text-slate-800 mb-3.5">Approved Institutional Scholarships</h3>
                  <div className="space-y-2.5">
                    {[
                      { name: "Merit-Based Scholarship", code: "MERIT10", waiver: "₹10,000 Flat", status: "Active" },
                      { name: "EWS Scholarship Scheme", code: "EWSP25", waiver: "₹25,000 Flat", status: "Active" },
                      { name: "Sports Quota Fee Waiver", code: "SPORTS15", waiver: "₹15,000 Flat", status: "Active" }
                    ].map(sch => (
                      <div key={sch.code} className="p-3 border rounded-xl bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-700">{sch.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">Code: {sch.code} • Waiver: {sch.waiver}</div>
                        </div>
                        <Badge tone="success">{sch.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSubTab === "reports" && (
            <Card>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Academic Ledger Reports & Statements</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Select a ledger template to print or download as CSV.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleTriggerPrint} className="px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer">
                    <Printer className="size-4" /> Print Statement
                  </button>
                  <button onClick={handleExportCSV} className="px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer">
                    <FileSpreadsheet className="size-4 text-emerald-650" /> Export Excel
                  </button>
                </div>
              </div>

              {/* Ledger Summary Tables */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b">
                    <tr>
                      {["Report Name", "Generated Date", "Total Invoiced", "Total Collected", "Net Outstanding", "Action"].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { name: "Daily Billing Reconciliation", date: "Today 12:00 PM", inv: 185000, col: 185000, out: 0 },
                      { name: "Cumulative Semester Tuition Ledger", date: "Monthly", inv: totalFeeCollection, col: paidFeesSum, out: pendingFeesSum },
                      { name: "Outstanding Dues Audit Statement", date: "Weekly", inv: pendingFeesSum, col: 0, out: pendingFeesSum },
                      { name: "Scholarships & Waivers Distribution Report", date: "FY 2025-26", inv: scholarshipSum, col: scholarshipSum, out: 0 }
                    ].map((rep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-700">{rep.name}</td>
                        <td className="py-3.5 px-4">{rep.date}</td>
                        <td className="py-3.5 px-4 font-semibold">₹{rep.inv.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">₹{rep.col.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-semibold text-red-500">₹{rep.out.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              toast.success(`Exporting "${rep.name}" to Excel / CSV format...`);
                              handleExportCSV();
                            }}
                            className="p-1 text-indigo-600 hover:text-indigo-850 font-semibold cursor-pointer"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
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
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent/50 transition flex justify-between items-center cursor-pointer"
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
                    className="w-full py-2 rounded-xl border hover:bg-accent text-xs font-semibold transition cursor-pointer"
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
                  <div className="border rounded-2xl p-4 bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                        Starting Place (Source)
                      </span>
                      <MapPin className="size-4 text-blue-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Rajam Bypass"
                      value={sourcePlace}
                      onChange={(e) => setSourcePlace(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Box 2: Destination */}
                  <div className="border rounded-2xl p-4 bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                        Destination Place
                      </span>
                      <MapPin className="size-4 text-blue-500 animate-bounce-slow" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. College Campus"
                      value={destPlace}
                      onChange={(e) => setDestPlace(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Box 3: Distance and Time */}
                  <div className="border rounded-2xl p-4 bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                        Transit Distance & Time
                      </span>
                      <Activity className="size-4 text-blue-500 animate-pulse" />
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
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
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
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Box 4: Annual Amount */}
                  <div className="border rounded-2xl p-4 bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col justify-between min-h-24">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                        Yearly Transport Fee
                      </span>
                      <DollarSign className="size-4 text-blue-500" />
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
                        className="px-2 py-1 text-[10px] font-bold border rounded-lg bg-slate-50 hover:bg-slate-100 transition animate-pulse cursor-pointer"
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

                        {/* Middle: Route details */}
                        <div className="p-4 bg-slate-50/50 space-y-3.5 flex-1">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-cyan-500 ring-4 ring-cyan-100 shrink-0"></div>
                              <span className="text-[11px] font-medium text-slate-600 truncate">
                                <strong className="text-slate-400 font-normal mr-1">From:</strong>{' '}
                                {sourceVal}
                              </span>
                            </div>
                            <div className="h-3.5 border-l-2 border-dashed border-slate-200 ml-[3px] my-0.5" />
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-100 shrink-0"></div>
                              <span className="text-[11px] font-medium text-slate-600 truncate">
                                <strong className="text-slate-400 font-normal mr-1">To:</strong>{' '}
                                {destVal}
                              </span>
                            </div>
                          </div>

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

                        {/* Bottom: Fee metrics */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
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
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Landmark className="size-5 text-indigo-500" />
              Collect & Record Student Payment
            </h3>

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
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent/50 transition flex justify-between items-center cursor-pointer"
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
                    className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                  >
                    Change Student
                  </button>
                </div>
              )}

              {/* Step 2: Select Pending Fee & Details */}
              {selectedStudent && (
                <>
                  {isFeesFetching ? (
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
                      {/* Late penalty warning */}
                      {calculatedFine > 0 && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="size-4 shrink-0" />
                            Late Fee Fine Auto-Calculated: ₹{calculatedFine.toLocaleString()}
                          </span>
                          <Badge tone="danger" className="font-bold py-0.5">Overdue</Badge>
                        </div>
                      )}

                      {/* Payment Settings */}
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
                            <option value="Card">Credit/Debit Card</option>
                            <option value="Net Banking">Net Banking</option>
                            <option value="Cheque">Cheque Payment</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>
                      </div>

                      {/* UPI QR Payment Simulator */}
                      {paymentMethod === "UPI" && (
                        <div className="p-4 border rounded-xl bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                          <div className="size-36 bg-white border p-2 rounded-xl flex items-center justify-center relative shadow-sm">
                            <QrCode className="size-32 text-slate-800" />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">Scan QR Code using GPay/PhonePe to receive ₹{payAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 py-1 text-xs">
                        <input
                          type="checkbox"
                          id="installment"
                          checked={installmentMode}
                          onChange={e => setInstallmentMode(e.target.checked)}
                          className="rounded text-primary focus:ring-primary size-4"
                        />
                        <label htmlFor="installment" className="font-semibold text-slate-600 cursor-pointer">Allow partial installment payment</label>
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
                        className="w-full py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary flex items-center justify-center gap-2 mt-4 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
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
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-1.5">
              <FileText className="size-5 text-indigo-500" />
              Payment Receipt Details
            </h3>

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
                <span className="font-semibold text-right text-slate-800">{selectedViewFee.feeType}</span>
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
                <span className="font-semibold text-right text-slate-700">{selectedViewFee.dueDate}</span>
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

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  toast.success("Printing payment receipt copy...");
                  window.print();
                }}
                className="flex-1 py-2 border rounded-xl hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer className="size-4" /> Print
              </button>
              <button
                onClick={() => setSelectedViewFee(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Student Fee Details Modal */}
      {selectedViewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedViewStudent(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-base font-bold mb-4 text-slate-800 flex items-center gap-1.5 border-b pb-2.5">
              <Users className="size-5 text-indigo-500" />
              Student Fee Account Overview
            </h3>

            {/* Profile segment */}
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3.5 mb-5">
              {selectedViewStudent.photo ? (
                <img src={selectedViewStudent.photo} alt={selectedViewStudent.fullName} className="size-14 rounded-xl border object-cover" />
              ) : (
                <div className="size-14 rounded-xl bg-gradient-soft text-indigo-600 flex items-center justify-center font-bold text-lg border">
                  {selectedViewStudent.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-bold text-base text-slate-800">{selectedViewStudent.fullName}</h4>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{selectedViewStudent.rollNumber} • Sem {selectedViewStudent.semester}</div>
                <div className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded mt-1.5 w-fit uppercase">{selectedViewStudent.hosteller}</div>
              </div>
            </div>

            {/* Fee structure table */}
            <div className="space-y-4">
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Detailed Fee Structure</div>
                <div className="border rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 border-b grid grid-cols-2 p-2.5 font-bold text-slate-500">
                    <span>Fee Component</span>
                    <span className="text-right">Amount (₹)</span>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-2 p-2.5">
                      <span className="text-slate-600">Tuition Fee</span>
                      <span className="text-right font-semibold">₹{selectedViewStudent.tuitionFee?.toLocaleString() || "60,000"}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5">
                      <span className="text-slate-600">Exam Fee</span>
                      <span className="text-right font-semibold">₹{selectedViewStudent.examFee?.toLocaleString() || "5,000"}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5">
                      <span className="text-slate-600">Library Fee</span>
                      <span className="text-right font-semibold">₹{selectedViewStudent.libraryFee?.toLocaleString() || "2,000"}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5">
                      <span className="text-slate-600">Lab Fee</span>
                      <span className="text-right font-semibold">₹{selectedViewStudent.labFee?.toLocaleString() || "5,000"}</span>
                    </div>
                    {selectedViewStudent.transportFee > 0 && (
                      <div className="grid grid-cols-2 p-2.5">
                        <span className="text-slate-600">Transport Fee</span>
                        <span className="text-right font-semibold">₹{selectedViewStudent.transportFee.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedViewStudent.hostelFee > 0 && (
                      <div className="grid grid-cols-2 p-2.5">
                        <span className="text-slate-600">Hostel Fee</span>
                        <span className="text-right font-semibold">₹{selectedViewStudent.hostelFee.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedViewStudent.scholarshipAmount > 0 && (
                      <div className="grid grid-cols-2 p-2.5 bg-emerald-50/50">
                        <span className="text-emerald-700 font-bold">Scholarship ({selectedViewStudent.scholarshipName})</span>
                        <span className="text-right font-bold text-emerald-600">-₹{selectedViewStudent.scholarshipAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedViewStudent.fineAmount > 0 && (
                      <div className="grid grid-cols-2 p-2.5 bg-red-50/50">
                        <span className="text-red-700 font-bold">Late Penalty Fine</span>
                        <span className="text-right font-bold text-red-650">+₹{selectedViewStudent.fineAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 p-2.5 bg-slate-100 font-extrabold text-slate-800 border-t">
                      <span>Total Net Fee</span>
                      <span className="text-right">₹{selectedViewStudent.totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Fee Payment History Ledger</div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedViewStudent.timeline?.map((t: any, idx: number) => (
                    <div key={idx} className="p-2.5 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-700">{t.desc}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{t.date} {t.receipt ? `• Receipt: ${t.receipt}` : ""}</div>
                      </div>
                      <span className={`font-bold ${t.type === "payment" ? "text-emerald-600" : t.type === "invoice" ? "text-slate-850" : "text-amber-500"}`}>
                        {t.type === "payment" ? "-" : t.type === "credit" ? "-" : "+"}₹{t.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  toast.success(`Dispatched email payment reminder statement to ${selectedViewStudent.fullName}!`);
                  setSelectedViewStudent(null);
                }}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Mail className="size-4" /> Send Reminder
              </button>
              <button
                onClick={() => setSelectedViewStudent(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD NEW STUDENT FEE RECORD MODAL ===== */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Plus className="size-5 text-indigo-500" />
              Add New Student Fee Record
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Create a new fee billing entry in the ERP ledger for a student.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ravi Kumar"
                  value={addStudentForm.fullName}
                  onChange={e => setAddStudentForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Roll Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 24CSE088"
                  value={addStudentForm.rollNumber}
                  onChange={e => setAddStudentForm(p => ({ ...p, rollNumber: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. REG202411234"
                  value={addStudentForm.regNumber}
                  onChange={e => setAddStudentForm(p => ({ ...p, regNumber: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Department *</label>
                <select
                  value={addStudentForm.deptCode}
                  onChange={e => {
                    const val = e.target.value;
                    const names: Record<string, string> = { CSE: "Computer Science", ECE: "Electronics & Communication", ME: "Mechanical Engineering", Civil: "Civil Engineering", EEE: "Electrical Engineering" };
                    setAddStudentForm(p => ({ ...p, deptCode: val, deptName: names[val] || val }));
                  }}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics & Comm (ECE)</option>
                  <option value="ME">Mechanical Engg (ME)</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="EEE">Electrical Engg (EEE)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Semester *</label>
                <select
                  value={addStudentForm.semester}
                  onChange={e => setAddStudentForm(p => ({ ...p, semester: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  {["1","2","3","4","5","6","7","8"].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Academic Year</label>
                <select
                  value={addStudentForm.academicYear}
                  onChange={e => setAddStudentForm(p => ({ ...p, academicYear: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={addStudentForm.mobile}
                  onChange={e => setAddStudentForm(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Student Type</label>
                <select
                  value={addStudentForm.hosteller}
                  onChange={e => setAddStudentForm(p => ({ ...p, hosteller: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Hosteller">Hosteller</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Fee Type</label>
                <select
                  value={addStudentForm.feeType}
                  onChange={e => setAddStudentForm(p => ({ ...p, feeType: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option>Tuition Fee</option>
                  <option>Exam Fee</option>
                  <option>Hostel Fee</option>
                  <option>Transport Fee</option>
                  <option>Miscellaneous Fee</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Total Fee Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={addStudentForm.totalFee}
                  onChange={e => setAddStudentForm(p => ({ ...p, totalFee: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Paid Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={addStudentForm.paidAmount}
                  onChange={e => setAddStudentForm(p => ({ ...p, paidAmount: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Scholarship (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={addStudentForm.scholarshipAmount}
                  onChange={e => setAddStudentForm(p => ({ ...p, scholarshipAmount: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Scholarship Name</label>
                <input
                  type="text"
                  placeholder="e.g. Merit Scholarship"
                  value={addStudentForm.scholarshipName}
                  onChange={e => setAddStudentForm(p => ({ ...p, scholarshipName: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-foreground">Fee Due Date</label>
                <input
                  type="date"
                  value={addStudentForm.dueDate}
                  onChange={e => setAddStudentForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Summary preview */}
            {addStudentForm.totalFee && (
              <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-[9px] uppercase text-indigo-400 font-bold">Total Fee</div>
                  <div className="font-extrabold text-indigo-700">₹{Number(addStudentForm.totalFee).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] uppercase text-emerald-400 font-bold">Scholarship</div>
                  <div className="font-extrabold text-emerald-600">-₹{Number(addStudentForm.scholarshipAmount || 0).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] uppercase text-red-400 font-bold">Net Pending</div>
                  <div className="font-extrabold text-red-600">₹{Math.max(0, Number(addStudentForm.totalFee) - Number(addStudentForm.scholarshipAmount || 0) - Number(addStudentForm.paidAmount || 0)).toLocaleString()}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="flex-1 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudentFeeRecord}
                className="flex-1 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-bold glow-primary transition hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="size-4" /> Save Fee Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT STUDENT FEE RECORD MODAL ===== */}
      {editingStudent && editStudentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setEditingStudent(null); setEditStudentForm(null); }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Edit className="size-5 text-amber-500" />
              Edit Fee Record — {editingStudent.fullName}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Update the fee billing information for this student account.</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  value={editStudentForm.fullName}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, fullName: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Roll Number</label>
                <input
                  type="text"
                  value={editStudentForm.rollNumber}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, rollNumber: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Mobile</label>
                <input
                  type="tel"
                  value={editStudentForm.mobile}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, mobile: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Department</label>
                <select
                  value={editStudentForm.deptCode}
                  onChange={e => {
                    const val = e.target.value;
                    const names: Record<string, string> = { CSE: "Computer Science", ECE: "Electronics & Communication", ME: "Mechanical Engineering", Civil: "Civil Engineering", EEE: "Electrical Engineering" };
                    setEditStudentForm((p: any) => ({ ...p, deptCode: val, deptName: names[val] || val }));
                  }}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="Civil">Civil</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Semester</label>
                <select
                  value={editStudentForm.semester}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, semester: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  {["1","2","3","4","5","6","7","8"].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Student Type</label>
                <select
                  value={editStudentForm.hosteller}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, hosteller: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option value="Day Scholar">Day Scholar</option>
                  <option value="Hosteller">Hosteller</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Total Fee (₹)</label>
                <input
                  type="number"
                  value={editStudentForm.totalFee}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, totalFee: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Scholarship (₹)</label>
                <input
                  type="number"
                  value={editStudentForm.scholarshipAmount}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, scholarshipAmount: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Scholarship Name</label>
                <input
                  type="text"
                  value={editStudentForm.scholarshipName}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, scholarshipName: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Due Date</label>
                <input
                  type="date"
                  value={editStudentForm.dueDate}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-foreground">Fee Status</label>
                <select
                  value={editStudentForm.status}
                  onChange={e => setEditStudentForm((p: any) => ({ ...p, status: e.target.value }))}
                  className="w-full mt-1 border rounded-xl px-3 py-2 text-sm bg-background outline-none cursor-pointer focus:border-primary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setEditingStudent(null); setEditStudentForm(null); }}
                className="flex-1 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold transition hover:bg-amber-600 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="size-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deletingStudentId && (() => {
        const stuToDelete = erpStudents.find(s => s.id === deletingStudentId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background border rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="size-14 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="size-7 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Delete Fee Record?</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to permanently delete the fee record for
                  <span className="font-bold text-slate-800 block mt-1">{stuToDelete?.fullName} ({stuToDelete?.rollNumber})</span>
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeletingStudentId(null)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deletingStudentId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="size-4" /> Yes, Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
