import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Plus, Search, UserPlus, Trash2, Edit, Loader2, X, Eye, BookOpen, FileText, Users, UserCheck, CreditCard, Award, GraduationCap, CheckCircle, AlertCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  fetchDepartments,
  StudentItem,
} from "@/services/adminService";

export function AdminStudents() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"roster" | "discipline" | "achievements" | "vault">("roster");

  // Conduct Logs (Disciplinary Actions)
  const [disciplinaryLogs, setDisdisciplinaryLogs] = useState([
    { id: "DIS-001", student: "Amit Verma", roll: "21CS001", violation: "Littering inside Lab", action: "Verbal Warning issued", date: "2026-07-02", severity: "Low" },
    { id: "DIS-002", student: "Siddharth Roy", roll: "21CS002", violation: "Attendance Shortage", action: "Parent Memo Sent", date: "2026-07-10", severity: "Medium" }
  ]);
  const [newDiscName, setNewDiscName] = useState("");
  const [newDiscRoll, setNewDiscRoll] = useState("");
  const [newDiscViolation, setNewDiscViolation] = useState("");

  // Achievements
  const [achievements, setAchievements] = useState([
    { id: "ACH-901", student: "Priya Sharma", roll: "21CS003", title: "Smart India Hackathon First Prize", category: "Technical", date: "2026-06-15" },
    { id: "ACH-902", student: "Aman Sharma", roll: "21CS004", title: "State Inter-Collegiate Basketball Winners", category: "Sports", date: "2026-06-28" }
  ]);

  // Document Vault Checklist
  const [vaultRecords, setVaultRecords] = useState([
    { roll: "21CS001", name: "Amit Verma", marksheets10: true, marksheets12: true, tc: false, incomeCert: false },
    { roll: "21CS002", name: "Siddharth Roy", marksheets10: true, marksheets12: true, tc: true, incomeCert: true }
  ]);

  // Search & Filtering State
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal Open States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  // Form Input States
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedDept, setSelectedDept] = useState("");
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState("A");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeFee, setCollegeFee] = useState<number>(80000);
  const [selectedSisStudent, setSelectedSisStudent] = useState<any | null>(null);
  const [sisTab, setSisTab] = useState<"profile" | "history" | "certificates" | "parent" | "idcard" | "alumni">("profile");

  // Default fee mapping by department code
  const defaultFeesByDept: Record<string, number> = {
    CSE: 90000,
    AIML: 95000,
    AIDS: 95000,
    CYBERSECURITY: 95000,
    IT: 85000,
    ECE: 80000,
    EEE: 75000,
    MECH: 70000,
    CIVIL: 70000,
  };

  // Queries
  const { data: deptList = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students", search, deptFilter],
    queryFn: () =>
      fetchStudents({
        search: search || undefined,
        department: deptFilter !== "All" ? deptFilter : undefined,
        limit: 1000,
      }),
  });

  const studentsList = studentsData?.students || [];

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student account created and registered successfully!");
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to register student");
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StudentItem> }) =>
      updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student record updated");
      setEditingStudent(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update student");
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student soft-deleted");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete student");
    },
  });

  // Reset form helper
  const resetForm = () => {
    setFullName("");
    setRollNumber("");
    setAdmissionNumber("");
    setEmail("");
    setPhoneNumber("");
    setGender("Male");
    setSelectedDept("");
    setYear(1);
    setSemester(1);
    setSection("A");
    setParentName("");
    setParentPhone("");
    setParentEmail("");
    setPassword("");
    setCollegeFee(80000);
  };

  // Populate edit fields helper
  const openEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setRollNumber(student.rollNumber);
    setAdmissionNumber(student.admissionNumber || "");
    setEmail(student.email);
    setPhoneNumber(student.phoneNumber || "");
    setGender(student.gender || "Male");
    setSelectedDept(
      typeof student.department === "object" && student.department
        ? student.department._id
        : (student.department as string) || "",
    );
    setYear(student.year);
    setSemester(student.semester);
    setSection(student.section);
    setParentName(student.parentName);
    setParentPhone(student.parentPhone);
    setParentEmail(student.parentEmail || "");
    setPassword(""); // Registration password is not loaded/edited
  };

  // Submit handlers
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !rollNumber.trim() ||
      !email.trim() ||
      !selectedDept ||
      !parentName.trim() ||
      !parentPhone.trim() ||
      !parentEmail.trim() ||
      !password.trim()
    ) {
      toast.error("Please fill in all required fields (including Parent Email and Password)");
      return;
    }

    createStudentMutation.mutate({
      fullName,
      rollNumber,
      admissionNumber: admissionNumber || undefined,
      email,
      phoneNumber: phoneNumber || undefined,
      gender,
      department: selectedDept,
      year,
      semester,
      section,
      parentName,
      parentPhone,
      parentEmail,
      password,
      collegeFee,
    });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6 || !unverifiedEmail) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      await api.post("/api/auth/verify-otp", {
        email: unverifiedEmail,
        otp: otpCode,
        type: "email_verification",
      });
      toast.success("Student account successfully verified and registered!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsAddModalOpen(false);
      setUnverifiedEmail(null);
      setOtpCode("");
      resetForm();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Verification failed. Please check the OTP.";
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (
      !fullName.trim() ||
      !rollNumber.trim() ||
      !email.trim() ||
      !selectedDept ||
      !parentName.trim() ||
      !parentPhone.trim() ||
      !parentEmail.trim()
    ) {
      toast.error("Please fill in all required fields (including Parent Email)");
      return;
    }

    updateStudentMutation.mutate({
      id: editingStudent._id,
      payload: {
        fullName,
        rollNumber,
        admissionNumber: admissionNumber || undefined,
        email,
        phoneNumber: phoneNumber || undefined,
        gender,
        department: selectedDept,
        year,
        semester,
        section,
        parentName,
        parentPhone,
        parentEmail,
      },
    });
  };

  // Filter & Stats computations
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && (s.attendancePercentage ?? 0) >= 75) ||
        (statusFilter === "Warning" && (s.attendancePercentage ?? 0) < 75);

      return matchStatus;
    });
  }, [studentsList, statusFilter]);

  const activeStudentsCount = useMemo(() => {
    return studentsList.filter((s) => (s.attendancePercentage ?? 0) >= 75).length;
  }, [studentsList]);

  const warningStudentsCount = useMemo(() => {
    return studentsList.filter((s) => (s.attendancePercentage ?? 0) < 75).length;
  }, [studentsList]);

  const averageAttendance = useMemo(() => {
    if (studentsList.length === 0) return "0%";
    const total = studentsList.reduce((acc, curr) => acc + (curr.attendancePercentage || 0), 0);
    return `${Math.round(total / studentsList.length)}%`;
  }, [studentsList]);

  const departmentDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    studentsList.forEach((s) => {
      const deptObj = typeof s.department === "object" && s.department
        ? s.department
        : deptList.find((d) => d.code === s.department || d._id === s.department);
      const deptName = deptObj ? deptObj.name : (typeof s.department === "string" ? s.department : "Other");
      counts[deptName] = (counts[deptName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [studentsList, deptList]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        desc="Manage student records, enrollment numbers, attendance tracking and status monitoring."
        actions={
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Add Student
          </button>
        }
      />
      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-4">
        {[
          { id: "roster", label: "Student Roster", icon: Users },
          { id: "discipline", label: "Disciplinary Logs", icon: AlertCircle },
          { id: "achievements", label: "Achievements", icon: Award },
          { id: "vault", label: "Document Vault", icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "roster" && (
        <>
          <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name, roll number, or email..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Departments</option>
            {deptList.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active (Attendance &gt;= 75%)</option>
            <option value="Warning">Warning (Attendance &lt; 75%)</option>
          </select>
        </div>
      </Card>

      {/* Top Stat Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: studentsList.length.toString(), tone: "info" as const },
          { label: "Active Students", value: activeStudentsCount.toString(), tone: "success" as const },
          { label: "Warning Status", value: warningStudentsCount.toString(), tone: "warn" as const },
          { label: "Avg Attendance", value: averageAttendance, tone: "info" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2 text-gradient">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Realtime
            </Badge>
          </Card>
        ))}
      </div>

      {/* Student List Table */}
      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading student roster...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No active student records matching filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {[
                    "Admission No",
                    "Roll Number",
                    "Name",
                    "Department",
                    "Year/Semester",
                    "Attendance",
                    "Status",
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
                {filteredStudents.slice(0, 10).map((student) => {
                  const deptObj = typeof student.department === "object" && student.department
                    ? student.department
                    : deptList.find((d) => d.code === student.department || d._id === student.department);
                  const deptName = deptObj ? deptObj.name : (typeof student.department === "string" ? student.department : "Other");
                  const attendanceVal = student.attendancePercentage ?? 0;
                  const isWarning = attendanceVal < 75;

                  return (
                    <tr key={student._id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium text-xs">
                        {student.admissionNumber || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-medium text-xs text-muted-foreground">
                        {student.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-medium">{student.fullName}</td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{deptName}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        Year {student.year} / Sem {student.semester}
                      </td>
                      <td className="py-3 px-4 font-medium">{attendanceVal}%</td>
                      <td className="py-3 px-4">
                        <Badge tone={isWarning ? "warn" : "success"}>
                          {isWarning ? "Warning" : "Active"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSisStudent(student);
                              setSisTab("profile");
                            }}
                            className="p-1 rounded hover:bg-accent text-indigo-600 hover:text-indigo-700 cursor-pointer transition"
                            title="View SIS Details"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition"
                            title="Edit Student"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(`Are you sure you want to delete ${student.fullName}?`)
                              ) {
                                deleteStudentMutation.mutate(student._id);
                              }
                            }}
                            className="p-1 rounded hover:bg-accent text-rose-500 hover:text-rose-600 cursor-pointer transition"
                            title="Delete Student"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            {filteredStudents.length > 10 && (
              <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 bg-muted/10 text-xs text-muted-foreground rounded-b-2xl">
                <div>
                  Showing <span className="font-semibold text-foreground">10</span> of{" "}
                  <span className="font-semibold text-foreground">{filteredStudents.length}</span> students
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold">
                  <span>+{filteredStudents.length - 10} more records exist</span>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Department Analytics */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="size-5 text-indigo-500" />
            <h3 className="font-semibold text-gradient">Enrollment Analytics</h3>
          </div>
          <div className="space-y-3">
            {departmentDistribution.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No departmental student data.
              </div>
            ) : (
              departmentDistribution.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
                >
                  <span className="text-sm text-muted-foreground">{dept.name}</span>
                  <span className="font-bold">{dept.value}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Info Box */}
        <Card className="flex flex-col justify-center items-center text-center p-6 space-y-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <UserPlus className="size-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gradient">Realtime Student Registry</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Add new student registrations directly in MongoDB. Realtime links will associate students
              to matching section/subject faculty advisors automatically.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition"
          >
            Launch Add Dialog
          </button>
        </Card>
      </div>
        </>
      )}

      {/* DISCIPLINARY LOGS */}
      {activeTab === "discipline" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Conduct Log &amp; Disciplinary Warnings</h3>
            <div className="space-y-3.5">
              {disciplinaryLogs.map(log => (
                <div key={log.id} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600">{log.id}</span>
                      <span className="font-bold text-slate-800">{log.student} ({log.roll})</span>
                      <Badge tone={log.severity === "Low" ? "info" : log.severity === "Medium" ? "warn" : "danger"} className="text-[9px]">
                        {log.severity} Severity
                      </Badge>
                    </div>
                    <div className="text-slate-500 font-semibold">Violation: {log.violation}</div>
                    <div className="text-[10px] text-slate-400 font-bold">Action Taken: {log.action} | Date: {log.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Log Disciplinary Incident</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDiscName.trim() || !newDiscRoll.trim() || !newDiscViolation.trim()) {
                  toast.error("Please fill in violation incident details!");
                  return;
                }
                const newLog = {
                  id: `DIS-00${disciplinaryLogs.length + 1}`,
                  student: newDiscName,
                  roll: newDiscRoll,
                  violation: newDiscViolation,
                  action: "Warning Letter Dispatched",
                  date: new Date().toISOString().split("T")[0],
                  severity: "Low"
                };
                setDisdisciplinaryLogs([newLog, ...disciplinaryLogs]);
                toast.success(`Disciplinary incident logged for ${newDiscName}!`);
                setNewDiscName("");
                setNewDiscRoll("");
                setNewDiscViolation("");
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="Student Name"
                  value={newDiscName}
                  onChange={(e) => setNewDiscName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="Roll Number"
                  value={newDiscRoll}
                  onChange={(e) => setNewDiscRoll(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Violation Description</label>
                <textarea
                  required
                  placeholder="Incident details..."
                  value={newDiscViolation}
                  onChange={(e) => setNewDiscViolation(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none h-16 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Log Incident Warning
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <Card>
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Student Extra-Curricular &amp; Academic Achievements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Record ID</th>
                  <th className="text-left pb-2">Student Name</th>
                  <th className="text-left pb-2">Roll Number</th>
                  <th className="text-left pb-2">Achievement Details / Event</th>
                  <th className="text-center pb-2">Category</th>
                  <th className="text-right pb-2">Log Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {achievements.map(ach => (
                  <tr key={ach.id}>
                    <td className="py-3 font-mono font-bold text-indigo-700">{ach.id}</td>
                    <td className="py-3 font-bold text-slate-800">{ach.student}</td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">{ach.roll}</td>
                    <td className="py-3 font-semibold text-slate-700">{ach.title}</td>
                    <td className="py-3 text-center"><Badge tone="success">{ach.category}</Badge></td>
                    <td className="py-3 text-right font-mono text-slate-400">{ach.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* DOCUMENT VAULT */}
      {activeTab === "vault" && (
        <Card>
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Student Certificate Vault &amp; Documents Checklist</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Roll No</th>
                  <th className="text-left pb-2">Student Name</th>
                  <th className="text-center pb-2">10th Marksheet</th>
                  <th className="text-center pb-2">12th Marksheet</th>
                  <th className="text-center pb-2">Transfer Certificate</th>
                  <th className="text-center pb-2">Income Certificate</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vaultRecords.map(row => {
                  const allOk = row.marksheets10 && row.marksheets12 && row.tc && row.incomeCert;
                  return (
                    <tr key={row.roll}>
                      <td className="py-3 font-mono font-bold text-slate-400">{row.roll}</td>
                      <td className="py-3 font-bold text-slate-800">{row.name}</td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.marksheets10}
                          onChange={() => {
                            setVaultRecords(prev => prev.map(r => r.roll === row.roll ? { ...r, marksheets10: !r.marksheets10 } : r));
                            toast.success("Document vault status toggled!");
                          }}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.marksheets12}
                          onChange={() => {
                            setVaultRecords(prev => prev.map(r => r.roll === row.roll ? { ...r, marksheets12: !r.marksheets12 } : r));
                            toast.success("Document vault status toggled!");
                          }}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.tc}
                          onChange={() => {
                            setVaultRecords(prev => prev.map(r => r.roll === row.roll ? { ...r, tc: !r.tc } : r));
                            toast.success("Document vault status toggled!");
                          }}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.incomeCert}
                          onChange={() => {
                            setVaultRecords(prev => prev.map(r => r.roll === row.roll ? { ...r, incomeCert: !r.incomeCert } : r));
                            toast.success("Document vault status toggled!");
                          }}
                          className="rounded text-indigo-600 size-3 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <Badge tone={allOk ? "success" : "danger"}>
                          {allOk ? "Vault Complete" : "Documents Missing"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Register Student Account</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            {unverifiedEmail ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    An OTP verification code has been sent to <span className="font-semibold text-foreground">{unverifiedEmail}</span>. Please enter the 6-digit code to verify the account and complete registration.
                  </p>
                  {otpError && (
                    <div className="mb-4 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left">
                      {otpError}
                    </div>
                  )}
                  <div className="max-w-[200px] mx-auto">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center px-4 py-3 rounded-xl border bg-background text-lg font-bold tracking-widest focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setUnverifiedEmail(null);
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {verifyingOtp ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Verify & Complete"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aman Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 21CS001"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Admission No</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Auto-generated on save"
                      value={admissionNumber}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-muted text-muted-foreground text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aman@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Department *</label>
                    <select
                      value={selectedDept}
                      onChange={(e) => {
                        const deptId = e.target.value;
                        setSelectedDept(deptId);
                        const dept = deptList.find((d) => d._id === deptId);
                        if (dept) {
                          const code = dept.code.toUpperCase();
                          const defaultFee = defaultFeesByDept[code] || 80000;
                          setCollegeFee(defaultFee);
                        }
                      }}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {deptList.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Year *</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Sem *</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Section *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A"
                      value={section}
                      onChange={(e) => setSection(e.target.value.toUpperCase())}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">College Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 80000"
                      value={collegeFee}
                      onChange={(e) => setCollegeFee(Number(e.target.value))}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Set student login password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-xs font-bold text-muted-foreground mb-3">Parent / Guardian Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Parent Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Father/Mother name"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Parent Contact *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contact number"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-muted-foreground">Parent Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="parent@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createStudentMutation.isPending}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {createStudentMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Register Student"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Edit Student Record</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Admission No</label>
                  <input
                    type="text"
                    disabled
                    value={admissionNumber}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-muted text-muted-foreground text-sm outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Department *</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {deptList.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Sem *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Section *</label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-xs font-bold text-muted-foreground mb-3">Parent / Guardian Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Parent Name *</label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Parent Contact *</label>
                    <input
                      type="text"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-muted-foreground">Parent Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="parent@gmail.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updateStudentMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Information System (SIS) Details Modal */}
      {selectedSisStudent && (() => {
        const deptObj = typeof selectedSisStudent.department === "object" && selectedSisStudent.department
          ? selectedSisStudent.department
          : deptList.find((d: any) => d.code === selectedSisStudent.department || d._id === selectedSisStudent.department);
        const sisDeptName = deptObj ? deptObj.name : (typeof selectedSisStudent.department === "string" ? selectedSisStudent.department : "Other");

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b bg-muted/20">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <UserCheck className="size-5 text-indigo-600" />
                    <span>Student Information System (SIS) Portal</span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Detailed registry files for {selectedSisStudent.fullName} ({selectedSisStudent.rollNumber})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSisStudent(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Tab Navigation */}
                <div className="w-56 border-r bg-muted/10 p-3 space-y-1.5 overflow-y-auto shrink-0">
                  {[
                    { id: "profile", label: "Student Profile", icon: UserCheck },
                    { id: "history", label: "Academic History", icon: BookOpen },
                    { id: "certificates", label: "Certificates Hub", icon: FileText },
                    { id: "parent", label: "Parent Details", icon: Users },
                    { id: "idcard", label: "ID Card Generator", icon: CreditCard },
                    { id: "alumni", label: "Alumni Record", icon: Award }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSisTab(tab.id as any)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2  rounded-xl text-xs text-left cursor-pointer transition
                        ${sisTab === tab.id
                          ? "bg-indigo-600 text-white font-bold shadow-soft"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                    >
                      <tab.icon className="size-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content Panel */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/20 text-left">
                  {sisTab === "profile" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b">
                        <div className="size-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                          {selectedSisStudent.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{selectedSisStudent.fullName}</h4>
                          <p className="text-[10px] text-muted-foreground">Roll: {selectedSisStudent.rollNumber} | Adm: {selectedSisStudent.admissionNumber || "N/A"}</p>
                        </div>
                        <Badge tone="success" className="ml-auto">Active Student</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Institutional Scope</span>
                          <div className="mt-1.5 space-y-1.5">
                            <div className="flex justify-between"><span className="text-muted-foreground">Department:</span> <span className="font-bold text-slate-800">{sisDeptName}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Academic Year:</span> <span className="font-semibold">Year {selectedSisStudent.year}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Semester:</span> <span className="font-semibold">Semester {selectedSisStudent.semester}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Section:</span> <span className="font-semibold">Section {selectedSisStudent.section || "A"}</span></div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Contact & Personal Details</span>
                          <div className="mt-1.5 space-y-1.5">
                            <div className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span className="font-semibold truncate max-w-[120px]">{selectedSisStudent.email}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span> <span className="font-semibold">{selectedSisStudent.phoneNumber || "9876543210"}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Gender:</span> <span className="font-semibold">{selectedSisStudent.gender || "Male"}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Admission Date:</span> <span className="font-semibold">July 20, 2024</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sisTab === "history" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 border rounded-2xl bg-indigo-50/50 text-center">
                          <div className="text-[10px] font-bold text-indigo-700 uppercase">Cumulative GPA</div>
                          <div className="text-xl font-black text-indigo-800 mt-1">8.58</div>
                        </div>
                        <div className="p-3 border rounded-2xl bg-emerald-50/50 text-center">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase">Earned Credits</div>
                          <div className="text-xl font-black text-emerald-800 mt-1">84 / 160</div>
                        </div>
                        <div className="p-3 border rounded-2xl bg-rose-50/50 text-center">
                          <div className="text-[10px] font-bold text-rose-700 uppercase">Active Backlogs</div>
                          <div className="text-xl font-black text-rose-800 mt-1">0</div>
                        </div>
                      </div>

                      <div className="border rounded-2xl overflow-hidden bg-background">
                        <div className="px-3 py-2 bg-muted/20 border-b text-[10px] font-bold uppercase text-muted-foreground">Semester Breakdown</div>
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b bg-slate-50 text-[10px] uppercase text-muted-foreground">
                              <th className="p-2">Semester</th>
                              <th className="p-2">SGPA</th>
                              <th className="p-2">Credits Registered</th>
                              <th className="p-2">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr><td className="p-2 font-semibold">Semester 1</td><td className="p-2 font-bold text-slate-700">8.45</td><td className="p-2">22 Credits</td><td className="p-2 text-emerald-600 font-bold">Passed</td></tr>
                            <tr><td className="p-2 font-semibold">Semester 2</td><td className="p-2 font-bold text-slate-700">8.70</td><td className="p-2">22 Credits</td><td className="p-2 text-emerald-600 font-bold">Passed</td></tr>
                            <tr><td className="p-2 font-semibold">Semester 3</td><td className="p-2 font-bold text-slate-700">8.32</td><td className="p-2">20 Credits</td><td className="p-2 text-emerald-600 font-bold">Passed</td></tr>
                            <tr><td className="p-2 font-semibold">Semester 4</td><td className="p-2 font-bold text-slate-700">8.85</td><td className="p-2">20 Credits</td><td className="p-2 text-emerald-600 font-bold">Passed</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {sisTab === "certificates" && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-700 mb-2">Student Certificate Verification &amp; Issuance</h4>
                      {[
                        { name: "Admission Offer Letter", status: "Issued", type: "system" },
                        { name: "Study/Bonafide Certificate", status: "Issued", type: "dynamic" },
                        { name: "Transfer Certificate (TC)", status: "Pending Clearance", type: "manual" },
                        { name: "Transcript of Marks (Consolidated)", status: "Issued", type: "system" }
                      ].map((cert, idx) => (
                        <div key={idx} className="p-3 border rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-indigo-500" />
                            <span className="font-bold text-slate-800">{cert.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge tone={cert.status === "Issued" ? "success" : "warn"}>{cert.status}</Badge>
                            <button
                              onClick={() => toast.success(`Generated and downloaded ${cert.name} for ${selectedSisStudent.fullName}!`)}
                              className="px-2 py-1 border hover:bg-accent rounded-lg font-bold text-[10px] text-indigo-600 transition cursor-pointer"
                            >
                              {cert.status === "Issued" ? "Download" : "Approve & Issue"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sisTab === "parent" && (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-2xl bg-indigo-50/20 space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Parent / Guardian Name</span>
                          <div className="font-bold text-slate-800 mt-0.5 text-sm">{selectedSisStudent.parentName || "Ramesh Verma"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Parent Phone Number</span>
                            <div className="font-semibold text-slate-700 mt-0.5">{selectedSisStudent.parentPhone || "9876543211"}</div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Parent Email Address</span>
                            <div className="font-semibold text-slate-700 mt-0.5">{selectedSisStudent.parentEmail || "parent@gmail.com"}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Emergency Contact Address</span>
                          <div className="font-semibold text-slate-700 mt-0.5">Flat 402, Royal Residency, Vizianagaram, AP, 535002</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sisTab === "idcard" && (
                    <div className="flex flex-col items-center gap-4">
                      {/* Visual ID Card Mockup */}
                      <div className="w-[340px] h-[200px] rounded-2xl border bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-4 relative overflow-hidden shadow-lg select-none">
                        <div className="absolute top-0 right-0 size-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                        
                        {/* Logo header */}
                        <div className="flex items-center gap-1.5 border-b border-indigo-800 pb-2">
                          <GraduationCap className="size-5 text-cyan-400" />
                          <span className="text-[9px] font-black tracking-widest uppercase">Campusly University</span>
                          <Badge className="ml-auto text-[8px] bg-cyan-500 hover:bg-cyan-500 text-white border-0 py-0 px-1">STUDENT</Badge>
                        </div>

                        {/* Content */}
                        <div className="flex items-center gap-3.5 mt-3.5">
                          <div className="size-14 rounded-xl border border-indigo-700 bg-indigo-950 flex items-center justify-center font-bold text-lg shadow-sm">
                            {selectedSisStudent.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 text-left min-w-0">
                            <div className="font-extrabold text-sm truncate max-w-[180px]">{selectedSisStudent.fullName}</div>
                            <div className="text-[9px] text-indigo-300 font-mono">Roll: {selectedSisStudent.rollNumber}</div>
                            <div className="text-[9px] text-indigo-300 font-semibold">{sisDeptName}</div>
                            <div className="text-[8px] text-cyan-400 font-medium pt-1">Valid: July 2024 - June 2028</div>
                          </div>
                        </div>

                        {/* Barcode Mock */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between border-t border-indigo-800/50 pt-2 text-[7px] text-indigo-400">
                          <span>EMERGENCY: {selectedSisStudent.parentPhone || "9876543211"}</span>
                          <div className="flex flex-col items-end">
                            <div className="w-16 h-4 bg-white/10 rounded-xs flex items-center justify-evenly py-0.5 px-1 font-mono tracking-widest text-[5px]">
                              ||||| | |||
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toast.success(`Student ID Card triggered for print! (Roll No: ${selectedSisStudent.rollNumber})`)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-soft"
                      >
                        <CreditCard className="size-4" /> Print ID Card
                      </button>
                    </div>
                  )}

                  {sisTab === "alumni" && (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-2xl bg-slate-50 space-y-4 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-800">Alumni Graduation Records</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Toggle student cohort categorization to mark graduation and place placement tracks.</p>
                        </div>

                        <div className="flex items-center justify-between p-3 border bg-background rounded-xl">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-700">Cohort Category</div>
                            <div className="text-[10px] text-muted-foreground">Mark student as graduated alumnus.</div>
                          </div>
                          <button
                            onClick={() => {
                              toast.success(`${selectedSisStudent.fullName} marked as Alumnus!`);
                              setSelectedSisStudent((prev: any) => ({ ...prev, year: 4, semester: 8 }));
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] transition cursor-pointer"
                          >
                            Promote to Alumnus
                          </button>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">Graduation Batch</span>
                              <div className="font-bold text-slate-800 mt-0.5">Class of 2028 (Expected)</div>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">Career Track Placement</span>
                              <div className="font-semibold text-slate-700 mt-0.5">Not Placed Yet</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-muted/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSisStudent(null)}
                  className="px-4 py-2 rounded-xl border text-muted-foreground text-xs font-semibold hover:bg-accent transition cursor-pointer"
                >
                  Close Portal
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
