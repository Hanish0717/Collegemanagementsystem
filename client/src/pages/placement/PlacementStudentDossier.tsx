import { useState, useEffect } from "react";
import { User, Building2, Briefcase, FileText, Calendar, ExternalLink, ShieldCheck, Award, Clock, History, Search, Download, CheckCircle2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchStudentPlacementHistory, fetchAllPlacementHistories, type StudentPlacementDossier } from "@/services/placementService";
import { toast } from "sonner";

export function PlacementStudentDossier() {
  const [dossier, setDossier] = useState<StudentPlacementDossier | null>(null);
  const [allStudents, setAllStudents] = useState<StudentPlacementDossier[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("CS100001");
  const [activeTab, setActiveTab] = useState<"applications" | "interviews" | "offers" | "timeline">("applications");
  const [loading, setLoading] = useState(true);

  const loadDossier = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchStudentPlacementHistory(id);
      setDossier(data);
    } catch (err) {
      console.warn("Failed to load placement dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlacementHistories()
      .then((res) => setAllStudents(res || []))
      .catch((err) => console.warn(err));

    loadDossier(selectedStudentId);
  }, [selectedStudentId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Placement Dossier & History 📜"
        desc="Permanent immutable historical record for every student: Application History, Interview History, Offer History, Placement History, Current Company, Package, Joining Date, Offer Letter, Resume, and Timeline."
        actions={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground">Select Student:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-background text-xs font-bold focus:border-primary outline-none cursor-pointer"
            >
              {allStudents.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName} ({s.studentId} - {s.department})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <span className="text-sm font-semibold text-muted-foreground">Retrieving Immutable Placement History Archives...</span>
        </Card>
      ) : dossier ? (
        <>
          {/* STUDENT HERO PROFILE & CURRENT PLACEMENT CARD */}
          <Card className="bg-gradient-soft border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile Details */}
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-2xl bg-gradient-primary text-white grid place-items-center font-extrabold text-xl shadow-md shrink-0">
                  {dossier.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-foreground">{dossier.studentName}</h2>
                    <Badge tone={dossier.careerStatus.includes("Super Dream") ? "success" : "info"}>
                      {dossier.careerStatus}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-0.5 space-x-3">
                    <span>ID: <strong className="text-foreground font-mono">{dossier.studentId}</strong></span>
                    <span>Dept: <strong className="text-foreground">{dossier.department}</strong></span>
                    <span>CGPA: <strong className="text-emerald-600 font-bold">{dossier.cgpa}</strong></span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    📧 {dossier.email} • 📞 {dossier.phone}
                  </div>
                </div>
              </div>

              {/* Current Placement Summary Box */}
              {dossier.currentPlacement ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex-1 lg:max-w-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Current Placement</span>
                    <Badge tone="success" className="text-[9px]">Verified Onboarding</Badge>
                  </div>

                  <div className="mt-2">
                    <div className="text-base font-extrabold text-foreground">{dossier.currentPlacement.company}</div>
                    <div className="text-xs text-muted-foreground">{dossier.currentPlacement.role} • <strong className="text-emerald-600 font-bold">{dossier.currentPlacement.package}</strong></div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Joining Date: <strong>{new Date(dossier.currentPlacement.joiningDate).toLocaleDateString()}</strong></div>
                  </div>

                  {/* Offer Letter & Resume Buttons */}
                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/60">
                    <a
                      href={dossier.currentPlacement.offerLetterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <FileText className="size-3.5" /> Verified Offer Letter
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a
                      href={dossier.currentPlacement.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5" /> Applied Resume Version
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-accent/40 border text-xs text-muted-foreground flex items-center justify-center">
                  Seeking placement opportunities. No active offer accepted yet.
                </div>
              )}
            </div>
          </Card>

          {/* DOSSIER SECTION TABS */}
          <div className="flex items-center gap-2 border-b pb-1">
            {[
              { id: "applications", label: `Application History (${dossier.applicationHistory.length})`, icon: "📋" },
              { id: "interviews", label: `Interview History (${dossier.interviewHistory.length})`, icon: "🗣️" },
              { id: "offers", label: `Offer History (${dossier.offerHistory.length})`, icon: "📄" },
              { id: "timeline", label: `Chronological Timeline (${dossier.timeline.length})`, icon: "⏳" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-gradient-primary text-white shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: APPLICATION HISTORY */}
          {activeTab === "applications" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-base">Complete Application History</h3>
                <Badge tone="info">Permanent Records Retained</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company & Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Offered CTC</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Application Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Final Application Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dossier.applicationHistory.map((app) => (
                      <tr key={app.id} className="hover:bg-accent/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-foreground">{app.company}</div>
                          <div className="text-muted-foreground text-[11px]">{app.role}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">{app.ctc}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            tone={
                              app.status === "Selected" || app.status === "Offer Released"
                                ? "success"
                                : app.status === "Shortlisted"
                                ? "info"
                                : "danger"
                            }
                          >
                            {app.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 2: INTERVIEW HISTORY */}
          {activeTab === "interviews" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-base">Interview Evaluation History</h3>
                <Badge tone="info">Interviewer Audit Log</Badge>
              </div>

              <div className="space-y-4">
                {dossier.interviewHistory.map((int) => (
                  <div key={int.id} className="p-4 rounded-xl border bg-background/50 hover:bg-accent/30 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-foreground">{int.company}</span>
                        <span className="text-xs text-muted-foreground ml-2">• {int.roundName}</span>
                      </div>
                      <Badge tone={int.outcome === "Passed" ? "success" : "danger"}>
                        {int.outcome} ({int.score})
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground/90 bg-accent/40 p-2.5 rounded-lg border">
                      "{int.feedback}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Interviewer: <strong>{int.interviewer}</strong></span>
                      <span>Date: {new Date(int.interviewDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: OFFER HISTORY */}
          {activeTab === "offers" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-base">Offer History</h3>
                <Badge tone="success">All Received Offers</Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {dossier.offerHistory.map((off) => (
                  <div key={off.id} className="p-4 rounded-xl border bg-background hover:shadow-xs transition space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{off.company}</h4>
                      <Badge tone={off.status === "Accepted" ? "success" : "danger"}>
                        {off.status}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>Role: <strong className="text-foreground">{off.role}</strong></div>
                      <div>Package: <strong className="text-emerald-600 font-bold">{off.package}</strong></div>
                      <div>Joining Date: <strong>{new Date(off.joiningDate).toLocaleDateString()}</strong></div>
                    </div>

                    <div className="pt-2 border-t flex justify-end">
                      <a
                        href={off.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        <FileText className="size-3.5" /> View Offer Letter
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: CHRONOLOGICAL TIMELINE */}
          {activeTab === "timeline" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-base">Placement History Timeline</h3>
                <Badge tone="info">Multi-Year Audit Stepper</Badge>
              </div>

              <div className="space-y-4">
                {dossier.timeline.map((tl) => (
                  <div key={tl.id} className="relative pl-6 border-l-2 border-primary/30 pb-3 last:pb-0">
                    <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-primary text-white grid place-items-center text-[9px] font-bold">
                      ✓
                    </div>
                    <div className="font-bold text-xs text-foreground">{tl.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(tl.timestamp).toLocaleString()}</div>
                    <div className="text-[11px] text-muted-foreground/90 mt-1">{tl.description}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
