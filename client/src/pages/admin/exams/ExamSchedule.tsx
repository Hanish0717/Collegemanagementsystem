import { useState } from "react";
import { Plus, Search, Calendar, Landmark, BookOpen, Trash2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function ExamSchedule() {
  const [exams, setExams] = useState([
    { id: "EX01", name: "Semester 5 Mid-Term", type: "Mid-Term", department: "CSE", dates: "2026-07-14 to 2026-07-17", status: "Ongoing" },
    { id: "EX02", name: "Semester 3 Final Practical", type: "Practical", department: "ECE", dates: "2026-07-22 to 2026-07-25", status: "Scheduled" },
    { id: "EX03", name: "Semester 1 Theory Finals", type: "Theory End-Sem", department: "MECH", dates: "2026-08-05 to 2026-08-15", status: "Scheduled" }
  ]);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Theory End-Sem");
  const [newDept, setNewDept] = useState("CSE");
  const [newDates, setNewDates] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDates) {
      toast.error("Please fill in the exam name and dates.");
      return;
    }

    const item = {
      id: `EX${String(exams.length + 1).padStart(2, "0")}`,
      name: newName,
      type: newType,
      department: newDept,
      dates: newDates,
      status: "Scheduled"
    };

    setExams(prev => [...prev, item]);
    toast.success("Exam schedule successfully registered!");
    setNewName("");
    setNewDates("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this scheduled exam?")) return;
    setExams(prev => prev.filter(e => e.id !== id));
    toast.success("Exam schedule removed.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Examinations"
        desc="Create new academic exam slots, mid-terms, final theory papers, and practical dates."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Active Schedules", value: String(exams.length), tone: "info" as const },
          { label: "Ongoing Exams", value: String(exams.filter(e => e.status === "Ongoing").length), tone: "warn" as const },
          { label: "Scheduled Exams", value: String(exams.filter(e => e.status === "Scheduled").length), tone: "success" as const },
          { label: "Departments Covered", value: "3 Departments", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Exam Cell
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-base">All Registered Exam Schedules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Exam ID & Name", "Type", "Department", "Dates & Duration", "Status", "Actions"].map(col => (
                    <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {exams.map(e => (
                  <tr key={e.id} className="hover:bg-accent/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs text-indigo-600 font-bold mb-1">{e.id}</div>
                      <div className="font-semibold text-sm">{e.name}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium">{e.type}</td>
                    <td className="py-4 px-4 text-xs">{e.department}</td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">{e.dates}</td>
                    <td className="py-4 px-4">
                      <Badge tone={e.status === "Ongoing" ? "warn" : "success"}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <button onClick={() => handleDelete(e.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Plus className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-base">Schedule New Exam</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Exam Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Semester 5 Finals"
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Exam Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Theory End-Sem">Theory End-Sem</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="Practical">Practical</option>
                <option value="Supplementary">Supplementary</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Target Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {["CSE", "AIML", "AIDS", "ECE", "EEE", "MECH", "CIVIL"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Exam Dates / Duration</label>
              <input
                value={newDates}
                onChange={(e) => setNewDates(e.target.value)}
                placeholder="e.g. 2026-07-22 to 2026-07-25"
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Plus className="size-4" /> Add Exam
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
