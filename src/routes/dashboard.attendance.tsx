import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { attendanceData, students } from "@/lib/mock-data";
import { CalendarCheck, Users, UserX, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/attendance")({ component: AttendancePage });

function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" desc="Track attendance across departments and cohorts." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present Today" value="11,801" change="+1.4%" icon={CalendarCheck} gradient="bg-gradient-primary" />
        <StatCard label="Absent" value="679" change="-0.6%" icon={UserX} gradient="bg-gradient-violet" />
        <StatCard label="On Leave" value="142" icon={Clock} gradient="bg-gradient-cyan" />
        <StatCard label="Total Students" value="12,480" icon={Users} gradient="bg-gradient-primary" />
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Attendance Trend</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="att" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Area type="monotone" dataKey="present" stroke="#06B6D4" fill="url(#att)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b font-semibold">Today's Attendance</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>{["Student","Department","Time In","Status"].map(h=><th key={h} className="px-5 py-3 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {students.slice(0,6).map((s,i)=>(
              <tr key={s.id} className="border-t">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.dept}</td>
                <td className="px-5 py-3 font-mono text-xs">{8 + i}:{(15*i)%60 < 10 ? "0":""}{(15*i)%60} AM</td>
                <td className="px-5 py-3"><Badge tone={i%4===3?"warn":"success"}>{i%4===3?"Late":"Present"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
