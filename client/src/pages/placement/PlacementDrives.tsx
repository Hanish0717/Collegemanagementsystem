import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { drives } from "@/mock/mockData";

export function PlacementDrives() {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "ongoing" | "completed">("upcoming");

  const upcoming = drives.filter((d) => d.status === "Upcoming");
  const ongoing = drives.filter((d) => d.status === "Ongoing");
  const completed = drives.filter((d) => d.status === "Completed");

  const DriveCard = ({ drive }: { drive: (typeof drives)[0] }) => (
    <Card className="hover:-translate-y-1 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{drive.company}</h3>
          <p className="text-sm text-muted-foreground mt-1">{drive.role}</p>
        </div>
        <Badge
          tone={
            drive.status === "Upcoming" ? "info" : drive.status === "Ongoing" ? "warn" : "success"
          }
        >
          {drive.status}
        </Badge>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Drive Date:</span>
          <span className="font-medium">{new Date(drive.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Venue:</span>
          <span className="font-medium">{drive.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Deadline:</span>
          <span className="font-medium">
            {new Date(drive.applicationDeadline).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Applications:</span>
          <span className="font-medium">{drive.studentCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 bg-gradient-soft rounded-lg mb-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Rounds</div>
          <div className="font-bold text-lg">{drive.rounds}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Applicants</div>
          <div className="font-bold text-lg">{drive.studentCount}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
          Details
        </button>
        <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
          Edit
        </button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drive Management"
        desc="Manage recruitment drives, schedules and timelines."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Create Drive
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setSelectedTab("upcoming")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "upcoming"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setSelectedTab("ongoing")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "ongoing"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Ongoing ({ongoing.length})
        </button>
        <button
          onClick={() => setSelectedTab("completed")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            selectedTab === "completed"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Completed ({completed.length})
        </button>
      </div>

      {/* Upcoming Drives */}
      {selectedTab === "upcoming" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}

      {/* Ongoing Drives */}
      {selectedTab === "ongoing" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ongoing.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}

      {/* Completed Drives */}
      {selectedTab === "completed" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completed.map((drive) => (
            <DriveCard key={drive.id} drive={drive} />
          ))}
        </div>
      )}

      {/* Calendar-style Schedule */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">June Drive Schedule</h3>
          <Badge tone="info">
            {drives.filter((d) => d.date.startsWith("2026-06")).length} drives
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Array.from({ length: 14 }, (_, i) => i + 10).map((day) => {
            const dayDrives = drives.filter((d) => new Date(d.date).getDate() === day);
            return (
              <div
                key={day}
                className="min-h-28 rounded-xl border bg-background/60 p-2 hover:bg-accent/50 transition"
              >
                <div className="text-xs font-semibold text-muted-foreground mb-2">Jun {day}</div>
                <div className="space-y-1.5">
                  {dayDrives.length === 0 && (
                    <div className="text-[11px] text-muted-foreground">No drive</div>
                  )}
                  {dayDrives.map((drive) => (
                    <div key={drive.id} className="rounded-lg bg-gradient-soft border p-2">
                      <div className="text-xs font-medium truncate">{drive.company}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{drive.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline View */}
      <Card>
        <h3 className="font-semibold mb-6">Drive Timeline</h3>
        <div className="space-y-4">
          {drives.map((drive, idx) => (
            <div key={drive.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`size-10 rounded-lg grid place-items-center font-bold text-sm text-white ${
                    drive.status === "Upcoming"
                      ? "bg-blue-500"
                      : drive.status === "Ongoing"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < drives.length - 1 && <div className="w-1 h-8 bg-muted mt-2" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{drive.company}</div>
                    <div className="text-sm text-muted-foreground mt-1">{drive.role}</div>
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div>📅 {new Date(drive.date).toLocaleDateString()}</div>
                      <div>📍 {drive.venue}</div>
                      <div>👥 {drive.studentCount} applications</div>
                    </div>
                  </div>
                  <Badge
                    tone={
                      drive.status === "Upcoming"
                        ? "info"
                        : drive.status === "Ongoing"
                          ? "warn"
                          : "success"
                    }
                  >
                    {drive.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Drive Details Table */}
      <Card>
        <h3 className="font-semibold mb-4">All Drives Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                  Deadline
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Applications
                </th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rounds</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drives.map((drive) => (
                <tr key={drive.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{drive.company}</td>
                  <td className="py-3 px-4">{drive.role}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {new Date(drive.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {new Date(drive.applicationDeadline).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center font-medium">{drive.studentCount}</td>
                  <td className="py-3 px-4">
                    <Badge tone="info">{drive.rounds} rounds</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-center">
                      <Badge
                        tone={
                          drive.status === "Upcoming"
                            ? "info"
                            : drive.status === "Ongoing"
                              ? "warn"
                              : "success"
                        }
                      >
                        {drive.status}
                      </Badge>
                    </div>
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
