import { useState } from "react";
import { Plus, Search, Calendar, Award, Trash2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function ExamInvigilation() {
  const [duties, setDuties] = useState([
    { id: "D01", name: "Dr. John Smith", email: "faculty@college.com", room: "LH-101", date: "2026-07-14", time: "09:00 AM - 12:00 PM" },
    { id: "D02", name: "Dr. Rajesh Kumar", email: "rajesh.kumar@college.com", room: "LH-102", date: "2026-07-15", time: "09:00 AM - 12:00 PM" },
    { id: "D03", name: "Dr. Vikram Rao", email: "vikram.rao@college.com", room: "LH-101", date: "2026-07-16", time: "01:00 PM - 04:00 PM" }
  ]);

  const [newFaculty, setNewFaculty] = useState("Dr. John Smith");
  const [newRoom, setNewRoom] = useState("LH-101");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("09:00 AM - 12:00 PM");

  const facultyEmails: Record<string, string> = {
    "Dr. John Smith": "faculty@college.com",
    "Dr. Rajesh Kumar": "rajesh.kumar@college.com",
    "Dr. Vikram Rao": "vikram.rao@college.com",
    "Prof. Sarah Lin": "sarah.lin@college.com"
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      toast.error("Please pick a duty date.");
      return;
    }

    const item = {
      id: `D${String(duties.length + 1).padStart(2, "0")}`,
      name: newFaculty,
      email: facultyEmails[newFaculty] || "faculty@college.com",
      room: newRoom,
      date: newDate,
      time: newTime
    };

    setDuties(prev => [...prev, item]);
    toast.success("Invigilation duty allocated successfully!");
    setNewDate("");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this duty allocation?")) return;
    setDuties(prev => prev.filter(d => d.id !== id));
    toast.success("Duty allocation cancelled.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invigilation Duty Allocation"
        desc="Assign teaching staff to examination supervisory duties and track conflicts or slots."
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-base">Allocated Supervisor Roster</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Faculty Member", "Supervision Hall", "Scheduled Date", "Time Slot", "Actions"].map(col => (
                    <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {duties.map(d => (
                  <tr key={d.id} className="hover:bg-accent/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-sm">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.email}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold">{d.room}</td>
                    <td className="py-4 px-4 text-xs font-mono">{d.date}</td>
                    <td className="py-4 px-4 text-xs">{d.time}</td>
                    <td className="py-4 px-4">
                      <button onClick={() => handleDelete(d.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Plus className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-base">Assign Supervision Duty</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Select Faculty Member</label>
              <select
                value={newFaculty}
                onChange={(e) => setNewFaculty(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {["Dr. John Smith", "Dr. Rajesh Kumar", "Dr. Vikram Rao", "Prof. Sarah Lin"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Lecture Hall / Room</label>
              <select
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                {["LH-101", "LH-102", "LH-201", "LH-202", "AUDI-A"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Duty Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none"
              >
                <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Plus className="size-4" /> Allocate Duty
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
