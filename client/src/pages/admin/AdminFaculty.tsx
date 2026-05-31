import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Plus, Search, UserCheck, Loader2, Trash2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import {
  fetchFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  fetchDepartments,
} from "@/services/adminService";
import { toast } from "sonner";
import api from "@/lib/api";

export function AdminFaculty() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [designation, setDesignation] = useState("Assistant Professor");
  const [experience, setExperience] = useState("");
  const [gender, setGender] = useState("Male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  // OTP Verification States
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Queries
  const { data: facultyList = [], isLoading: isFacultyLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: fetchFaculty,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  // Mutations
  const createFacultyMutation = useMutation({
    mutationFn: createFaculty,
    onSuccess: (data, variables) => {
      setUnverifiedEmail(variables.email);
      toast.success("Faculty member registered successfully. Please enter the OTP sent to their email to complete registration.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to register faculty member");
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
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast.success("Faculty record updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update faculty record");
    },
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast.success("Faculty record soft-deleted");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete faculty record");
    },
  });

  // Filters & Search
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((fac) => {
      const matchesSearch = [fac.fullName, fac.employeeId, fac.email, fac.designation].some((val) =>
        val.toLowerCase().includes(search.toLowerCase()),
      );

      const matchesDept = deptFilter === "All" || fac.department?._id === deptFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && fac.status === "active") ||
        (statusFilter === "On Leave" && fac.status === "on-leave");

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [facultyList, search, deptFilter, statusFilter]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !employeeId.trim() || !selectedDept || !password.trim()) {
      toast.error("Please fill in all required fields (including Password)");
      return;
    }
    createFacultyMutation.mutate({
      fullName,
      email,
      employeeId,
      department: selectedDept,
      designation,
      experience: experience ? Number(experience) : 0,
      gender,
      phoneNumber: phoneNumber || undefined,
      password,
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
      toast.success("Faculty account successfully verified and registered!");
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      setUnverifiedEmail(null);
      setOtpCode("");
      // Reset form
      setFullName("");
      setEmail("");
      setEmployeeId("");
      setExperience("");
      setPhoneNumber("");
      setPassword("");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Verification failed. Please check the OTP.";
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Unique status list
  const statuses = ["All", "Active", "On Leave"];

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
        title="Faculty Management"
        desc="Manage faculty records, subject allocation, department mapping and status tracking."
      />

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
          { label: "Total Faculty", value: facultyList.length.toString(), tone: "info" as const },
          {
            label: "Active Faculty",
            value: facultyList.filter((f) => f.status === "active").length.toString(),
            tone: "success" as const,
          },
          {
            label: "On Leave",
            value: facultyList.filter((f) => f.status === "on-leave").length.toString(),
            tone: "warn" as const,
          },
          {
            label: "Departments",
            value: departments.length.toString(),
            tone: "info" as const,
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
                      "Faculty ID",
                      "Name & Email",
                      "Department",
                      "Designation",
                      "Exp (Yrs)",
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
                        <Badge tone="info">{fac.department?.name || "Unassigned"}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{fac.designation}</td>
                      <td className="py-3 px-4 font-medium">{fac.experience}</td>
                      <td className="py-3 px-4">
                        <select
                          value={fac.status}
                          onChange={(e) =>
                            updateFacultyMutation.mutate({
                              id: fac._id,
                              payload: { status: e.target.value },
                            })
                          }
                          className="rounded-lg border bg-background/50 px-2 py-1 text-xs outline-none focus:border-primary transition"
                        >
                          <option value="active">Active</option>
                          <option value="on-leave">On Leave</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to soft-delete faculty ${fac.fullName}?`,
                                )
                              ) {
                                deleteFacultyMutation.mutate(fac._id);
                              }
                            }}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title="Delete Faculty"
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
            {filteredFaculty.length > 10 && (
              <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 bg-muted/10 text-xs text-muted-foreground rounded-b-2xl">
                <div>
                  Showing <span className="font-semibold text-foreground">10</span> of{" "}
                  <span className="font-semibold text-foreground">{filteredFaculty.length}</span> faculty members
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
            {unverifiedEmail ? "Verify Faculty Account" : "Add New Faculty"}
          </h3>
          {unverifiedEmail ? (
            <form
              onSubmit={handleOtpSubmit}
              className="space-y-4 p-4 border rounded-xl bg-gradient-soft"
            >
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  An OTP verification code has been sent to{" "}
                  <span className="font-semibold text-foreground">{unverifiedEmail}</span>.
                  Please enter the 6-digit code to complete registration.
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
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUnverifiedEmail(null);
                    setOtpCode("");
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
                  {verifyingOtp ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Verify & Complete"
                  )}
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
                  <label className="text-xs font-semibold text-muted-foreground">Designation *</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                    <option value="HOD">HOD</option>
                  </select>
                </div>
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
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
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
                  "Register Faculty"
                )}
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
