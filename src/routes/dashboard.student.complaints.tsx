import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Send } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { complaints } from "@/lib/student-data";

export const Route = createFileRoute("/dashboard/student/complaints")({
  component: ComplaintSubmission,
});

function ComplaintSubmission() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaint Submission"
        desc="Submit complaints, track complaint status, and view resolution history."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: complaints.length.toString(), tone: "info" as const },
          { label: "Pending", value: complaints.filter(c => c.status === "Pending").length.toString(), tone: "warn" as const },
          { label: "Resolved", value: complaints.filter(c => c.status === "Resolved").length.toString(), tone: "success" as const },
          { label: "In Progress", value: complaints.filter(c => c.status === "In Progress").length.toString(), tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Submit Complaint</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["Infrastructure", "Academic", "Hostel", "Canteen", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Subject" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <textarea placeholder="Describe your complaint in detail..." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-sm">Attach supporting documents</span>
              </label>
              <input type="file" className="text-sm" />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Send className="size-4" /> Submit Complaint
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-indigo" />
            <h3 className="font-semibold">Complaint Categories</h3>
          </div>
          <div className="space-y-3">
            {[
              { category: "Infrastructure", description: "Lab equipment, classroom facilities, etc." },
              { category: "Academic", description: "Grades, faculty issues, curriculum, etc." },
              { category: "Hostel", description: "Room maintenance, facilities, etc." },
              { category: "Canteen", description: "Food quality, hygiene, etc." },
              { category: "Other", description: "Any other issues not listed above." },
            ].map(item => (
              <div key={item.category} className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer">
                <div className="text-sm font-medium">{item.category}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Complaint History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Category", "Subject", "Date", "Status"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {complaints.map(complaint => (
                <tr key={complaint.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{complaint.category}</td>
                  <td className="py-3 px-4">{complaint.subject}</td>
                  <td className="py-3 px-4">{complaint.date}</td>
                  <td className="py-3 px-4">
                    <Badge tone={complaint.status === "Resolved" ? "success" : complaint.status === "In Progress" ? "info" : "warn"}>
                      {complaint.status}
                    </Badge>
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
