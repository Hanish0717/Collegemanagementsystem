import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Search, Phone, Mail, MapPin, Activity, GraduationCap } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { hostelStudents } from "@/mock/hostelData";

export function HostelStudents() {
  const studentAnalytics = [
    { department: "CSE", count: 120 },
    { department: "AIML", count: 95 },
    { department: "AIDS", count: 85 },
    { department: "IT", count: 60 },
    { department: "ECE", count: 52 },
    { department: "EEE", count: 36 },
    { department: "MECH", count: 42 },
    { department: "CIVIL", count: 28 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Students"
        desc="Manage hostel student profiles, room allocations, and attendance."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Users className="size-4" /> Add Student
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "396", tone: "info" as const },
          { label: "Active", value: "350", tone: "success" as const },
          { label: "Warning", value: "38", tone: "warn" as const },
          { label: "Inactive", value: "8", tone: "danger" as const },
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
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search by student name, ID, department..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {[
              "All Departments",
              "Computer Science & Engineering",
              "Artificial Intelligence & Machine Learning",
              "Artificial Intelligence & Data Science",
              "Cybersecurity",
              "Information Technology",
              "Electronics & Communication Engineering",
              "Electrical & Electronics Engineering",
              "Mechanical Engineering",
              "Civil Engineering"
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Active", "Warning", "Inactive"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Floors", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Hostel Student Cards</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {hostelStudents.map((student) => (
              <div
                key={student.id}
                className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center text-sm font-semibold">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.department}</div>
                    </div>
                  </div>
                  <Badge tone={student.status === "Active" ? "success" : "warn"}>
                    {student.status}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {student.roomNumber} • {student.floor}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="size-3" />
                    Attendance: {student.attendance}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="size-3" />
                    {student.emergencyContact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={studentAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="department" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Activity</h3>
          </div>
          <div className="space-y-2">
            {[
              { student: "Rahul Sharma", activity: "Checked into mess", time: "10 min ago" },
              { student: "Priya Patel", activity: "Visitor checked out", time: "25 min ago" },
              { student: "Amit Kumar", activity: "Complaint resolved", time: "1 hour ago" },
              { student: "Sneha Reddy", activity: "Fee payment received", time: "2 hours ago" },
              {
                student: "Vikram Singh",
                activity: "Room maintenance completed",
                time: "3 hours ago",
              },
            ].map((activity) => (
              <div
                key={activity.student}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {activity.student
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.student}</div>
                  <div className="text-xs text-muted-foreground">{activity.activity}</div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="size-5 text-indigo" />
            <h3 className="font-semibold">Emergency Contacts</h3>
          </div>
          <div className="space-y-2">
            {hostelStudents.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft"
              >
                <div>
                  <div className="text-sm font-medium">{student.name}</div>
                  <div className="text-xs text-muted-foreground">{student.roomNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-sm">{student.emergencyContact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">Quick Student Statistics</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Average Attendance", value: "87%", icon: "📊" },
            { label: "Room Occupancy", value: "79%", icon: "🏠" },
            { label: "Fee Compliance", value: "95%", icon: "💰" },
            { label: "Complaint Rate", value: "12%", icon: "📝" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xl font-bold mt-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
