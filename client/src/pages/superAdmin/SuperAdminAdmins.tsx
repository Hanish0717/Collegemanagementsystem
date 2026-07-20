import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus, Search, ShieldCheck, UserCog, Loader2, X, Trash2 } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  fetchDepartments,
} from '@/services/adminService';
import { toast } from 'sonner';
import api from '@/lib/api';

export function SuperAdminAdmins() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // OTP Verification States
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Queries
  const { data: admins = [], isLoading: isAdminsLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  // Mutations
  const createAdminMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setUnverifiedEmail(variables.email);
      setIsAddModalOpen(false);
      toast.success(
        'Admin registered successfully. Please enter the OTP sent to their email to complete registration.',
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create administrator account');
    },
  });

  const toggleAdminStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAdmin(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Administrator account status updated');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update administrator status');
    },
  });

  const updateAdminDeptMutation = useMutation({
    mutationFn: ({ id, departmentId }: { id: string; departmentId: string | null }) =>
      updateAdmin(id, { department: departmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Administrator department ownership updated');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update department ownership');
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Administrator soft-deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete administrator');
    },
  });

  // Filters & Search
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch = [
        admin.fullName,
        admin.employeeId,
        admin.email,
        admin.department?.name || '',
      ].some((val) => val.toLowerCase().includes(search.toLowerCase()));

      const matchesDept = departmentFilter === 'All' || admin.department?._id === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [admins, search, departmentFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !employeeId.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createAdminMutation.mutate({
      fullName,
      email,
      employeeId,
      department: selectedDept || undefined,
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
      toast.success('Admin account successfully verified and registered!');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setUnverifiedEmail(null);
      setOtpCode('');
      // Reset fields
      setFullName('');
      setEmail('');
      setEmployeeId('');
      setSelectedDept('');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        desc="Manage administrator accounts, department ownership and access permissions."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Add Admin
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
              placeholder="Search admins by name, ID or department..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {isAdminsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading administrators...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No administrators found. Click "Add Admin" to register a new account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['Admin ID', 'Name & Email', 'Department Owner', 'Status', 'Actions'].map(
                    (column) => (
                      <th
                        key={column}
                        className="text-left py-3 px-4 font-semibold text-muted-foreground"
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-semibold text-xs text-primary">
                      {admin.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{admin.fullName}</div>
                      <div className="text-xs text-muted-foreground">{admin.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={admin.department?._id || ''}
                        onChange={(e) =>
                          updateAdminDeptMutation.mutate({
                            id: admin._id,
                            departmentId: e.target.value || null,
                          })
                        }
                        className="rounded-lg border bg-background/50 px-2 py-1 text-xs outline-none focus:border-primary transition"
                      >
                        <option value="">None</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          toggleAdminStatusMutation.mutate({
                            id: admin._id,
                            isActive: !admin.isActive,
                          })
                        }
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge tone={admin.isActive ? 'success' : 'danger'}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (
                              confirm(`Are you sure you want to delete admin ${admin.fullName}?`)
                            ) {
                              deleteAdminMutation.mutate(admin._id);
                            }
                          }}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          title="Delete Admin"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Permissions / Assignment Info Panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Security Levels</h3>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              Each registered Administrator possesses full write capability across their designated
              academic department. They can assign sections and classes, register faculty records,
              and manage student advisor mappings.
            </p>
            <p>
              Only the system Super Admin can register new admin profiles or change their department
              ownership rights.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="size-5 text-indigo" />
            <h3 className="font-semibold">Quick Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-xl bg-gradient-soft">
              <div className="text-2xl font-bold text-gradient">
                {admins.filter((a) => a.isActive).length}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Active Administrators</div>
            </div>
            <div className="p-3 border rounded-xl bg-gradient-soft">
              <div className="text-2xl font-bold text-gradient">
                {
                  admins.filter(
                    (a) =>
                      a.department &&
                      a.department._id !== 'Administration' &&
                      a.department._id !== 'None' &&
                      a.department._id !== '',
                  ).length
                }
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Departments Assigned</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Admin Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Register Admin Account</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.kumar@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Employee ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-ADM-004"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Department Assignment
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">None (General Access)</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createAdminMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    'Register Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {unverifiedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Verify Admin Account</h3>
              <button
                onClick={() => {
                  setUnverifiedEmail(null);
                  setOtpCode('');
                  setOtpError(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An OTP verification code has been sent to{' '}
                <span className="font-semibold text-foreground">{unverifiedEmail}</span>. Please
                enter the 6-digit code to complete registration.
              </p>
              {otpError && (
                <div className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
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
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUnverifiedEmail(null);
                    setOtpCode('');
                    setOtpError(null);
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
                  {verifyingOtp ? <Loader2 className="size-4 animate-spin" /> : 'Verify & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
