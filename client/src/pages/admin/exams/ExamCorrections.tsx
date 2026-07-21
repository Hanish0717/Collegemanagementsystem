import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

export function ExamCorrections() {
  // 1. Fetch pending corrections list
  const { data: correctionsList = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["corrections-pending"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: any[] }>("/api/exams/corrections/pending");
      return data.data || [];
    }
  });

  // 2. Approve/Reject mutation
  const approveCorrectionMutation = useMutation({
    mutationFn: async (payload: { request_id: string; action: "Approved" | "Rejected"; remarks: string }) => {
      await api.post("/api/exams/corrections/approve", payload);
    },
    onSuccess: (_, variables) => {
      refetch();
      toast.success(`Marks correction successfully ${variables.action.toLowerCase()}!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to process request");
    }
  });

  const handleAction = (requestId: string, action: "Approved" | "Rejected") => {
    const remarks = prompt(`Enter remarks for ${action.toLowerCase()}:`);
    if (remarks === null) return;
    approveCorrectionMutation.mutate({ request_id: requestId, action, remarks });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Correction approvals"
        desc="Moderators review log requests from faculty members to correct locked grades. Audits old vs proposed marks."
      />

      <Card>
        <h3 className="font-semibold text-xs mb-4">Pending Requests Ledger</h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Retrieving pending revaluations...</span>
          </div>
        ) : correctionsList.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
            <AlertCircle className="size-5 text-slate-400" />
            <span>No pending correction requests currently require review.</span>
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
    </div>
  );
}
