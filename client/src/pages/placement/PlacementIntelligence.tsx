import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell
} from "recharts";
import { Sparkles, AlertTriangle, TrendingUp, ShieldCheck, Award, FileText, CheckCircle2, ArrowRight, Brain, Lightbulb, Users, Target, Loader2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementIntelligenceData, type PlacementIntelligenceData } from "@/services/placementService";
import { toast } from "sonner";

export function PlacementIntelligence() {
  const [data, setData] = useState<PlacementIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      const res = await fetchPlacementIntelligenceData();
      setData(res);
    } catch (err) {
      console.warn("Failed to load placement intelligence data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntelligence();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Placement Prediction & Analytics Intelligence 🤖"
        desc="Machine learning probability models, ATS resume analysis, skill gap metrics, at-risk candidate detection, recommendation engine, and management insights."
      />

      {loading ? (
        <Card className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm font-semibold text-muted-foreground">Running AI Predictive Scoring & Skill Gap Engine...</span>
          </div>
        </Card>
      ) : data ? (
        <>
          {/* EXECUTIVE AI INSIGHTS BANNER */}
          <Card className="bg-gradient-soft border">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-gradient-primary text-white grid place-items-center shrink-0 shadow-md">
                <Brain className="size-5" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                    Executive AI Management Insights
                  </h3>
                  <Badge tone="success">ML Model v3.2 Active</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {data.aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-background/60 p-2.5 rounded-xl border">
                      <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* KEY INTELLIGENCE SUMMARY WIDGETS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Batch Probability", val: `${data.summary.overallBatchProbability}%`, tone: "success" },
              { label: "Evaluated Candidates", val: data.summary.totalEvaluated, tone: "info" },
              { label: "High Readiness", val: data.summary.highReadinessCount, tone: "success" },
              { label: "Moderate Readiness", val: data.summary.moderateReadinessCount, tone: "warn" },
              { label: "At-Risk Candidates", val: data.summary.atRiskCount, tone: "danger" },
              { label: "Avg Resume ATS Score", val: `${data.summary.avgResumeScore}%`, tone: "info" }
            ].map((widget) => (
              <Card key={widget.label} className="p-3 text-center">
                <div className="text-xs text-muted-foreground truncate">{widget.label}</div>
                <div className="text-xl font-bold text-foreground mt-1">{widget.val}</div>
                <Badge tone={widget.tone as any} className="mt-2 text-[9px]">AI Metric</Badge>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* STUDENT PLACEMENT PROBABILITY & RESUME SCORE TABLE */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div>
                    <h3 className="font-bold text-base">Student Placement Probability & Skill Readiness</h3>
                    <p className="text-xs text-muted-foreground">Predictive probability scores based on CGPA, backlogs, skills & resume.</p>
                  </div>
                  <Badge tone="info">ML Predictive Matrix</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student Name & ID</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Dept & CGPA</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Resume ATS</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Placement Probability</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Recommendation Engine Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.studentPredictions.map((st) => (
                        <tr key={st.studentId} className="hover:bg-accent/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-sm text-foreground">{st.studentName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{st.studentId}</div>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            <div>{st.department}</div>
                            <div className="text-[10px] text-emerald-600 font-bold">{st.cgpa} CGPA</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold">{st.resumeScore}%</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-extrabold text-sm text-emerald-600">{st.placementProbability}%</span>
                              <Badge tone={st.riskTier === "High Readiness" ? "success" : st.riskTier === "Moderate" ? "warn" : "danger"} className="text-[9px] mt-0.5">
                                {st.riskTier}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right max-w-xs">
                            <span className="text-[11px] text-muted-foreground font-medium">{st.recommendedAction}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* SKILL GAP ANALYSIS CHART */}
              <Card>
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div>
                    <h3 className="font-bold text-base">Skill Gap Analysis Widget</h3>
                    <p className="text-xs text-muted-foreground">Corporate industry demand vs current batch proficiency gap.</p>
                  </div>
                  <Badge tone="warn">Gap Identification</Badge>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.skillGapAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="skill" stroke="currentColor" className="text-[11px]" />
                      <YAxis stroke="currentColor" className="text-[11px]" />
                      <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderRadius: "12px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="industryDemand" fill="#4F46E5" name="Industry Demand %" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="batchProficiency" fill="#10B981" name="Batch Proficiency %" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* AT-RISK STUDENTS PANEL & RECOMMENDATION ENGINE */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-rose-500" />
                    <div>
                      <h3 className="font-bold text-base">At-Risk Candidates Panel</h3>
                      <p className="text-xs text-muted-foreground">Flagged candidates with probability &lt; 60%.</p>
                    </div>
                  </div>
                  <Badge tone="danger">{data.riskStudents.length} Flagged</Badge>
                </div>

                <div className="space-y-4">
                  {data.riskStudents.map((rs) => (
                    <div key={rs.studentId} className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-foreground">{rs.studentName}</div>
                          <div className="text-[10px] text-muted-foreground">{rs.department} • CGPA: {rs.cgpa} • Backlogs: {rs.backlogs}</div>
                        </div>
                        <Badge tone="danger">{rs.placementProbability}%</Badge>
                      </div>

                      <div className="p-2.5 rounded-lg bg-background border text-xs space-y-1">
                        <div className="font-bold text-primary flex items-center gap-1">
                          <Sparkles className="size-3.5" /> Recommendation Engine Action
                        </div>
                        <div className="text-muted-foreground">{rs.recommendedAction}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* DEPARTMENT PERFORMANCE TREND WIDGET */}
              <Card>
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <h3 className="font-bold text-base">Department Readiness Matrix</h3>
                  <Badge tone="info">Branch Velocity</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  {data.departmentPerformance.map((dept) => (
                    <div key={dept.department} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{dept.department}</span>
                        <span className="text-emerald-600 font-bold">{dept.avgProbability}% Readiness</span>
                      </div>
                      <div className="w-full bg-accent h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-primary h-full rounded-full" style={{ width: `${dept.avgProbability}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
