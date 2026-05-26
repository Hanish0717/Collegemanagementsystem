import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Plus, Search, Upload } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { assignments } from "@/mock/facultyData";



export function FacultyAssignments() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Assignments"
        desc="Create and manage assignments, track submissions, and download student work."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> New Assignment
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Assignments", value: assignments.length.toString(), tone: "info" as const },
          { label: "Active", value: assignments.filter(a => a.status === "Active").length.toString(), tone: "success" as const },
          { label: "Pending Review", value: assignments.filter(a => a.status === "Review").length.toString(), tone: "warn" as const },
          { label: "Total Submissions", value: "155", tone: "info" as const },
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
            <input placeholder="Search assignments..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Subjects", "Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Active", "Review", "Completed"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Assignment Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assignments.map(assignment => (
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
              <button className="mt-4 w-full px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition flex items-center justify-center gap-1">
                <Download className="size-3" /> View Submissions
              </button>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Create New Assignment</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <input placeholder="Assignment title" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="date" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input type="time" className="rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <textarea placeholder="Assignment description..." rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload className="size-4 text-muted-foreground" />
                <span className="text-sm">Attach files</span>
              </label>
              <input type="file" className="text-sm" />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Publish Assignment
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Pending Submissions</h3>
          <div className="space-y-2">
            {[
              { student: "Rahul Sharma", assignment: "Data Structures Assignment", time: "2h ago" },
              { student: "Priya Patel", assignment: "Algorithm Analysis", time: "5h ago" },
              { student: "Amit Kumar", assignment: "Database Design Project", time: "1d ago" },
              { student: "Sneha Reddy", assignment: "Web Development Task", time: "2d ago" },
            ].map(sub => (
              <div key={sub.student} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                  {sub.student.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{sub.student}</div>
                  <div className="text-xs text-muted-foreground">{sub.assignment}</div>
                </div>
                <Badge tone="info">{sub.time}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
