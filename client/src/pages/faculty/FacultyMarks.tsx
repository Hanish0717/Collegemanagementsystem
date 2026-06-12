import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Save, Search } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function FacultyMarks() {
  const [marks, setMarks] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("Data Structures");
  const [term, setTerm] = useState("Mid-Term");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/api/faculty-module/performance");
        if (res.data?.success && res.data?.data) {
          const mapped = res.data.data.map((p: any, index: number) => ({
            id: p.studentId || `STU${100 + index}`,
            name: p.student,
            marks: p.overall || 80,
            grade: p.overall >= 90 ? "A+" : p.overall >= 80 ? "A" : p.overall >= 70 ? "B+" : "B",
            status: "Pending",
            attendance: p.attendance || 85
          }));
          setMarks(mapped);
        }
      } catch (err) {
        console.error("Error loading students for marks:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchStudents();
  }, []);

  const handleMarksChange = (id: string, newMarks: number) => {
    setMarks(prev => prev.map(m => {
      if (m.id === id) {
        let grade = "C";
        if (newMarks >= 90) grade = "A+";
        else if (newMarks >= 80) grade = "A";
        else if (newMarks >= 70) grade = "B+";
        else if (newMarks >= 60) grade = "B";
        
        return { ...m, marks: newMarks, grade };
      }
      return m;
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const student of marks) {
        const emailSafe = `${student.name.toLowerCase().replace(/\s+/g, "")}@college.com`;
        await api.post("/api/faculty-module/marks", {
          studentEmail: emailSafe,
          subject: selectedSubject,
          credits: 4,
          marks: Number(student.marks),
          grade: student.grade,
          semester: "Sem 5"
        });
      }
      setMarks(prev => prev.map(m => ({ ...m, status: "Submitted" })));
      alert("Marks submitted successfully!");
    } catch (err: any) {
      console.error("Error saving marks:", err);
      alert(err.response?.data?.message || "Failed to submit marks to backend");
    } finally {
      setLoading(false);
    }
  };

  const filteredMarks = marks.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = marks.map(m => ({
    student: m.name.split(" ")[0],
    marks: m.marks,
    attendance: m.attendance
  }));

  if (fetching) {
    return (
      <div className="space-y-6">
        <PageHeader title="Internal Marks Entry" desc="Loading students and grades..." />
        <div className="p-8 text-center text-muted-foreground">Loading marks entry console...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internal Marks Entry"
        desc="Enter and manage internal marks for students with grade calculation and performance tracking."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: marks.length.toString(), tone: "info" as const },
          { label: "Submitted", value: marks.filter(m => m.status === "Submitted").length.toString(), tone: "success" as const },
          { label: "Pending", value: marks.filter(m => m.status === "Pending").length.toString(), tone: "warn" as const },
          { label: "Average Score", value: marks.length > 0 ? `${Math.round(marks.reduce((sum, m) => sum + Number(m.marks), 0) / marks.length)}%` : "0%", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" 
            />
          </div>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Mid-Term", "Final", "Assignment", "Quiz"].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </Card>

      {marks.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Marks Entry Table</h3>
            <Badge tone="info">{selectedSubject}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Student ID", "Student Name", "Subject", "Internal Marks", "Grade", "Status"].map(
                    (column) => (
                      <th
                        key={column}
                        className="text-left py-3 px-4 font-semibold text-muted-foreground"
                      >
                        {column}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMarks.map(mark => (
                  <tr key={mark.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{mark.id}</td>
                    <td className="py-3 px-4 font-medium">{mark.name}</td>
                    <td className="py-3 px-4"><Badge tone="info">{selectedSubject}</Badge></td>
                    <td className="py-3 px-4">
                      <input 
                        type="number" 
                        value={mark.marks} 
                        onChange={(e) => handleMarksChange(mark.id, Number(e.target.value))}
                        max={100} 
                        className="w-20 rounded-lg border bg-background px-3 py-1.5 text-sm" 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        tone={
                          mark.grade.startsWith("A")
                            ? "success"
                            : mark.grade.startsWith("B")
                              ? "info"
                              : "warn"
                        }
                      >
                        {mark.grade}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={mark.status === "Submitted" ? "success" : "warn"}>
                        {mark.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary disabled:opacity-50"
            >
              <Save className="size-4" /> {loading ? "Submitting..." : "Submit Marks"}
            </button>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No student profiles found under your mentorship.
        </Card>
      )}

      {marks.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold mb-4">Performance Analytics</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="student" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="attendance" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="marks" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Grade Distribution</h3>
            <div className="space-y-3">
              {[
                { grade: "A+ (90-100)", count: marks.filter(m => m.grade === "A+").length },
                { grade: "A (80-89)", count: marks.filter(m => m.grade === "A").length },
                { grade: "B+ (70-79)", count: marks.filter(m => m.grade === "B+").length },
                { grade: "B (60-69)", count: marks.filter(m => m.grade === "B").length },
                { grade: "C (Below 60)", count: marks.filter(m => m.grade === "C").length },
              ].map((item) => {
                const percentage = marks.length > 0 ? `${Math.round((item.count / marks.length) * 100)}%` : "0%";
                return (
                  <div
                    key={item.grade}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
                  >
                    <span className="text-sm font-medium">{item.grade}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{item.count} students</span>
                      <Badge tone="info">{percentage}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
