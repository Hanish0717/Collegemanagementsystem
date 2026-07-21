import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Loader2, CheckSquare, Calendar } from "lucide-react";
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

export function ExamHallTickets() {
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedSem, setSelectedSem] = useState("5");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [maxFeeInput, setMaxFeeInput] = useState<string>("0");

  // 1. Fetch Exams List
  const { data: examsList = [], isLoading: isExamsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  // Resolve active exam schedule for selected cohort
  const activeExam = examsList.find(e => 
    e.department === selectedDept && 
    Number(e.semester) === Number(selectedSem) &&
    e.status !== "Results Published"
  );

  useEffect(() => {
    if (activeExam) {
      setSelectedExamId(activeExam.id);
    } else {
      setSelectedExamId("");
    }
  }, [activeExam]);

  // 2. Fetch Eligibility Roster for the Selected Exam
  const { data: eligibilityResponse, isLoading: isRosterLoading, refetch } = useQuery<any>({
    queryKey: ["exams", selectedExamId, "hall-tickets"],
    queryFn: async () => {
      if (!selectedExamId) return null;
      const { data } = await api.get<{ success: boolean; maxFeeLimit: number; data: any[] }>(
        `/api/exams/${selectedExamId}/hall-tickets`
      );
      return data;
    },
    enabled: !!selectedExamId
  });

  const eligibilityList = eligibilityResponse?.data || [];
  const activeMaxFeeLimit = eligibilityResponse?.maxFeeLimit ?? 0;

  useEffect(() => {
    if (eligibilityResponse) {
      setMaxFeeInput(String(eligibilityResponse.maxFeeLimit ?? 0));
    }
  }, [eligibilityResponse]);

  // Update fee limit mutation
  const updateFeeLimitMutation = useMutation({
    mutationFn: async (limit: number) => {
      await api.put(`/api/exams/${selectedExamId}`, { max_fee_due_limit: limit });
    },
    onSuccess: () => {
      refetch();
      toast.success("Maximum fee due limit updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update fee limit");
    }
  });

  const handleSaveFeeLimit = () => {
    const limitNum = Number(maxFeeInput);
    if (isNaN(limitNum) || limitNum < 0) {
      toast.error("Please enter a valid non-negative fee limit amount.");
      return;
    }
    updateFeeLimitMutation.mutate(limitNum);
  };

  // 3. Approve Hall Ticket Mutation
  const approveHallTicketMutation = useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      await api.post(`/api/exams/${id}/hall-tickets/approve`, { student_id: studentId });
    },
    onSuccess: () => {
      refetch();
      toast.success("Hall Ticket generated and approved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve hall ticket");
    }
  });

  // 4. Bulk Approve Eligible Mutation
  const approveAllEligibleMutation = useMutation({
    mutationFn: async ({ id, studentIds }: { id: string; studentIds: string[] }) => {
      await Promise.all(studentIds.map(studentId => 
        api.post(`/api/exams/${id}/hall-tickets/approve`, { student_id: studentId })
      ));
    },
    onSuccess: () => {
      refetch();
      toast.success("All eligible hall tickets generated and approved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to bulk approve eligible hall tickets");
    }
  });

  const handleApprove = (studentId: string) => {
    if (!selectedExamId) return;
    approveHallTicketMutation.mutate({ id: selectedExamId, studentId });
  };

  const handleApproveAllEligible = () => {
    if (!selectedExamId) return;
    const eligibleIds = eligibilityList
      .filter((s: any) => s.eligible && s.status !== "Approved")
      .map((s: any) => s.id);

    if (eligibleIds.length === 0) {
      toast.info("No pending eligible students to approve.");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve all ${eligibleIds.length} eligible student hall tickets in a single click?`)) return;
    approveAllEligibleMutation.mutate({ id: selectedExamId, studentIds: eligibleIds });
  };

  const handlePrintMock = (studentName: string) => {
    toast.success(`Printing signed Hall Ticket PDF for ${studentName}...`);
  };

  // Sort non-eligible students first, then filter by search query
  const sortedRoster = [...eligibilityList].sort((a, b) => {
    const aPass = a.eligible;
    const bPass = b.eligible;
    if (!aPass && bPass) return -1;
    if (aPass && !bPass) return 1;
    return 0;
  });

  const filteredRoster = sortedRoster.filter(s =>
    (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hall Ticket & Eligibility Control"
        desc="Audit student fee dues and attendance logs to verify eligibility, override restrictions, and generate final hall tickets."
      />

      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSearch("");
              }}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => {
                setSelectedSem(e.target.value);
                setSearch("");
              }}
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary cursor-pointer"
            >
              <option value="1">Sem 1</option>
              <option value="2">Sem 2</option>
              <option value="3">Sem 3</option>
              <option value="4">Sem 4</option>
              <option value="5">Sem 5</option>
              <option value="6">Sem 6</option>
              <option value="7">Sem 7</option>
              <option value="8">Sem 8</option>
            </select>
          </div>

          {selectedExamId && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search by name or roll number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {!selectedExamId ? (
        <Card className="p-8 text-center text-xs text-muted-foreground flex flex-col justify-center items-center gap-2 bg-slate-50/50 border border-dashed">
          <Calendar className="size-8 text-slate-400" />
          <div className="font-semibold text-slate-700">No Active Exam Schedule Found</div>
          <p className="max-w-[340px] leading-relaxed">
            There is no exam scheduled for {selectedDept} - Sem {selectedSem} yet. Please configure the exam schedule under the <strong>"Schedule Exam"</strong> console first.
          </p>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
            <div>
              <h3 className="font-semibold text-xs text-slate-800">Student Eligibility Roster</h3>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                Active Schedule: <span className="font-semibold text-indigo-600">{activeExam?.name}</span> (Non-Eligible shown first)
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 border bg-slate-50/80 rounded-xl px-3 py-1.5 text-xs shadow-sm">
                <span className="font-semibold text-slate-550">Max Fee Due Limit:</span>
                <span className="text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  className="w-24 bg-transparent border-b border-slate-300 outline-none text-center font-bold font-mono focus:border-indigo-500 text-slate-800 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={maxFeeInput}
                  onChange={(e) => setMaxFeeInput(e.target.value)}
                  placeholder="e.g. 10000"
                />
                <button
                  onClick={handleSaveFeeLimit}
                  disabled={updateFeeLimitMutation.isPending}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
                >
                  {updateFeeLimitMutation.isPending ? "Setting..." : "Set"}
                </button>
              </div>
              <button
                onClick={handleApproveAllEligible}
                disabled={approveAllEligibleMutation.isPending || isRosterLoading}
                className="px-3 py-2 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <CheckSquare className="size-3.5" /> Approve All Eligible
              </button>
            </div>
          </div>

          {isRosterLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Auditing roster data...</span>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No students found matching current search or cohort criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/40 uppercase text-[10px] tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-center py-3 px-4">Registered Exams</th>
                    <th className="text-center py-3 px-4">Attendance %</th>
                    <th className="text-center py-3 px-4">Fee Balance (INR)</th>
                    <th className="text-center py-3 px-4">Criteria Pass</th>
                    <th className="text-center py-3 px-4">Hall Ticket Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRoster.map((s) => {
                    const criteriaPass = Boolean(s.eligible);
                    return (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{s.full_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{s.roll_number}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            Number(s.registered_exams_count) === 0
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : Number(s.registered_exams_count) < Number(s.total_exams_count)
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            {s.registered_exams_count || 0} / {s.total_exams_count || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          <span className={s.attendance_percentage < 75 ? "text-rose-600" : "text-emerald-600"}>
                            {s.attendance_percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                          {Number(s.unpaid_fees || 0) > 0 ? (
                            <span className="text-rose-600">₹{Number(s.unpaid_fees).toLocaleString('en-IN')} Due</span>
                          ) : (
                            <span className="text-emerald-600">No Dues (₹0)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge tone={criteriaPass ? "success" : "danger"}>
                            {criteriaPass ? "Passed" : "Failed Criteria"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge tone={s.status === "Approved" ? "success" : "info"}>
                            {s.status || "Awaiting Audit"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                          {s.status !== "Approved" ? (
                            <button
                              onClick={() => handleApprove(s.id)}
                              disabled={approveHallTicketMutation.isPending}
                              className="px-2.5 py-1 text-white text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                              Approve &amp; Generate
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePrintMock(s.full_name)}
                              className="px-2.5 py-1 text-indigo-700 text-[10px] font-bold bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                            >
                              Print Ticket
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
