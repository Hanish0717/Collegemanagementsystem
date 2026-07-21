import { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Building,
  BookOpen,
  AlertCircle,
  Edit,
  Eye,
  CheckCircle2,
  X,
  ShieldAlert,
  Loader2,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchStudents,
  updateStudent,
  fetchFaculty,
  updateFaculty,
  createFaculty,
} from '@/services/adminService';
import { fetchIssuedBooks } from '@/services/libraryService';
import { toast } from 'sonner';

export interface UnifiedMember {
  id: string;
  rawId: string;
  memberType: 'Student' | 'Staff';
  name: string;
  identifier: string; // Roll Number for Students, Employee ID for Staff
  email: string;
  phone: string;
  department: string;
  roleOrDesignation: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  booksIssued: number;
  fineAmount: number;
  borrowingLimit: number;
  issuedBooksList: Array<{
    bookTitle: string;
    issueDate: string;
    dueDate: string;
    fine: number;
    status: string;
  }>;
}

export function LibrarianMembers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Student' | 'Staff'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterDept, setFilterDept] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UnifiedMember | null>(null);

  // Form Fields (Add Staff / Member)
  const [addMemberType, setAddMemberType] = useState<'Staff' | 'Student'>('Staff');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIdentifier, setFormIdentifier] = useState('');
  const [formDept, setFormDept] = useState('Computer Science');
  const [formDesignation, setFormDesignation] = useState('Assistant Professor');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Queries
  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['allStudentsLibrary'],
    queryFn: () => fetchStudents({ limit: 1000 }),
  });

  const {
    data: facultyData,
    isLoading: isFacultyLoading,
    refetch: refetchFaculty,
  } = useQuery({
    queryKey: ['allFacultyLibrary'],
    queryFn: () => fetchFaculty(),
  });

  const {
    data: issuedBooks,
    isLoading: isIssuedLoading,
    refetch: refetchIssues,
  } = useQuery({
    queryKey: ['allIssuedBooksLibrary'],
    queryFn: () => fetchIssuedBooks(),
  });

  // Status toggle mutations
  const updateStudentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateStudent(id, payload),
    onSuccess: (_, variables) => {
      toast.success(
        `Successfully updated student status to ${variables.payload.isActive ? 'Active' : 'Inactive'}!`,
      );
      refetchStudents();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update student status');
    },
  });

  const updateFacultyMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateFaculty(id, payload),
    onSuccess: (_, variables) => {
      toast.success(
        `Successfully updated staff status to ${variables.payload.isActive ? 'Active' : 'Inactive'}!`,
      );
      refetchFaculty();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update staff status');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormIdentifier('');
    setFormDept('Computer Science');
    setFormDesignation('Assistant Professor');
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formIdentifier) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmittingForm(true);
    try {
      if (addMemberType === 'Staff') {
        await createFaculty({
          fullName: formName,
          email: formEmail,
          employeeId: formIdentifier,
          department: formDept,
          designation: formDesignation,
          phoneNumber: formPhone,
        });
        toast.success(`Staff member ${formName} registered successfully in database!`);
        refetchFaculty();
      } else {
        toast.info('New students are registered via the Student Management module.');
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add staff member');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsSubmittingForm(true);
    try {
      if (selectedMember.memberType === 'Student') {
        await updateStudent(selectedMember.rawId, {
          fullName: formName,
          phoneNumber: formPhone,
        });
        toast.success('Student contact details updated successfully!');
        refetchStudents();
      } else {
        await updateFaculty(selectedMember.rawId, {
          designation: formDesignation,
        });
        toast.success('Staff role and details updated successfully!');
        refetchFaculty();
      }
      setIsEditModalOpen(false);
      setSelectedMember(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update member');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const openEditModal = (member: UnifiedMember) => {
    setSelectedMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone !== 'N/A' ? member.phone : '');
    setFormIdentifier(member.identifier);
    setFormDept(member.department);
    setFormDesignation(member.roleOrDesignation);
    setIsEditModalOpen(true);
  };

  const openBlockConfirm = (member: UnifiedMember) => {
    setSelectedMember(member);
    setIsConfirmBlockOpen(true);
  };

  const handleToggleBlock = () => {
    if (!selectedMember) return;
    const newActiveState = selectedMember.status !== 'Active';

    if (selectedMember.memberType === 'Student') {
      updateStudentMutation.mutate({
        id: selectedMember.rawId,
        payload: { isActive: newActiveState },
      });
    } else {
      updateFacultyMutation.mutate({
        id: selectedMember.rawId,
        payload: { isActive: newActiveState, status: newActiveState ? 'Active' : 'Inactive' },
      });
    }
    setIsConfirmBlockOpen(false);
  };

  // Compile Unified Members list from Students + Faculty Data
  const studentMembers: UnifiedMember[] = (studentsData?.students || []).map((student) => {
    const deptName =
      typeof student.department === 'object' && student.department !== null
        ? student.department.name || student.department.code
        : String(student.department || 'General');

    const studentIssues = (issuedBooks || []).filter((issue) => {
      const studentId = typeof issue.student === 'object' ? issue.student?._id : issue.student;
      return studentId === student._id;
    });

    const activeIssues = studentIssues.filter(
      (i) => i.status === 'issued' || i.status === 'overdue',
    );
    const fineAmount = studentIssues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

    const issuedBooksList = activeIssues.map((issue) => {
      const bTitle = typeof issue.book === 'object' ? issue.book?.title : 'Library Book';
      return {
        bookTitle: bTitle,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        fine: issue.fineAmount || 0,
        status: issue.status,
      };
    });

    return {
      id: `STU-${student.rollNumber || student._id}`,
      rawId: student._id,
      memberType: 'Student',
      name: student.fullName,
      identifier: student.rollNumber || student.admissionNumber || 'N/A',
      email: student.email,
      phone: student.phoneNumber || student.parentPhone || 'N/A',
      department: deptName,
      roleOrDesignation: `Student (Yr ${student.year || 1}, Sem ${student.semester || 1}, Sec ${student.section || 'A'})`,
      status: student.isActive ? 'Active' : 'Inactive',
      joinDate: student.createdAt || new Date().toISOString(),
      booksIssued: activeIssues.length,
      fineAmount,
      borrowingLimit: 5,
      issuedBooksList,
    };
  });

  const facultyMembers: UnifiedMember[] = (facultyData || []).map((faculty) => {
    const deptName =
      typeof faculty.department === 'object' && faculty.department !== null
        ? faculty.department.name || faculty.department.code
        : String(faculty.department || 'Faculty');

    // Find books issued to this staff/faculty if any
    const staffIssues = (issuedBooks || []).filter((issue) => {
      const studentId = typeof issue.student === 'object' ? issue.student?._id : issue.student;
      return studentId === faculty._id;
    });

    const activeIssues = staffIssues.filter(
      (i) => i.status === 'issued' || i.status === 'overdue',
    );
    const fineAmount = staffIssues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

    const issuedBooksList = activeIssues.map((issue) => {
      const bTitle = typeof issue.book === 'object' ? issue.book?.title : 'Library Book';
      return {
        bookTitle: bTitle,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        fine: issue.fineAmount || 0,
        status: issue.status,
      };
    });

    return {
      id: `FAC-${faculty.employeeId || faculty._id}`,
      rawId: faculty._id,
      memberType: 'Staff',
      name: faculty.fullName,
      identifier: faculty.employeeId || 'EMP-N/A',
      email: faculty.email,
      phone: faculty.phoneNumber || 'N/A',
      department: deptName,
      roleOrDesignation: faculty.designation || 'Faculty Member',
      status: faculty.isActive ? 'Active' : 'Inactive',
      joinDate: (faculty as any).createdAt || new Date().toISOString(),
      booksIssued: activeIssues.length,
      fineAmount,
      borrowingLimit: 10,
      issuedBooksList,
    };
  });

  const allMembers = [...studentMembers, ...facultyMembers];

  // Unique departments list for filter
  const departmentsList = [
    'All',
    ...Array.from(new Set(allMembers.map((m) => m.department).filter(Boolean))),
  ];

  const filteredMembers = allMembers.filter((m) => {
    const matchesType = filterType === 'All' || m.memberType === filterType;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchesDept = filterDept === 'All' || m.department === filterDept;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.roleOrDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesDept && matchesSearch;
  });

  // Summary Metrics
  const totalCount = allMembers.length;
  const totalStudents = studentMembers.length;
  const totalStaff = facultyMembers.length;
  const activeCount = allMembers.filter((m) => m.status === 'Active').length;
  const totalIssued = allMembers.reduce((sum, m) => sum + m.booksIssued, 0);
  const outstandingFines = allMembers.reduce((sum, m) => sum + m.fineAmount, 0);

  const isLoading = isStudentsLoading || isFacultyLoading || isIssuedLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader
          title="Library Member Directory 👥"
          desc="Unified access management for Students and Staff members."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Library Member Directory 👥"
        desc="Unified membership portal for all enrolled Students and Staff members in the institution."
        actions={
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <Plus className="size-4" /> Add Staff Member
          </button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Library Members</div>
              <div className="text-3xl font-bold text-gradient mt-1">{totalCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {totalStudents} Students | {totalStaff} Staff
              </div>
            </div>
            <div className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Users className="size-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-emerald-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Active Privileges</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</div>
              <div className="text-[11px] font-medium text-emerald-600/80 mt-1">
                {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% Active Rate
              </div>
            </div>
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
              <UserCheck className="size-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-violet-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Active Issued Books</div>
              <div className="text-3xl font-bold text-violet-600 mt-1">{totalIssued}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Across all members</div>
            </div>
            <div className="size-11 rounded-xl bg-violet-500/10 text-violet-600 grid place-items-center">
              <BookOpen className="size-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-rose-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Outstanding Fines</div>
              <div className="text-3xl font-bold text-rose-600 mt-1">₹{outstandingFines}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Pending dues to settle</div>
            </div>
            <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 grid place-items-center">
              <IndianRupee className="size-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search by name, roll/employee ID, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/80 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>
            {/* Dept Filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2.5 rounded-xl border bg-background text-sm font-medium focus:border-primary outline-none"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t">
            {/* Member Type Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Type:</span>
              {(['All', 'Student', 'Staff'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    filterType === type
                      ? 'bg-gradient-primary text-white shadow-xs'
                      : 'bg-background border text-muted-foreground hover:border-primary'
                  }`}
                >
                  {type === 'Student' && <GraduationCap className="size-3.5" />}
                  {type === 'Staff' && <Briefcase className="size-3.5" />}
                  {type === 'All' ? 'All Members' : type}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
              {(['All', 'Active', 'Inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    filterStatus === status
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-background border text-muted-foreground hover:border-primary'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-14 text-center">
          <Users className="size-16 text-muted-foreground/40 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-semibold">No Members Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            No library members match your current search and filter selections.
          </p>
        </Card>
      )}

      {/* Members Grid */}
      {filteredMembers.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="hover:-translate-y-1 transition flex flex-col justify-between relative group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-12 rounded-xl grid place-items-center font-bold text-white shadow-xs ${
                        member.memberType === 'Staff'
                          ? 'bg-gradient-to-br from-amber-500 to-rose-600'
                          : 'bg-gradient-to-br from-violet-600 to-blue-600'
                      }`}
                    >
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground truncate max-w-[160px]">
                        {member.name}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {member.identifier}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={member.memberType === 'Staff' ? 'violet' : 'info'}>
                      {member.memberType}
                    </Badge>
                    <Badge tone={member.status === 'Active' ? 'success' : 'warn'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>

                {/* Role / Dept info */}
                <div className="space-y-1.5 text-xs text-muted-foreground mb-4 bg-muted/40 p-2.5 rounded-lg border border-border/50">
                  <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                    {member.memberType === 'Staff' ? (
                      <Briefcase className="size-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <GraduationCap className="size-3.5 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate">{member.roleOrDesignation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{member.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone !== 'N/A' && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gradient-soft rounded-lg mb-4 text-center">
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium">Books Issued</div>
                    <div className="text-base font-bold text-foreground">
                      {member.booksIssued} <span className="text-xs text-muted-foreground font-normal">/ {member.borrowingLimit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium">Fine Due</div>
                    <div
                      className={`text-base font-bold ${
                        member.fineAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      ₹{member.fineAmount}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gradient-soft transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Eye className="size-3.5" /> Details
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gradient-soft transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit className="size-3.5" /> Edit
                  </button>
                  <button
                    disabled={updateStudentMutation.isPending || updateFacultyMutation.isPending}
                    onClick={() => openBlockConfirm(member)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      member.status === 'Active'
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {member.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Full Directory Table View */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gradient text-base">Complete Directory Log</h3>
          <span className="text-xs text-muted-foreground">Showing {filteredMembers.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Member Name</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">ID / Roll No</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Role / Designation</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Department</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Books</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Fine</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3">
                    <Badge tone={m.memberType === 'Staff' ? 'violet' : 'info'}>
                      {m.memberType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.identifier}</td>
                  <td className="px-4 py-3 text-xs">{m.roleOrDesignation}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.department}</td>
                  <td className="px-4 py-3 text-center font-semibold">{m.booksIssued}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className={m.fineAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                      ₹{m.fineAmount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={m.status === 'Active' ? 'success' : 'warn'}>
                      {m.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMember(m);
                        setIsProfileModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer hover:bg-background transition flex items-center gap-1"
                    >
                      <Eye className="size-3" /> View
                    </button>
                    <button
                      onClick={() => openEditModal(m)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer hover:bg-background transition flex items-center gap-1"
                    >
                      <Edit className="size-3" /> Edit
                    </button>
                    <button
                      onClick={() => openBlockConfirm(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
                        m.status === 'Active'
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {m.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff / Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-gradient">Add Library Member / Staff</h3>
            </div>
            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Member Category</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setAddMemberType('Staff')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      addMemberType === 'Staff'
                        ? 'bg-gradient-primary text-white border-primary'
                        : 'bg-background text-muted-foreground hover:border-primary'
                    }`}
                  >
                    <Briefcase className="size-4" /> Staff / Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMemberType('Student')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      addMemberType === 'Student'
                        ? 'bg-gradient-primary text-white border-primary'
                        : 'bg-background text-muted-foreground hover:border-primary'
                    }`}
                  >
                    <GraduationCap className="size-4" /> Student
                  </button>
                </div>
              </div>

              {addMemberType === 'Student' ? (
                <div className="p-4 bg-muted/50 rounded-xl border text-xs text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" /> Automatic Student Synchronization
                  </p>
                  <p>
                    All enrolled students are automatically loaded directly from the institution's Student Directory.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh Kumar"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. EMP102"
                        value={formIdentifier}
                        onChange={(e) => setFormIdentifier(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Department</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Computer Science"
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Assistant Professor / Library Assistant"
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="ramesh@college.edu"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
                {addMemberType === 'Staff' && (
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    {isSubmittingForm && <Loader2 className="size-4 animate-spin" />}
                    Save Staff Member
                  </button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-gradient">Edit Member Details</h3>
            </div>
            <form onSubmit={handleEditMemberSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  {selectedMember.memberType === 'Student' ? 'Roll Number' : 'Employee ID'}
                </label>
                <input
                  type="text"
                  disabled
                  value={formIdentifier}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-muted text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Role / Designation</label>
                <input
                  type="text"
                  disabled={selectedMember.memberType === 'Student'}
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border text-sm outline-none ${
                    selectedMember.memberType === 'Student'
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-background focus:border-primary'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {isSubmittingForm && <Loader2 className="size-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Member Profile Specifications Modal */}
      {isProfileModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-lg text-gradient">Member Profile Specifications</h3>
            </div>

            <div className="space-y-4">
              {/* Header profile card */}
              <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border/50">
                <div
                  className={`size-16 rounded-2xl grid place-items-center font-bold text-2xl text-white shadow-xs ${
                    selectedMember.memberType === 'Staff'
                      ? 'bg-gradient-to-br from-amber-500 to-rose-600'
                      : 'bg-gradient-to-br from-violet-600 to-blue-600'
                  }`}
                >
                  {selectedMember.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg text-foreground truncate">{selectedMember.name}</h4>
                    <Badge tone={selectedMember.memberType === 'Staff' ? 'violet' : 'info'}>
                      {selectedMember.memberType}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{selectedMember.identifier}</p>
                  <p className="text-xs text-foreground font-medium mt-1">{selectedMember.roleOrDesignation}</p>
                </div>
              </div>

              {/* Specifications Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-background rounded-xl border space-y-1">
                  <span className="text-muted-foreground font-medium">Department</span>
                  <p className="font-semibold text-foreground truncate">{selectedMember.department}</p>
                </div>
                <div className="p-3 bg-background rounded-xl border space-y-1">
                  <span className="text-muted-foreground font-medium">Account Status</span>
                  <div>
                    <Badge tone={selectedMember.status === 'Active' ? 'success' : 'warn'}>
                      {selectedMember.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-background rounded-xl border space-y-1">
                  <span className="text-muted-foreground font-medium">Email Address</span>
                  <p className="font-semibold text-foreground truncate">{selectedMember.email}</p>
                </div>
                <div className="p-3 bg-background rounded-xl border space-y-1">
                  <span className="text-muted-foreground font-medium">Phone Contact</span>
                  <p className="font-semibold text-foreground">{selectedMember.phone}</p>
                </div>
              </div>

              {/* Borrowing Limit & Stats */}
              <div className="p-3.5 bg-gradient-soft rounded-xl border border-border/50 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground">Borrowing Limit</span>
                  <p className="text-base font-bold text-foreground">{selectedMember.borrowingLimit} Books</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Currently Issued</span>
                  <p className="text-base font-bold text-violet-600">{selectedMember.booksIssued}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Fine Due</span>
                  <p
                    className={`text-base font-bold ${
                      selectedMember.fineAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    ₹{selectedMember.fineAmount}
                  </p>
                </div>
              </div>

              {/* Issued Books Breakdown */}
              <div className="border-t pt-3">
                <h5 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-primary" /> Active Issued Books ({selectedMember.issuedBooksList.length})
                </h5>
                {selectedMember.issuedBooksList.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg text-center">
                    No books currently issued to this member.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedMember.issuedBooksList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-background rounded-lg border text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{item.bookTitle}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Due Date: {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge tone={item.status === 'overdue' ? 'danger' : 'info'}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-sm"
              >
                Close Specifications
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Suspend/Block Modal */}
      {isConfirmBlockOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <ShieldAlert className="size-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">
                {selectedMember.status === 'Active' ? 'Suspend Privileges' : 'Re-activate Member'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Are you sure you want to{' '}
              <strong className="text-foreground">{selectedMember.status === 'Active' ? 'suspend' : 're-activate'}</strong> library
              privileges for <strong className="text-foreground">{selectedMember.name}</strong> ({selectedMember.identifier})?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmBlockOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                disabled={updateStudentMutation.isPending || updateFacultyMutation.isPending}
                onClick={handleToggleBlock}
                className={`flex-1 px-4 py-2.5 text-white font-semibold transition cursor-pointer rounded-xl text-xs ${
                  selectedMember.status === 'Active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {updateStudentMutation.isPending || updateFacultyMutation.isPending
                  ? 'Updating...'
                  : 'Confirm Action'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
