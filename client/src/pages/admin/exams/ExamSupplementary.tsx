import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, Users, Loader2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function ExamSupplementary() {
  // Fetch at-risk students list (reusing risk analytics query which details student failures)
  const { data: analytics = {} as any, isLoading } = useQuery({
    queryKey: ["exam-supplementary-analytics"],
    queryFn: async () => {
      // Find the first exam to fetch analytics for, or we can generalise
      const { data: examsData } = await api.get<{ success: boolean; data: any[] }>("/api/exams");
      const activeExam = examsData.data?.[0];
      if (!activeExam) return { atRiskStudents: [] };

      const { data: analData } = await api.get<{ success: boolean; data: any }>(
        `/api/exams/${activeExam.id}/extended-analytics`
      );
      return analData.data || { atRiskStudents: [] };
    }
  });

  const backlogRoster = analytics.atRiskStudents || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplementary Exam registration & Roster"
        desc="Audit failed student logs, track supplementary registries, and plan remedial testing sessions."
      />

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Backlog Roster Count", value: String(backlogRoster.length), tone: "danger" as const, icon: Users },
          { label: "Supplementary Timetables", value: "3 Scheduled", tone: "info" as const, icon: Clock },
          { label: "Pending Evaluations", value: "0 Pending", tone: "success" as const, icon: AlertTriangle }
        ].map((s, idx) => (
          <Card key={idx}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold mt-2 text-slate-800">{s.value}</div>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <s.icon className="size-4" />
              </div>
            </div>
            <Badge tone={s.tone} className="mt-3">Action Required</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-xs mb-4">Active Backlog / Supplementary Roster</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Analysing backlog registrations...</span>
          </div>
        ) : backlogRoster.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground">
            No students currently logged with active fail marks (Grade F) or backlogs in the query range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/40 uppercase text-[10px] tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left py-3 px-4">Student</th>
                  <th className="text-left py-3 px-4">Roll Number</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-center py-3 px-4">Active Backlogs</th>
                  <th className="text-right py-3 px-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {backlogRoster.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-4 px-4 font-semibold text-slate-800">{item.student_name}</td>
                    <td className="py-4 px-4 font-mono">{item.roll_number}</td>
                    <td className="py-4 px-4 font-semibold">{item.department}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge tone="danger" className="font-bold text-[10px]">{item.risk_factor || "Fail Grade Logged"}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Eligible for Remedial
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
