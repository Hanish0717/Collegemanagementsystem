import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Calendar } from "lucide-react";
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
  start_date: string;
  end_date: string;
  status: string;
}

export function ExamSchedule() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Theory End-Sem");
  const [newDept, setNewDept] = useState("CSE");
  const [newYear, setNewYear] = useState("3");
  const [newSem, setNewSem] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 1. Fetch Exam Schedules
  const { data: examsList = [], isLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[] }>("/api/exams");
      return data.data || [];
    }
  });

  // Fetch subjects for dynamic preview
  const { data: previewSubjects = [], isLoading: isPreviewLoading } = useQuery<any[]>({
    queryKey: ["schedule-preview-subjects", newDept, newYear, newSem],
    queryFn: async () => {
      if (!newDept || !newYear || !newSem) return [];
      const { data } = await api.get<{ success: boolean; data: any[] }>(
        `/api/exams/courses?department=${newDept}&year=${newYear}&semester=${newSem}`
      );
      const list = data.data || [];
      return list.map((c: any) => ({
        code: c.course_code,
        name: c.course_name,
        semester: c.semester,
        ...c
      }));
    },
    enabled: !!newDept && !!newYear && !!newSem
  });

  // 2. Create Exam Schedule Mutation
  const createExamMutation = useMutation({
    mutationFn: async (newExam: any) => {
      const { data } = await api.post("/api/exams", newExam);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam schedule successfully registered!");
      setNewName("");
      setStartDate("");
      setEndDate("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to schedule exam");
    }
  });

  // 3. Delete Exam Schedule Mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam schedule removed successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete exam schedule");
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !startDate || !endDate) {
      toast.error("Please fill in name and start/end dates.");
      return;
    }

    createExamMutation.mutate({
      name: newName,
      type: newType,
      department: newDept,
      year: Number(newYear),
      semester: Number(newSem),
      start_date: startDate,
      end_date: endDate,
      status: "Scheduled"
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this scheduled exam?")) return;
    deleteExamMutation.mutate(id);
  };

  const getSemestersForYear = (yr: string) => {
    switch (yr) {
      case "1": return [1, 2];
      case "2": return [3, 4];
      case "3": return [5, 6];
      case "4": return [7, 8];
      default: return [1, 2];
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Examinations"
        desc="Create new academic exam slots, mid-terms, final theory papers, and practical dates."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-xs">All Registered Exam Schedules</h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Retrieving exam calendars...</span>
            </div>
          ) : examsList.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No examination schedules cataloged. Register one using the scheduler panel.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/40 uppercase text-[10px] tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-3 px-4">Exam Name</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Department &amp; Sem</th>
                    <th className="text-left py-3 px-4">Dates &amp; Duration</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {examsList.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold text-slate-800">{e.name}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{e.type}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-indigo-600">{e.department}</span> (Year {e.year} - Sem {e.semester})
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                        {new Date(e.start_date).toLocaleDateString()} to {new Date(e.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={e.status === "Ongoing" ? "warn" : e.status === "Results Published" ? "success" : "info"}>
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={deleteExamMutation.isPending}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Scheduler Form */}
        <Card className="h-fit">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Calendar className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-xs text-slate-800">Add Exam Schedule</h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4 text-xs">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Exam Description *</label>
              <input
                type="text"
                placeholder="e.g. R20 Sem 5 Theory Finals"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Exam Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="Theory End-Sem">Theory End-Sem</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Practical">Practical</option>
                  <option value="Supplementary">Supplementary</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Target Year</label>
                <select
                  value={newYear}
                  onChange={(e) => {
                    const yr = e.target.value;
                    setNewYear(yr);
                    const sems = getSemestersForYear(yr);
                    if (!sems.includes(Number(newSem))) {
                      setNewSem(String(sems[0]));
                    }
                  }}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Semester</label>
                <select
                  value={newSem}
                  onChange={(e) => setNewSem(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
                >
                  {getSemestersForYear(newYear).map(s => (
                    <option key={s} value={String(s)}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 px-3 py-2 outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
            
            {/* Subjects Preview */}
            <div className="border rounded-xl p-3 bg-slate-50/50 space-y-2">
              <div className="font-semibold text-slate-700 flex justify-between">
                <span>Associated Subjects ({previewSubjects.length})</span>
                {isPreviewLoading && <Loader2 className="size-3.5 text-indigo-600 animate-spin" />}
              </div>
              {previewSubjects.length === 0 ? (
                <div className="text-[10px] text-muted-foreground italic">No subjects configured for {newDept} - Sem {newSem}.</div>
              ) : (
                <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
                  {previewSubjects.map((sub: any) => (
                    <div key={sub.code} className="flex justify-between items-center text-[10px] p-1.5 bg-background rounded-lg border">
                      <span className="font-medium text-slate-800">{sub.name}</span>
                      <span className="font-mono text-indigo-600 font-semibold">{sub.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={createExamMutation.isPending}
              className="w-full mt-2 py-2 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Plus className="size-4" /> Schedule Exam
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
