import { useState, useEffect } from "react";
import { Award, FileText, Upload, CheckCircle2, XCircle, Clock, AlertCircle, ShieldCheck, FileCheck, ExternalLink, ArrowRight, UserCheck, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchCareerDeclarations, submitCareerDeclaration, verifyParentDeclaration, type CareerDeclarationItem } from "@/services/placementService";
import { toast } from "sonner";

export function StudentCareerDeclaration() {
  const [declarations, setDeclarations] = useState<CareerDeclarationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [category, setCategory] = useState<"Higher Studies" | "Entrepreneurship" | "Government Exams" | "Medical Leave">("Higher Studies");
  const [reason, setReason] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [letterUrl, setLetterUrl] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const currentStudentId = "CS100001";
  const currentStudentName = "Student Demo";

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchCareerDeclarations(currentStudentId);
      setDeclarations(res || []);
      if (res && res.length > 0) {
        const active = res[0];
        setCategory(active.category);
        setReason(active.reason);
        setPdfUrl(active.pdfUrl || "");
        setLetterUrl(active.letterUrl || "");
        setProofUrl(active.proofUrl || "");
      }
    } catch (err) {
      console.warn("Failed to load student career declarations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDeclaration = declarations.length > 0 ? declarations[0] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Detailed justification is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await submitCareerDeclaration({
        studentId: currentStudentId,
        studentName: currentStudentName,
        department: "CSE",
        category,
        reason,
        pdfUrl: pdfUrl || "https://college.edu/documents/columbia_admission_letter.pdf",
        letterUrl: letterUrl || "https://college.edu/documents/formal_declaration_letter.pdf",
        proofUrl: proofUrl || "https://college.edu/documents/gre_scorecards.pdf"
      });

      toast.success(res.message || "Career Declaration submitted successfully (No duplicate record created)!");
      loadData();
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to submit declaration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleParentConsentToggle = async (consent: boolean) => {
    if (!activeDeclaration) return;
    setIsSaving(true);
    try {
      await verifyParentDeclaration(activeDeclaration.id, consent);
      toast.success(consent ? "Parent Consent Verified!" : "Parent Disapproval recorded.");
      loadData();
    } catch (err) {
      toast.error("Failed to update parent consent.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeTone = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "danger";
      case "Clarification Requested":
        return "warn";
      case "Submitted":
        return "info";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Career Declaration & Opt-Out Portal 🎓"
        desc="Declare non-placement career paths (Higher Studies, Entrepreneurship, Government Exams, Medical Leave) with document uploads and parent verification."
      />

      {/* CAREER STATUS & DEDUPLICATION BANNER */}
      <Card className="bg-gradient-soft border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Career Status</span>
              <Badge tone={activeDeclaration ? getStatusBadgeTone(activeDeclaration.status) : "info"}>
                {activeDeclaration ? activeDeclaration.status : "Not Submitted"}
              </Badge>
              {activeDeclaration && (
                <Badge tone={activeDeclaration.parentStatus === "Parent Verified" ? "success" : "warn"}>
                  {activeDeclaration.parentStatus}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground mt-1">
              {activeDeclaration
                ? `Active Opt-Out Declaration: ${activeDeclaration.category}`
                : "No active career declaration submitted."}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Strict Single-Declaration Enforcement: Only one declaration record exists per student. Re-submitting updates your existing record.
            </p>
          </div>

          {activeDeclaration && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleParentConsentToggle(true)}
                disabled={isSaving || activeDeclaration.parentStatus === "Parent Verified"}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <UserCheck className="size-3.5" /> Parent Verify
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* OFFICER NOTES WARNING IF CLARIFICATION REQUESTED */}
      {activeDeclaration && activeDeclaration.status === "Clarification Requested" && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-sm">Placement Officer Requested Document Clarification</div>
              <div>{activeDeclaration.officerNotes || "Please review your uploaded admission/proof documents and update the form below."}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* SUBMISSION FORM */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div>
                <h3 className="font-bold text-base">Submit / Update Career Declaration</h3>
                <p className="text-xs text-muted-foreground">Select category and upload PDF, formal letter, and proof documents.</p>
              </div>
              <Badge tone="info">Single Record Guard</Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Selector */}
              <div>
                <label className="font-bold text-foreground block mb-1.5">Career Category Option</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "Higher Studies", label: "Higher Studies", icon: "📚" },
                    { id: "Entrepreneurship", label: "Entrepreneurship", icon: "🚀" },
                    { id: "Government Exams", label: "Government Exams", icon: "🏛️" },
                    { id: "Medical Leave", label: "Medical Leave", icon: "🏥" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        category === cat.id
                          ? "bg-gradient-primary text-white border-primary shadow-sm"
                          : "bg-background hover:bg-accent/50 text-foreground"
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="font-semibold text-[11px] truncate">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Justification Text */}
              <div>
                <label className="font-bold text-foreground block mb-1">Detailed Reason & Justification</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your admission status, university name, startup details, or exam score..."
                  className="w-full px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-primary outline-none resize-none"
                  required
                />
              </div>

              {/* Document Upload Links */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <Upload className="size-3.5 text-primary" /> Document Uploads (PDF / Letters / Proofs)
                </h4>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">1. Upload PDF (Admission Letter)</label>
                    <input
                      type="text"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="https://...admission.pdf"
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-mono focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">2. Upload Letter (Formal Opt-out)</label>
                    <input
                      type="text"
                      value={letterUrl}
                      onChange={(e) => setLetterUrl(e.target.value)}
                      placeholder="https://...letter.pdf"
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-mono focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">3. Upload Proof (Scorecards/Deeds)</label>
                    <input
                      type="text"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://...proof.pdf"
                      className="w-full px-3 py-2 rounded-xl border bg-background text-xs font-mono focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || (activeDeclaration?.status === "Approved")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary cursor-pointer hover:opacity-95 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <FileCheck className="size-4" />}
                  {activeDeclaration ? "Update Career Declaration" : "Submit Career Declaration"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* STUDENT DECLARATION TIMELINE */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h3 className="font-bold text-base">Student Timeline</h3>
              <Badge tone="info">Audit Event Log</Badge>
            </div>

            {!activeDeclaration ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No timeline events logged yet. Submit a declaration to start tracking.
              </div>
            ) : (
              <div className="space-y-4">
                {activeDeclaration.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="relative pl-6 border-l-2 border-primary/30 pb-3 last:pb-0">
                    <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-primary text-white grid place-items-center text-[9px] font-bold">
                      ✓
                    </div>
                    <div className="font-bold text-xs text-foreground">{event.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(event.timestamp).toLocaleString()}</div>
                    <div className="text-[11px] text-muted-foreground/90 mt-1">{event.description}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
