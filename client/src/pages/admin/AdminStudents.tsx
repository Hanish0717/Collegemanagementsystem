import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Plus, Search, UserPlus, Trash2, Edit, Loader2, X } from "lucide-react";
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
                        <div className="flex gap-2">
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
    </div>
  );
}
