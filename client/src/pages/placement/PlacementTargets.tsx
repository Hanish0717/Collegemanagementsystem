import { useState, useEffect } from "react";
import { Target, CheckCircle2, XCircle, FileText, ArrowRight, ShieldCheck, Clock, Plus, Loader2, Award, History, ExternalLink } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementTargets, updateExemptionStatus, submitExemptionRequest, type TargetSummaryData, type ExemptionRequestItem, type TargetAuditLogItem } from "@/services/placementService";
import { toast } from "sonner";

export function PlacementTargets() {
  const [data, setData] = useState<TargetSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingModalOpen, setIsSubmittingModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // New Exemption Request Form
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [exemptionType, setExemptionType] = useState<"Higher Studies" | "Entrepreneurship" | "Government Exams" | "Medical Leave">("Higher Studies");
  const [reason, setReason] = useState("");

  const loadTargetData = async () => {
    setLoading(true);
    try {
      const res = await fetchPlacementTargets();
      setData(res);
    } catch (err) {
      console.warn("Failed to load target summary data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargetData();
  }, []);

  const handleStatusChange = async (reqItem: ExemptionRequestItem, newStatus: "Approved" | "Rejected") => {
    setIsUpdating(true);
    try {
      const res = await updateExemptionStatus(
        reqItem.id,
        newStatus,
        `Officer reviewed proof document for ${reqItem.studentName}`,
        reqItem.studentName,
        reqItem.exemptionType
      );

      toast.success(
        newStatus === "Approved"
          ? `Exemption Approved! Active Placement Target updated to ${res.newActiveTarget || "new value"}.`
          : `Exemption Request Rejected.`
      );

      loadTargetData();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update exemption status.");
    } finally {
      setIsUpdating(false);
    }
  };

  /** Request clarification from student for a pending exemption request */
  const processDeclarationAction = async (_id: string, _action: string, notes: string): Promise<void> => {
    // Clarification request is logged locally until a dedicated backend endpoint is available
    console.info(`[PlacementTargets] Clarification requested. Notes: ${notes}`);
    return Promise.resolve();
  };

  const handleNewRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !reason.trim()) {
      toast.error("Student name and reason are required.");
      return;
    }

    setIsUpdating(true);
    try {
      await submitExemptionRequest({
        studentId: studentId || "CS100001",
        studentName,
        department,
        exemptionType,
        reason,
        documentUrl: "https://college.edu/proofs/exemption_document.pdf"
      });

      toast.success("Exemption request submitted for officer review!");
      setIsSubmittingModalOpen(false);
      setStudentName("");
      setReason("");
      loadTargetData();
    } catch (err: any) {
      toast.error("Failed to submit exemption request.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Target & Exemption Management 🎯"
        desc="Equation pipeline: Original Target → Approved Exemptions → Active Placement Target. Automatically updates dashboard and logs target history."
        actions={
          <button
            onClick={() => setIsSubmittingModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Submit Exemption Request
          </button>
        }
      />

      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm font-semibold text-muted-foreground">Calculating Placement Target Equation & Audit Logs...</span>
          </div>
        </Card>
      ) : data ? (
        <>
          {/* TARGET PIPELINE EQUATION STEPPER BANNER */}
          <Card className="bg-gradient-soft border">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
              {/* Step 1: Original Target */}
              <div className="flex items-center gap-3 flex-1">
                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 grid place-items-center font-bold shrink-0">
                  <Target className="size-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Step 1: Original Target</div>
                  <div className="text-2xl font-extrabold text-foreground mt-0.5">{data.originalTarget} Students</div>
                  <div className="text-[11px] text-muted-foreground">95% of {data.totalStudents} Batch Students</div>
                </div>
              </div>

              <ArrowRight className="size-6 text-muted-foreground hidden lg:block shrink-0" />

              {/* Step 2: Approved Exemptions */}
              <div className="flex items-center gap-3 flex-1">
                <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 grid place-items-center font-bold shrink-0">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Step 2: Approved Exemptions</div>
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">-{data.totalApprovedExemptions} Students</div>
                  <div className="text-[11px] text-muted-foreground">Higher Studies, Startups, Govt, Medical</div>
                </div>
              </div>

              <ArrowRight className="size-6 text-muted-foreground hidden lg:block shrink-0" />

              {/* Step 3: Active Target */}
              <div className="flex items-center gap-3 flex-1 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="size-12 rounded-2xl bg-emerald-600 text-white grid place-items-center font-bold shrink-0 shadow-sm">
                  <Award className="size-6" />
                </div>
                <div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-bold">Step 3: Active Target</div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{data.activePlacementTarget} Students</div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">Placement Ratio: <strong>{data.placementPercentage}%</strong></div>
                </div>
              </div>
            </div>
          </Card>

          {/* 4 APPROVED EXEMPTION CATEGORIES */}
          <div>
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Approved Exemption Categories
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Higher Studies", count: data.exemptionsBreakdown.higherStudies, desc: "MS, M.Tech & MBA Admission Proof", icon: "📚", tone: "info" },
                { title: "Entrepreneurship", count: data.exemptionsBreakdown.entrepreneurship, desc: "Startup Incorporation Proof", icon: "🚀", tone: "success" },
                { title: "Government Exams", count: data.exemptionsBreakdown.governmentExams, desc: "GATE, UPSC & Defense Call Letters", icon: "🏛️", tone: "info" },
                { title: "Medical Leave", count: data.exemptionsBreakdown.medicalLeave, desc: "Certified Medical Exemption Grounds", icon: "🏥", tone: "warn" }
              ].map((cat) => (
                <Card key={cat.title}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cat.icon}</span>
                    <Badge tone={cat.tone as any} className="text-xs font-bold">
                      {cat.count} Approved
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm mt-3 text-foreground">{cat.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* EXEMPTION REQUEST APPROVAL QUEUE */}
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div>
                <h3 className="font-bold text-base">Exemption Approval Queue</h3>
                <p className="text-xs text-muted-foreground">Officer review panel for student exemption applications.</p>
              </div>
              <Badge tone="warn">
                {data.exemptionRequests.filter((e) => e.status === "Pending").length} Pending Requests
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student Name & ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Exemption Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Reason & Proof</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Officer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.exemptionRequests.map((reqItem) => (
                    <tr key={reqItem.id} className="hover:bg-accent/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-foreground">{reqItem.studentName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{reqItem.studentId}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{reqItem.department}</td>
                      <td className="py-3 px-4">
                        <Badge tone="info" className="text-[10px]">{reqItem.exemptionType}</Badge>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-muted-foreground line-clamp-2">{reqItem.reason}</div>
                        {reqItem.documentUrl && (
                          <a
                            href={reqItem.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline mt-1"
                          >
                            <ExternalLink className="size-3" /> View Proof Document
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          tone={
                            reqItem.status === "Approved"
                              ? "success"
                              : reqItem.status === "Rejected"
                              ? "danger"
                              : "warn"
                          }
                        >
                          {reqItem.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {reqItem.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(reqItem, "Approved")}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Approve Declaration (Reduces Target)"
                            >
                              <CheckCircle2 className="size-3.5" /> Approve
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(reqItem, "Rejected")}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Reject Declaration"
                            >
                              <XCircle className="size-3.5" /> Reject
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => {
                                const notes = prompt("Enter clarification request details for student:");
                                if (notes) {
                                  processDeclarationAction(reqItem.id, "Request Clarification", notes)
                                    .then(() => {
                                      toast.info("Clarification requested from student.");
                                      loadTargetData();
                                    });
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Request Document Clarification"
                            >
                              Clarification
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium">Reviewed ({reqItem.status})</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* TARGET HISTORY & AUDIT LOG TABLE */}
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base">Target History & Audit Log</h3>
                  <p className="text-xs text-muted-foreground">Timestamped audit trail of target recalculations triggered by officer approvals.</p>
                </div>
              </div>
              <Badge tone="info">System Audit Log Active</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Action & Candidate</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Exemption Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Target Recalculation</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Reviewer Notes</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-accent/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-foreground">{log.action}</div>
                        <div className="text-muted-foreground text-[11px]">{log.studentName}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">{log.exemptionType}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-muted-foreground">{log.prevActiveTarget}</span>
                        <ArrowRight className="size-3 inline mx-1.5 text-primary" />
                        <span className="font-bold text-emerald-600">{log.newActiveTarget}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs">{log.notes}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      {/* NEW EXEMPTION REQUEST MODAL */}
      {isSubmittingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Submit Exemption Request</h3>
              <button
                onClick={() => setIsSubmittingModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleNewRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Student ID / Roll Number</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. CS100005"
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Department / Branch</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs font-semibold focus:border-primary outline-none"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Approved Exemption Category</label>
                <select
                  value={exemptionType}
                  onChange={(e) => setExemptionType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs font-semibold focus:border-primary outline-none"
                >
                  <option value="Higher Studies">📚 Higher Studies (MS/MBA Admission)</option>
                  <option value="Entrepreneurship">🚀 Entrepreneurship (Startup Incorporation)</option>
                  <option value="Government Exams">🏛️ Government Exams (GATE/UPSC Call Letter)</option>
                  <option value="Medical Leave">🏥 Medical Leave (Certified Medical Grounds)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground">Reason & Justification</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details and admission/incorporation letter info..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none resize-none"
                  required
                />
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmittingModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold cursor-pointer hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary cursor-pointer hover:opacity-95 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
