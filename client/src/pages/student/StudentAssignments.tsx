import { createFileRoute } from "@tanstack/react-router";
import { FileText, Upload } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { assignments } from "@/mock/studentData";

export function StudentAssignments() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment Submission"
        desc="View pending assignments, submit your work, and track submission status."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Assignments",
            value: assignments.length.toString(),
            tone: "info" as const,
          },
          {
            label: "Pending",
            value: assignments.filter((a) => !a.submitted).length.toString(),
            tone: "warn" as const,
          },
          {
            label: "Submitted",
            value: assignments.filter((a) => a.submitted).length.toString(),
            tone: "success" as const,
          },
          { label: "Overdue", value: "1", tone: "danger" as const },
        ].map((stat) => (
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
        <h3 className="font-semibold mb-4">Assignment Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                  <FileText className="size-5" />
                </div>
                <Badge tone={assignment.status === "Submitted" ? "success" : "warn"}>
                  {assignment.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm">{assignment.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{assignment.subject}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{assignment.dueDate}</span>
                </div>
              </div>
              {!assignment.submitted && (
                <button className="mt-4 w-full px-3 py-2 rounded-lg bg-gradient-primary text-white text-xs font-medium hover:opacity-90 transition">
                  Submit Now
                </button>
              )}
            </Card>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Submit Assignment</h3>
        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
            {assignments
              .filter((a) => !a.submitted)
              .map((a) => (
                <option key={a.id}>{a.title}</option>
              ))}
          </select>
          <textarea
            placeholder="Assignment description or notes..."
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-sm">Upload file</span>
            </label>
            <input type="file" className="text-sm" />
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
            Submit Assignment
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Submission History</h3>
        <div className="space-y-2">
          {assignments
            .filter((a) => a.submitted)
            .map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                  {assignment.subject.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {assignment.subject} • Submitted on {assignment.dueDate}
                  </div>
                </div>
                <Badge tone="success">Submitted</Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
