import { useState } from "react";
import { Search, Plus, Users, UserCheck, ShieldCheck, Mail, Phone, Building, Briefcase, UserPlus, Filter } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudents, updateStudent, fetchFaculty, createFaculty, updateFaculty } from "@/services/adminService";
import { fetchIssuedBooks } from "@/services/libraryService";
import { toast } from "sonner";

const getMemberInitials = (name?: string) => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
};

const getMemberDeptString = (dept: any) => {
  if (!dept) return "Academic Staff";
  if (typeof dept === "string") return dept;
  if (typeof dept === "object") {
    return dept.name || dept.code || "Academic Staff";
  }
  return "Academic Staff";
};

export function LibrarianMembers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All"); // All | Staff | Student

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Form Fields (For Staff Member Registration)
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formDept, setFormDept] = useState("CSE");
  const [formDesignation, setFormDesignation] = useState("Assistant Professor");

  // Central Database Queries
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["allStudents"],
    queryFn: () => fetchStudents({ limit: 1000 }),
  });

  const { data: facultyData, isLoading: isFacultyLoading } = useQuery({
    queryKey: ["allFaculty"],
    queryFn: () => fetchFaculty(),
  });

  const { data: issuedBooks, isLoading: isIssuedLoading } = useQuery({
    queryKey: ["allIssuedBooks"],
    queryFn: () => fetchIssuedBooks(),
  });

  // Mutations
  const createStaffMutation = useMutation({
    mutationFn: (payload: {
      fullName: string;
      email: string;
      employeeId: string;
      department: string;
      designation: string;
      phoneNumber?: string;
      password?: string;
    }) => createFaculty(payload),
    onSuccess: () => {
      toast.success("Staff member registered successfully in central registry & library members!");
      queryClient.invalidateQueries({ queryKey: ["allFaculty"] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register staff member");
    },
  });

  const updateStudentStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateStudent(id, payload),
    onSuccess: (_, variables) => {
      toast.success(
        `Successfully updated student status to ${variables.payload.isActive ? "Active" : "Inactive"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["allStudents"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update member status");
    },
  });

  const updateStaffStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateFaculty(id, payload),
    onSuccess: (_, variables) => {
      toast.success(
        `Successfully updated staff status to ${variables.payload.isActive ? "Active" : "Inactive"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["allFaculty"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update staff status");
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormEmployeeId("");
    setFormDept("CSE");
    setFormDesignation("Assistant Professor");
  };

  const handleAddStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formEmployeeId.trim()) {
      toast.error("Please fill in required staff name, email, and employee ID.");
      return;
    }
    createStaffMutation.mutate({
      fullName: formName.trim(),
      email: formEmail.trim(),
      employeeId: formEmployeeId.trim(),
      department: formDept,
      designation: formDesignation.trim(),
      phoneNumber: formPhone.trim(),
      password: "Staff@12345",
    });
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone);
    setFormEmployeeId(member.memberId);
    setFormDept(member.department || "CSE");
    setFormDesignation(member.designation || "Staff Member");
    setIsEditModalOpen(true);
  };

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    if (selectedMember.memberType === "Staff") {
      updateStaffStatusMutation.mutate({
        id: selectedMember.rawId,
        payload: {
          department: formDept,
          designation: formDesignation,
        },
      });
      setIsEditModalOpen(false);
      setSelectedMember(null);
      resetForm();
    } else {
      toast.info("Student records are synchronized with Central Student Management.");
      setIsEditModalOpen(false);
    }
  };

  const openBlockConfirm = (member: any) => {
    setSelectedMember(member);
    setIsConfirmBlockOpen(true);
  };

  const handleToggleBlock = () => {
    if (!selectedMember) return;
    const newActiveState = selectedMember.status !== "Active";
    if (selectedMember.memberType === "Student") {
      updateStudentStatusMutation.mutate({
        id: selectedMember.rawId,
        payload: { isActive: newActiveState },
      });
    } else {
      updateStaffStatusMutation.mutate({
        id: selectedMember.rawId,
        payload: { isActive: newActiveState },
      });
    }
    setIsConfirmBlockOpen(false);
  };

  // 1. Map Auto-Fetched Central Students
  const studentMembers = (studentsData?.students || []).map((student: any) => {
    const studentIssues = (issuedBooks || []).filter((issue: any) => {
      const studentId = typeof issue.student === "object" ? issue.student?._id : issue.student;
      return studentId === student._id;
    });

    const booksIssued = studentIssues.filter((i: any) => i.status === "issued" || i.status === "overdue").length;
    const fineAmount = studentIssues.reduce((sum: number, i: any) => sum + (i.fineAmount || 0), 0);

    return {
      id: student.rollNumber || student.admissionNumber || student._id || `std-${Math.random()}`,
      memberId: student.rollNumber || student.admissionNumber || student._id || "STD",
      rawId: student._id || student.id,
      name: student.fullName || student.name || "Student",
      email: student.email || "N/A",
      phone: student.phoneNumber || "N/A",
      department: getMemberDeptString(student.department),
      designation: "Student",
      memberType: "Student",
      joinDate: student.createdAt || new Date().toISOString(),
      status: student.isActive ? "Active" : "Inactive",
      booksIssued,
      fineAmount,
    };
  });

  // 2. Map Staff Members (Faculty & Librarians)
  const staffMembers = (facultyData || []).map((staff: any) => {
    const staffDept = getMemberDeptString(staff.department);

    const staffIssues = (issuedBooks || []).filter((issue: any) => {
      const studentId = typeof issue.student === "object" ? issue.student?._id : issue.student;
      return studentId === staff._id;
    });

    const booksIssued = staffIssues.filter((i: any) => i.status === "issued" || i.status === "overdue").length;
    const fineAmount = staffIssues.reduce((sum: number, i: any) => sum + (i.fineAmount || 0), 0);

    return {
      id: staff.employeeId || staff._id || `emp-${Math.random()}`,
      memberId: staff.employeeId || staff._id || "EMP",
      rawId: staff._id || staff.id,
      name: staff.fullName || staff.name || "Staff Member",
      email: staff.email || "N/A",
      phone: staff.phoneNumber || "N/A",
      department: staffDept,
      designation: staff.designation || "Staff Member",
      memberType: "Staff",
      joinDate: staff.createdAt || new Date().toISOString(),
      status: staff.isActive ? "Active" : "Inactive",
      booksIssued,
      fineAmount,
    };
  });

  // Combine both Central Students and Staff Records
  const allMembers = [...staffMembers, ...studentMembers];

  // Filtering Logic
  const filteredMembers = allMembers.filter((m) => {
    const matchesStatus = filterStatus === "All" || m.status === filterStatus;
    const matchesType = filterType === "All" || m.memberType === filterType;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      m.name.toLowerCase().includes(searchLower) ||
      m.memberId.toLowerCase().includes(searchLower) ||
      m.email.toLowerCase().includes(searchLower) ||
      m.department.toLowerCase().includes(searchLower);

    return matchesStatus && matchesType && matchesSearch;
  });

  // Category specific lists for counts
  const totalCount = allMembers.length;
  const studentCount = studentMembers.length;
  const staffCount = staffMembers.length;

  // Selected Category Display Data
  const displayedCategoryMembers =
    filterType === "Staff"
      ? staffMembers
      : filterType === "Student"
      ? studentMembers
      : allMembers;

  const activeCount = displayedCategoryMembers.filter((m) => m.status === "Active").length;
  const totalIssued = displayedCategoryMembers.reduce((sum, m) => sum + m.booksIssued, 0);
  const outstandingFines = displayedCategoryMembers.reduce((sum, m) => sum + m.fineAmount, 0);

  if (isStudentsLoading || isFacultyLoading || isIssuedLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader title="Member Management 👥" desc="Central student auto-sync & staff member management." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Member Management 👥"
        desc="Auto-synchronized central student directory & staff library member registry."
        actions={
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <UserPlus className="size-4" /> Add Staff Member
          </button>
        }
      />

      {/* Search and Category Filter Card */}
      <Card>
        <div className="space-y-4">
          {/* Main Controls Header: Search & Category Dropdown */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder={
                  filterType === "Staff"
                    ? "Search staff members by name, employee ID, email, department..."
                    : filterType === "Student"
                    ? "Search students by name, roll number, email, department..."
                    : "Search by student/staff name, Roll No, Employee ID, Email or Department..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>

            {/* Member Category Dropdown Select Box */}
            <div className="flex items-center gap-2 bg-gradient-soft p-1 rounded-xl border shrink-0">
              <Filter className="size-4 text-primary ml-2.5 shrink-0" />
              <label htmlFor="memberTypeSelect" className="text-xs font-bold text-foreground whitespace-nowrap hidden sm:inline">
                Member Category:
              </label>
              <select
                id="memberTypeSelect"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-background text-foreground font-semibold text-xs py-2 px-3 rounded-lg border outline-none cursor-pointer focus:border-primary transition shadow-xs"
              >
                <option value="All">All Members ({totalCount})</option>
                <option value="Staff">Staff Members Only ({staffCount})</option>
                <option value="Student">Student Members Only ({studentCount})</option>
              </select>
            </div>
          </div>

          {/* Secondary Controls: Status Pills & Category Quick Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">Status:</span>
              {["All", "Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    filterStatus === status
                      ? "bg-gradient-primary text-white shadow-xs"
                      : "bg-background border text-muted-foreground hover:border-primary"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Category Tab Buttons (In sync with Dropdown) */}
            <div className="flex gap-2">
              {[
                { id: "All", label: `All Members (${totalCount})` },
                { id: "Staff", label: `Staff (${staffCount})` },
                { id: "Student", label: `Students (${studentCount})` },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    filterType === type.id
                      ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-border font-bold shadow-xs"
                      : "bg-background border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Info Banner when Student Category is Selected */}
      {filterType === "Student" && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-2">
          <span>
            ℹ️ <strong>Student Category Active:</strong> All student records are automatically retrieved live from Central Student Management. No manual student registration required.
          </span>
          <Badge tone="info">Auto-Synced</Badge>
        </div>
      )}

      {/* Info Banner when Staff Category is Selected */}
      {filterType === "Staff" && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs flex items-center justify-between gap-2">
          <span>
            💼 <strong>Staff Category Active:</strong> Showing staff and faculty library members. Click <strong>+ Add Staff Member</strong> to register a new staff member.
          </span>
          <Badge tone="info">Staff Directory</Badge>
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-16 text-muted-foreground/40 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-semibold">No {filterType === "All" ? "Library" : filterType} Members Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            No active {filterType.toLowerCase()} member records match your search criteria.
          </p>
        </Card>
      )}

      {/* Members Cards Grid */}
      {filteredMembers.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card
              key={member.id + member.memberType}
              className="hover:-translate-y-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`size-12 rounded-xl text-white grid place-items-center font-semibold text-base shadow-sm ${
                      member.memberType === "Staff"
                        ? "bg-gradient-to-br from-purple-600 to-indigo-700"
                        : "bg-gradient-to-br from-blue-600 to-cyan-600"
                    }`}
                  >
                    {getMemberInitials(member.name)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={member.memberType === "Staff" ? "info" : "neutral"}>
                      {member.memberType === "Staff" ? "Staff" : "Student"}
                    </Badge>
                    <Badge tone={member.status === "Active" ? "success" : "warn"}>
                      {member.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 min-w-0 mb-3 space-y-1">
                  <div className="font-bold text-sm truncate text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building className="size-3 shrink-0" />
                    <span className="truncate">{member.department} {member.designation !== "Student" ? `• ${member.designation}` : ""}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3 shrink-0" />
                    <span className="font-mono text-[11px]">{member.memberId}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && member.phone !== "N/A" && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Book Loans & Fines Stats */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gradient-soft rounded-xl mb-3">
                  <div className="text-center">
                    <div className="text-[11px] text-muted-foreground">Books Issued</div>
                    <div className="text-base font-bold text-foreground">{member.booksIssued}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] text-muted-foreground">Fine Due</div>
                    <div
                      className={`text-base font-bold ${
                        member.fineAmount > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      ₹{member.fineAmount}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gradient-soft transition cursor-pointer"
                  >
                    Profile
                  </button>
                  {member.memberType === "Staff" && (
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex-1 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gradient-soft transition cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    disabled={updateStudentStatusMutation.isPending || updateStaffStatusMutation.isPending}
                    onClick={() => openBlockConfirm(member)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      member.status === "Active"
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
                  >
                    {member.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary KPI Cards (Dynamically calculated based on selected dropdown category) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              Total {filterType === "All" ? "Members" : filterType === "Staff" ? "Staff Members" : "Student Members"}
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">{displayedCategoryMembers.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {filterType === "All" ? `${studentCount} Students • ${staffCount} Staff` : `${filterType} Category Active`}
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Active {filterType === "All" ? "Members" : filterType}</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Clear library status
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Books Active Issued</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{totalIssued}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Currently on loan
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Outstanding Fines</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">₹{outstandingFines}</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Total overdue fines
            </div>
          </div>
        </Card>
      </div>

      {/* Add Staff Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <UserPlus className="size-5 text-primary" /> Register Staff Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Note: Student members are automatically synchronized from Central Student Registration. Use this form to register staff/faculty library members.
            </p>

            <form onSubmit={handleAddStaffMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Staff Full Name *</label>
                <input
                  required
                  placeholder="e.g. Dr. John Smith"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Employee ID *</label>
                  <input
                    required
                    placeholder="EMP-1001"
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Designation</label>
                <input
                  placeholder="Assistant Professor / HOD / Staff"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@college.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={createStaffMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                >
                  {createStaffMutation.isPending ? "Registering..." : "Register Staff Member"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-sm font-semibold text-muted-foreground hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Staff Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-foreground">Edit Staff Member Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Name</label>
                <input
                  disabled
                  value={formName}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-muted/50 text-sm outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <input
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Designation</label>
                  <input
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={updateStaffStatusMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold glow-primary cursor-pointer hover:opacity-90 transition disabled:opacity-50"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-sm font-semibold text-muted-foreground hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Member Profile Modal */}
      {isProfileModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <UserCheck className="size-5 text-primary" /> Member Details
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-soft border">
                <div
                  className={`size-12 rounded-xl text-white grid place-items-center font-bold text-base shadow-sm ${
                    selectedMember.memberType === "Staff"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-700"
                      : "bg-gradient-to-br from-blue-600 to-cyan-600"
                  }`}
                >
                  {getMemberInitials(selectedMember.name)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">{selectedMember.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedMember.memberId}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Member Type</span>
                  <Badge tone={selectedMember.memberType === "Staff" ? "info" : "neutral"}>
                    {selectedMember.memberType}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium text-foreground">{selectedMember.department}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Designation / Role</span>
                  <span className="font-medium text-foreground">{selectedMember.designation}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium text-foreground">{selectedMember.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <Badge tone={selectedMember.status === "Active" ? "success" : "warn"}>
                    {selectedMember.status}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Active Book Loans</span>
                  <span className="font-bold text-foreground">{selectedMember.booksIssued}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Fine Due</span>
                  <span
                    className={`font-bold ${
                      selectedMember.fineAmount > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    ₹{selectedMember.fineAmount}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-soft border text-xs font-bold text-foreground hover:bg-muted/50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Suspend / Activate Confirm Modal */}
      {isConfirmBlockOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-foreground">
              Confirm {selectedMember.status === "Active" ? "Suspension" : "Activation"}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              Are you sure you want to {selectedMember.status === "Active" ? "suspend" : "activate"} library membership privileges for <strong>{selectedMember.name}</strong>?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleToggleBlock}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-xs transition cursor-pointer ${
                  selectedMember.status === "Active"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm {selectedMember.status === "Active" ? "Suspend" : "Activate"}
              </button>
              <button
                onClick={() => setIsConfirmBlockOpen(false)}
                className="px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold text-xs hover:bg-gradient-soft transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
