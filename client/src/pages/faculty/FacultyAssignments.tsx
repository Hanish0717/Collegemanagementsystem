import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Plus, Search, Upload } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { assignments } from "@/mock/facultyData";
import api from "@/lib/api";

export function FacultyAssignments() {
  const [list, setList] = useState<any[]>(assignments);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Data Structures");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/api/faculty-module/assignments");
      if (res.data?.success && res.data?.data) {
        const dbAssignments = res.data.data.map((a: any) => ({
          id: a._id,
          title: a.title,
          subject: a.subject,
          dueDate: new Date(a.dueDate).toISOString().split('T')[0],
          status: new Date(a.dueDate) > new Date() ? "Active" : "Review",
          submissions: a.submissions.length,
          description: a.description,
          submissionsList: a.submissions
        }));
        if (dbAssignments.length > 0) {
          setList(dbAssignments);
        }
      }
    } catch (err) {
      console.error("Error loading assignments:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert("Please enter a title and due date.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/faculty-module/assignments", {
        title,
        description,
        subject,
        dueDate,
        department: "CSE",
        year: 3,
        semester: 5,
        section: "A"
      });
      if (res.data?.success) {
        alert("Assignment published successfully!");
        setTitle("");
        setDescription("");
        setDueDate("");
        fetchAssignments();
      }
    } catch (err: any) {
      console.error("Error publishing assignment:", err);
      alert(err.response?.data?.message || "Failed to publish assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (assignmentId: string, studentId: string) => {
    const scoreStr = prompt("Enter score (0-100):");
    if (scoreStr === null) return;
    const score = Number(scoreStr);
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Please enter a valid score between 0 and 100.");
      return;
    }

    try {
      const res = await api.post("/api/faculty-module/assignments/grade", {
        assignmentId,
        studentId,
        score
      });
      if (res.data?.success) {
        alert("Graded successfully!");
        fetchAssignments();
      }
    } catch (err: any) {
      console.error("Error grading submission:", err);
      alert(err.response?.data?.message || "Failed to grade submission");
    }
  };

  const filteredAssignments = list.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "All Subjects" || a.subject === subjectFilter;
    const matchesStatus = statusFilter === "All Status" || a.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const pendingSubmissionsList: any[] = [];
  list.forEach(a => {
    if (a.submissionsList) {
      a.submissionsList.forEach((sub: any) => {
        if (!sub.graded) {
          pendingSubmissionsList.push({
            assignmentId: a.id,
            studentId: sub.student?._id,
            studentName: sub.student?.fullName || "Student User",
            assignmentTitle: a.title,
            time: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Recently",
            fileUrl: sub.fileUrl
          });
        }
      });
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Assignments"
        desc="Create and manage assignments, track submissions, and download student work."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: list.length.toString(), tone: "info" as const },
          { label: "Active", value: list.filter(a => a.status === "Active").length.toString(), tone: "success" as const },
          { label: "Pending Review", value: pendingSubmissionsList.length.toString(), tone: "warn" as const },
          { label: "Total Submissions", value: list.reduce((sum, a) => sum + a.submissions, 0).toString(), tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              placeholder="Search assignments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" 
            />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Subjects", "Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Active", "Review", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Assignment Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAssignments.map(assignment => (
            <Card key={assignment.id} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                  <FileText className="size-5" />
                </div>
                <Badge tone={assignment.status === "Active" ? "success" : "warn"}>{assignment.status}</Badge>
              </div>
              <h3 className="font-semibold text-sm">{assignment.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{assignment.subject}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{assignment.dueDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Submissions</span>
                  <span className="font-medium">{assignment.submissions}/45</span>
                </div>
              </div>
              <button 
                onClick={() => alert(`Showing submissions for ${assignment.title}`)}
                className="mt-4 w-full px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition flex items-center justify-center gap-1"
              >
                <Download className="size-3" /> View Submissions
              </button>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Create New Assignment</h3>
          <form onSubmit={handlePublish} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <input 
              placeholder="Assignment title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
              required
            />
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-sm" 
                required
              />
            </div>
            <textarea 
              placeholder="Assignment description..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3} 
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" 
            />
            <button type="submit" disabled={loading} className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              {loading ? "Publishing..." : "Publish Assignment"}
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Pending Submissions</h3>
          <div className="space-y-2">
            {pendingSubmissionsList.length > 0 ? (
              pendingSubmissionsList.map(sub => (
                <div key={sub.studentId + sub.assignmentId} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                  <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                    {sub.studentName.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{sub.studentName}</div>
                    <div className="text-xs text-muted-foreground">{sub.assignmentTitle} • {sub.time}</div>
                  </div>
                  <button 
                    onClick={() => handleGrade(sub.assignmentId, sub.studentId)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-primary text-white text-xs font-semibold"
                  >
                    Grade
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
                No pending submissions to grade.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
