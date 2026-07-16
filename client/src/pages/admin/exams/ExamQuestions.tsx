import { useState } from "react";
import { Plus, Search, FileText, Download, Check, AlertCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function ExamQuestions() {
  const [papers, setPapers] = useState([
    { id: "Q01", subject: "Data Structures & Algorithms", code: "CS-301", department: "CSE", difficulty: "Medium", uploadedBy: "Dr. John Smith", status: "Approved" },
    { id: "Q02", subject: "Database Management Systems", code: "CS-302", department: "CSE", difficulty: "Medium", uploadedBy: "Dr. Rajesh Kumar", status: "Approved" },
    { id: "Q03", subject: "Microprocessors & Interfacing", code: "EC-305", department: "ECE", difficulty: "Hard", uploadedBy: "Dr. Vikram Rao", status: "Pending Review" }
  ]);

  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDept, setNewDept] = useState("CSE");
  const [newDiff, setNewDiff] = useState("Medium");
  const [newUploader, setNewUploader] = useState("Dr. John Smith");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newCode) {
      toast.error("Please fill in the subject name and code.");
      return;
    }

    const item = {
      id: `Q${String(papers.length + 1).padStart(2, "0")}`,
      subject: newSubject,
      code: newCode,
      department: newDept,
      difficulty: newDiff,
      uploadedBy: newUploader,
      status: "Pending Review"
    };

    setPapers(prev => [...prev, item]);
    toast.success("Question paper uploaded to registry!");
    setNewSubject("");
    setNewCode("");
  };

  const handleApprove = (id: string) => {
    setPapers(prev => prev.map(p => p.id === id ? { ...p, status: "Approved" } : p));
    toast.success("Question paper approved!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank Repository"
        desc="Audit submitted faculty question papers, verify syllabus coverage, and approve files for final printing."
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-base">Question Paper Submissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Subject & Code", "Uploader / Faculty", "Diff Level", "Status", "Actions"].map(col => (
                    <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {papers.map(p => (
                  <tr key={p.id} className="hover:bg-accent/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-sm">{p.subject}</div>
                      <div className="text-xs text-indigo-600 font-mono font-bold">{p.code} | {p.department}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-muted-foreground">{p.uploadedBy}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.difficulty === "Hard" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone={p.status === "Approved" ? "success" : "warn"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 flex items-center gap-2">
                      {p.status === "Pending Review" && (
                        <button onClick={() => handleApprove(p.id)} className="p-1 hover:bg-emerald-50 rounded text-emerald-600" title="Approve Paper">
                          <Check className="size-4" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-indigo-50 rounded text-indigo-600" title="Download Blueprint">
                        <Download className="size-4" />
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
            <h3 className="font-semibold text-base">Submit Question Paper</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject Name</label>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Design of Machine Elements"
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject Code</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. ME-402"
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {["CSE", "AIML", "AIDS", "ECE", "EEE", "MECH"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Difficulty Level</label>
              <select
                value={newDiff}
                onChange={(e) => setNewDiff(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Author / Reviewer</label>
              <select
                value={newUploader}
                onChange={(e) => setNewUploader(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {["Dr. John Smith", "Dr. Rajesh Kumar", "Dr. Vikram Rao", "Prof. Sarah Lin"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Plus className="size-4" /> Upload Paper
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
