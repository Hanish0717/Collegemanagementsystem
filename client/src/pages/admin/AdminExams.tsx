import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calendar, 
  Award, 
  FileText, 
  PieChart, 
  Loader2, 
  Trash2, 
  Download, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  Save, 
  UserCheck,
  Clock,
  BookOpen,
  Shield
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";
import { fetchDepartments } from "@/services/adminService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { jsPDF } from "jspdf";

// Type definitions
interface Exam {
  id: string;
  name: string;
  type: string;
  department: string;
  year: number;
  semester: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface Schedule {
  id?: string;
  subject: string;
  date: string;
  time: string;
  hall: string;
  duration: string;
}

interface StudentEligibility {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  year: number;
  semester: number;
  attendance_percentage: number;
  unpaid_fees: number;
  feeEligible: boolean;
  attendanceEligible: boolean;
  eligible: boolean;
  status: string;
  seat_number: string | null;
}

interface MarkRow {
  student_id: string;
  user_id: string;
  full_name: string;
  roll_number: string;
  marks: number | null;
  grade: string;
  credits: number;
}

export function AdminExams() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "timetable" | "qbank" | "invigilation" | "halltickets" | "results" | "corrections" | "supplementary" | "analytics">("overview");

  // Question Bank State
  const [qbank, setQbank] = useState([
    { id: "QB-01", subject: "Operating Systems", year: 3, semester: 5, uploadedBy: "Dr. Kumar Swamy", status: "Approved" },
    { id: "QB-02", subject: "Database Management Systems", year: 3, semester: 5, uploadedBy: "Prof. Anitha Rao", status: "Under Review" }
  ]);

  // Invigilation/Duty Chart State
  const [invigilationDuty, setInvigilationDuty] = useState([
    { id: "DUTY-01", faculty: "Dr. Kumar Swamy", date: "2026-08-10", session: "Morning (09:30 AM)", hall: "Block-A / 101" },
    { id: "DUTY-02", faculty: "Prof. Anitha Rao", date: "2026-08-11", session: "Afternoon (02:00 PM)", hall: "Block-B / 203" }
  ]);

  // Selection states
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // Form States - Exam Creation
  const [examForm, setExamForm] = useState({
    name: "",
    type: "Mid",
    department: "CSE",
    year: "3",
    semester: "5",
    start_date: "",
    end_date: ""
  });

  // Form States - Timetable Builder
  const [timetableForm, setTimetableForm] = useState({
    subject: "",
    date: "",
    time: "09:30 AM",
    hall: "Block-A / 101",
    duration: "3 Hours"
  });
  const [currentSchedules, setCurrentSchedules] = useState<Schedule[]>([]);

  // Form States - Marks Entry
  const [marksList, setMarksList] = useState<MarkRow[]>([]);

  // 1. Queries
  const { data: deptList = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: examStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["exams", "stats"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any }>("/api/exams/stats");
      return data.data;
    }
  });

  const { data: examsList = [], isLoading: isExamsLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data;
    }
  });

  const { data: activeTimetable = [], isLoading: isTimetableLoading } = useQuery({
    queryKey: ["exams", selectedExamId, "timetable"],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data } = await api.get<{ success: boolean; data: Schedule[] }>(`/api/exams/${selectedExamId}/timetable`);
      setCurrentSchedules(data.data || []);
      return data.data;
    },
    enabled: !!selectedExamId
  });

  const { data: eligibilityList = [], isLoading: isEligLoading, refetch: refetchEligibility } = useQuery({
    queryKey: ["exams", selectedExamId, "hall-tickets"],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data } = await api.get<{ success: boolean; data: StudentEligibility[] }>(`/api/exams/${selectedExamId}/hall-tickets`);
      return data.data;
    },
    enabled: !!selectedExamId && activeTab === "halltickets"
  });

  const { data: resultsList = [], isLoading: isResultsLoading, refetch: refetchResults } = useQuery({
    queryKey: ["exams", selectedExamId, "results", selectedSubject],
    queryFn: async () => {
      if (!selectedExamId || !selectedSubject) return [];
      const { data } = await api.get<{ success: boolean; data: MarkRow[] }>(
        `/api/exams/${selectedExamId}/results?subject=${encodeURIComponent(selectedSubject)}`
      );
      setMarksList(data.data || []);
      return data.data;
    },
    enabled: !!selectedExamId && !!selectedSubject && activeTab === "results"
  });

  const { data: examAnalytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["exams", selectedExamId, "extended-analytics"],
    queryFn: async () => {
      if (!selectedExamId) return null;
      const { data } = await api.get<{ success: boolean; data: any }>(`/api/exams/${selectedExamId}/extended-analytics`);
      return data.data;
    },
    enabled: !!selectedExamId && activeTab === "analytics"
  });

  const { data: correctionsList = [], isLoading: isCorrectionsLoading, refetch: refetchCorrections } = useQuery({
    queryKey: ["corrections", "pending"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any[] }>("/api/exams/corrections/pending");
      return data.data || [];
    },
    enabled: activeTab === "corrections"
  });

  const approveCorrectionMutation = useMutation({
    mutationFn: async ({ requestId, action, remarks }: { requestId: string; action: "Approved" | "Rejected"; remarks?: string }) => {
      await api.post("/api/exams/corrections/approve", { request_id: requestId, action, remarks });
    },
    onSuccess: () => {
      refetchCorrections();
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Marks correction status updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update correction status");
    }
  });

  const requestCorrectionMutation = useMutation({
    mutationFn: async (payload: { result_id: string; new_internal_marks: number; new_external_marks: number; reason: string }) => {
      await api.post("/api/exams/corrections/request", payload);
    },
    onSuccess: () => {
      refetchResults();
      toast.success("Marks correction request submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit correction request");
    }
  });

  // 2. Mutations
  const createExamMutation = useMutation({
    mutationFn: async (payload: typeof examForm) => {
      const { data } = await api.post("/api/exams", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam scheduled successfully!");
      setExamForm({
        name: "",
        type: "Mid",
        department: "CSE",
        year: "3",
        semester: "5",
        start_date: "",
        end_date: ""
      });
      setActiveTab("overview");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to schedule exam");
    }
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Exam> }) => {
      const { data } = await api.put(`/api/exams/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam status updated!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update exam");
    }
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully");
      if (selectedExamId) setSelectedExamId("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  });

  const saveTimetableMutation = useMutation({
    mutationFn: async ({ id, schedules }: { id: string; schedules: Schedule[] }) => {
      await api.post(`/api/exams/${id}/timetable`, { schedules });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams", selectedExamId, "timetable"] });
      toast.success("Exam timetable saved and broadcasted to Student & Faculty notifications!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save timetable");
    }
  });

  const approveHallTicketMutation = useMutation({
    mutationFn: async ({ id, studentId, seatNumber }: { id: string; studentId: string; seatNumber?: string }) => {
      await api.post(`/api/exams/${id}/hall-tickets/approve`, { student_id: studentId, seat_number: seatNumber });
    },
    onSuccess: () => {
      refetchEligibility();
      toast.success("Student approved & Hall Ticket generated!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve student");
    }
  });

  const saveResultsMutation = useMutation({
    mutationFn: async ({ id, subject, marksData }: { id: string; subject: string; marksData: MarkRow[] }) => {
      await api.post(`/api/exams/${id}/results`, {
        subject,
        marksData: marksData.map(m => ({
          student_user_id: m.user_id,
          marks: m.marks || 0,
          grade: m.grade || "F",
          credits: m.credits || 3
        }))
      });
    },
    onSuccess: () => {
      refetchResults();
      toast.success("Marks saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save marks");
    }
  });

  // Selected Exam Details helper
  const selectedExam = examsList.find(e => e.id === selectedExamId);

  // Timetable helpers
  const handleAddSchedule = () => {
    if (!timetableForm.subject.trim() || !timetableForm.date) {
      toast.error("Subject name and Date are required");
      return;
    }
    setCurrentSchedules([...currentSchedules, { ...timetableForm }]);
    setTimetableForm({
      subject: "",
      date: "",
      time: "09:30 AM",
      hall: "Block-A / 101",
      duration: "3 Hours"
    });
  };

  const handleRemoveSchedule = (index: number) => {
    setCurrentSchedules(currentSchedules.filter((_, i) => i !== index));
  };

  // Hall ticket pdf generation
  const downloadHallTicketPDF = (student: StudentEligibility) => {
    if (!selectedExam) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Outer Border
    doc.setDrawColor(79, 70, 229); // Indigo border
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(10, 10, 190, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CAMPUSLY COLLEGE OF ENGINEERING", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("HALL TICKET FOR UNIVERSITY EXAMINATION", 105, 28, { align: "center" });

    // Details Grid
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Student Name:", 20, 50);
    doc.text("Roll Number:", 20, 57);
    doc.text("Department:", 20, 64);
    doc.text("Academic Year:", 20, 71);

    doc.setFont("helvetica", "normal");
    doc.text(student.full_name, 60, 50);
    doc.text(student.roll_number, 60, 57);
    doc.text(student.department, 60, 64);
    doc.text(`Year ${student.year} / Semester ${student.semester}`, 60, 71);

    doc.setFont("helvetica", "bold");
    doc.text("Exam Name:", 120, 50);
    doc.text("Exam Type:", 120, 57);
    doc.text("Seat Number:", 120, 64);
    doc.text("Status:", 120, 71);

    doc.setFont("helvetica", "normal");
    doc.text(selectedExam.name, 150, 50);
    doc.text(selectedExam.type, 150, 57);
    doc.text(student.seat_number || "A-101", 150, 64);
    doc.text("Approved & Verified", 150, 71);

    // Divider line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, 80, 195, 80);

    // Timetable Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("EXAMINATION SCHEDULE", 20, 90);

    // Timetable Grid
    let startY = 100;
    doc.setFontSize(9);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, startY, 170, 8, "F");
    doc.text("Subject", 22, startY + 5);
    doc.text("Date", 80, startY + 5);
    doc.text("Time", 120, startY + 5);
    doc.text("Hall", 160, startY + 5);

    doc.setFont("helvetica", "normal");
    currentSchedules.forEach((s, idx) => {
      startY += 10;
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, startY - 2, 170, 8, "F");
      }
      doc.text(s.subject, 22, startY + 3);
      doc.text(s.date, 80, startY + 3);
      doc.text(s.time, 120, startY + 3);
      doc.text(s.hall, 160, startY + 3);
    });

    // Important Instructions
    const instrY = startY + 30;
    doc.line(15, instrY - 5, 195, instrY - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Important Instructions:", 20, instrY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("1. Candidates must carry this Hall Ticket and College ID Card to the exam hall.", 20, instrY + 6);
    doc.text("2. Please report to the designated hall 15 minutes before the start time.", 20, instrY + 11);
    doc.text("3. Electronic gadgets, smartwatches, and mobile phones are strictly prohibited.", 20, instrY + 16);

    // Signature Area
    doc.setFont("helvetica", "bold");
    doc.text("Controller of Examinations", 150, instrY + 35);
    doc.line(145, instrY + 30, 185, instrY + 30);

    doc.save(`HallTicket_${student.roll_number}.pdf`);
    toast.success(`Downloaded Hall Ticket for ${student.full_name}`);
  };

  // Grade helper
  const calculateGrade = (marks: number) => {
    if (marks >= 90) return "O";
    if (marks >= 80) return "A+";
    if (marks >= 70) return "A";
    if (marks >= 60) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 40) return "C";
    return "F";
  };

  const handleInternalMarkChange = (index: number, val: string) => {
    const internalVal = val === "" ? null : Number(val);
    const updated = [...marksList];
    updated[index].internal_marks = internalVal;
    
    const ext = updated[index].external_marks || 0;
    const total = (internalVal || 0) + ext;
    updated[index].marks = total;
    updated[index].grade = calculateGrade(total);
    setMarksList(updated);
  };

  const handleExternalMarkChange = (index: number, val: string) => {
    const externalVal = val === "" ? null : Number(val);
    const updated = [...marksList];
    updated[index].external_marks = externalVal;
    
    const int = updated[index].internal_marks || 0;
    const total = int + (externalVal || 0);
    updated[index].marks = total;
    updated[index].grade = calculateGrade(total);
    setMarksList(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Admin Examination Control"
        desc="Schedule examinations, configure timetables, audit student eligibility, generate hall tickets, and publish grades."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Dashboard & Exams", icon: LayoutDashboard },
          { id: "create", label: "Schedule Exam", icon: PlusCircle },
          { id: "timetable", label: "Timetable Builder", icon: Calendar },
          { id: "qbank", label: "Question Bank", icon: BookOpen },
          { id: "invigilation", label: "Invigilation Duty", icon: Shield },
          { id: "halltickets", label: "Hall Ticket Control", icon: UserCheck },
          { id: "results", label: "Results Publisher", icon: Award },
          { id: "corrections", label: "Correction Requests", icon: FileText },
          { id: "supplementary", label: "Supplementary Exams", icon: PlusCircle },
          { id: "analytics", label: "Exam Analytics", icon: PieChart }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer shrink-0 ${
                isActive 
                  ? "bg-primary text-white shadow-soft" 
                  : "bg-background border hover:bg-accent/40 text-muted-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          {isStatsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading metrics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard label="Upcoming Exams" value={examStats?.upcoming || 0} icon={Calendar} gradient="from-blue-600 to-indigo-500" />
              <StatCard label="Ongoing Exams" value={examStats?.ongoing || 0} icon={Clock} gradient="from-amber-500 to-orange-500" />
              <StatCard label="Completed Exams" value={examStats?.completed || 0} icon={CheckCircle} gradient="from-emerald-500 to-teal-500" />
              <StatCard label="Results Pending" value={examStats?.pendingResults || 0} icon={FileText} gradient="from-indigo-600 to-purple-500" />
              <StatCard label="Published" value={examStats?.resultsPublished || 0} icon={Award} gradient="from-purple-600 to-pink-500" />
            </div>
          )}

          {/* Scheduled Exams List */}
          <Card>
            <h3 className="font-semibold mb-4 text-gradient flex items-center gap-2 text-sm">
              <FileText className="size-4 text-primary" />
              All Scheduled Examinations
            </h3>
            {isExamsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="size-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Loading examinations...</span>
              </div>
            ) : examsList.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No examinations scheduled yet. Click the "Schedule Exam" tab to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Exam Name</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Year / Semester</th>
                      <th className="px-4 py-3 text-left">Dates</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {examsList.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-semibold text-foreground">{e.name}</td>
                        <td className="px-4 py-3">
                          <Badge tone="info">{e.type}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono">{e.department}</td>
                        <td className="px-4 py-3">Year {e.year} / Sem {e.semester}</td>
                        <td className="px-4 py-3 font-mono">{e.start_date} to {e.end_date}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            tone={
                              e.status === "Results Published" ? "success" : 
                              e.status === "Upcoming" ? "info" : 
                              e.status === "Ongoing" ? "warn" : "default"
                            }
                          >
                            {e.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5">
                          {e.status !== "Results Published" && (
                            <button
                              onClick={() => {
                                setSelectedExamId(e.id);
                                setActiveTab("timetable");
                              }}
                              className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition font-medium cursor-pointer"
                              title="Edit Timetable"
                            >
                              Timetable
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedExamId(e.id);
                              if (e.status === "Results Published" || e.status === "Results Pending") {
                                setActiveTab("results");
                              } else {
                                setActiveTab("halltickets");
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-600 transition font-medium cursor-pointer"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this scheduled exam? All associated timetable records will be permanently removed.")) {
                                deleteExamMutation.mutate(e.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Exam"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "create" && (
        <Card className="max-w-2xl mx-auto">
          <h3 className="font-semibold mb-4 text-gradient flex items-center gap-2 text-sm">
            <PlusCircle className="size-4 text-primary" />
            Schedule New Examination
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createExamMutation.mutate(examForm);
            }}
            className="space-y-4 p-4 border rounded-2xl bg-gradient-soft"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Exam Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Semester V Mid-Term Exams"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Exam Type *</label>
                <select
                  value={examForm.type}
                  onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Mid">Mid Exams</option>
                  <option value="Internal">Internal Exams</option>
                  <option value="Semester">Semester Exams</option>
                  <option value="Supplementary">Supplementary Exams</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Department *</label>
                <select
                  value={examForm.department}
                  onChange={(e) => setExamForm({ ...examForm, department: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  {deptList.map((d) => (
                    <option key={d._id} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Year *</label>
                <select
                  value={examForm.year}
                  onChange={(e) => setExamForm({ ...examForm, year: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Semester *</label>
                <select
                  value={examForm.semester}
                  onChange={(e) => setExamForm({ ...examForm, semester: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Start Date *</label>
                <input
                  type="date"
                  required
                  value={examForm.start_date}
                  onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">End Date *</label>
                <input
                  type="date"
                  required
                  value={examForm.end_date}
                  onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
                  className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createExamMutation.isPending}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {createExamMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save & Schedule Exam"
              )}
            </button>
          </form>
        </Card>
      )}

      {activeTab === "timetable" && (
        <div className="space-y-6">
          {/* Exam Selector */}
          <Card>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Examination to Build Timetable</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full max-w-md rounded-xl border bg-background/60 px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Choose Exam --</option>
              {examsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.department} - Sem {e.semester})
                </option>
              ))}
            </select>
          </Card>

          {selectedExamId && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Form Add Slot */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <h3 className="font-semibold mb-4 text-gradient text-xs">Add Schedule Slot</h3>
                  <div className="space-y-4 p-4 border rounded-2xl bg-gradient-soft">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Subject *</label>
                      <input
                        type="text"
                        placeholder="e.g. DBMS"
                        value={timetableForm.subject}
                        onChange={(e) => setTimetableForm({ ...timetableForm, subject: e.target.value })}
                        className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Exam Date *</label>
                      <input
                        type="date"
                        value={timetableForm.date}
                        onChange={(e) => setTimetableForm({ ...timetableForm, date: e.target.value })}
                        className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Time Slot *</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:30 AM"
                        value={timetableForm.time}
                        onChange={(e) => setTimetableForm({ ...timetableForm, time: e.target.value })}
                        className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Hall / Location *</label>
                      <input
                        type="text"
                        placeholder="e.g. Block-A / 101"
                        value={timetableForm.hall}
                        onChange={(e) => setTimetableForm({ ...timetableForm, hall: e.target.value })}
                        className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Duration *</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 Hours"
                        value={timetableForm.duration}
                        onChange={(e) => setTimetableForm({ ...timetableForm, duration: e.target.value })}
                        className="w-full mt-1.5 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      onClick={handleAddSchedule}
                      className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      + Add Subject Slot
                    </button>
                  </div>
                </Card>
              </div>

              {/* Schedules View */}
              <div className="lg:col-span-2">
                <Card className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gradient text-xs">Timetable Preview</h3>
                    <button
                      onClick={() => saveTimetableMutation.mutate({ id: selectedExamId, schedules: currentSchedules })}
                      disabled={saveTimetableMutation.isPending}
                      className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold hover:opacity-95 shadow-soft transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {saveTimetableMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Publish Timetable
                    </button>
                  </div>

                  {isTimetableLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 flex-1">
                      <Loader2 className="size-8 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">Loading preview...</span>
                    </div>
                  ) : currentSchedules.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-muted rounded-2xl py-12">
                      No subject schedules added to this exam timetable yet. Use the left panel to add slots.
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                          <tr>
                            <th className="px-4 py-2.5 text-left">Subject</th>
                            <th className="px-4 py-2.5 text-left">Date</th>
                            <th className="px-4 py-2.5 text-left">Time</th>
                            <th className="px-4 py-2.5 text-left">Hall</th>
                            <th className="px-4 py-2.5 text-left">Duration</th>
                            <th className="px-4 py-2.5 text-center">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {currentSchedules.map((s, idx) => (
                            <tr key={idx} className="hover:bg-muted/30">
                              <td className="px-4 py-2.5 font-semibold text-foreground">{s.subject}</td>
                              <td className="px-4 py-2.5 font-mono">{s.date ? String(s.date).substring(0, 10) : ""}</td>
                              <td className="px-4 py-2.5">{s.time}</td>
                              <td className="px-4 py-2.5">
                                <Badge tone="info">{s.hall}</Badge>
                              </td>
                              <td className="px-4 py-2.5">{s.duration}</td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  onClick={() => handleRemoveSchedule(idx)}
                                  className="text-rose-500 hover:text-rose-600 transition cursor-pointer font-bold text-xs"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTION BANK MANAGEMENT */}
      {activeTab === "qbank" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Question Bank Vault &amp; Peer Auditing</h3>
            <Badge tone="info">Accreditation Audit Ready</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Record ID</th>
                  <th className="text-left pb-2">Subject Course</th>
                  <th className="text-center pb-2">Cohort (Year/Sem)</th>
                  <th className="text-left pb-2">Uploaded By (Faculty)</th>
                  <th className="text-center pb-2">Audit Status</th>
                  <th className="text-right pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qbank.map(row => (
                  <tr key={row.id}>
                    <td className="py-3 font-mono font-bold text-indigo-700">{row.id}</td>
                    <td className="py-3 font-bold text-slate-800">{row.subject}</td>
                    <td className="py-3 text-center">Y{row.year} / S{row.semester}</td>
                    <td className="py-3 font-semibold text-slate-600">{row.uploadedBy}</td>
                    <td className="py-3 text-center">
                      <Badge tone={row.status === "Approved" ? "success" : "warn"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      {row.status !== "Approved" ? (
                        <>
                          <button
                            onClick={() => {
                              setQbank(prev => prev.map(q => q.id === row.id ? { ...q, status: "Approved" } : q));
                              toast.success(`Question Bank for ${row.subject} approved successfully!`);
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setQbank(prev => prev.map(q => q.id === row.id ? { ...q, status: "Rejected" } : q));
                              toast.error(`Question Bank for ${row.subject} rejected/sent back for revision!`);
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Locked &amp; Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* INVIGILATION DUTY CHART */}
      {activeTab === "invigilation" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Invigilator Allocation &amp; Exam Hall Duties</h3>
            <div className="space-y-3.5">
              {invigilationDuty.map(duty => (
                <div key={duty.id} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{duty.id}</span>
                      <span className="font-bold text-slate-800">{duty.faculty}</span>
                    </div>
                    <div className="text-slate-500 font-semibold">Date: {duty.date} | Session: {duty.session}</div>
                    <div className="text-[10px] text-slate-400 font-bold">Assigned Location: {duty.hall}</div>
                  </div>
                  <button
                    onClick={() => {
                      setInvigilationDuty(prev => prev.filter(d => d.id !== duty.id));
                      toast.info(`Invigilation duty duty duty deleted.`);
                    }}
                    className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Assign Duty Slot</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const faculty = (form.elements.namedItem("faculty") as HTMLInputElement).value;
                const date = (form.elements.namedItem("date") as HTMLInputElement).value;
                const session = (form.elements.namedItem("session") as HTMLSelectElement).value;
                const hall = (form.elements.namedItem("hall") as HTMLInputElement).value;

                if (!faculty.trim() || !date || !hall.trim()) {
                  toast.error("Please fill in all duty details!");
                  return;
                }

                const newDuty = {
                  id: `DUTY-0${invigilationDuty.length + 1}`,
                  faculty,
                  date,
                  session,
                  hall
                };
                setInvigilationDuty([...invigilationDuty, newDuty]);
                toast.success(`Invigilation duty assigned to ${faculty}!`);
                form.reset();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Faculty Name</label>
                <input
                  name="faculty"
                  type="text"
                  required
                  placeholder="e.g. Prof. Anitha Rao"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Duty Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Session Slot</label>
                <select
                  name="session"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Morning (09:30 AM)">Morning (09:30 AM)</option>
                  <option value="Afternoon (02:00 PM)">Afternoon (02:00 PM)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Exam Hall</label>
                <input
                  name="hall"
                  type="text"
                  required
                  placeholder="e.g. Block-A / 101"
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Assign Duty
              </button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === "halltickets" && (
        <div className="space-y-6">
          {/* Exam Selector */}
          <Card>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Examination for Hall Tickets Audit</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full max-w-md rounded-xl border bg-background/60 px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Choose Exam --</option>
              {examsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.department} - Sem {e.semester})
                </option>
              ))}
            </select>
          </Card>

          {selectedExamId && (
            <Card>
              <h3 className="font-semibold mb-4 text-gradient text-xs">Student Hall Tickets Eligibility</h3>
              {isEligLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Auditing student status...</span>
                </div>
              ) : eligibilityList.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No students found enrolled in the exam's cohort ({selectedExam?.department} - Year {selectedExam?.year} / Sem {selectedExam?.semester}).
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Student Info</th>
                        <th className="px-4 py-3 text-left">Attendance Status</th>
                        <th className="px-4 py-3 text-left">Fee Status</th>
                        <th className="px-4 py-3 text-left">Seat Number</th>
                        <th className="px-4 py-3 text-left">Eligibility</th>
                        <th className="px-4 py-3 text-center">Hall Ticket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {eligibilityList.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{s.full_name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{s.roll_number}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{s.attendance_percentage}%</div>
                            <Badge tone={s.attendanceEligible ? "success" : "danger"} className="scale-90 origin-left mt-1">
                              {s.attendanceEligible ? ">= 75% Eligible" : "Low Attendance"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">₹{s.unpaid_fees} unpaid</div>
                            <Badge tone={s.feeEligible ? "success" : "danger"} className="scale-90 origin-left mt-1">
                              {s.feeEligible ? "Fees Clear" : "Pending Dues"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono">{s.seat_number || "Not assigned"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {s.eligible ? (
                                <CheckCircle className="size-4 text-emerald-500" />
                              ) : (
                                <XCircle className="size-4 text-rose-500" />
                              )}
                              <span className={`font-semibold ${s.eligible ? "text-emerald-600" : "text-rose-600"}`}>
                                {s.eligible ? "Eligible" : "Ineligible"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.status === "Approved" ? (
                              <button
                                onClick={() => downloadHallTicketPDF(s)}
                                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition font-medium cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Download className="size-3" /> Download
                              </button>
                            ) : (
                              <button
                                onClick={() => approveHallTicketMutation.mutate({ id: selectedExamId, studentId: s.id })}
                                disabled={!s.eligible || approveHallTicketMutation.isPending}
                                className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Approve & Issue
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === "results" && (
        <div className="space-y-6">
          {/* Filters Card */}
          <Card>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Examination</label>
                <select
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    setSelectedSubject("");
                  }}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">-- Choose Exam --</option>
                  {examsList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedExamId && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Subject Subject Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. DBMS, OS, Python"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              )}

              {selectedExam && (
                <div className="flex items-end gap-2">
                  {selectedExam.status !== "Results Published" ? (
                    <button
                      onClick={() => updateExamMutation.mutate({ id: selectedExamId, updates: { status: "Results Published" } })}
                      disabled={updateExamMutation.isPending}
                      className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold hover:opacity-95 shadow-soft transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="size-4" /> Publish & Lock Results
                    </button>
                  ) : (
                    <button
                      onClick={() => updateExamMutation.mutate({ id: selectedExamId, updates: { status: "Completed" } })}
                      disabled={updateExamMutation.isPending}
                      className="w-full px-4 py-2.5 rounded-xl bg-muted border text-foreground text-xs font-semibold hover:bg-accent/40 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Unlock className="size-4" /> Reopen Results Editing
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {selectedExamId && selectedSubject && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gradient text-xs">Enter Student Marks ({selectedSubject})</h3>
                <button
                  onClick={() => saveResultsMutation.mutate({ id: selectedExamId, subject: selectedSubject, marksData: marksList })}
                  disabled={saveResultsMutation.isPending || selectedExam?.status === "Results Published"}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="size-4" /> Save Marks Draft
                </button>
              </div>

              {isResultsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Retrieving student ledger...</span>
                </div>
              ) : marksList.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No student records to display.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">Student</th>
                        <th className="px-4 py-3 text-left">Roll Number</th>
                        <th className="px-4 py-3 text-center w-28">Internal (0-30)</th>
                        <th className="px-4 py-3 text-center w-28">External (0-70)</th>
                        <th className="px-4 py-3 text-center w-28">Total (0-100)</th>
                        <th className="px-4 py-3 text-center w-20">Credits</th>
                        <th className="px-4 py-3 text-center w-20">Grade</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {marksList.map((m, idx) => (
                        <tr key={m.student_id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-foreground">{m.full_name}</td>
                          <td className="px-4 py-3 font-mono">{m.roll_number}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={m.internal_marks === null || m.internal_marks === undefined ? "" : m.internal_marks}
                              onChange={(e) => handleInternalMarkChange(idx, e.target.value)}
                              disabled={selectedExam?.status === "Results Published"}
                              className="rounded border px-2 py-1 text-center w-16 bg-background focus:border-primary outline-none disabled:opacity-60 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="70"
                              value={m.external_marks === null || m.external_marks === undefined ? "" : m.external_marks}
                              onChange={(e) => handleExternalMarkChange(idx, e.target.value)}
                              disabled={selectedExam?.status === "Results Published"}
                              className="rounded border px-2 py-1 text-center w-16 bg-background focus:border-primary outline-none disabled:opacity-60 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">
                            <div className="flex items-center justify-center gap-1.5">
                              <span>{m.marks === null || m.marks === undefined ? "0" : m.marks}</span>
                              {m.grace_applied && (
                                <Badge tone="warning" className="text-[9px] py-0 px-1 font-mono">Grace +{m.grace_marks}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              value={m.credits}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updated = [...marksList];
                                updated[idx].credits = val;
                                setMarksList(updated);
                              }}
                              disabled={selectedExam?.status === "Results Published"}
                              className="rounded border px-2 py-1 text-center w-12 bg-background focus:border-primary outline-none disabled:opacity-60 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold text-sm ${m.grade === "F" ? "text-rose-600" : "text-indigo-600"}`}>{m.grade || "F"}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {selectedExam?.status === "Results Published" && m.result_id ? (
                              <button
                                onClick={() => {
                                  const reason = prompt("Enter reason for requesting correction:");
                                  if (!reason) return;
                                  const proposedInternal = prompt("Enter proposed Internal marks (0-30):", String(m.internal_marks || 0));
                                  if (proposedInternal === null) return;
                                  const proposedExternal = prompt("Enter proposed External marks (0-70):", String(m.external_marks || m.marks || 0));
                                  if (proposedExternal === null) return;

                                  requestCorrectionMutation.mutate({
                                    result_id: m.result_id,
                                    new_internal_marks: parseFloat(proposedInternal),
                                    new_external_marks: parseFloat(proposedExternal),
                                    reason
                                  });
                                }}
                                className="px-2 py-1 rounded bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition cursor-pointer"
                              >
                                Request Edit
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold">Editable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      )}      {activeTab === "corrections" && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gradient text-xs mb-2">Marks Correction Request Portal</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Review and approve marks correction requests submitted by faculty members. Approved changes will directly overwrite the student grade card.
            </p>
            {isCorrectionsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="size-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Fetching pending requests...</span>
              </div>
            ) : correctionsList.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                No pending marks correction requests.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Subject</th>
                      <th className="px-4 py-3 text-center">Current (Int/Ext)</th>
                      <th className="px-4 py-3 text-center">Proposed (Int/Ext)</th>
                      <th className="px-4 py-3 text-left">Reason</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {correctionsList.map((req: any) => (
                      <tr key={req.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{req.student_profile?.full_name || "Student"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{req.student_profile?.roll_number}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{req.result?.subject}</td>
                        <td className="px-4 py-3 text-center text-slate-500">
                          {req.old_internal_marks} / {req.old_external_marks}
                        </td>
                        <td className="px-4 py-3 text-center text-indigo-600 font-bold font-mono">
                          {req.new_internal_marks} / {req.new_external_marks}
                        </td>
                        <td className="px-4 py-3 text-slate-600 italic max-w-xs truncate" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => approveCorrectionMutation.mutate({ requestId: req.id, action: "Approved" })}
                            disabled={approveCorrectionMutation.isPending}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const remarks = prompt("Enter rejection remarks:");
                              if (remarks === null) return;
                              approveCorrectionMutation.mutate({ requestId: req.id, action: "Rejected", remarks });
                            }}
                            disabled={approveCorrectionMutation.isPending}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "supplementary" && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gradient text-xs mb-2">Supplementary Exams Management</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Monitor active backlogs and manage student supplementary registrations.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Subject Code</th>
                    <th className="px-4 py-3 text-left">Subject Title</th>
                    <th className="px-4 py-3 text-center">Failing Roster Count</th>
                    <th className="px-4 py-3 text-center">Supplementary Date</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-background/50">
                  <tr className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">CS-504</td>
                    <td className="px-4 py-3 font-semibold text-foreground">Compiler Design</td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">3 Students</td>
                    <td className="px-4 py-3 text-center font-mono">2026-08-15</td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone="warning">Registration Open</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">ML-502</td>
                    <td className="px-4 py-3 font-semibold text-foreground">Machine Learning</td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">1 Student</td>
                    <td className="px-4 py-3 text-center font-mono">2026-08-16</td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone="warning">Registration Open</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-700">VL-701</td>
                    <td className="px-4 py-3 font-semibold text-foreground">VLSI Architecture</td>
                    <td className="px-4 py-3 text-center font-bold text-rose-600">0 Students</td>
                    <td className="px-4 py-3 text-center font-mono">--</td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone="info">No Backlogs</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Exam Selector */}
          <Card>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Select Examination for Analytics</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full max-w-md rounded-xl border bg-background/60 px-3 py-2.5 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Choose Exam --</option>
              {examsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Card>

          {selectedExamId && (
            <div className="grid lg:grid-cols-3 gap-6">
              {isAnalyticsLoading ? (
                <div className="col-span-3 flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Aggregating stats...</span>
                </div>
              ) : !examAnalytics || examAnalytics.totalSubmissions === 0 ? (
                <div className="col-span-3 text-center py-12 text-xs text-muted-foreground border-2 border-dashed rounded-2xl">
                  No graded marks submissions found for this exam. Please upload marks in the "Results Publisher" tab.
                </div>
              ) : (
                <>
                  {/* Left stats columns */}
                  <div className="lg:col-span-1 space-y-4">
                    <Card>
                      <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase">Key Performance Indices</h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-soft border flex justify-between items-center">
                          <div>
                            <div className="text-[10px] text-muted-foreground font-semibold uppercase">Pass Rate</div>
                            <div className="text-2xl font-bold text-emerald-600 mt-1">{examAnalytics.passRate}%</div>
                          </div>
                          <CheckCircle className="size-8 text-emerald-500/30" />
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-soft border flex justify-between items-center">
                          <div>
                            <div className="text-[10px] text-muted-foreground font-semibold uppercase">Average Score</div>
                            <div className="text-2xl font-bold text-indigo-600 mt-1">{examAnalytics.averageMarks} / 100</div>
                          </div>
                          <Award className="size-8 text-indigo-500/30" />
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-soft border flex justify-between items-center">
                          <div>
                            <div className="text-[10px] text-muted-foreground font-semibold uppercase">Total Graded Papers</div>
                            <div className="text-2xl font-bold text-foreground mt-1">{examAnalytics.totalSubmissions}</div>
                          </div>
                          <FileText className="size-8 text-muted-foreground/30" />
                        </div>
                      </div>
                    </Card>

                    {/* Top Performers */}
                    <Card>
                      <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase">Top Performing Students (Rank List)</h3>
                      <div className="space-y-3">
                        {examAnalytics.rankList?.map((stud: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 rounded-xl border bg-gradient-soft">
                            <div>
                              <div className="font-bold text-xs">{idx + 1}. {stud.full_name}</div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">{stud.roll_number} • {stud.department}</div>
                            </div>
                            <Badge tone="success">Total: {stud.totalMarks}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Chart and At-Risk view */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold mb-4 text-xs text-muted-foreground uppercase">Department Pass Rates</h3>
                        <div className="h-64 mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={examAnalytics.branchData?.map((b: any) => ({ name: b.branch, value: b.passRate }))}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                              <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                              <YAxis stroke="#64748B" fontSize={11} unit="%" />
                              <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(value) => [`${value}%`, "Pass Rate"]} />
                              <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="p-3 border rounded-xl bg-indigo-50 border-indigo-100 text-indigo-700 text-xs mt-4">
                        💡 **Note:** Pass eligibility requires student subject score &ge; 40. Stats auto-refresh upon publication of grades.
                      </div>
                    </Card>

                    {/* At-Risk Students Warning */}
                    {examAnalytics.atRiskStudents && examAnalytics.atRiskStudents.length > 0 && (
                      <Card className="border-rose-100 bg-rose-50/20">
                        <h4 className="font-bold text-xs text-rose-700 uppercase mb-3 flex items-center gap-1.5">
                          <AlertTriangle className="size-4 text-rose-500 animate-pulse" />
                          At-Risk Candidates Panel ({examAnalytics.atRiskStudents.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {examAnalytics.atRiskStudents.map((stud: any) => (
                            <div key={stud.id} className="p-3 border border-rose-100 rounded-xl bg-background flex justify-between items-start text-xs shadow-sm">
                              <div>
                                <div className="font-bold text-slate-800">{stud.full_name} ({stud.roll_number})</div>
                                <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-1">
                                  {stud.factors.map((f: string, i: number) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-medium">{f}</span>
                                  ))}
                                </div>
                              </div>
                              <Badge tone="danger">Risk Index: {stud.riskScore}</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


