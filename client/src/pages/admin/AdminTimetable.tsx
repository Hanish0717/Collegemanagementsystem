import { createFileRoute } from "@tanstack/react-router";
import { Edit, MapPin, Plus, Search, User } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { departmentDistributionAdmin, timetableSlots } from "@/mock/adminData";



export function AdminTimetable() {
  const timeSlots = ["09:00 AM", "11:00 AM", "02:00 PM"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable Scheduling"
        desc="Manage weekly timetables, faculty allocation, classroom assignment and subject scheduling."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Slot
          </button>
        }
      />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search timetable by subject, faculty, room..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {departmentDistributionAdmin.map(dept => <option key={dept.name}>{dept.name}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weekly Timetable</h3>
          <Badge tone="info">Current Week</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Time</th>
                {days.map(day => (
                  <th key={day} className="text-center py-3 px-4 font-semibold text-muted-foreground">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="py-3 px-4 font-medium text-xs bg-gradient-soft">{time}</td>
                  {days.map(day => {
                    const slot = timetableSlots.find(s => s.day === day && s.time === time);
                    return (
                      <td key={day} className="py-2 px-2 text-center">
                        {slot ? (
                          <div className="p-2 rounded-lg bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer">
                            <div className="text-xs font-medium">{slot.subject}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">{slot.faculty}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
                              <MapPin className="size-2.5" /> {slot.room}
                            </div>
                          </div>
                        ) : (
                          <button className="w-full p-2 rounded-lg border border-dashed text-muted-foreground hover:border-primary hover:text-primary transition text-xs">
                            + Add
                          </button>
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

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Faculty Allocation</h3>
          </div>
          <div className="space-y-2">
            {timetableSlots.slice(0, 4).map(slot => (
              <div key={slot.day + slot.time} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {slot.day.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{slot.faculty}</div>
                    <div className="text-xs text-muted-foreground">{slot.subject}</div>
                  </div>
                </div>
                <Badge tone="info">{slot.time}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Add New Slot</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {days.map(day => <option key={day}>{day}</option>)}
              </select>
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {timeSlots.map(time => <option key={time}>{time}</option>)}
              </select>
              <input placeholder="Subject" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input placeholder="Faculty name" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input placeholder="Room number" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {departmentDistributionAdmin.map(dept => <option key={dept.name}>{dept.name}</option>)}
              </select>
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Edit className="size-4" /> Add to Timetable
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
