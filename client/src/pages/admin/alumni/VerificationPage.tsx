import React, { useState, useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { StyledTable, TableRow, TableCell, TablePagination, AdvancedTableToolbar } from "./components/TableElements";
import { ShieldCheck, CheckCircle2, XCircle, Clock, Eye, FileText, X, Award, UserCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveAlumniProfile } from "@/services/alumniService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VerificationPage() {
  const { pendingAlumni, pendingLoading, directoryList } = useAlumni();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Document Review Modal state
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Approved" | "Rejected" }) => approveAlumniProfile(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`Profile status has been marked as ${variables.status.toLowerCase()} successfully.`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update verification status.");
    }
  });

  // Calculate dynamic tab button counts from database
  const pendingList = useMemo(() => {
    return (pendingAlumni || []).filter((a: any) => a.status === "Pending" || a.status === "Pending Verification" || !a.status).map((a: any) => ({
      id: String(a.id),
      name: a.full_name || a.name || "Anonymous",
      batch: String(a.graduation_year || a.batch || 2024),
      department: a.department || "Computer Science",
      appliedAt: a.created_at || a.appliedAt || new Date().toISOString(),
      docsCount: 2,
      email: a.email || "N/A",
      status: "Pending Verification",
      raw: a
    }));
  }, [pendingAlumni]);

  const approvedList = useMemo(() => {
    return (directoryList || []).filter((a: any) => a.status === "Approved" || a.status === "Verified").map((a: any) => ({
      id: String(a.id),
      name: a.full_name || a.name || "Anonymous",
      batch: String(a.graduation_year || a.batch || 2024),
      department: a.department || "Computer Science",
      appliedAt: a.created_at || a.appliedAt || new Date().toISOString(),
      docsCount: 2,
      email: a.email || "N/A",
      status: "Verified",
      raw: a
    }));
  }, [directoryList]);

  const rejectedList = useMemo(() => {
    const rejectedPending = (pendingAlumni || []).filter((a: any) => a.status === "Rejected");
    const rejectedDir = (directoryList || []).filter((a: any) => a.status === "Rejected");
    return [...rejectedPending, ...rejectedDir].map((a: any) => ({
      id: String(a.id),
      name: a.full_name || a.name || "Anonymous",
      batch: String(a.graduation_year || a.batch || 2024),
      department: a.department || "Computer Science",
      appliedAt: a.created_at || a.appliedAt || new Date().toISOString(),
      docsCount: 2,
      email: a.email || "N/A",
      status: "Rejected",
      raw: a
    }));
  }, [pendingAlumni, directoryList]);

  // Select active list
  const activeList = useMemo(() => {
    if (activeTab === 'pending') return pendingList;
    if (activeTab === 'approved') return approvedList;
    return rejectedList;
  }, [activeTab, pendingList, approvedList, rejectedList]);

  const filteredList = useMemo(() => {
    return activeList.filter((a: any) => 
      a.name?.toLowerCase().includes(search.toLowerCase()) || 
      a.batch?.includes(search) ||
      a.department?.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeList, search]);

  // Pagination calculations
  const limit = 10;
  const totalPages = Math.ceil(filteredList.length / limit) || 1;
  const paginatedList = useMemo(() => {
    return filteredList.slice((currentPage - 1) * limit, currentPage * limit);
  }, [filteredList, currentPage]);

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedList.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedList.map((a: any) => a.id));
    }
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // Bulk actions
  const handleBulkApprove = () => {
    if (selectedRows.length === 0) {
      toast.error("No applicants selected.");
      return;
    }
    selectedRows.forEach(id => {
      verifyMutation.mutate({ id, status: "Approved" });
    });
    toast.success(`Dispatched approvals for ${selectedRows.length} applicants.`);
    setSelectedRows([]);
  };

  const handleBulkReject = () => {
    if (selectedRows.length === 0) {
      toast.error("No applicants selected.");
      return;
    }
    if (window.confirm(`Are you sure you want to reject the selected ${selectedRows.length} applications?`)) {
      selectedRows.forEach(id => {
        verifyMutation.mutate({ id, status: "Rejected" });
      });
      toast.success(`Dispatched rejections for ${selectedRows.length} applicants.`);
      setSelectedRows([]);
    }
  };

  // Document review popup trigger
  const handleReviewClick = (app: any) => {
    setSelectedApplicant(app);
    setIsReviewOpen(true);
  };

  if (pendingLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="h-96 bg-muted rounded-3xl w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Verification Center" 
        description="Review and verify alumni registrations to ensure platform authenticity."
        icon={ShieldCheck}
        color="from-amber-500 to-orange-600"
      >
        <div className="flex bg-black/20 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveTab('pending'); setCurrentPage(1); setSelectedRows([]); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", 
              activeTab === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'
            )}
          >
            Pending ({pendingList.length})
          </button>
          <button 
            onClick={() => { setActiveTab('approved'); setCurrentPage(1); setSelectedRows([]); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", 
              activeTab === 'approved' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'
            )}
          >
            Approved ({approvedList.length})
          </button>
          <button 
            onClick={() => { setActiveTab('rejected'); setCurrentPage(1); setSelectedRows([]); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", 
              activeTab === 'rejected' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'
            )}
          >
            Rejected ({rejectedList.length})
          </button>
        </div>
      </GradientHeader>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold">Verification Queue</h3>
            {activeTab === 'pending' && (
              <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                <Clock className="w-3 h-3 mr-1" /> Action Required
              </Badge>
            )}
          </div>
          {activeTab === 'pending' && (
            <div className="flex items-center gap-2">
              <Button onClick={handleBulkApprove} variant="outline" size="sm" className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"><CheckCircle2 className="w-4 h-4 mr-2"/> Bulk Approve</Button>
              <Button onClick={handleBulkReject} variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"><XCircle className="w-4 h-4 mr-2"/> Bulk Reject</Button>
            </div>
          )}
        </div>

        <AdvancedTableToolbar 
          onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
          searchPlaceholder="Search by applicant name or batch..."
        />

        <StyledTable headers={[
          activeTab === 'pending' ? <input type="checkbox" checked={selectedRows.length === paginatedList.length && paginatedList.length > 0} onChange={handleSelectAll} className="rounded" /> : null,
          "Applicant", "Academic Info", "Submitted On", "Documents", "Actions"
        ].filter(Boolean)}>
          {paginatedList.length > 0 ? paginatedList.map((app: any) => (
            <TableRow key={app.id}>
              {activeTab === 'pending' && (
                <TableCell>
                  <input type="checkbox" checked={selectedRows.includes(app.id)} onChange={() => handleCheckboxToggle(app.id)} className="rounded" />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{app.name}</p>
                    <p className="text-xs text-muted-foreground">ID: ALM-{app.id.padStart(4, '0')}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">Class of {app.batch}</p>
                <p className="text-xs text-muted-foreground">{app.department}</p>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground">{new Date(app.appliedAt).toLocaleTimeString()}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleReviewClick(app)} className="rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100">
                  <FileText className="w-4 h-4 mr-1.5" /> {app.docsCount} Docs
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleReviewClick(app)} className="h-8 w-8 p-0 rounded-xl bg-muted/50 hover:bg-muted" title="Review Docs">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {activeTab === 'pending' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-xl text-emerald-600 hover:bg-emerald-50" 
                        title="Approve"
                        onClick={() => verifyMutation.mutate({ id: app.id, status: "Approved" })}
                        disabled={verifyMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-xl text-rose-600 hover:bg-rose-50" 
                        title="Reject"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to reject registration for ${app.name}?`)) {
                            verifyMutation.mutate({ id: app.id, status: "Rejected" });
                          }
                        }}
                        disabled={verifyMutation.isPending}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <tr>
              <td colSpan={activeTab === 'pending' ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <p>No applicants found matching current search criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </StyledTable>
        
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </GlassCard>

      {/* ── MODAL: Document Review Popup ── */}
      {isReviewOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsReviewOpen(false)} className="absolute top-5 right-5 p-1.5 text-muted-foreground hover:bg-muted rounded-xl">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold flex items-center gap-2 text-orange-600 mb-1">
              <ShieldCheck className="w-5 h-5" /> Document Verification Review
            </h3>
            <p className="text-xs text-muted-foreground mb-4 border-b pb-3">
              Applicant: <span className="font-semibold text-foreground">{selectedApplicant.name}</span> (Class of {selectedApplicant.batch})
            </p>

            <div className="space-y-6">
              {/* Document 1: Degree Certificate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-4 h-4 text-emerald-600" /> Document 1: Degree Certificate
                  </span>
                  <span className="text-muted-foreground">Verified Academic Record</span>
                </div>
                <div className="p-8 border rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center gap-3">
                  <Award className="w-12 h-12 text-amber-500 opacity-80" />
                  <div>
                    <h5 className="font-bold text-sm">B.Tech Degree Certificate</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedApplicant.department} Branch</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px]">MockScannedDoc_Preview.pdf</Badge>
                </div>
              </div>

              {/* Document 2: College Identity Card */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-4 h-4 text-emerald-600" /> Document 2: Identity Verification Card
                  </span>
                  <span className="text-muted-foreground">Government or College Issued Card</span>
                </div>
                <div className="p-8 border rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-24 h-16 rounded-xl border bg-card/60 shadow-sm flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                    [ ID CARD PHOTO ]
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">College Registration ID Card</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">Registration ID matching student profile</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px]">Alumni_Identity_Card.png</Badge>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center gap-2 pt-6 mt-6 border-t">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                Applicant Email: <span className="font-bold text-foreground">{selectedApplicant.email}</span>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsReviewOpen(false)} className="rounded-xl">
                  Close
                </Button>
                {activeTab === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to reject this application?`)) {
                          verifyMutation.mutate({ id: selectedApplicant.id, status: "Rejected" });
                          setIsReviewOpen(false);
                        }
                      }}
                      variant="outline" 
                      className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        verifyMutation.mutate({ id: selectedApplicant.id, status: "Approved" });
                        setIsReviewOpen(false);
                      }}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Approve Applicant
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
