import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Lock, Unlock, Loader2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

interface Exam {
  id: string;
  name: string;
  type: string;
  department: string;
  year: number;
  semester: number;
  status: string;
}

export function ExamResults() {
  const queryClient = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [marksList, setMarksList] = useState<any[]>([]);

  // 1. Fetch Exams List
  const { data: examsList = [], isLoading: isExamsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  const selectedExam = examsList.find(e => e.id === selectedExamId);

  // 2. Fetch Results Ledger for the Exam & Subject
  const { isLoading: isResultsLoading, refetch: refetchResults } = useQuery({
    queryKey: ["exams", selectedExamId, "results", selectedSubject],
    queryFn: async () => {
      if (!selectedExamId || !selectedSubject) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/${selectedExamId}/results?subject=${encodeURIComponent(selectedSubject)}`
      );
      const list = data.data || [];
      setMarksList(list);
      return list;
    },
    enabled: !!selectedExamId && !!selectedSubject
  });

  // 3. Save Marks Draft Mutation
  const saveResultsMutation = useMutation({
    mutationFn: async ({ id, subject, marksData }: { id: string; subject: string; marksData: any[] }) => {
      const mapped = marksData.map(m => ({
        student_user_id: m.user_id || m.student_id,
        marks: m.marks,
        internal_marks: m.internal_marks,
        external_marks: m.external_marks,
        grade: m.grade,
        credits: m.credits
      }));
      await api.post(`/api/exams/${id}/results`, { subject, marksData: mapped });
    },
    onSuccess: () => {
      refetchResults();
      toast.success("Marks draft saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save marks");
    }
  });

  // 4. Publish / Lock Exam Results Mutation
  const updateExamMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Exam> }) => {
      const { data } = await api.put(`/api/exams/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam results lock state updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update lock state");
    }
  });

  // 5. Request Marks Correction Mutation
  const requestCorrectionMutation = useMutation({
    mutationFn: async (payload: { result_id: string; new_internal_marks: number; new_external_marks: number; reason: string }) => {
      await api.post("/api/exams/corrections/request", payload);
    },
    onSuccess: () => {
      refetchResults();
      toast.success("Marks correction request submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit correction request");
    }
  });

  // Grade helper
  const calculateGrade = (marks: number) => {
    if (marks >= 90) return "O";
    if (marks >= 80) return "A+";
    if (marks >= 70) return "A";
    if (marks >= 60) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 40) return "C";
    return "F";
  };

  const handleInternalMarkChange = (index: number, val: string) => {
    const internalVal = val === "" ? null : Number(val);
    const updated = [...marksList];
    updated[index].internal_marks = internalVal;
    
    const ext = updated[index].external_marks || 0;
    const total = (internalVal || 0) + ext;
    updated[index].marks = total;
    updated[index].grade = calculateGrade(total);
    setMarksList(updated);
  };

  const handleExternalMarkChange = (index: number, val: string) => {
    const externalVal = val === "" ? null : Number(val);
    const updated = [...marksList];
    updated[index].external_marks = externalVal;
    
    const int = updated[index].internal_marks || 0;
    const total = int + (externalVal || 0);
    updated[index].marks = total;
    updated[index].grade = calculateGrade(total);
    setMarksList(updated);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results Publisher Console"
        desc="Moderate student results ledger, compute final grades, manage lock states, and handle revaluations."
      />

      {/* Filters Card */}
      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Examination</label>
            {isExamsLoading ? (
              <div className="text-xs py-2 text-muted-foreground animate-pulse">Loading exams...</div>
            ) : (
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setSelectedSubject("");
                  setMarksList([]);
                }}
                className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">-- Choose Exam --</option>
                {examsList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department} - Sem {e.semester})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedExamId && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Subject Name *</label>
              <input
                type="text"
                placeholder="e.g. DBMS, OS, Python"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          )}

          {selectedExam && (
            <div className="flex items-end gap-2">
              {selectedExam.status !== "Results Published" ? (
                <button
                  onClick={() => updateExamMutation.mutate({ id: selectedExamId, updates: { status: "Results Published" } })}
                  disabled={updateExamMutation.isPending}
                  className="w-full px-4 py-2 text-white text-xs font-semibold bg-slate-900 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 h-9"
                >
                  Publish &amp; Lock Results
                </button>
              ) : (
                <button
                  onClick={() => updateExamMutation.mutate({ id: selectedExamId, updates: { status: "Completed" } })}
                  disabled={updateExamMutation.isPending}
                  className="w-full px-4 py-2 border text-foreground text-xs font-semibold hover:bg-accent/40 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 h-9 rounded-xl"
                >
                  Reopen Results Editing
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {selectedExamId && selectedSubject && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs">Enter Student Marks ({selectedSubject})</h3>
            <button
              onClick={() => saveResultsMutation.mutate({ id: selectedExamId, subject: selectedSubject, marksData: marksList })}
              disabled={saveResultsMutation.isPending || selectedExam?.status === "Results Published"}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="size-4" /> Save Marks Draft
            </button>
          </div>

          {isResultsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Retrieving student ledger...</span>
            </div>
          ) : marksList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No student records to display. Verify that students are registered for this exam's cohort.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Roll Number</th>
                    <th className="px-4 py-3 text-center w-28">Internal (0-30)</th>
                    <th className="px-4 py-3 text-center w-28">External (0-70)</th>
                    <th className="px-4 py-3 text-center w-28">Total (0-100)</th>
                    <th className="px-4 py-3 text-center w-20">Credits</th>
                    <th className="px-4 py-3 text-center w-20">Grade</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {marksList.map((m, idx) => (
                    <tr key={m.student_id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">{m.full_name}</td>
                      <td className="px-4 py-3 font-mono">{m.roll_number}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={m.internal_marks === null || m.internal_marks === undefined ? "" : m.internal_marks}
                          onChange={(e) => handleInternalMarkChange(idx, e.target.value)}
                          disabled={selectedExam?.status === "Results Published"}
                          className="rounded border px-2 py-1 text-center w-16 bg-background focus:border-primary outline-none disabled:opacity-60 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          value={m.external_marks === null || m.external_marks === undefined ? "" : m.external_marks}
                          onChange={(e) => handleExternalMarkChange(idx, e.target.value)}
                          disabled={selectedExam?.status === "Results Published"}
                          className="rounded border px-2 py-1 text-center w-16 bg-background focus:border-primary outline-none disabled:opacity-60 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{m.marks === null || m.marks === undefined ? "0" : m.marks}</span>
                          {m.grace_applied && (
                            <Badge tone="warning" className="text-[9px] py-0 px-1 font-mono">Grace +{m.grace_marks}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={m.credits}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...marksList];
                            updated[idx].credits = val;
                            setMarksList(updated);
                          }}
                          disabled={selectedExam?.status === "Results Published"}
                          className="rounded border px-2 py-1 text-center w-12 bg-background focus:border-primary outline-none disabled:opacity-60 text-xs"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-sm ${m.grade === "F" ? "text-rose-600" : "text-indigo-600"}`}>{m.grade || "F"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {selectedExam?.status === "Results Published" && m.result_id ? (
                          <button
                            onClick={() => {
                              const reason = prompt("Enter reason for requesting correction:");
                              if (!reason) return;
                              const proposedInternal = prompt("Enter proposed Internal marks (0-30):", String(m.internal_marks || 0));
                              if (proposedInternal === null) return;
                              const proposedExternal = prompt("Enter proposed External marks (0-70):", String(m.external_marks || m.marks || 0));
                              if (proposedExternal === null) return;

                              requestCorrectionMutation.mutate({
                                result_id: m.result_id,
                                new_internal_marks: parseFloat(proposedInternal),
                                new_external_marks: parseFloat(proposedExternal),
                                reason
                              });
                            }}
                            className="px-2 py-1 rounded bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition cursor-pointer"
                          >
                            Request Edit
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Editable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
