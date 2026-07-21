import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Loader2, Compass, AlertTriangle, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

export function ExamAnalytics() {
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // 1. Fetch Exams List
  const { data: examsList = [], isLoading: isExamsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  // 2. Fetch Extended Analytics for Selected Exam
  const { data: analytics = {} as any, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["exams", selectedExamId, "extended-analytics"],
    queryFn: async () => {
      if (!selectedExamId) return null;
      const { data } = await api.get<{ success: boolean; data: any }>(
        `/api/exams/${selectedExamId}/extended-analytics`
      );
      return data.data;
    },
    enabled: !!selectedExamId
  });

  // Chart data from analytics
  const passRatesMap = analytics?.passRatesByDept || {};
  const chartData = Object.keys(passRatesMap).map(dept => ({
    department: dept,
    passRate: parseFloat(passRatesMap[dept])
  }));

  const overallPassRate = analytics?.overallPassRate || "0.00";
  const overallAvg = analytics?.overallAverage || "0.00";
  const rankList = analytics?.rankList || [];
  const atRiskStudents = analytics?.atRiskStudents || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations Analytics Dashboard"
        desc="Audit general student academic metrics, average GPA distribution by branch, and pass rate progression."
      />

      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Examination</label>
            {isExamsLoading ? (
              <div className="text-xs py-2 text-muted-foreground animate-pulse">Loading exams...</div>
            ) : (
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
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
        </div>
      </Card>

      {selectedExamId && (
        <>
          {isAnalyticsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Compiling analytics matrices...</span>
            </div>
          ) : (
            <>
              {/* Counters */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "Overall Pass Rate", value: `${overallPassRate}%`, tone: "success" as const },
                  { label: "Class Average Score", value: `${overallAvg}%`, tone: "success" as const },
                  { label: "Top Performer Score", value: rankList[0] ? `${rankList[0].marks}%` : "N/A", tone: "info" as const },
                  { label: "At-Risk Candidates", value: String(atRiskStudents.length), tone: atRiskStudents.length > 0 ? "danger" as const : "success" as const },
                ].map(stat => (
                  <Card key={stat.label}>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="text-2xl font-bold mt-2 text-slate-800">{stat.value}</div>
                    <Badge tone={stat.tone} className="mt-3">
                      Dynamic Analytics
                    </Badge>
                  </Card>
                ))}
              </div>

              {/* Grid Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Chart card */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="size-5 text-indigo-600" />
                    <h3 className="font-semibold text-xs text-slate-800">Pass Percentage by Department</h3>
                  </div>
                  {chartData.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted-foreground">
                      No department data to display. Complete publishing grades to see comparison.
                    </div>
                  ) : (
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="department" stroke="#94A3B8" fontSize={10} />
                          <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}% Pass Rate`]} />
                          <Bar dataKey="passRate" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                {/* Rank list card */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="size-5 text-indigo-600" />
                    <h3 className="font-semibold text-xs text-slate-800">Top Performing Candidates (Rank List)</h3>
                  </div>
                  {rankList.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted-foreground">No rank logs found.</div>
                  ) : (
                    <div className="space-y-2">
                      {rankList.map((rank: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Rank #{idx+1}</span>
                            <div>
                              <span className="font-semibold text-slate-800 block">{rank.student_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{rank.roll_number}</span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-700">{rank.marks}% Average</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* At-Risk candidates list */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="size-5 text-rose-600" />
                  <h3 className="font-semibold text-xs text-slate-800">At-Risk Student Watchlist (Low Performance / Attendance)</h3>
                </div>
                {atRiskStudents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-emerald-600 font-semibold">
                    🎉 Excellent! All student credentials clear criteria checks.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-3">
                    {atRiskStudents.map((stud: any, idx: number) => (
                      <div key={idx} className="border border-red-200 bg-red-50/30 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-slate-800 block">{stud.student_name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{stud.roll_number}</span>
                          </div>
                          <Badge tone="danger" className="text-[8px] py-0 px-1">Risk Alert</Badge>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Risk Factors: <span className="font-bold text-rose-600">{stud.risk_factor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
