import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  CheckCircle, XCircle, Loader2, AlertCircle, Upload, FileText, 
  UserCheck, PlusCircle, ShieldCheck, Eye, Sparkles
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

export function ExamCorrections() {
  const [activeTab, setActiveTab] = useState<"allocations" | "revaluations">("allocations");

  // Form states for allocation
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [pdfFileUrl, setPdfFileUrl] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // 1. Fetch Exams List
  const { data: examsList = [] } = useQuery<any[]>({
    queryKey: ["exams-list"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any[] }>("/api/exams");
      return data.data || [];
    }
  });

  // Active Selected Exam Object
  const selectedExam = examsList.find(e => e.id === selectedExamId);

  // 2. Fetch Offered Courses / Subjects for Selected Exam Cohort
  const { data: coursesList = [], isLoading: isCoursesLoading } = useQuery<any[]>({
    queryKey: ["courses-for-exam", selectedExam?.department, selectedExam?.year, selectedExam?.semester],
    queryFn: async () => {
      if (!selectedExam) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/courses?department=${selectedExam.department}&year=${selectedExam.year || 1}&semester=${selectedExam.semester}`
      );
      return data.data || [];
    },
    enabled: !!selectedExam
  });

  // 3. Fetch Faculty List by Selected Department
  const { data: facultyList = [], isLoading: isFacultyLoading } = useQuery<any[]>({
    queryKey: ["faculty-by-dept", selectedDept],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any[] }>(`/api/exams/faculty?department=${selectedDept}`);
      return data.data || [];
    }
  });

  // 4. Fetch Answer Copy Evaluations Roster (Officer View)
  const { data: officerEvaluations = [], isLoading: isEvaluationsLoading, refetch: refetchEvaluations } = useQuery<any[]>({
    queryKey: ["officer-evaluations"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any[] }>("/api/exams/evaluations/officer");
      return data.data || [];
    }
  });

  // 5. Fetch Pending Revaluations List
  const { data: correctionsList = [], isLoading: isCorrectionsLoading, refetch: refetchCorrections } = useQuery<any[]>({
    queryKey: ["corrections-pending"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any[] }>("/api/exams/corrections/pending");
      return data.data || [];
    }
  });

  // Assign Answer Copy Mutation
  const assignCopyMutation = useMutation({
    mutationFn: async (payload: { exam_id: string; course_id?: string; roll_number: string; faculty_id: string; pdf_url: string }) => {
      await api.post("/api/exams/evaluations/assign", payload);
    },
    onSuccess: () => {
      refetchEvaluations();
      toast.success("Scanned answer copy assigned for faculty evaluation!");
      setStudentRollNo("");
      setPdfFileUrl("");
      setSelectedFacultyId("");
      setSelectedCourseId("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to assign answer copy");
    }
  });

  // Approve/Reject Revaluation Mutation
  const approveCorrectionMutation = useMutation({
    mutationFn: async (payload: { request_id: string; action: "Approved" | "Rejected"; remarks: string }) => {
      await api.post("/api/exams/corrections/approve", payload);
    },
    onSuccess: (_, variables) => {
      refetchCorrections();
      toast.success(`Marks correction successfully ${variables.action.toLowerCase()}!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to process request");
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPdfFileUrl(reader.result as string);
      setIsUploadingPdf(false);
      toast.success(`PDF '${file.name}' attached successfully!`);
    };
    reader.onerror = () => {
      setIsUploadingPdf(false);
      toast.error("Failed to read PDF file.");
    };
    reader.readAsDataURL(file);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      toast.error("Please select an exam schedule.");
      return;
    }
    if (!studentRollNo) {
      toast.error("Please enter a valid student roll number.");
      return;
    }
    if (!selectedFacultyId) {
      toast.error("Please select a faculty member for evaluation.");
      return;
    }
    const finalPdf = pdfFileUrl || "https://pdfobject.com/pdf/sample-3pp.pdf";

    assignCopyMutation.mutate({
      exam_id: selectedExamId,
      course_id: selectedCourseId || undefined,
      roll_number: studentRollNo.trim().toUpperCase(),
      faculty_id: selectedFacultyId,
      pdf_url: finalPdf
    });
  };

  const handleAction = (requestId: string, action: "Approved" | "Rejected") => {
    const remarks = prompt(`Enter remarks for ${action.toLowerCase()}:`);
    if (remarks === null) return;
    approveCorrectionMutation.mutate({ request_id: requestId, action, remarks });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Answer Sheet Corrections & Evaluation Control"
        desc="Upload scanned student PDF answer copies, assign faculty evaluators, monitor blind evaluation status, and review revaluation logs."
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("allocations")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "allocations"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-4" /> Answer Copy Allocations & Evaluations
        </button>

        <button
          onClick={() => setActiveTab("revaluations")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "revaluations"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-4" /> Faculty Revaluation Requests ({correctionsList.length})
        </button>
      </div>

      {activeTab === "allocations" ? (
        <div className="space-y-6">
          {/* Allocation & Upload Card Form */}
          <Card className="p-6 border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <PlusCircle className="size-5 text-indigo-600" />
              <h3 className="font-semibold text-sm text-slate-800">
                Upload Scanned Answer Sheet & Assign Faculty Evaluator
              </h3>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Select Exam Schedule</label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      setSelectedCourseId("");
                    }}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">-- Choose Exam --</option>
                    {examsList.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.department} - Sem {e.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subject / Booklet</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    disabled={!selectedExamId || isCoursesLoading}
                    className="w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">
                      {isCoursesLoading ? "Loading Subjects..." : "-- Select Subject --"}
                    </option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_name} ({c.course_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Student Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE26001"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Filter Faculty Dept</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {["CSE", "AIML", "AIDS", "ECE", "EEE", "MECH", "CIVIL", "IT"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Faculty Evaluator</label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    required
                    disabled={isFacultyLoading}
                    className="w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.full_name || f.name || "Faculty Member"} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Upload PDF Answer Sheet</span>
                    <span className="text-[10px] text-muted-foreground">Scanned PDF format required for digital correction workspace</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    id="pdf-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="px-4 py-2 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isUploadingPdf ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    {pdfFileUrl ? "Change PDF File" : "Select PDF File"}
                  </label>

                  <button
                    type="submit"
                    disabled={assignCopyMutation.isPending}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
                  >
                    {assignCopyMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" /> Assigning...
                      </>
                    ) : (
                      <>
                        <UserCheck className="size-3.5" /> Assign Copy for Correction
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {/* Allocation Roster Grid */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xs text-slate-800">Answer Copies Evaluation Roster</h3>
              <Badge tone="info" className="text-[10px]">Total Uploads: {officerEvaluations.length}</Badge>
            </div>

            {isEvaluationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="size-8 text-indigo-600 animate-spin" />
                <span className="text-xs text-muted-foreground">Retrieving answer sheet roster...</span>
              </div>
            ) : officerEvaluations.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl">
                <FileText className="size-8 text-slate-300" />
                <span>No answer copies uploaded or assigned for evaluation yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/40 uppercase text-[10px] tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Evaluation Code (Blind)</th>
                      <th className="text-left py-3 px-4">Exam & Subject</th>
                      <th className="text-left py-3 px-4">Assigned Faculty</th>
                      <th className="text-center py-3 px-4">Evaluation Status</th>
                      <th className="text-center py-3 px-4">Total Score</th>
                      <th className="text-right py-3 px-4">Answer Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {officerEvaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{ev.student?.full_name || "N/A"}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{ev.student?.roll_number}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                            {ev.evaluation_code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-700">
                            {ev.course?.course_name || ev.exam?.name || "End Semester Exam"} {ev.course?.course_code ? `(${ev.course.course_code})` : ""}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{ev.exam?.name} • {ev.exam?.department} - Sem {ev.exam?.semester}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">{ev.evaluator?.full_name || ev.evaluator?.name || "Assigned Evaluator"}</div>
                          <div className="text-[10px] text-muted-foreground">{ev.evaluator?.department}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge tone={ev.status === "Evaluated" ? "success" : "warn"}>
                            {ev.status === "Evaluated" ? "Corrected / Evaluated" : "Assigned"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {ev.status === "Evaluated" ? (
                            <span className="font-bold text-indigo-700 text-sm">{ev.total_score} <span className="text-[10px] text-slate-400">/ 70</span></span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">--</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={ev.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            <Eye className="size-3.5" /> View PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Revaluation Requests Ledger Tab */
        <Card>
          <h3 className="font-semibold text-xs mb-4 text-slate-800">Pending Grade Revaluation Approvals</h3>

          {isCorrectionsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Retrieving pending revaluations...</span>
            </div>
          ) : correctionsList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1 border border-dashed rounded-xl">
              <AlertCircle className="size-5 text-slate-400" />
              <span>No pending revaluation requests currently require review.</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {correctionsList.map((req) => (
                <div key={req.id} className="border rounded-xl p-4 flex flex-col justify-between hover:shadow transition bg-card">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="font-bold text-xs text-indigo-600 block">{req.student_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{req.roll_number} | {req.subject_name}</span>
                      </div>
                      <Badge tone="warn" className="text-[9px]">Pending Approval</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-2 bg-muted/40 rounded-lg text-center">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Old Marks</span>
                        <span className="font-bold text-sm text-slate-600">
                          {req.old_internal_marks !== null ? `${req.old_internal_marks} / 30` : "--"} (Int) <br />
                          {req.old_external_marks !== null ? `${req.old_external_marks} / 70` : "--"} (Ext) <br />
                          <span className="text-xs text-slate-500">Total: {req.old_marks}%</span>
                        </span>
                      </div>
                      <div className="border-l">
                        <span className="text-[9px] uppercase tracking-wider text-indigo-600 block">Proposed</span>
                        <span className="font-bold text-sm text-indigo-700">
                          {req.new_internal_marks !== null ? `${req.new_internal_marks} / 30` : "--"} (Int) <br />
                          {req.new_external_marks !== null ? `${req.new_external_marks} / 70` : "--"} (Ext) <br />
                          <span className="text-xs text-indigo-600">Total: {(req.new_internal_marks || 0) + (req.new_external_marks || 0)}%</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-muted-foreground font-medium">Reason for correction:</div>
                      <p className="italic text-slate-700 bg-amber-50/50 p-2 rounded border border-amber-100 text-[11px] leading-relaxed">
                        "{req.reason || 'No description provided.'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={() => handleAction(req.id, "Approved")}
                      disabled={approveCorrectionMutation.isPending}
                      className="flex-1 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="size-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "Rejected")}
                      disabled={approveCorrectionMutation.isPending}
                      className="flex-1 py-1.5 rounded-lg font-bold text-xs bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="size-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
