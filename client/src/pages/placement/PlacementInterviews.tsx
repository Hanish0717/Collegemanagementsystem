import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Video, Edit2, Plus } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { interviews } from "@/mock/mockData";

export function PlacementInterviews() {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const scheduled = interviews.filter((i) => i.status === "Scheduled");
  const pending = interviews.filter((i) => i.status === "Pending");
  const completed = interviews.filter((i) => i.status === "Completed");

  const interviewStats = [
    { label: "Total Interviews", value: interviews.length, color: "bg-blue-500" },
    { label: "Scheduled", value: scheduled.length, color: "bg-amber-500" },
    { label: "Pending", value: pending.length, color: "bg-purple-500" },
    { label: "Completed", value: completed.length, color: "bg-emerald-500" },
  ];

  const InterviewCard = ({ interview }: { interview: (typeof interviews)[0] }) => (
    <Card className="hover:-translate-y-1 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{interview.studentName}</h3>
          <p className="text-xs text-muted-foreground mt-1">{interview.company}</p>
        </div>
        <Badge tone={interview.status === "Scheduled" ? "success" : "warn"}>
          {interview.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="size-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center font-bold text-xs shrink-0">
            {interview.round}
          </div>
          <span className="text-muted-foreground">
            Round {interview.round} • {interview.mode}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">{interview.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">{interview.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {interview.mode === "Online" ? (
            <Video className="size-4 text-muted-foreground" />
          ) : (
            <MapPin className="size-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{interview.venue}</span>
        </div>
      </div>

      <div className="mb-3 p-2 bg-gradient-soft rounded-lg">
        <div className="text-xs text-muted-foreground mb-1">Panelists</div>
        <div className="text-xs font-medium space-y-0.5">
          {interview.panelists.map((p) => (
            <div key={p}>{p}</div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
          View
        </button>
        <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
          <Edit2 className="size-3 inline mr-1" /> Edit
        </button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Scheduling"
        desc="Manage interview calendars, panel assignments and timelines."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Schedule Interview
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {interviewStats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div
              className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Interview Calendar */}
      <Card>
        <h3 className="font-semibold mb-4">Interview Calendar</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <input type="date" className="w-full rounded-lg border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Select Time Slot</label>
            <select className="w-full rounded-lg border bg-background px-3 py-2">
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>02:00 PM</option>
              <option>03:00 PM</option>
            </select>
          </div>
        </div>
        <button className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium">
          Find Available Slots
        </button>
      </Card>

      {/* Scheduled Interviews */}
      <div>
        <h3 className="font-semibold mb-4">Scheduled Interviews ({scheduled.length})</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduled.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      </div>

      {/* Pending Interviews */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Pending Interviews ({pending.length})</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {/* Interview Details Table */}
      <Card>
        <h3 className="font-semibold mb-4">All Interviews Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Round</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Date & Time
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Mode</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Venue</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {interviews.map((interview) => (
                <tr key={interview.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{interview.studentName}</td>
                  <td className="py-3 px-4">{interview.company}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge tone="info">Round {interview.round}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    {interview.date} {interview.time}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge tone={interview.mode === "Online" ? "info" : "success"}>
                      {interview.mode}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm">{interview.venue}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      tone={
                        interview.status === "Scheduled"
                          ? "success"
                          : interview.status === "Pending"
                            ? "warn"
                            : "info"
                      }
                    >
                      {interview.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Panel Management */}
      <Card>
        <h3 className="font-semibold mb-4">Panel Management</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border flex items-start justify-between hover:bg-accent/50 transition">
            <div>
              <div className="font-medium">Dr. Rajesh Verma</div>
              <div className="text-xs text-muted-foreground">
                Google India • Technical Interviewer
              </div>
              <div className="text-xs mt-2">📅 3 interviews scheduled • ✓ 2 completed</div>
            </div>
            <button className="px-3 py-1 rounded text-xs text-blue-600 hover:bg-blue-50">
              Edit
            </button>
          </div>
          <div className="p-4 rounded-lg border flex items-start justify-between hover:bg-accent/50 transition">
            <div>
              <div className="font-medium">Priya Sharma</div>
              <div className="text-xs text-muted-foreground">Microsoft India • HR Interviewer</div>
              <div className="text-xs mt-2">📅 2 interviews scheduled • ✓ 1 completed</div>
            </div>
            <button className="px-3 py-1 rounded text-xs text-blue-600 hover:bg-blue-50">
              Edit
            </button>
          </div>
        </div>
        <button className="mt-3 w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition flex items-center justify-center gap-2">
          <Plus className="size-4" /> Add Panelist
        </button>
      </Card>

      {/* Interview Rounds */}
      <Card>
        <h3 className="font-semibold mb-4">Interview Round Types</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { round: 1, name: "Online Assessment", desc: "Aptitude, coding, logical reasoning" },
            { round: 2, name: "Technical Round", desc: "In-depth technical discussion" },
            { round: 3, name: "HR Round", desc: "HR discussion and cultural fit" },
            { round: 4, name: "Final Round", desc: "Management / Leadership discussion" },
            { round: 5, name: "Group Discussion", desc: "Soft skills and group interaction" },
          ].map((r) => (
            <div key={r.round} className="p-3 rounded-lg border bg-gradient-soft">
              <div className="font-medium text-sm mb-1">
                Round {r.round}: {r.name}
              </div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interview Feedback Template */}
      <Card>
        <h3 className="font-semibold mb-4">Interview Feedback Form</h3>
        <div className="space-y-4 p-4 border rounded-lg bg-gradient-soft">
          <div>
            <label className="text-sm font-medium block mb-2">Student Name</label>
            <input
              placeholder="Enter student name"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Rating (1-5)</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option>Select rating</option>
                <option>1 - Poor</option>
                <option>2 - Below Average</option>
                <option>3 - Average</option>
                <option>4 - Good</option>
                <option>5 - Excellent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Outcome</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option>Select outcome</option>
                <option>Selected</option>
                <option>Hold</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Feedback</label>
            <textarea
              placeholder="Enter interview feedback..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              rows={4}
            />
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
            Submit Feedback
          </button>
        </div>
      </Card>
    </div>
  );
}
