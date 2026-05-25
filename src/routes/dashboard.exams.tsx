import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { exams, performanceData } from "@/lib/mock-data";
import { Download, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard/exams")({ component: ExamsPage });

function ExamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Examinations" desc="Schedules, hall tickets, results and performance." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold">Upcoming Exam Schedule</h3>
            <Badge tone="info">June 2026</Badge>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>{["Code","Subject","Date","Time","Hall","Duration"].map(h=><th key={h} className="px-5 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {exams.map(e=>(
                <tr key={e.code} className="border-t hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{e.code}</td>
                  <td className="px-5 py-3 font-medium">{e.subject}</td>
                  <td className="px-5 py-3">{e.date}</td>
                  <td className="px-5 py-3">{e.time}</td>
                  <td className="px-5 py-3"><Badge>{e.hall}</Badge></td>
                  <td className="px-5 py-3">{e.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hall Ticket</div>
          <div className="rounded-2xl bg-gradient-primary p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-80">CAMPUSLY UNIVERSITY</div>
                <div className="font-bold text-lg mt-1">Summer Examination</div>
              </div>
              <Calendar className="size-6 opacity-80" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div><div className="opacity-70 text-xs">Student</div><div className="font-medium">Aarav Sharma</div></div>
              <div><div className="opacity-70 text-xs">Roll No.</div><div className="font-medium">STU001</div></div>
              <div><div className="opacity-70 text-xs">Course</div><div className="font-medium">CS — Year 3</div></div>
              <div><div className="opacity-70 text-xs">Seat</div><div className="font-medium">A-203 / 14</div></div>
            </div>
            <div className="mt-5 flex gap-2">
              {[...Array(8)].map((_,i)=><div key={i} className="flex-1 h-6 rounded bg-white/20" />)}
            </div>
            <button className="mt-5 w-full rounded-xl bg-white text-foreground text-sm font-medium py-2 flex items-center justify-center gap-2">
              <Download className="size-4" /> Download
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Performance Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={12} stroke="#64748B" />
              <YAxis fontSize={12} stroke="#64748B" />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="score" fill="#9333EA" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
