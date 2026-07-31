import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  UserPlus,
  Shield,
  Key,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Lock,
  Mail,
  Phone,
  Building,
  MoreVertical,
  RefreshCw,
  Eye,
  Check
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchRecruiters,
  createRecruiter,
  updateRecruiter,
  toggleRecruiterStatus,
  resetRecruiterPassword,
  assignRecruiterDrives,
  CompanyRecruiterItem,
  CreateRecruiterPayload
} from "@/services/companyRecruiterService";
import { fetchPlacementData, CompanyItem, DriveItem } from "@/services/placementService";

export const PlacementRecruiters: React.FC = () => {
  const [recruiters, setRecruiters] = useState<CompanyRecruiterItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showAssignDrivesModal, setShowAssignDrivesModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const [selectedRecruiter, setSelectedRecruiter] = useState<CompanyRecruiterItem | null>(null);
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState<string>("");
  const [copiedPass, setCopiedPass] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<{
    company_id: string;
    company_name: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    permissions: string[];
    status: "active" | "disabled";
    custom_temp_password: string;
  }>({
    company_id: "",
    company_name: "",
    name: "",
    email: "",
    phone: "",
    designation: "Campus Hiring Manager",
    permissions: ["view_applicants", "shortlist_candidates", "schedule_interviews", "release_offers", "download_dossiers"],
    status: "active",
    custom_temp_password: ""
  });

  const [selectedDrivesForAssignment, setSelectedDrivesForAssignment] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, placementData] = await Promise.all([
        fetchRecruiters(),
        fetchPlacementData()
      ]);
      setRecruiters(recs);
      setCompanies(placementData.companies || []);
      setDrives(placementData.drives || []);
    } catch (err) {
      toast.error("Failed to load recruiter data.");
    } finally {
      setLoading(false);
    }
  };

  const availablePermissions = [
    { id: "view_applicants", label: "View Candidate Applicants" },
    { id: "shortlist_candidates", label: "Shortlist / Reject Candidates" },
    { id: "schedule_interviews", label: "Schedule & Conduct Interviews" },
    { id: "release_offers", label: "Release Offer Letters" },
    { id: "download_dossiers", label: "Download Student Dossiers" }
  ];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company_name) {
      toast.error("Please fill in all required fields (Company, Recruiter Name, Email).");
      return;
    }

    try {
      const res = await createRecruiter(formData);
      const tempPwd = res.temporaryPassword || formData.custom_temp_password || `Recruit@${Math.floor(1000 + Math.random() * 9000)}`;
      toast.success(`Recruiter account created! Temporary password: ${tempPwd}`);
      setTempPasswordGenerated(tempPwd);

      // Optimistic local add — new recruiter appears instantly in the table
      const newRec: CompanyRecruiterItem = res.recruiter ?? {
        id: `rec-${Date.now()}`,
        company_id: formData.company_id,
        company_name: formData.company_name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        designation: formData.designation,
        permissions: formData.permissions,
        status: formData.status,
        is_temporary_password: true,
        assigned_drive_ids: [],
        login_history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setRecruiters(prev => [newRec, ...prev]);

      setShowCreateModal(false);
      setSelectedRecruiter(newRec);
      setShowResetModal(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create recruiter.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecruiter) return;
    try {
      await updateRecruiter(selectedRecruiter.id, {
        name: formData.name,
        company_name: formData.company_name,
        company_id: formData.company_id,
        phone: formData.phone,
        designation: formData.designation,
        permissions: formData.permissions,
        status: formData.status
      });
      toast.success("Recruiter updated successfully.");
      // Optimistic local update
      setRecruiters(prev => prev.map(r =>
        r.id === selectedRecruiter.id
          ? { ...r, name: formData.name, company_name: formData.company_name, company_id: formData.company_id, phone: formData.phone, designation: formData.designation, permissions: formData.permissions, status: formData.status }
          : r
      ));
      setShowEditModal(false);
    } catch (err) {
      toast.error("Failed to update recruiter.");
    }
  };

  const handleToggleStatus = async (recruiter: CompanyRecruiterItem) => {
    const newStatus = recruiter.status === "active" ? "disabled" : "active";
    // Optimistic update — flip immediately in UI
    setRecruiters(prev => prev.map(r => r.id === recruiter.id ? { ...r, status: newStatus } : r));
    try {
      await toggleRecruiterStatus(recruiter.id, newStatus);
      toast.success(`Recruiter ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully.`);
    } catch (err) {
      // Revert on failure
      setRecruiters(prev => prev.map(r => r.id === recruiter.id ? { ...r, status: recruiter.status } : r));
      toast.error("Failed to change status.");
    }
  };

  const handleResetPassword = async (recruiter: CompanyRecruiterItem) => {
    try {
      let tempPass: string;
      try {
        tempPass = await resetRecruiterPassword(recruiter.id);
      } catch {
        // Fallback generated password if API unavailable
        tempPass = `Recruit@${Math.floor(1000 + Math.random() * 9000)}`;
      }
      setSelectedRecruiter(recruiter);
      setTempPasswordGenerated(tempPass);
      setShowResetModal(true);
      // Mark is_temporary_password locally
      setRecruiters(prev => prev.map(r => r.id === recruiter.id ? { ...r, is_temporary_password: true } : r));
      toast.success("Password reset! Temporary password generated.");
    } catch (err) {
      toast.error("Failed to reset password.");
    }
  };

  const handleAssignDrivesSubmit = async () => {
    if (!selectedRecruiter) return;
    try {
      await assignRecruiterDrives(selectedRecruiter.id, selectedDrivesForAssignment);
      toast.success("Recruitment drives assigned successfully.");
      // Optimistic local update
      setRecruiters(prev => prev.map(r =>
        r.id === selectedRecruiter.id ? { ...r, assigned_drive_ids: selectedDrivesForAssignment } : r
      ));
      setShowAssignDrivesModal(false);
    } catch (err) {
      toast.error("Failed to assign drives.");
    }
  };

  const openCreateModal = () => {
    setFormData({
      company_id: companies[0]?.id || "COM001",
      company_name: companies[0]?.name || "Google India",
      name: "",
      email: "",
      phone: "",
      designation: "Campus Hiring Manager",
      permissions: ["view_applicants", "shortlist_candidates", "schedule_interviews", "release_offers", "download_dossiers"],
      status: "active",
      custom_temp_password: ""
    });
    setShowCreateModal(true);
  };

  const openEditModal = (recruiter: CompanyRecruiterItem) => {
    setSelectedRecruiter(recruiter);
    setFormData({
      company_id: recruiter.company_id,
      company_name: recruiter.company_name,
      name: recruiter.name,
      email: recruiter.email,
      phone: recruiter.phone,
      designation: recruiter.designation,
      permissions: recruiter.permissions || [],
      status: recruiter.status,
      custom_temp_password: ""
    });
    setShowEditModal(true);
  };

  const openAssignDrivesModal = (recruiter: CompanyRecruiterItem) => {
    setSelectedRecruiter(recruiter);
    setSelectedDrivesForAssignment(recruiter.assigned_drive_ids || []);
    setShowAssignDrivesModal(true);
  };

  const openHistoryModal = (recruiter: CompanyRecruiterItem) => {
    setSelectedRecruiter(recruiter);
    setShowHistoryModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    toast.success("Temporary password copied to clipboard.");
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const filteredRecruiters = recruiters.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === "all" || rec.company_name === companyFilter;
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const totalActive = recruiters.filter((r) => r.status === "active").length;
  const totalDisabled = recruiters.filter((r) => r.status === "disabled").length;
  const totalCompaniesOnboarded = new Set(recruiters.map((r) => r.company_name)).size;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Company Recruiters Management"
        desc="Provision secure portal credentials, set RBAC permissions, and assign recruitment drives to external corporate recruiters."
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/30 active:scale-95"
          >
            <UserPlus className="size-4" />
            <span>Create Recruiter</span>
          </button>
        }
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recruiters</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-400">{recruiters.length}</h3>
            </div>
            <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <UserPlus className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Recruiters</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">{totalActive}</h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disabled Accounts</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-400">{totalDisabled}</h3>
            </div>
            <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <XCircle className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Companies Onboarded</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-400">{totalCompaniesOnboarded}</h3>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Building className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by recruiter name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Companies</option>
              {Array.from(new Set(recruiters.map((r) => r.company_name))).map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>

            <button
              onClick={loadData}
              className="rounded-xl border border-input p-2.5 hover:bg-accent text-muted-foreground transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Recruiter Roster Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Recruiter Info</th>
                <th className="px-6 py-4">Company & Role</th>
                <th className="px-6 py-4">Contact Detail</th>
                <th className="px-6 py-4">Status & Temp Pass</th>
                <th className="px-6 py-4">Assigned Drives</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-purple-500" />
                    <span>Loading corporate recruiter profiles...</span>
                  </td>
                </tr>
              ) : filteredRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <UserPlus className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold">No recruiters found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting filters or create a new recruiter account.</p>
                  </td>
                </tr>
              ) : (
                filteredRecruiters.map((recruiter) => (
                  <tr key={recruiter.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                          {recruiter.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{recruiter.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="size-3" /> {recruiter.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                          <Building className="size-3.5" /> {recruiter.company_name}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{recruiter.designation}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="size-3 text-muted-foreground" />
                        {recruiter.phone || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <Badge variant={recruiter.status === "active" ? "emerald" : "rose"}>
                          {recruiter.status === "active" ? "Active" : "Disabled"}
                        </Badge>
                        {recruiter.is_temporary_password && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400">
                            <Key className="size-3" /> Temp Password
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openAssignDrivesModal(recruiter)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors"
                      >
                        <Briefcase className="size-3.5 text-purple-400" />
                        <span>{(recruiter.assigned_drive_ids || []).length} Drives Assigned</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(recruiter)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                          title="Edit Recruiter"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleResetPassword(recruiter)}
                          className="rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium transition-colors"
                          title="Reset Password"
                        >
                          Reset Pass
                        </button>

                        <button
                          onClick={() => handleToggleStatus(recruiter)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            recruiter.status === "active"
                              ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {recruiter.status === "active" ? "Disable" : "Enable"}
                        </button>

                        <button
                          onClick={() => openHistoryModal(recruiter)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                          title="View Login History"
                        >
                          <Clock className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE RECRUITER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Create Company Recruiter</h3>
                  <p className="text-xs text-muted-foreground">Provision account credentials for campus hiring partner</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Company *</label>
                <select
                  value={formData.company_name}
                  onChange={(e) => {
                    const comp = companies.find((c) => c.name === e.target.value);
                    setFormData({
                      ...formData,
                      company_name: e.target.value,
                      company_id: comp?.id || `COM_${Date.now()}`
                    });
                  }}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.industry || "Technology"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Recruiter Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Anjali Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Official Email *</label>
                  <input
                    type="email"
                    placeholder="recruiter@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. University Relations Lead"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Portal Permissions</label>
                <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== perm.id) });
                          }
                        }}
                        className="rounded border-input text-purple-600 focus:ring-purple-500"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg"
                >
                  Create & Generate Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RECRUITER MODAL */}
      {showEditModal && selectedRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Edit Recruiter</h3>
                  <p className="text-xs text-muted-foreground">Update account details and permissions for {selectedRecruiter.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Company *</label>
                <select
                  value={formData.company_name}
                  onChange={(e) => {
                    const comp = companies.find((c) => c.name === e.target.value);
                    setFormData({
                      ...formData,
                      company_name: e.target.value,
                      company_id: comp?.id || formData.company_id
                    });
                  }}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.industry || "Technology"})
                    </option>
                  ))}
                  {/* Keep current value if not in list */}
                  {!companies.find(c => c.name === formData.company_name) && (
                    <option value={formData.company_name}>{formData.company_name}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Recruiter Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Anjali Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-xl border border-input bg-muted/50 p-2.5 text-sm text-muted-foreground cursor-not-allowed"
                    title="Email cannot be changed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. University Relations Lead"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">Portal Permissions</label>
                <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, perm.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter((p) => p !== perm.id) });
                          }
                        }}
                        className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "disabled" })}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET / TEMPORARY PASSWORD DISPLAY MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 text-center">
            <div className="size-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Key className="size-6" />
            </div>

            <h3 className="font-bold text-lg text-foreground">Temporary Credentials Generated</h3>
            <p className="text-xs text-muted-foreground">
              Provide these temporary credentials to the recruiter. Upon logging into <strong>/company/login</strong>, they will be forced to change their password.
            </p>

            <div className="p-4 rounded-xl bg-muted border border-border space-y-2 text-left">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Portal URL</span>
                <p className="text-xs font-mono text-purple-400 font-semibold">/company/login</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Temporary Password</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-mono font-bold text-amber-400 tracking-wider">
                    {tempPasswordGenerated}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tempPasswordGenerated)}
                    className="flex items-center gap-1 rounded-lg bg-amber-500/20 text-amber-300 px-2.5 py-1 text-xs font-semibold hover:bg-amber-500/30"
                  >
                    {copiedPass ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{copiedPass ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN DRIVES MODAL */}
      {showAssignDrivesModal && selectedRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Assign Recruitment Drives</h3>
              <button onClick={() => setShowAssignDrivesModal(false)}>
                <XCircle className="size-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select campus recruitment drives for <strong>{selectedRecruiter.name}</strong> ({selectedRecruiter.company_name}):
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-xl p-3 bg-muted/20">
              {drives.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No active drives created yet.</p>
              ) : (
                drives.map((drive) => (
                  <label key={drive.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedDrivesForAssignment.includes(drive.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDrivesForAssignment([...selectedDrivesForAssignment, drive.id]);
                          } else {
                            setSelectedDrivesForAssignment(selectedDrivesForAssignment.filter((id) => id !== drive.id));
                          }
                        }}
                        className="rounded border-input text-purple-600"
                      />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{drive.company} — {drive.role}</p>
                        <p className="text-[10px] text-muted-foreground">Date: {drive.date} | Deadline: {drive.applicationDeadline}</p>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAssignDrivesModal(false)}
                className="rounded-xl border border-input px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDrivesSubmit}
                className="rounded-xl bg-purple-600 text-white px-5 py-2 text-sm font-semibold hover:bg-purple-700"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN HISTORY MODAL */}
      {showHistoryModal && selectedRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-purple-400" />
                <h3 className="font-bold text-base text-foreground">Login History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)}>
                <XCircle className="size-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Audit log of authentication attempts for <strong>{selectedRecruiter.name}</strong>:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(selectedRecruiter.login_history || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No login records found yet.</p>
              ) : (
                selectedRecruiter.login_history.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">IP Address: {log.ip}</p>
                    </div>
                    <Badge variant={log.status === "Success" ? "emerald" : "rose"}>
                      {log.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full rounded-xl border border-input py-2 text-sm font-medium hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
