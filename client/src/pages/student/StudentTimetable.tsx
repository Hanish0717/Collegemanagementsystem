import { createFileRoute } from "@tanstack/react-router";
import { MapPin, User } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { timetableSlots } from "@/mock/studentData";

export function StudentTimetable() {
  const timeSlots = ["09:00 AM", "11:00 AM", "02:00 PM"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="StudentTimetable"
        desc="View your weekly class schedule, faculty information, and room assignments."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Classes", value: "15", tone: "info" as const },
          { label: "Today's Classes", value: "4", tone: "success" as const },
          { label: "Lab Sessions", value: "3", tone: "info" as const },
          { label: "Free Periods", value: "2", tone: "warn" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              This Week
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weekly StudentTimetable</h3>
          <Badge tone="info">Semester 5</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Time</th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="text-center py-3 px-4 font-semibold text-muted-foreground"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="py-3 px-4 font-medium text-xs bg-gradient-soft">{time}</td>
                  {days.map((day) => {
                    const slot = timetableSlots.find((s) => s.day === day && s.time === time);
                    return (
                      <td key={day} className="py-2 px-2 text-center">
                        {slot ? (
                          <div className="p-2 rounded-lg bg-gradient-soft border">
                            <div className="text-xs font-medium">{slot.subject}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {slot.faculty}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
                              <MapPin className="size-2.5" /> {slot.room}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg border border-dashed text-muted-foreground text-xs">
                            Free
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Today's Schedule</h3>
        <div className="space-y-2">
          {timetableSlots
            .filter((s) => s.day === "Monday")
            .map((slot) => (
              <div
                key={slot.time}
                className="flex items-center gap-4 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {slot.time.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{slot.subject}</div>
                  <div className="text-xs text-muted-foreground">{slot.faculty}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">{slot.time}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-2.5" /> {slot.room}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="size-5 text-indigo" />
          <h3 className="font-semibold">Faculty Information</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(timetableSlots.map((s) => s.faculty))).map((faculty) => (
            <div key={faculty} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-semibold">
                  {faculty
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{faculty}</div>
                  <div className="text-xs text-muted-foreground">Faculty</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
