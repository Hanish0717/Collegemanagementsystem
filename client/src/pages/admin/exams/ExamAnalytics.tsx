import { Award, BookOpen, Activity, Compass, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from "recharts";

export function ExamAnalytics() {
  const gpaData = [
    { department: "CSE", avgGpa: 8.4 },
    { department: "AIML", avgGpa: 8.2 },
    { department: "AIDS", avgGpa: 8.0 },
    { department: "ECE", avgGpa: 7.8 },
    { department: "MECH", avgGpa: 7.2 },
    { department: "CIVIL", avgGpa: 7.0 }
  ];

  const passRateData = [
    { semester: "Sem 1", passRate: 88 },
    { semester: "Sem 2", passRate: 91 },
    { semester: "Sem 3", passRate: 89 },
    { semester: "Sem 4", passRate: 94 },
    { semester: "Sem 5", passRate: 92 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations Analytics Dashboard"
        desc="Audit general student academic metrics, average GPA distribution by branch, and pass rate progression."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Overall Institution Pass Rate", value: "91.8%", tone: "success" as const },
          { label: "Top Department GPA", value: "CSE (8.4 GPA)", tone: "success" as const },
          { label: "Total Graded Semesters", value: "5 Semesters", tone: "info" as const },
          { label: "Failed/Under-performing Students", value: "24 Students", tone: "danger" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Analytics
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Compass className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-base">Average GPA Distribution by Department</h3>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="department" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 10]} />
                <Tooltip formatter={(value) => [`${value} GPA`]} />
                <Bar dataKey="avgGpa" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-5 text-indigo-600" />
            <h3 className="font-semibold text-base">Pass Percentage Progression (%)</h3>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={passRateData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="semester" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={10} domain={[80, 100]} />
                <Tooltip formatter={(value) => [`${value}% Pass Rate`]} />
                <Line type="monotone" dataKey="passRate" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
