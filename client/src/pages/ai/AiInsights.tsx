import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lightbulb, TrendingUp, TrendingDown, Award, AlertCircle, Target, Brain, Zap } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";



export function AiInsights() {
  const insights = [
    { title: "Attendance Improvement", desc: "Overall college attendance improved by 3.2% this month after implementing new monitoring system", type: "Positive", impact: "High" },
    { title: "Academic Excellence", desc: "Computer Science department shows highest GPA improvement of 0.4 points", type: "Positive", impact: "High" },
    { title: "Risk Reduction", desc: "High-risk student count decreased by 8% after targeted interventions", type: "Positive", impact: "Medium" },
    { title: "Engagement Alert", desc: "Student participation in extracurricular activities dropped by 5%", type: "Negative", impact: "Medium" },
    { title: "Performance Trend", desc: "Mathematics department showing consistent improvement across all semesters", type: "Positive", impact: "High" },
    { title: "Resource Optimization", desc: "Library utilization increased by 15% suggesting better resource management", type: "Positive", impact: "Low" },
  ];

  const recommendations = [
    { title: "Increase Tutoring Support", desc: "Assign additional tutors for Mathematics and Physics departments", priority: "High" },
    { title: "Enhance Engagement Programs", desc: "Launch new student engagement initiatives to boost participation", priority: "Medium" },
    { title: "Monitor Attendance Patterns", desc: "Implement real-time attendance alerts for at-risk students", priority: "High" },
    { title: "Optimize Class Schedules", desc: "Adjust timetable based on student performance patterns", priority: "Medium" },
    { title: "Strengthen Parent Communication", desc: "Increase frequency of parent-teacher meetings", priority: "Low" },
    { title: "Expand Mentorship Program", desc: "Pair high-performing students with those needing support", priority: "High" },
  ];

  const performanceTrends = [
    { month: "Jan", gpa: 3.2, attendance: 82 },
    { month: "Feb", gpa: 3.3, attendance: 84 },
    { month: "Mar", gpa: 3.4, attendance: 85 },
    { month: "Apr", gpa: 3.5, attendance: 83 },
    { month: "May", gpa: 3.6, attendance: 87 },
    { month: "Jun", gpa: 3.7, attendance: 89 },
  ];

  const departmentPerformance = [
    { department: "Computer Science", score: 92, trend: "up" },
    { department: "Electrical Engineering", score: 85, trend: "up" },
    { department: "Mechanical Engineering", score: 78, trend: "down" },
    { department: "Civil Engineering", score: 82, trend: "up" },
    { department: "Business Administration", score: 88, trend: "up" },
  ];

  const highlights = [
    { label: "Top Performing Department", value: "Computer Science", icon: Award, color: "bg-gradient-primary" },
    { label: "Most Improved", value: "Mathematics", icon: TrendingUp, color: "bg-gradient-cyan" },
    { label: "Best Attendance", value: "Business Admin", icon: Target, color: "bg-gradient-violet" },
    { label: "Active Insights", value: "67", icon: Brain, color: "bg-gradient-primary" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Insights"
        desc="AI-generated smart recommendations, academic trends, and performance highlights."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Insights", value: "67", tone: "success" as const },
          { label: "Positive Trends", value: "45", tone: "success" as const },
          { label: "Areas to Improve", value: "12", tone: "warn" as const },
          { label: "Recommendations", value: "28", tone: "info" as const },
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
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="size-5 text-indigo" />
            <h3 className="font-semibold">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-xl border hover:bg-accent/50 transition ${insight.type === "Negative" ? "bg-red-50 border-red-200" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{insight.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone={insight.type === "Positive" ? "success" : "warn"}>{insight.type}</Badge>
                    <Badge tone={insight.impact === "High" ? "warn" : "info"}>{insight.impact} Impact</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{insight.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="size-5 text-indigo" />
            <h3 className="font-semibold">Smart Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{rec.title}</span>
                  <Badge tone={rec.priority === "High" ? "warn" : rec.priority === "Medium" ? "info" : "success"}>{rec.priority}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{rec.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Performance Trends</h3>
            <Badge tone="success">Improving</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={performanceTrends}>
                <defs>
                  <linearGradient id="gpa-trend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="att-trend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="gpa" stroke="#4F46E5" fill="url(#gpa-trend)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="attendance" stroke="#06B6D4" fill="url(#att-trend)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Department Performance</h3>
            <Badge tone="info">5 Departments</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="department" stroke="#64748B" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Award className="size-5 text-indigo" />
          <h3 className="font-semibold">Performance Highlights</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((highlight, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center gap-2 mb-2">
                <div className={`size-8 rounded-lg ${highlight.color} text-white grid place-items-center`}>
                  <highlight.icon className="size-4" />
                </div>
                <span className="text-xs text-muted-foreground">{highlight.label}</span>
              </div>
              <div className="text-xl font-bold">{highlight.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Insights Timeline</h3>
        <div className="space-y-3">
          {[
            { time: "10:30 AM", insight: "Attendance improvement detected in Computer Science department", type: "Positive" },
            { time: "09:45 AM", insight: "Risk assessment completed for 245 students", type: "Analysis" },
            { time: "09:15 AM", insight: "Performance trend analysis shows upward trajectory", type: "Positive" },
            { time: "08:30 AM", insight: "New recommendation generated for Mathematics department", type: "Recommendation" },
            { time: "08:00 AM", insight: "Daily insight generation completed successfully", type: "System" },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center">
                <Brain className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{item.insight}</div>
                <div className="text-xs text-muted-foreground">{item.type}</div>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="size-5 text-indigo" />
          <h3 className="font-semibold">Areas Needing Attention</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Student Engagement", desc: "Participation in activities dropped by 5%", priority: "Medium" },
            { title: "Mechanical Engineering", desc: "Performance score decreased by 3 points", priority: "High" },
            { title: "Library Resources", desc: "Book return rate below expected levels", priority: "Low" },
          ].map((area, index) => (
            <div key={index} className={`p-4 rounded-xl border hover:bg-accent/50 transition ${area.priority === "High" ? "bg-amber-50 border-amber-200" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{area.title}</span>
                <Badge tone={area.priority === "High" ? "warn" : area.priority === "Medium" ? "info" : "success"}>{area.priority}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{area.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
