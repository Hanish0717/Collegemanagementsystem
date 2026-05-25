import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bed, Plus, Search, Building2, User } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { roomAllocations, availableRooms, roomOccupancyData } from "@/lib/hostel-data";

export const Route = createFileRoute("/dashboard/hostel/rooms")({
  component: RoomAllocation,
});

function RoomAllocation() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Allocation"
        desc="Manage room assignments, availability status, and allocation history."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Allocation
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Rooms", value: "250", tone: "info" as const },
          { label: "Occupied", value: "198", tone: "success" as const },
          { label: "Available", value: "52", tone: "warn" as const },
          { label: "Occupancy Rate", value: "79%", tone: "success" as const },
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
            <input placeholder="Search by room number, student name..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Floors", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"].map(f => <option key={f}>{f}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Blocks", "Block A", "Block B", "Block C", "Block D"].map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Occupied", "Available"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Room Allocation Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Room Number", "Student Name", "Department", "Floor", "Room Type", "Occupancy Status", "Actions"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {roomAllocations.map(allocation => (
                  <tr key={allocation.roomNumber} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{allocation.roomNumber}</td>
                    <td className="py-3 px-4">{allocation.studentName || <span className="text-muted-foreground">-</span>}</td>
                    <td className="py-3 px-4">{allocation.department ? <Badge tone="info">{allocation.department}</Badge> : <span className="text-muted-foreground">-</span>}</td>
                    <td className="py-3 px-4 text-muted-foreground">{allocation.floor}</td>
                    <td className="py-3 px-4">{allocation.roomType}</td>
                    <td className="py-3 px-4">
                      <Badge tone={allocation.occupancyStatus === "Occupied" ? "success" : "warn"}>
                        {allocation.occupancyStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="size-5 text-indigo" />
            <h3 className="font-semibold">Available Rooms</h3>
          </div>
          <div className="space-y-2">
            {availableRooms.map(room => (
              <div key={room.roomNumber} className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{room.roomNumber}</span>
                  <Badge tone="success">Available</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{room.floor} • {room.roomType} • Capacity: {room.capacity}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bed className="size-5 text-indigo" />
            <h3 className="font-semibold">Room Occupancy Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={roomOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="occupied" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="available" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Allocation History</h3>
          </div>
          <div className="space-y-2">
            {[
              { student: "Rahul Sharma", room: "A-101", date: "Jan 15, 2026", action: "Allocated" },
              { student: "Priya Patel", room: "A-102", date: "Jan 16, 2026", action: "Allocated" },
              { student: "Amit Kumar", room: "A-103", date: "Jan 17, 2026", action: "Allocated" },
              { student: "Sneha Reddy", room: "A-105", date: "Jan 18, 2026", action: "Allocated" },
              { student: "Vikram Singh", room: "B-201", date: "Jan 19, 2026", action: "Allocated" },
            ].map(history => (
              <div key={history.student} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {history.student.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{history.student}</div>
                  <div className="text-xs text-muted-foreground">{history.room} • {history.date}</div>
                </div>
                <Badge tone="success">{history.action}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
