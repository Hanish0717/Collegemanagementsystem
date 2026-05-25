import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { gpaHistory, results } from "@/lib/student-data";

export const Route = createFileRoute("/dashboard/student/results")({
  component: ResultsGPA,
});

function ResultsGPA() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Results & GPA"
        desc="View your academic results, semester-wise GPA, and overall performance analytics."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Current GPA", value: "3.7", tone: "success" as const },
          { label: "CGPA", value: "3.6", tone: "success" as const },
          { label: "Total Credits", value: "140", tone: "info" as const },
          { label: "Class Rank", value: "12/45", tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">GPA Progress</h3>
            <Badge tone="success">3.7</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={gpaHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Grade Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { grade: "A+", count: 8, percentage: "40%" },
              { grade: "A", count: 6, percentage: "30%" },
              { grade: "B+", count: 4, percentage: "20%" },
              { grade: "B", count: 2, percentage: "10%" },
            ].map(item => (
              <div key={item.grade} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm font-medium">{item.grade}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{item.count} subjects</span>
                  <Badge tone="info">{item.percentage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Subject-wise Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Subject", "Credits", "Grade", "Marks", "Semester"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{result.subject}</td>
                  <td className="py-3 px-4">{result.credits}</td>
                  <td className="py-3 px-4">
                    <Badge tone={result.grade.startsWith("A") ? "success" : "info"}>{result.grade}</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{result.marks}%</td>
                  <td className="py-3 px-4"><Badge tone="info">{result.semester}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Credits Summary</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Semester 1", credits: 24, gpa: 3.4 },
            { label: "Semester 2", credits: 26, gpa: 3.6 },
            { label: "Semester 3", credits: 28, gpa: 3.5 },
            { label: "Semester 4", credits: 30, gpa: 3.7 },
            { label: "Semester 5", credits: 32, gpa: 3.8 },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-sm font-medium">{item.label}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{item.credits} credits</span>
                <Badge tone="success">{item.gpa} GPA</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
