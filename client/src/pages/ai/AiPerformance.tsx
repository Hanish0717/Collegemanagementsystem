import { createFileRoute } from "@tanstack/react-router";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Award, AlertCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";

export function AiPerformance() {
  const performanceData = [
    {
      name: "John Smith",
      currentGPA: 3.2,
      predictedGPA: 3.5,
      riskLevel: "Low",
      recommendation: "Focus on Mathematics",
    },
    {
      name: "Emily Johnson",
      currentGPA: 3.8,
      predictedGPA: 3.9,
      riskLevel: "Low",
      recommendation: "Maintain current pace",
    },
    {
      name: "Michael Brown",
      currentGPA: 2.8,
      predictedGPA: 3.1,
      riskLevel: "Medium",
      recommendation: "Increase study hours",
    },
    {
      name: "Sarah Davis",
      currentGPA: 3.5,
      predictedGPA: 3.7,
      riskLevel: "Low",
      recommendation: "Excellent progress",
    },
    {
      name: "James Wilson",
      currentGPA: 2.4,
      predictedGPA: 2.6,
      riskLevel: "High",
      recommendation: "Needs tutoring support",
    },
    {
      name: "Lisa Anderson",
      currentGPA: 3.6,
      predictedGPA: 3.8,
      riskLevel: "Low",
      recommendation: "Consider advanced courses",
    },
    {
      name: "Robert Taylor",
      currentGPA: 2.9,
      predictedGPA: 3.2,
      riskLevel: "Medium",
      recommendation: "Attend extra classes",
    },
    {
      name: "Jennifer Martinez",
      currentGPA: 3.4,
      predictedGPA: 3.6,
      riskLevel: "Low",
      recommendation: "Good improvement",
    },
  ];

  const subjectPrediction = [
    { subject: "Mathematics", current: 78, predicted: 82, trend: "up" },
    { subject: "Physics", current: 72, predicted: 75, trend: "up" },
    { subject: "Chemistry", current: 68, predicted: 70, trend: "up" },
    { subject: "Computer Science", current: 85, predicted: 88, trend: "up" },
    { subject: "English", current: 80, predicted: 82, trend: "up" },
  ];

  const gradeForecast = [
    { month: "Jan", forecast: 3.2 },
    { month: "Feb", forecast: 3.3 },
    { month: "Mar", forecast: 3.4 },
    { month: "Apr", forecast: 3.5 },
    { month: "May", forecast: 3.6 },
    { month: "Jun", forecast: 3.7 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Prediction"
        desc="AI-powered student performance forecasting and grade predictions."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Students Analyzed", value: "245", tone: "success" as const },
          { label: "High Risk Students", value: "12", tone: "warn" as const },
          { label: "Average Predicted GPA", value: "3.4", tone: "info" as const },
          { label: "Improvement Rate", value: "78%", tone: "success" as const },
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

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Grade Forecasting</h3>
            <Badge tone="success">Trending Up</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={gradeForecast}>
                <defs>
                  <linearGradient id="grade-forecast" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#4F46E5"
                  fill="url(#grade-forecast)"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Subject-wise Predictions</h3>
            <Badge tone="info">5 Subjects</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={subjectPrediction}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="current" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Student Performance Predictions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Student Name",
                  "Current GPA",
                  "Predicted GPA",
                  "Risk Level",
                  "Recommendation",
                ].map((column) => (
                  <th
                    key={column}
                    className="text-left py-3 px-4 font-semibold text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {performanceData.map((student, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.currentGPA}</td>
                  <td className="py-3 px-4 font-medium">{student.predictedGPA}</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        student.riskLevel === "High"
                          ? "warn"
                          : student.riskLevel === "Medium"
                            ? "info"
                            : "success"
                      }
                    >
                      {student.riskLevel}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{student.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award className="size-5 text-indigo" />
            <h3 className="font-semibold">Top Performers</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: "Emily Johnson", gpa: "3.9", improvement: "+0.1" },
              { name: "Lisa Anderson", gpa: "3.8", improvement: "+0.2" },
              { name: "Sarah Davis", gpa: "3.7", improvement: "+0.2" },
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Predicted GPA: {student.gpa}
                    </div>
                  </div>
                </div>
                <Badge tone="success">{student.improvement}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="size-5 text-indigo" />
            <h3 className="font-semibold">Low Performance Alerts</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: "James Wilson", gpa: "2.6", risk: "High" },
              { name: "Michael Brown", gpa: "3.1", risk: "Medium" },
              { name: "Robert Taylor", gpa: "3.2", risk: "Medium" },
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-lg ${student.risk === "High" ? "bg-red-500" : "bg-amber-500"} text-white grid place-items-center`}
                  >
                    <AlertCircle className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Predicted GPA: {student.gpa}
                    </div>
                  </div>
                </div>
                <Badge tone={student.risk === "High" ? "warn" : "info"}>{student.risk}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Performance Improvement Suggestions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Study Group Sessions",
              desc: "Organize weekly study groups for struggling students",
              icon: TrendingUp,
            },
            {
              title: "Personalized Tutoring",
              desc: "Assign tutors for high-risk students",
              icon: Award,
            },
            {
              title: "Extra Practice Materials",
              desc: "Provide additional resources for improvement",
              icon: TrendingUp,
            },
            {
              title: "Progress Monitoring",
              desc: "Track weekly progress with AI analytics",
              icon: TrendingUp,
            },
            {
              title: "Parent Communication",
              desc: "Regular updates to parents on student progress",
              icon: TrendingUp,
            },
            {
              title: "Motivation Programs",
              desc: "Reward systems for improved performance",
              icon: Award,
            },
          ].map((suggestion, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center gap-2 mb-2">
                <suggestion.icon className="size-4 text-indigo" />
                <span className="text-sm font-medium">{suggestion.title}</span>
              </div>
              <div className="text-xs text-muted-foreground">{suggestion.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
