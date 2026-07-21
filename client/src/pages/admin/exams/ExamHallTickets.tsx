import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
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
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [search, setSearch] = useState("");

  // 1. Fetch Exams List
  const { data: examsList = [], isLoading: isExamsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  // 2. Fetch Eligibility Roster for the Selected Exam
  const { data: eligibilityList = [], isLoading: isRosterLoading, refetch } = useQuery<any[]>({
    queryKey: ["exams", selectedExamId, "hall-tickets"],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/${selectedExamId}/hall-tickets`
      );
      return data.data || [];
    },
    enabled: !!selectedExamId
  });

  // 3. Approve Hall Ticket Mutation
  const approveHallTicketMutation = useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      await api.post(`/api/exams/${id}/hall-tickets/approve`, { studentId });
    },
    onSuccess: () => {
      refetch();
      toast.success("Hall Ticket generated and approved successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve hall ticket");
    }
  });

  const handleApprove = (studentId: string) => {
    if (!selectedExamId) return;
    approveHallTicketMutation.mutate({ id: selectedExamId, studentId });
  };

  const handlePrintMock = (studentName: string) => {
    toast.success(`Printing signed Hall Ticket PDF for ${studentName}...`);
  };

  const filteredRoster = eligibilityList.filter(s =>
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
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Exam Schedule</label>
            {isExamsLoading ? (
              <div className="text-xs py-2 text-muted-foreground animate-pulse">Loading exams...</div>
            ) : (
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setSearch("");
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

      {selectedExamId && (
        <Card className="space-y-4">
          <h3 className="font-semibold text-xs">Student Eligibility Roster</h3>

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
                    <th className="text-center py-3 px-4">Attendance %</th>
                    <th className="text-center py-3 px-4">Fee Balance (INR)</th>
                    <th className="text-center py-3 px-4">Criteria Pass</th>
                    <th className="text-center py-3 px-4">Hall Ticket Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRoster.map((s) => {
                    const criteriaPass = s.attendance_pct >= 75 && Number(s.pending_amount || 0) <= 0;
                    return (
                      <tr key={s.student_id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{s.full_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{s.roll_number}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          <span className={s.attendance_pct < 75 ? "text-rose-600" : "text-emerald-600"}>
                            {s.attendance_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                          {Number(s.pending_amount || 0) > 0 ? (
                            <span className="text-rose-600">₹{Number(s.pending_amount).toLocaleString('en-IN')} Due</span>
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
                          <Badge tone={s.ticket_status === "Approved" ? "success" : "info"}>
                            {s.ticket_status || "Awaiting Audit"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                          {s.ticket_status !== "Approved" ? (
                            <button
                              onClick={() => handleApprove(s.student_id)}
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
