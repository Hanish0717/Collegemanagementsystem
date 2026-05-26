import { createFileRoute } from "@tanstack/react-router";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { AlertTriangle, Shield, TrendingUp, UserCheck, AlertCircle, CheckCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";



export function AiRisk() {
  const riskData = [
    { name: "John Smith", riskCategory: "Academic", riskLevel: "High", attendanceStatus: "72%", performanceStatus: "2.4 GPA", action: "Counseling Required" },
    { name: "Emily Johnson", riskCategory: "Academic", riskLevel: "Low", attendanceStatus: "92%", performanceStatus: "3.8 GPA", action: "Monitor" },
    { name: "Michael Brown", riskCategory: "Attendance", riskLevel: "Medium", attendanceStatus: "78%", performanceStatus: "2.8 GPA", action: "Intervention" },
    { name: "Sarah Davis", riskCategory: "Behavioral", riskLevel: "Low", attendanceStatus: "88%", performanceStatus: "3.5 GPA", action: "Monitor" },
    { name: "James Wilson", riskCategory: "Academic", riskLevel: "High", attendanceStatus: "65%", performanceStatus: "2.1 GPA", action: "Immediate Action" },
    { name: "Lisa Anderson", riskCategory: "Attendance", riskLevel: "Medium", attendanceStatus: "74%", performanceStatus: "3.0 GPA", action: "Support Needed" },
    { name: "Robert Taylor", riskCategory: "Behavioral", riskLevel: "Low", attendanceStatus: "85%", performanceStatus: "3.2 GPA", action: "Monitor" },
    { name: "Jennifer Martinez", riskCategory: "Academic", riskLevel: "Low", attendanceStatus: "90%", performanceStatus: "3.6 GPA", action: "Monitor" },
  ];

  const riskDistribution = [
    { name: "High Risk", value: 12, color: "#EF4444" },
    { name: "Medium Risk", value: 28, color: "#F59E0B" },
    { name: "Low Risk", value: 205, color: "#10B981" },
  ];

  const riskTrend = [
    { month: "Jan", high: 15, medium: 25, low: 205 },
    { month: "Feb", high: 14, medium: 26, low: 205 },
    { month: "Mar", high: 13, medium: 27, low: 205 },
    { month: "Apr", high: 12, medium: 28, low: 205 },
    { month: "May", high: 12, medium: 28, low: 205 },
    { month: "Jun", high: 11, medium: 29, low: 205 },
  ];

  const criticalAlerts = [
    { student: "James Wilson", risk: "Critical", category: "Academic & Attendance", details: "GPA dropped to 2.1, attendance 65%" },
    { student: "John Smith", risk: "High", category: "Academic", details: "GPA 2.4, declining trend" },
    { student: "Michael Brown", risk: "High", category: "Attendance", details: "Attendance 78%, below threshold" },
  ];

  const recommendations = [
    { student: "James Wilson", recommendation: "Assign academic tutor, mandatory counseling", priority: "Critical" },
    { student: "John Smith", recommendation: "Weekly progress meetings, study group", priority: "High" },
    { student: "Michael Brown", recommendation: "Attendance monitoring, extra support", priority: "High" },
    { student: "Lisa Anderson", recommendation: "Regular check-ins, mentorship", priority: "Medium" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Risk Analysis"
        desc="AI-powered risk assessment and early warning system for student success."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "High Risk Students", value: "12", tone: "warn" as const },
          { label: "Medium Risk Students", value: "28", tone: "info" as const },
          { label: "Low Risk Students", value: "205", tone: "success" as const },
          { label: "Critical Alerts", value: "3", tone: "warn" as const },
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
            <h3 className="font-semibold">Risk Distribution</h3>
            <Badge tone="info">245 Students</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Risk Trend Analysis</h3>
            <Badge tone="success">Improving</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="high" stroke="#EF4444" strokeWidth={2.5} />
                <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2.5} />
                <Line type="monotone" dataKey="low" stroke="#10B981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Student Risk Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Student Name", "Risk Category", "Risk Level", "Attendance Status", "Performance Status", "Action"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {riskData.map((student, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.riskCategory}</td>
                  <td className="py-3 px-4">
                    <Badge tone={student.riskLevel === "High" ? "warn" : student.riskLevel === "Medium" ? "info" : "success"}>{student.riskLevel}</Badge>
                  </td>
                  <td className="py-3 px-4">{student.attendanceStatus}</td>
                  <td className="py-3 px-4">{student.performanceStatus}</td>
                  <td className="py-3 px-4 text-muted-foreground">{student.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="size-5 text-indigo" />
          <h3 className="font-semibold">Critical Alerts</h3>
        </div>
        <div className="space-y-3">
          {criticalAlerts.map((alert, index) => (
            <div key={index} className={`flex items-center gap-3 p-4 rounded-xl border hover:bg-accent/50 transition ${alert.risk === "Critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <div className={`size-12 rounded-lg ${alert.risk === "Critical" ? "bg-red-500" : "bg-amber-500"} text-white grid place-items-center`}>
                <AlertTriangle className="size-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{alert.student}</span>
                  <Badge tone={alert.risk === "Critical" ? "warn" : "warn"}>{alert.risk}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{alert.category}</div>
                <div className="text-xs text-muted-foreground mt-1">{alert.details}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{rec.student}</span>
                  <Badge tone={rec.priority === "Critical" ? "warn" : rec.priority === "High" ? "warn" : "info"}>{rec.priority}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{rec.recommendation}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Risk Indicators</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Academic Risk", value: "18 students", icon: AlertCircle, color: "bg-red-500" },
              { label: "Attendance Risk", value: "12 students", icon: AlertCircle, color: "bg-amber-500" },
              { label: "Behavioral Risk", value: "5 students", icon: AlertCircle, color: "bg-gradient-primary" },
              { label: "No Risk", value: "210 students", icon: CheckCircle, color: "bg-green-500" },
            ].map((indicator, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className={`size-10 rounded-lg ${indicator.color} text-white grid place-items-center`}>
                  <indicator.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{indicator.label}</div>
                  <div className="text-xs text-muted-foreground">{indicator.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="size-5 text-indigo" />
          <h3 className="font-semibold">Risk Summary</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students Analyzed", value: "245", icon: UserCheck, color: "bg-gradient-primary" },
            { label: "Risk Reduction Rate", value: "+8%", icon: TrendingUp, color: "bg-gradient-cyan" },
            { label: "Interventions Active", value: "15", icon: Shield, color: "bg-gradient-violet" },
            { label: "Success Rate", value: "78%", icon: CheckCircle, color: "bg-green-500" },
          ].map((summary, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center gap-2 mb-2">
                <div className={`size-8 rounded-lg ${summary.color} text-white grid place-items-center`}>
                  <summary.icon className="size-4" />
                </div>
                <span className="text-xs text-muted-foreground">{summary.label}</span>
              </div>
              <div className="text-xl font-bold">{summary.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
