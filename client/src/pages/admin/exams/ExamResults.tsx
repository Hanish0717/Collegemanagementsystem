import { useState } from "react";
import { Plus, Search, FileSpreadsheet, Eye, RefreshCw } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function ExamResults() {
  const [results, setResults] = useState([
    { id: "R01", name: "Semester 5 Mid-Term", department: "CSE", batch: "2023-2027", studentsCount: 45, status: "Published" },
    { id: "R02", name: "Semester 3 Final Theory", department: "ECE", batch: "2024-2028", studentsCount: 38, status: "Awaiting Moderation" },
    { id: "R03", name: "Semester 1 Practical Results", department: "MECH", batch: "2025-2029", studentsCount: 40, status: "Pending Upload" }
  ]);

  const handlePublish = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: "Published" } : r));
    toast.success("Exam results published to student and parent dashboards successfully!");
  };

  const handleModerate = (id: string) => {
    toast.success("Moderation algorithms applied. Ready for review.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results Publisher Portal"
        desc="Moderate results spreadsheets, compute final GPAs/CGPAs, and publish grades to student/parent modules."
      />

      <Card className="space-y-4">
        <h3 className="font-semibold text-base">Results Sheets Roster</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Exam Sheet ID & Name", "Department", "Graded Batch", "Class Size", "Status", "Actions"].map(col => (
                  <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-accent/40 transition">
                  <td className="py-4 px-4">
                    <div className="font-mono text-xs text-indigo-600 font-bold mb-1">{r.id}</div>
                    <div className="font-semibold text-sm">{r.name}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold">{r.department}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground">{r.batch}</td>
                  <td className="py-4 px-4 text-xs font-mono">{r.studentsCount} Students</td>
                  <td className="py-4 px-4">
                    <Badge tone={r.status === "Published" ? "success" : r.status === "Awaiting Moderation" ? "warn" : "info"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 flex items-center gap-2">
                    {r.status === "Pending Upload" && (
                      <button className="px-2 py-1 bg-indigo-50 border rounded text-indigo-600 text-xs font-bold transition hover:bg-indigo-100">
                        Upload Marks
                      </button>
                    )}
                    {r.status === "Awaiting Moderation" && (
                      <>
                        <button onClick={() => handleModerate(r.id)} className="px-2 py-1 bg-amber-50 border rounded text-amber-600 text-xs font-bold transition hover:bg-amber-100 flex items-center gap-1">
                          <RefreshCw className="size-3" /> Moderate
                        </button>
                        <button onClick={() => handlePublish(r.id)} className="px-2 py-1 bg-emerald-600 border rounded text-white text-xs font-bold transition hover:bg-emerald-700">
                          Publish
                        </button>
                      </>
                    )}
                    {r.status === "Published" && (
                      <button className="p-1 hover:bg-accent rounded text-muted-foreground" title="View Published Grades">
                        <Eye className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
