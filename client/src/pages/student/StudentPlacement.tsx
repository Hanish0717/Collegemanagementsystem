import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Briefcase, Building2, Send, Upload, Lock, CheckCircle2, AlertCircle, Clock, X, FileText, Globe, Linkedin, Phone, XCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { fetchPlacementData, createApplication, fetchStudentApplications, withdrawStudentApplication, checkStudentDriveEligibility, type DriveItem, type StudentApplicationItem, type StudentProfile } from "@/services/placementService";
import { toast } from "sonner";

export function StudentPlacement() {
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [myApplications, setMyApplications] = useState<StudentApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Application Modal States
  const [selectedDrive, setSelectedDrive] = useState<DriveItem | null>(null);
  const [activeApp, setActiveApp] = useState<StudentApplicationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const currentStudentProfile: StudentProfile = {
    studentId: "CS100001",
    full_name: "Student Demo",
    department: "CSE",
    cgpa: 8.2,
    backlogs: 0,
    batch: "2026",
    gender: "Male",
    graduationYear: 2026,
    skills: ["Python", "SQL", "React", "Node.js"]
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [drivesRes, appsRes] = await Promise.all([
        fetchPlacementData(),
        fetchStudentApplications(currentStudentProfile.studentId),
      ]);
      setDrives(drivesRes.drives || []);
      setMyApplications(appsRes || []);
    } catch (err) {
      console.warn("Failed to load student placement data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDriveApplication = (drive: DriveItem) => {
    return myApplications.find(
      (a) => a.company.toLowerCase() === drive.company.toLowerCase() && a.role.toLowerCase() === drive.role.toLowerCase()
    );
  };

  const openApplicationModal = (drive: DriveItem) => {
    const eligibility = checkStudentDriveEligibility(currentStudentProfile, drive);
    if (!eligibility.isEligible) {
      toast.error(`Ineligible to apply. ${eligibility.reasons.join("; ")}`);
      return;
    }

    const existing = getDriveApplication(drive);
    setSelectedDrive(drive);
    setActiveApp(existing || null);

    setPhone(existing?.phone || "+91 98765 43210");
    setCoverNote(existing?.coverNote || "");
    setLinkedinUrl(existing?.linkedinUrl || "https://linkedin.com/in/studentdemo");
    setPortfolioUrl(existing?.portfolioUrl || "https://studentdemo.dev");
    setResumeUrl(existing?.resumeUrl || "https://college.edu/resumes/CS100001.pdf");
    setIsModalOpen(true);
  };

  const handleSubmitApplication = async (status: "Draft" | "Submitted") => {
    if (!selectedDrive) return;

    const eligibility = checkStudentDriveEligibility(currentStudentProfile, selectedDrive);
    if (!eligibility.isEligible) {
      toast.error(`Cannot apply: Ineligible for drive. ${eligibility.reasons.join("; ")}`);
      return;
    }

    const isDeadlinePassed = selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline);
    if (isDeadlinePassed) {
      toast.error("Application is locked because drive deadline has passed.");
      return;
    }

    setIsSaving(true);
    try {
      await createApplication({
        studentName: currentStudentProfile.full_name,
        studentId: currentStudentProfile.studentId,
        company: selectedDrive.company,
        role: selectedDrive.role,
        department: currentStudentProfile.department,
        cgpa: currentStudentProfile.cgpa,
        backlogs: currentStudentProfile.backlogs,
        batch: currentStudentProfile.batch,
        gender: currentStudentProfile.gender,
        graduationYear: currentStudentProfile.graduationYear,
        skills: currentStudentProfile.skills,
        status,
        phone,
        coverNote,
        linkedinUrl,
        portfolioUrl,
        resumeUrl,
      });

      toast.success(status === "Draft" ? "Application saved as Draft!" : "Application submitted successfully!");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error("Error submitting application:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to submit application.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedDrive || !activeApp) return;

    const isDeadlinePassed = selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline);
    if (isDeadlinePassed) {
      toast.error("Cannot withdraw application after deadline.");
      return;
    }

    setIsSaving(true);
    try {
      await withdrawStudentApplication(selectedDrive.id, currentStudentProfile.studentId);
      toast.success("Application withdrawn.");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to withdraw application.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeTone = (status: string) => {
    switch (status) {
      case "Verified":
      case "Selected":
      case "Offer Released":
        return "success";
      case "Submitted":
      case "Applied":
        return "info";
      case "Draft":
        return "warn";
      case "Rejected":
      case "Withdrawn":
        return "danger";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Application Portal 🎓"
        desc="Explore campus recruitment drives, submit applications, edit allowed details before deadline, and track application status."
        actions={
          <Link
            to="/dashboard/student/career-declaration"
            className="px-3.5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary flex items-center gap-1.5 cursor-pointer hover:opacity-95 transition"
          >
            <Briefcase className="size-4" /> Career Opt-Out Declaration
          </Link>
        }
      />

      {/* Student Profile Card */}
      <Card className="bg-gradient-soft border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-sm text-foreground block">{currentStudentProfile.full_name} ({currentStudentProfile.studentId})</span>
            <span className="text-muted-foreground mt-0.5 block">
              Branch: <span className="font-semibold text-foreground">{currentStudentProfile.department}</span> • CGPA: <span className="font-semibold text-emerald-600">{currentStudentProfile.cgpa}</span> • Active Backlogs: <span className="font-semibold text-foreground">{currentStudentProfile.backlogs}</span> • Batch: <span className="font-semibold text-foreground">{currentStudentProfile.batch}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentStudentProfile.skills.map((sk) => (
              <Badge key={sk} tone="info" className="text-[10px]">
                {sk}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Recruitment Drives", value: drives.length.toString(), tone: "info" as const },
          { label: "My Submitted Applications", value: myApplications.filter((a) => a.status === "Submitted" || a.status === "Verified").length.toString(), tone: "success" as const },
          { label: "Draft Applications", value: myApplications.filter((a) => a.status === "Draft").length.toString(), tone: "warn" as const },
          { label: "Verified Applications", value: myApplications.filter((a) => a.status === "Verified").length.toString(), tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-1.5">{loading ? "…" : stat.value}</div>
            <Badge tone={stat.tone} className="mt-2 text-[10px]">
              Active Drive
            </Badge>
          </Card>
        ))}
      </div>

      {/* Recruitment Drives */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base">Campus Recruitment Drives</h3>
            <p className="text-xs text-muted-foreground">Automatic eligibility evaluation based on CGPA, Branch, Backlogs, Gender, and Skills.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="h-44 animate-pulse bg-muted/20">{null}</Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drives.map((drive) => {
              const existing = getDriveApplication(drive);
              const isDeadlinePassed = drive.applicationDeadline ? new Date() > new Date(drive.applicationDeadline) : false;
              const eligibility = checkStudentDriveEligibility(currentStudentProfile, drive);

              return (
                <Card key={drive.id} className="hover:-translate-y-1 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="size-10 rounded-xl bg-gradient-primary text-white grid place-items-center text-xs font-bold shadow-sm">
                        {(drive.company || 'DR').slice(0, 2).toUpperCase()}
                      </div>
                      {existing ? (
                        <Badge tone={getStatusBadgeTone(existing.status)}>
                          {existing.status}
                        </Badge>
                      ) : !eligibility.isEligible ? (
                        <Badge tone="danger">Not Eligible</Badge>
                      ) : isDeadlinePassed ? (
                        <Badge tone="danger">Closed</Badge>
                      ) : (
                        <Badge tone="success">Eligible</Badge>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-foreground">{drive.company}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{drive.role}</p>

                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> Deadline:</span>
                        <span className={`font-semibold ${isDeadlinePassed ? "text-rose-600" : "text-emerald-600"}`}>
                          {drive.applicationDeadline}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Drive Date:</span>
                        <span className="font-medium">{drive.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Venue:</span>
                        <span className="font-medium">{drive.venue}</span>
                      </div>
                    </div>

                    {/* Eligibility Breakdown */}
                    {!eligibility.isEligible && (
                      <div className="mt-3 p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <XCircle className="size-3.5 text-rose-600" /> Ineligible Reasons:
                        </div>
                        {eligibility.reasons.map((reason, idx) => (
                          <div key={idx} className="pl-4 text-[10px] flex items-center gap-1 font-medium">
                            <span>•</span> <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    {existing ? (
                      <button
                        onClick={() => openApplicationModal(drive)}
                        className="w-full px-3 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isDeadlinePassed ? <Lock className="size-3.5" /> : <FileText className="size-3.5" />}
                        {isDeadlinePassed ? "View Application (Locked)" : `Edit Application (${existing.status})`}
                      </button>
                    ) : !eligibility.isEligible ? (
                      <button
                        disabled
                        className="w-full px-3 py-2 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="size-3.5" /> Not Eligible
                      </button>
                    ) : isDeadlinePassed ? (
                      <button
                        disabled
                        className="w-full px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Lock className="size-3.5" /> Deadline Passed
                      </button>
                    ) : (
                      <button
                        onClick={() => openApplicationModal(drive)}
                        className="w-full px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="size-3.5" /> Apply Now
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Applications Tracker */}
      <Card>
        <h3 className="font-bold text-base mb-4">My Submitted Applications</h3>
        {myApplications.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-xs">
            You haven't submitted any placement applications yet. Choose an open drive above to apply.
          </div>
        ) : (
          <div className="space-y-2.5">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-background/50 hover:bg-accent/30 transition gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-violet text-white grid place-items-center text-xs font-bold">
                    {(app.company || 'CP').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{app.company}</h4>
                    <p className="text-xs text-muted-foreground">{app.role} • Applied on {app.appliedDate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {app.isDeadlinePassed && (
                    <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                      <Lock className="size-3" /> Locked
                    </span>
                  )}
                  <Badge tone={getStatusBadgeTone(app.status)}>
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Application Drawer / Modal */}
      {isModalOpen && selectedDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-gradient">
                  Application: {selectedDrive.company}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedDrive.role}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Deadline Locking Alert */}
            {selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline) ? (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                <Lock className="size-4 shrink-0" />
                <span>Application deadline has passed. Fields are locked and editing is disabled.</span>
              </div>
            ) : (
              <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                <span>Editing updates your existing application. Only 1 application per drive is saved.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3" /> Contact Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!!(selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline))}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none disabled:opacity-60"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Linkedin className="size-3" /> LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    disabled={!!(selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-60"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Globe className="size-3" /> Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    disabled={!!(selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-60"
                    placeholder="https://myportfolio.dev"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <FileText className="size-3" /> Statement of Interest / Cover Note
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  disabled={!!(selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline))}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-60 resize-none"
                  placeholder="Brief statement highlighting relevant skills and achievements for this role..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Upload className="size-3" /> Resume Link (PDF)
                </label>
                <input
                  type="text"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  disabled={!!(selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline))}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-60"
                  placeholder="https://college.edu/resumes/CS100001.pdf"
                />
              </div>

              {/* Modal Action Footer */}
              {selectedDrive.applicationDeadline && new Date() > new Date(selectedDrive.applicationDeadline) ? (
                <div className="pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold text-xs cursor-pointer hover:bg-accent transition"
                  >
                    Close (Application Locked)
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {activeApp && activeApp.status !== "Withdrawn" && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleWithdraw}
                      className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  )}

                  <div className="flex-1 flex gap-2 justify-end">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSubmitApplication("Draft")}
                      className="px-4 py-2.5 rounded-xl border bg-background text-xs font-semibold hover:bg-accent transition cursor-pointer disabled:opacity-50"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSubmitApplication("Submitted")}
                      className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary hover:opacity-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="size-3.5" /> Submit Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
