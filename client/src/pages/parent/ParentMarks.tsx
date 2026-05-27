import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { marksPerformance, subjectMarks } from "@/mock/parentData";

export function ParentMarks() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks & Grades"
        desc="View child's subject-wise marks, grades, and academic performance."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download Report Card
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Average Marks", value: "85.4%", tone: "success" as const },
          { label: "Overall GPA", value: "3.6", tone: "success" as const },
          { label: "Class Rank", value: "8/45", tone: "info" as const },
          { label: "Top Subjects", value: "2", tone: "info" as const },
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
        <h3 className="font-semibold mb-4">Subject-wise Marks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Subject", "Internal Marks", "External Marks", "Total", "Grade", "Status"].map(
                  (column) => (
                    <th
                      key={column}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjectMarks.map((subject, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{subject.subject}</td>
                  <td className="py-3 px-4">{subject.internal}</td>
                  <td className="py-3 px-4">{subject.external}</td>
                  <td className="py-3 px-4 font-medium">{subject.total}</td>
                  <td className="py-3 px-4">
                    <Badge tone={subject.grade.startsWith("A") ? "success" : "info"}>
                      {subject.grade}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={subject.status === "Excellent" ? "success" : "info"}>
                      {subject.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Monthly Performance</h3>
            <Badge tone="success">85.4%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={marksPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="marks" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Top Performance</h3>
          </div>
          <div className="space-y-2">
            {subjectMarks
              .filter((s) => s.status === "Excellent")
              .map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
                >
                  <span className="text-sm font-medium">{subject.subject}</span>
                  <Badge tone="success">{subject.total}%</Badge>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Grade Distribution</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { grade: "A+", count: 1, percentage: "20%" },
            { grade: "A", count: 3, percentage: "60%" },
            { grade: "B+", count: 1, percentage: "20%" },
            { grade: "B", count: 0, percentage: "0%" },
          ].map((item) => (
            <div key={item.grade} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-sm font-medium">{item.grade}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{item.count} subjects</span>
                <Badge tone="info">{item.percentage}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
