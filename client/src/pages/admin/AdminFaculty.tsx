import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus, Search, UserCheck, Loader2, Trash2 } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import {
  fetchFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  fetchDepartments,
} from '@/services/adminService';
import { toast } from 'sonner';
import api from '@/lib/api';
import { PERMISSION_PROFILES } from '@/lib/permissionProfiles';

export function AdminFaculty() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [facultyType, setFacultyType] = useState<'Faculty' | 'HOD' | 'Dean' | 'Principal' | 'Vice Principal'>('Faculty');
  const [deanResponsibilities, setDeanResponsibilities] = useState<string[]>([]);
  const [assignedPrograms, setAssignedPrograms] = useState<string[]>(['B.Tech CSE']);
  const [assignedSemesters, setAssignedSemesters] = useState<string[]>(['Sem 1', 'Sem 2']);
  const [employeeStatus, setEmployeeStatus] = useState<'Active' | 'On Leave' | 'Suspended' | 'Resigned' | 'Retired' | 'Relieved'>('Active');
  const [isActing, setIsActing] = useState(false);
  const [secondaryDepartments, setSecondaryDepartments] = useState<string[]>([]);
  const [advisorSections, setAdvisorSections] = useState<string[]>([]);
  const [delegatedToName, setDelegatedToName] = useState('');
  const [delegationStartDate, setDelegationStartDate] = useState('');
  const [delegationEndDate, setDelegationEndDate] = useState('');
  const [reportsToUserId, setReportsToUserId] = useState('');
  const [permissionProfile, setPermissionProfile] = useState('Faculty Template');
  const [viewingLifecycleStaff, setViewingLifecycleStaff] = useState<any | null>(null);
  const [experience, setExperience] = useState('');
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // OTP Verification States
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Queries
  const { data: facultyList = [], isLoading: isFacultyLoading } = useQuery({
    queryKey: ['faculty'],
    queryFn: fetchFaculty,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  // Mutations
  const createFacultyMutation = useMutation({
    mutationFn: createFaculty,
    onSuccess: (data, variables) => {
      setUnverifiedEmail(variables.email);
      toast.success(
        'Faculty member registered successfully. Please enter the OTP sent to their email to complete registration.',
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to register faculty member');
    },
  });

  const updateFacultyMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        department?: string;
        designation?: string;
        experience?: number;
        status?: string;
        isActive?: boolean;
      };
    }) => updateFaculty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Faculty record updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update faculty record');
    },
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      toast.success('Faculty record soft-deleted');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete faculty record');
    },
  });

  const [designationTabFilter, setDesignationTabFilter] = useState('All');
  const [employeeCategory, setEmployeeCategory] = useState<'Teaching' | 'Non-Teaching'>('Teaching');

  // Filters & Search
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((fac) => {
      const matchesSearch = [fac.fullName, fac.employeeId, fac.email, fac.designation].some((val) =>
        (val || '').toLowerCase().includes(search.toLowerCase()),
      );

      const matchesDept = deptFilter === 'All' || fac.department?._id === deptFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && fac.status?.toLowerCase() === 'active') ||
        (statusFilter === 'On Leave' && fac.status?.toLowerCase() === 'on-leave');

      const matchesDesignationTab =
        designationTabFilter === 'All' ||
        (designationTabFilter === 'Principal' && fac.designation === 'Principal') ||
        (designationTabFilter === 'Vice Principal' && fac.designation === 'Vice Principal') ||
        (designationTabFilter === 'Dean' && fac.designation === 'Dean') ||
        (designationTabFilter === 'HOD' && fac.designation === 'HOD') ||
        (designationTabFilter === 'Faculty' && ['Professor', 'Associate Professor', 'Assistant Professor', 'Guest Faculty', 'Faculty'].includes(fac.designation)) ||
        (designationTabFilter === 'Non-Teaching' && ['Lab Assistant', 'Librarian', 'Hostel Warden', 'Transport Manager', 'Office Staff', 'Accounts', 'Exam Cell'].includes(fac.designation)) ||
        (designationTabFilter === 'Admins' && ['Admin', 'Department Admin', 'System Administrator'].includes(fac.designation)) ||
        (designationTabFilter === 'Super Admins' && ['Super Admin'].includes(fac.designation));

      return matchesSearch && matchesDept && matchesStatus && matchesDesignationTab;
    });
  }, [facultyList, search, deptFilter, statusFilter, designationTabFilter]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !email.trim() ||
      !selectedDept ||
      !password.trim()
    ) {
      toast.error('Please fill in all required fields (including Password)');
      return;
    }

    if (designation === 'Dean' && deanResponsibilities.length === 0) {
      toast.error('Validation Error: Please select at least one Dean Responsibility for Dean designation');
      return;
    }

    createFacultyMutation.mutate({
      fullName,
      email,
      employeeId: employeeId.trim() || undefined,
      department: selectedDept,
      designation,
      employeeCategory,
      facultyType: designation === 'Dean' ? 'Dean' : designation === 'HOD' ? 'HOD' : 'Faculty',
      deanResponsibilities: designation === 'Dean' ? deanResponsibilities : [],
      assignedPrograms: designation === 'HOD' ? assignedPrograms : [],
      assignedSemesters: designation === 'HOD' ? assignedSemesters : [],
      employeeStatus,
      isActing,
      secondaryDepartments,
      advisorSections,
      delegatedTo: delegatedToName ? {
        name: delegatedToName,
        startDate: delegationStartDate || null,
        endDate: delegationEndDate || null
      } : null,
      reportsTo: reportsToUserId ? {
        userId: reportsToUserId,
        name: facultyList.find((f: any) => f._id === reportsToUserId || f.id === reportsToUserId)?.fullName || 'Manager',
        designation: facultyList.find((f: any) => f._id === reportsToUserId || f.id === reportsToUserId)?.designation || 'Supervisor',
      } : null,
      permissionProfile,
      experience: experience ? Number(experience) : 0,
      gender,
      phoneNumber: phoneNumber || undefined,
      password,
    });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6 || !unverifiedEmail) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      await api.post('/api/auth/verify-otp', {
        email: unverifiedEmail,
        otp: otpCode,
        type: 'email_verification',
      });
      toast.success('Faculty account successfully verified and registered!');
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      setUnverifiedEmail(null);
      setOtpCode('');
      // Reset form
      setFullName('');
      setEmail('');
      setEmployeeId('');
      setExperience('');
      setPhoneNumber('');
      setPassword('');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Verification failed. Please check the OTP.';
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Unique status list
  const statuses = ['All', 'Active', 'On Leave'];

  // Department distribution calculation for dynamic dashboard stats
  const deptStats = useMemo(() => {
    const counts: Record<string, number> = {};
    facultyList.forEach((f) => {
      if (f.department?.name) {
        counts[f.department.name] = (counts[f.department.name] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
    }));
  }, [facultyList]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Staff Management"
        desc="Manage all institutional personnel, executive leadership, HODs, Deans, faculty, and support staff."
      />

      <div className="flex flex-wrap gap-1.5 p-1.5 bg-accent/20 border rounded-xl overflow-x-auto">
        {[
          { id: 'All', label: 'All Users' },
          { id: 'Principal', label: 'Principal' },
          { id: 'Vice Principal', label: 'Vice Principal' },
          { id: 'Dean', label: 'Deans' },
          { id: 'HOD', label: 'HODs' },
          { id: 'Faculty', label: 'Faculty' },
          { id: 'Non-Teaching', label: 'Non-Teaching' },
          { id: 'Admins', label: 'Admins' },
          { id: 'Super Admins', label: 'Super Admins' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDesignationTabFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              designationTabFilter === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, ID, designation..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition cursor-pointer">
            <Filter className="size-4" /> Filters
          </button>
        </div>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: facultyList.length.toString(), tone: 'info' as const },
          {
            label: 'Active Faculty',
            value: facultyList
              .filter((f) => f.status?.toLowerCase() === 'active')
              .length.toString(),
            tone: 'success' as const,
          },
          {
            label: 'On Leave',
            value: facultyList
              .filter((f) => f.status?.toLowerCase() === 'on-leave')
              .length.toString(),
            tone: 'warn' as const,
          },
          {
            label: 'Departments',
            value: departments.length.toString(),
            tone: 'info' as const,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Live
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        {isFacultyLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading faculty records...</span>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No faculty members found. Fill out the form below to register a new faculty.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {[
                      'Faculty ID',
                      'Name & Email',
                      'Department',
                      'Designation',
                      'Exp (Yrs)',
                      'Status',
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
                  {filteredFaculty.slice(0, 10).map((fac) => (
                    <tr key={fac._id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-semibold text-xs text-primary">
                        {fac.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{fac.fullName}</div>
                        <div className="text-xs text-muted-foreground">{fac.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{fac.department?.name || 'Unassigned'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{fac.designation}</span>
                          {fac.isActing && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                              (In-Charge)
                            </span>
                          )}
                        </div>
                        {Array.isArray(fac.deanResponsibilities) && fac.deanResponsibilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {fac.deanResponsibilities.map((r: string) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{fac.experience}</td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            fac.employeeStatus === 'Active'
                              ? 'success'
                              : fac.employeeStatus === 'On Leave'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {fac.employeeStatus || 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingLifecycleStaff(fac)}
                            className="px-2 py-1 rounded border text-xs hover:bg-accent transition font-medium cursor-pointer"
                            title="View Employee Lifecycle & Promotion History"
                          >
                            Lifecycle Log
                          </button>
                          {['Principal', 'Vice Principal', 'System Administrator'].includes(fac.designation) ? (
                            <span
                              className="px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold"
                              title="System-Critical User: Permanent deletion forbidden. Use Archive or Replace instead."
                            >
                              Archive Only
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to soft-delete and archive staff member ${fac.fullName}?`,
                                  )
                                ) {
                                  deleteFacultyMutation.mutate(fac._id);
                                }
                              }}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                              title="Soft-Delete & Archive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredFaculty.length > 10 && (
              <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 bg-muted/10 text-xs text-muted-foreground rounded-b-2xl">
                <div>
                  Showing <span className="font-semibold text-foreground">10</span> of{' '}
                  <span className="font-semibold text-foreground">{filteredFaculty.length}</span>{' '}
                  faculty members
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold">
                  <span>+{filteredFaculty.length - 10} more records exist</span>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Faculty Analytics</h3>
          </div>
          <div className="space-y-3">
            {deptStats.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                No faculty distribution data available.
              </div>
            ) : (
              deptStats.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
                >
                  <span className="text-sm text-muted-foreground">{dept.name}</span>
                  <span className="font-bold">{dept.value} faculty</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-gradient">
            {unverifiedEmail ? 'Verify Faculty Account' : 'Add New Faculty'}
          </h3>
          {unverifiedEmail ? (
            <form
              onSubmit={handleOtpSubmit}
              className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
            >
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  An OTP verification code has been sent to{' '}
                  <span className="font-semibold text-foreground">{unverifiedEmail}</span>. Please
                  enter the 6-digit code to complete registration.
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
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center px-4 py-3 rounded-xl border bg-background text-lg font-bold tracking-widest focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUnverifiedEmail(null);
                    setOtpCode('');
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {verifyingOtp ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Complete'}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Faculty Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Faculty ID (Employee) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC-CSE-023"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.gupta@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Department Assignment *
                  </label>
                  <select
                    required
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Employee Category *
                  </label>
                  <select
                    value={employeeCategory}
                    onChange={(e) => {
                      const cat = e.target.value as 'Teaching' | 'Non-Teaching';
                      setEmployeeCategory(cat);
                      setDesignation(cat === 'Teaching' ? 'Assistant Professor' : 'Lab Assistant');
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Teaching">Teaching Staff</option>
                    <option value="Non-Teaching">Non-Teaching Support Staff</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Employee Designation *
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDesignation(val);
                      if (val === 'Dean') setFacultyType('Dean');
                      else if (val === 'HOD') setFacultyType('HOD');
                      else setFacultyType('Faculty');
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer font-semibold text-foreground"
                  >
                    {employeeCategory === 'Teaching' ? (
                      <>
                        <option value="Principal">Principal</option>
                        <option value="Vice Principal">Vice Principal</option>
                        <option value="Dean">Dean</option>
                        <option value="HOD">HOD</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Guest Faculty">Guest Faculty</option>
                      </>
                    ) : (
                      <>
                        <option value="Lab Assistant">Lab Assistant</option>
                        <option value="Librarian">Librarian</option>
                        <option value="Hostel Warden">Hostel Warden</option>
                        <option value="Transport Manager">Transport Manager</option>
                        <option value="Office Staff">Office Staff</option>
                        <option value="Accounts">Accounts Staff</option>
                        <option value="Exam Cell">Exam Cell Officer</option>
                        <option value="System Administrator">System Administrator</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Employee Status *
                  </label>
                  <select
                    value={employeeStatus}
                    onChange={(e) => setEmployeeStatus(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Retired">Retired</option>
                    <option value="Relieved">Relieved</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Reports To (Reporting Manager)
                  </label>
                  <select
                    value={reportsToUserId}
                    onChange={(e) => setReportsToUserId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">Select Reporting Manager</option>
                    {facultyList.map((fac: any) => (
                      <option key={fac._id || fac.id} value={fac._id || fac.id}>
                        {fac.fullName} ({fac.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Permission Profile Template
                  </label>
                  <select
                    value={permissionProfile}
                    onChange={(e) => setPermissionProfile(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    {PERMISSION_PROFILES.map((profile) => (
                      <option key={profile.id} value={profile.name}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActing}
                      onChange={(e) => setIsActing(e.target.checked)}
                      className="rounded border-primary text-primary focus:ring-primary size-4"
                    />
                    <span>Acting / In-Charge Position</span>
                  </label>
                </div>

                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3 p-3 border rounded-xl bg-accent/20">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Secondary Departments (Cross-Teaching)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IT, AIML (comma separated)"
                      value={secondaryDepartments.join(', ')}
                      onChange={(e) =>
                        setSecondaryDepartments(
                          e.target.value.split(',').map((s) => s.trim()),
                        )
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Faculty Advisor Sections
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd Year CSE-A, 2nd Year CSE-B"
                      value={advisorSections.join(', ')}
                      onChange={(e) =>
                        setAdvisorSections(
                          e.target.value.split(',').map((s) => s.trim()),
                        )
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border bg-background text-xs"
                    />
                  </div>
                </div>

                {employeeStatus === 'On Leave' && (
                  <div className="sm:col-span-2 p-3 border rounded-xl bg-amber-500/10 space-y-2">
                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      Leave Delegation & Workflow Rerouting
                    </label>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Delegated To (Name)"
                        value={delegatedToName}
                        onChange={(e) => setDelegatedToName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border bg-background text-xs"
                      />
                      <input
                        type="date"
                        value={delegationStartDate}
                        onChange={(e) => setDelegationStartDate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border bg-background text-xs"
                      />
                      <input
                        type="date"
                        value={delegationEndDate}
                        onChange={(e) => setDelegationEndDate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border bg-background text-xs"
                      />
                    </div>
                  </div>
                )}

                {designation === 'Dean' && (
                  <div className="sm:col-span-2 p-3 border rounded-xl bg-blue-500/5 space-y-2">
                    <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span>Dean Domain Responsibilities *</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Academics',
                        'Examination',
                        'Student Affairs',
                        'Research',
                        'IQAC',
                        'IMA',
                        'Training & Placements',
                      ].map((resp) => (
                        <label
                          key={resp}
                          className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={deanResponsibilities.includes(resp)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDeanResponsibilities([...deanResponsibilities, resp]);
                              } else {
                                setDeanResponsibilities(
                                  deanResponsibilities.filter((r) => r !== resp),
                                );
                              }
                            }}
                            className="rounded border-primary text-primary focus:ring-primary"
                          />
                          <span>{resp}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {designation === 'HOD' && (
                  <div className="sm:col-span-2 p-3 border rounded-xl bg-indigo-500/5 space-y-2">
                    <label className="text-xs font-bold text-indigo flex items-center gap-1.5">
                      <span>HOD Scoping (Assigned Programs & Semesters)</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">
                          Assigned Programs
                        </span>
                        <input
                          type="text"
                          value={assignedPrograms.join(', ')}
                          onChange={(e) =>
                            setAssignedPrograms(
                              e.target.value.split(',').map((p) => p.trim()),
                            )
                          }
                          placeholder="e.g. B.Tech CSE, M.Tech CSE"
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">
                          Assigned Semesters
                        </span>
                        <input
                          type="text"
                          value={assignedSemesters.join(', ')}
                          onChange={(e) =>
                            setAssignedSemesters(
                              e.target.value.split(',').map((s) => s.trim()),
                            )
                          }
                          placeholder="e.g. Sem 1, Sem 3, Sem 5"
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Set faculty login password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={createFacultyMutation.isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-semibold glow-primary hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {createFacultyMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Register Faculty'
                )}
              </button>
            </form>
          )}
        </Card>
      </div>

      {viewingLifecycleStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Employee Lifecycle & Promotion History
                </h3>
                <p className="text-xs text-muted-foreground">
                  {viewingLifecycleStaff.fullName} ({viewingLifecycleStaff.employeeId})
                </p>
              </div>
              <button
                onClick={() => setViewingLifecycleStaff(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded border"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-lg bg-accent/20 text-xs space-y-1">
                <div className="font-semibold text-foreground">Current Designation: {viewingLifecycleStaff.designation}</div>
                <div>Status: <Badge tone="info">{viewingLifecycleStaff.employeeStatus || 'Active'}</Badge></div>
                <div>Permission Profile: <span className="font-medium text-primary">{viewingLifecycleStaff.permissionProfile || 'Faculty Template'}</span></div>
                {viewingLifecycleStaff.reportsTo && (
                  <div>Reports To: <span className="font-semibold text-foreground">{viewingLifecycleStaff.reportsTo.name} ({viewingLifecycleStaff.reportsTo.designation})</span></div>
                )}
              </div>

              <div className="text-xs font-bold text-muted-foreground pt-2">Lifecycle History Trail</div>
              {Array.isArray(viewingLifecycleStaff.lifecycleHistory) && viewingLifecycleStaff.lifecycleHistory.length > 0 ? (
                <div className="space-y-2">
                  {viewingLifecycleStaff.lifecycleHistory.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg bg-background space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{item.newStatus || 'Active'} - {item.newDesignation || viewingLifecycleStaff.designation}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-muted-foreground">Reason: {item.reason || 'Status update'}</div>
                      <div className="text-[10px] text-muted-foreground">Recorded By: {item.changedBy || 'System Admin'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No historical lifecycle changes recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
