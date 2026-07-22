import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Lock, Unlock, Loader2, Sparkles, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

export function ExamResults() {
  const queryClient = useQueryClient();
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // 1. Fetch Exams List
  const { data: examsList = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get("/api/exams");
      return data.data || [];
    }
  });

  // 2. Fetch Consolidated Results
  const { data: resultsData, isLoading: isResultsLoading, refetch } = useQuery({
    queryKey: ["exam-consolidated-results", selectedExamId, department, year, semester],
    queryFn: async () => {
      const { data } = await api.get(`/api/exams/${selectedExamId || 'all'}/results?department=${department}&semester=${semester}`);
      return data;
    }
  });

  // 3. Consolidate & Auto-Calculate Results Mutation
  const consolidateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        exam_id: selectedExamId || undefined,
        department,
        year: Number(year),
        semester: Number(semester)
      };
      const { data } = await api.post("/api/exams/results/consolidate", payload);
      return data;
    },
    onSuccess: (res) => {
      refetch();
      toast.success(res.message || "Results consolidated and grades calculated!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to consolidate results");
    }
  });

  // 4. Publish Results Mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        exam_id: selectedExamId || undefined,
        semester: Number(semester)
      };
      const { data } = await api.post("/api/exams/results/publish", payload);
      return data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      refetch();
      toast.success(res.message || "Semester results published successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to publish results");
    }
  });

  const resultsList = resultsData?.data || [];
  const stats = resultsData?.stats || {
    total: resultsList.length,
    passed: resultsList.filter((r: any) => r.status === 'Pass' || r.grade !== 'F').length,
    failed: resultsList.filter((r: any) => r.status === 'Fail' || r.grade === 'F').length,
    passPercentage: resultsList.length > 0 ? Math.round((resultsList.filter((r: any) => r.status === 'Pass' || r.grade !== 'F').length / resultsList.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Cell Results Publisher Portal"
        desc="Consolidate Internal Mid Marks (30M) and External Evaluated Copies (70M) to compute 100M grades, SGPA/CGPA, and publish semester results."
      />

      {/* Filter Header */}
      <Card className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="CSE">CSE - Computer Science</option>
              <option value="ECE">ECE - Electronics & Comm</option>
              <option value="EEE">EEE - Electrical Eng</option>
              <option value="MECH">MECH - Mechanical Eng</option>
              <option value="CIVIL">CIVIL - Civil Eng</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Year & Semester</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={year}
                onChange={e => {
                  setYear(e.target.value);
                  const yr = Number(e.target.value);
                  setSemester(yr === 1 ? '1' : yr === 2 ? '3' : yr === 3 ? '5' : '7');
                }}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs font-semibold"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-2 py-2 text-xs font-semibold"
              >
                {Number(year) === 1 && <><option value="1">Sem 1</option><option value="2">Sem 2</option></>}
                {Number(year) === 2 && <><option value="3">Sem 3</option><option value="4">Sem 4</option></>}
                {Number(year) === 3 && <><option value="5">Sem 5</option><option value="6">Sem 6</option></>}
                {Number(year) === 4 && <><option value="7">Sem 7</option><option value="8">Sem 8</option></>}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Select Scheduled Exam</label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-indigo-300 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="">-- All Semester Exams --</option>
              {examsList.map((e: any) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.department} - Sem {e.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => consolidateMutation.mutate()}
              disabled={consolidateMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="size-4" />
              {consolidateMutation.isPending ? 'Calculating...' : 'Consolidate & Auto-Calculate'}
            </button>
          </div>
        </div>
      </Card>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total} Students</div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">{department} - Sem {semester}</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passed Students</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
            <CheckCircle2 className="size-6 text-emerald-500" /> {stats.passed}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">Met Grade Requirements</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Backlogs / Failed</div>
          <div className="text-2xl font-black text-rose-600 mt-1 flex items-center gap-2">
            <AlertTriangle className="size-6 text-rose-500" /> {stats.failed}
          </div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1">Eligible for Supplementary</div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pass Percentage</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{stats.passPercentage}%</div>
          <div className="text-[11px] font-semibold text-indigo-600 mt-1">Cohort Academic Average</div>
        </Card>
      </div>

      {/* Main Results Table & Publish Action */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Consolidated Semester Grade Ledger</h3>
            <p className="text-xs text-slate-500">Includes 30 Marks Internal + 70 Marks External Evaluated Paper Copies.</p>
          </div>

          <button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || resultsList.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="size-4" />
            {publishMutation.isPending ? 'Publishing...' : 'Publish Results & Notify Students'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Roll No.</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-center">Internal (Max 30)</th>
                <th className="px-4 py-3 text-center">External (Max 70)</th>
                <th className="px-4 py-3 text-center">Total (Max 100)</th>
                <th className="px-4 py-3 text-center">Grade Letter</th>
                <th className="px-4 py-3 text-center">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {isResultsLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">Loading consolidated results...</td>
                </tr>
              ) : resultsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No consolidated results generated yet. Click <strong>"Consolidate & Auto-Calculate"</strong> above.
                  </td>
                </tr>
              ) : (
                resultsList.map((r: any) => {
                  const isPass = r.status === 'Pass' || (r.grade && r.grade !== 'F');
                  return (
                    <tr key={r.student_id || r.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">{r.roll_number || r.student?.roll_number}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.student_name || r.student?.full_name}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{r.internal_marks ?? 0} / 30</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{r.external_marks ?? 0} / 70</td>
                      <td className="px-4 py-3 text-center font-extrabold text-sm text-indigo-900 bg-indigo-50/50">
                        {r.total_marks ?? r.marks ?? 0} / 100
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          r.grade === 'O' || r.grade === 'A+' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          r.grade === 'A' || r.grade === 'B+' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          r.grade === 'B' || r.grade === 'C' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {r.grade || 'F'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPass ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            ✓ Pass
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            Fail (Backlog)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
