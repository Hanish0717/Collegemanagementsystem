import { useState } from "react";
import { Search, Printer, Check, X, FileText } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function ExamHallTickets() {
  const [students, setStudents] = useState([
    { id: "S101", name: "Student Demo", roll: "CS100001", attendance: 92.5, feeStatus: "No Due", eligible: true },
    { id: "S102", name: "Alice Smith", roll: "CS100002", attendance: 86.4, feeStatus: "No Due", eligible: true },
    { id: "S103", name: "Bob Johnson", roll: "CS100003", attendance: 71.2, feeStatus: "Due Pending", eligible: false },
    { id: "S104", name: "Charlie Brown", roll: "CS100004", attendance: 88.0, feeStatus: "Due Pending", eligible: false }
  ]);

  const [search, setSearch] = useState("");

  const handlePrint = (name: string) => {
    toast.success(`Generating Hall Ticket PDF for ${name}...`);
  };

  const handleToggleEligibility = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, eligible: !s.eligible } : s));
    toast.success("Eligibility override updated successfully!");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hall Ticket & Eligibility Control"
        desc="Audit student fee dues and attendance logs to verify eligibility, override restrictions, and generate final hall tickets."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students Audited", value: String(students.length), tone: "info" as const },
          { label: "Eligible Automatically", value: String(students.filter(s => s.attendance >= 75 && s.feeStatus === "No Due").length), tone: "success" as const },
          { label: "Blocked / Ineligible", value: String(students.filter(s => !s.eligible).length), tone: "danger" as const },
          { label: "Manual Overrides Active", value: String(students.filter(s => s.eligible && (s.attendance < 75 || s.feeStatus !== "No Due")).length), tone: "warn" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Eligibility
            </Badge>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-semibold text-base">Student Eligibility Roster</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Roll No & Student", "Attendance %", "Fee Account Status", "Status", "Manual Toggle", "Print Action"].map(col => (
                  <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map(s => {
                const autoEligibility = s.attendance >= 75 && s.feeStatus === "No Due";
                return (
                  <tr key={s.id} className="hover:bg-accent/40 transition">
                    <td className="py-4 px-4 font-medium">
                      <div className="text-sm">{s.name}</div>
                      <div className="text-xs text-indigo-600 font-mono font-bold">{s.roll}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.attendance < 75 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold">
                      <span className={`${s.feeStatus === "Due Pending" ? "text-red-600" : "text-emerald-600"}`}>
                        {s.feeStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge tone={s.eligible ? "success" : "danger"}>
                        {s.eligible ? "Eligible" : "Ineligible / Blocked"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleEligibility(s.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                          s.eligible 
                            ? "hover:bg-red-50 hover:text-red-700 hover:border-red-200" 
                            : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        }`}
                      >
                        {s.eligible ? "Block Student" : "Allow Override"}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handlePrint(s.name)}
                        disabled={!s.eligible}
                        className="p-2 border rounded-xl hover:bg-accent text-indigo-600 disabled:opacity-40 disabled:hover:bg-transparent"
                        title="Print Hall Ticket"
                      >
                        <Printer className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
