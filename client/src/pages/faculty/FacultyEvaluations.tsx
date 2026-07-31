import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  FileText, CheckCircle2, Clock, Award, Eye, Loader2, AlertCircle, 
  X, Check, AlertTriangle, ShieldCheck, ArrowRight, BookOpen
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

interface EvaluationItem {
  id: string;
  exam_id: string;
  course_id?: string;
  evaluation_code: string;
  pdf_url: string;
  status: "Assigned" | "Evaluated";
  marks_breakdown: Record<string, number>;
  total_score: number;
  evaluated_at?: string;
  created_at: string;
  exam?: {
    name: string;
    type: string;
    department: string;
    semester: number;
  };
  course?: {
    course_name: string;
    course_code: string;
  };
}

export function FacultyEvaluations() {
  const [activeEvaluation, setActiveEvaluation] = useState<EvaluationItem | null>(null);

  // Form state for 15-question evaluation
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Fetch Faculty Assigned Evaluations & Analytics
  const { data: evalResponse, isLoading, refetch } = useQuery<{
    success: boolean;
    analytics: {
      totalAssigned: number;
      pendingCount: number;
      evaluatedCount: number;
      completionRate: number;
    };
    data: EvaluationItem[];
  }>({
    queryKey: ["faculty-evaluations"],
    queryFn: async () => {
      const { data } = await api.get("/api/exams/evaluations/faculty");
      return data;
    }
  });

  const analytics = evalResponse?.analytics || { totalAssigned: 0, pendingCount: 0, evaluatedCount: 0, completionRate: 0 };
  const evaluationsList = evalResponse?.data || [];

  // Submit Evaluation Mutation
  const submitEvaluationMutation = useMutation({
    mutationFn: async ({ id, marks_breakdown, total_score }: { id: string; marks_breakdown: Record<string, number>; total_score: number }) => {
      await api.post(`/api/exams/evaluations/${id}/submit`, { marks_breakdown, total_score });
    },
    onSuccess: () => {
      refetch();
      toast.success("Answer copy evaluation submitted successfully!");
      setActiveEvaluation(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    }
  });

  // Open Studio & Populate Initial Form
  const handleOpenStudio = (item: EvaluationItem) => {
    setActiveEvaluation(item);
    setMarks(item.marks_breakdown || {});
    setErrors({});
  };

  // Handle Score Input & Live Out-of-Range Validation
  const handleScoreChange = (field: string, rawVal: string, maxVal: number) => {
    const num = parseFloat(rawVal);
    const newMarks = { ...marks };
    const newErrors = { ...errors };

    if (rawVal === "" || isNaN(num)) {
      delete newMarks[field];
      delete newErrors[field];
    } else {
      newMarks[field] = num;
      if (num < 0 || num > maxVal) {
        newErrors[field] = `Out of range! Max ${maxVal} marks.`;
      } else {
        delete newErrors[field];
      }
    }

    setMarks(newMarks);
    setErrors(newErrors);
  };

  // Compute Live Total Score using Either/Or Choice Pair Max Rule
  const computeTotalScore = () => {
    let total = 0;
    // Part A: Q1 - Q7
    for (let i = 1; i <= 7; i++) {
      const val = Number(marks[`q${i}`] || 0);
      if (val >= 0 && val <= 2) total += val;
    }

    // Part B Either/Or Choice Pairs: (8/9), (10/11), (12/13), (14/15)
    const pairs = [
      [8, 9],
      [10, 11],
      [12, 13],
      [14, 15]
    ];

    for (const [q1, q2] of pairs) {
      const s1 = Math.min(8, Math.max(0, Number(marks[`q${q1}a`] || 0))) + Math.min(6, Math.max(0, Number(marks[`q${q1}b`] || 0)));
      const s2 = Math.min(8, Math.max(0, Number(marks[`q${q2}a`] || 0))) + Math.min(6, Math.max(0, Number(marks[`q${q2}b`] || 0)));
      total += Math.max(s1, s2);
    }

    return Math.min(total, 70); // Max 70 total
  };

  const getChoicePairBadge = (qNum: number, otherNum: number) => {
    const sThis = Math.min(8, Math.max(0, Number(marks[`q${qNum}a`] || 0))) + Math.min(6, Math.max(0, Number(marks[`q${qNum}b`] || 0)));
    const sOther = Math.min(8, Math.max(0, Number(marks[`q${otherNum}a`] || 0))) + Math.min(6, Math.max(0, Number(marks[`q${otherNum}b`] || 0)));

    if (sThis === 0 && sOther === 0) {
      return <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Max 14 Marks</span>;
    }

    if (sThis >= sOther && sThis > 0) {
      return (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
          ✓ Best Attempt ({sThis} Marks Counted)
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Ignored: Lower Attempt ({sThis} M)
        </span>
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvaluation) return;

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix out-of-range marks before submitting.");
      return;
    }

    const calculatedTotal = computeTotalScore();
    submitEvaluationMutation.mutate({
      id: activeEvaluation.id,
      marks_breakdown: marks,
      total_score: calculatedTotal
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Examination Evaluation Studio"
        desc="Perform anonymized (blind) digital grading of assigned student PDF answer copies with real-time question rubric validation."
      />

      {/* Analytics Header Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Assigned Copies</span>
              <span className="text-2xl font-black text-slate-800">{analytics.totalAssigned}</span>
            </div>
            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
              <FileText className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Pending Evaluation</span>
              <span className="text-2xl font-black text-amber-600">{analytics.pendingCount}</span>
            </div>
            <div className="size-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
              <Clock className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Completed & Corrected</span>
              <span className="text-2xl font-black text-emerald-600">{analytics.evaluatedCount}</span>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Completion Rate</span>
              <span className="text-2xl font-black text-purple-600">{analytics.completionRate}%</span>
            </div>
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 grid place-items-center">
              <Award className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Answer Copies Grid */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-xs text-slate-800">
              Assigned Answer Copies for Evaluation (Blind Grading)
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Student details are anonymized to ensure unbiased evaluation.
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-indigo-600 animate-spin" />
            <span className="text-xs text-muted-foreground">Loading assigned answer copies...</span>
          </div>
        ) : evaluationsList.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl">
            <AlertCircle className="size-6 text-slate-300" />
            <span>No answer copies assigned to your profile for evaluation currently.</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluationsList.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition bg-white space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {item.evaluation_code}
                    </span>
                    <Badge tone={item.status === "Evaluated" ? "success" : "warn"}>
                      {item.status === "Evaluated" ? "Corrected" : "Pending"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-800">
                      {item.course?.course_name || item.exam?.name || "End Semester Theory Exam"} {item.course?.course_code ? `(${item.course.course_code})` : ""}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {item.exam?.name} • Dept: {item.exam?.department} | Semester: {item.exam?.semester}
                    </span>
                  </div>

                  {item.status === "Evaluated" && (
                    <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-800">Evaluated Score:</span>
                      <span className="font-black text-emerald-700 text-sm">{item.total_score} / 70</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenStudio(item)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                    item.status === "Evaluated"
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  <Eye className="size-3.5" />
                  {item.status === "Evaluated" ? "Review / Edit Marks" : "Evaluate Answer Copy"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Split-Screen Digital Evaluation Studio Modal */}
      {activeEvaluation && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    Digital Correction Studio 
                    <span className="font-mono text-xs text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
                      {activeEvaluation.evaluation_code}
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Exam: {activeEvaluation.exam?.name} ({activeEvaluation.exam?.department} - Sem {activeEvaluation.exam?.semester})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Blind Evaluation</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="size-3.5" /> Identity Anonymized
                  </span>
                </div>

                <button
                  onClick={() => setActiveEvaluation(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Split Screen Container */}
            <div className="grid lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Left Column: PDF Answer Copy Viewer (7 Cols) */}
              {(() => {
                const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" ? "" : "http://localhost:5000");
                const pdfUrlToUse = `${apiBase}/api/exams/evaluations/${activeEvaluation.id}/pdf`;

                return (
                  <div className="lg:col-span-7 border-r border-slate-200 bg-slate-900/95 p-4 flex flex-col justify-between overflow-y-auto">
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-300 border-b border-slate-800 pb-2">
                      <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                        <BookOpen className="size-4" /> Scanned Student Answer Sheet PDF
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={pdfUrlToUse}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-200 underline flex items-center gap-1 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-700/50"
                        >
                          Open in New Tab ↗
                        </a>
                      </div>
                    </div>

                    <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden min-h-[520px] border border-slate-700 flex flex-col justify-center items-center relative p-1">
                      <iframe
                        src={pdfUrlToUse}
                        className="w-full h-full min-h-[520px] rounded-xl border-none"
                        title="Answer Copy PDF Viewer"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Use embedded controls to zoom, scroll, or rotate answer sheet pages.</span>
                      <a
                        href={pdfUrlToUse}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-200 font-semibold underline"
                      >
                        Download PDF File 📥
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Right Column: Interactive 15-Question Rubric (5 Cols) */}
              <div className="lg:col-span-5 p-5 bg-slate-50/50 overflow-y-auto flex flex-col justify-between">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-900 border-b pb-2 mb-3 flex items-center justify-between">
                      <span>Part A: Short Questions (Q1 - Q7)</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Max 2 Marks Each</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                        const fieldKey = `q${num}`;
                        const err = errors[fieldKey];
                        return (
                          <div key={fieldKey} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700">Question {num}</label>
                              <span className="text-[9px] font-bold text-slate-400">Out of 2</span>
                            </div>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="2"
                              placeholder="0 - 2"
                              value={marks[fieldKey] !== undefined ? marks[fieldKey] : ""}
                              onChange={(e) => handleScoreChange(fieldKey, e.target.value, 2)}
                              className={`w-full text-xs font-bold rounded-lg border px-2.5 py-1.5 outline-none transition ${
                                err ? "border-rose-500 bg-rose-50/50 text-rose-700" : "border-slate-300 focus:border-indigo-600 bg-slate-50/50"
                              }`}
                            />
                            {err && <span className="text-[9px] font-bold text-rose-600 mt-1 block">{err}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-900 border-b pb-2 mb-3 flex items-center justify-between">
                      <span>Part B: Long Questions (Q8 - Q15)</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Either/Or Choice (a: Max 8, b: Max 6)</span>
                    </h4>

                    <div className="space-y-3">
                      {[
                        { title: "Question 8 (Choice 1A)", qNum: 8, otherNum: 9, aKey: "q8a", bKey: "q8b" },
                        { title: "Question 9 (Choice 1B)", qNum: 9, otherNum: 8, aKey: "q9a", bKey: "q9b" },
                        { title: "Question 10 (Choice 2A)", qNum: 10, otherNum: 11, aKey: "q10a", bKey: "q10b" },
                        { title: "Question 11 (Choice 2B)", qNum: 11, otherNum: 10, aKey: "q11a", bKey: "q11b" },
                        { title: "Question 12 (Choice 3A)", qNum: 12, otherNum: 13, aKey: "q12a", bKey: "q12b" },
                        { title: "Question 13 (Choice 3B)", qNum: 13, otherNum: 12, aKey: "q13a", bKey: "q13b" },
                        { title: "Question 14 (Choice 4A)", qNum: 14, otherNum: 15, aKey: "q14a", bKey: "q14b" },
                        { title: "Question 15 (Choice 4B)", qNum: 15, otherNum: 14, aKey: "q15a", bKey: "q15b" },
                      ].map((item) => (
                        <div key={item.title} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <div className="text-xs font-bold text-slate-800 border-b pb-1 flex items-center justify-between">
                            <span>{item.title}</span>
                            {getChoicePairBadge(item.qNum, item.otherNum)}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
                                <span>Subpart (a)</span>
                                <span>Out of 8</span>
                              </div>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="8"
                                placeholder="0 - 8"
                                value={marks[item.aKey] !== undefined ? marks[item.aKey] : ""}
                                onChange={(e) => handleScoreChange(item.aKey, e.target.value, 8)}
                                className={`w-full text-xs font-bold rounded-lg border px-2 py-1 outline-none transition ${
                                  errors[item.aKey] ? "border-rose-500 bg-rose-50/50 text-rose-700" : "border-slate-300 focus:border-indigo-600 bg-slate-50/50"
                                }`}
                              />
                              {errors[item.aKey] && <span className="text-[9px] font-bold text-rose-600 mt-0.5 block">{errors[item.aKey]}</span>}
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
                                <span>Subpart (b)</span>
                                <span>Out of 6</span>
                              </div>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="6"
                                placeholder="0 - 6"
                                value={marks[item.bKey] !== undefined ? marks[item.bKey] : ""}
                                onChange={(e) => handleScoreChange(item.bKey, e.target.value, 6)}
                                className={`w-full text-xs font-bold rounded-lg border px-2 py-1 outline-none transition ${
                                  errors[item.bKey] ? "border-rose-500 bg-rose-50/50 text-rose-700" : "border-slate-300 focus:border-indigo-600 bg-slate-50/50"
                                }`}
                              />
                              {errors[item.bKey] && <span className="text-[9px] font-bold text-rose-600 mt-0.5 block">{errors[item.bKey]}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Total Score Footer & Submit Action */}
                  <div className="sticky bottom-0 bg-white p-4 rounded-xl border border-slate-300 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Evaluated Total Score:</span>
                      <span className="text-xl font-black text-indigo-700 font-mono">
                        {computeTotalScore()} <span className="text-xs text-slate-400 font-normal">/ 70 Marks</span>
                      </span>
                    </div>

                    {Object.keys(errors).length > 0 && (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Fix red out-of-range errors before submitting evaluation!</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveEvaluation(null)}
                        className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submitEvaluationMutation.isPending || Object.keys(errors).length > 0}
                        className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {submitEvaluationMutation.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" /> Submitting Evaluation...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-4" /> Submit Evaluation & Sync Marks
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
