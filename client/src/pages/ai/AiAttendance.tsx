import { createFileRoute } from '@tanstack/react-router';
import {
  Line,
  LineChart,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, TrendingUp, Calendar, Users } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';

export function AiAttendance() {
  const attendanceData = [
    { name: 'John Smith', current: 72, predicted: 75, warningLevel: 'High', status: 'At Risk' },
    { name: 'Emily Johnson', current: 92, predicted: 94, warningLevel: 'Low', status: 'Excellent' },
    { name: 'Michael Brown', current: 78, predicted: 80, warningLevel: 'Medium', status: 'Good' },
    { name: 'Sarah Davis', current: 88, predicted: 90, warningLevel: 'Low', status: 'Excellent' },
    { name: 'James Wilson', current: 65, predicted: 68, warningLevel: 'High', status: 'Critical' },
    { name: 'Lisa Anderson', current: 85, predicted: 87, warningLevel: 'Low', status: 'Good' },
    {
      name: 'Robert Taylor',
      current: 74,
      predicted: 76,
      warningLevel: 'Medium',
      status: 'At Risk',
    },
    {
      name: 'Jennifer Martinez',
      current: 90,
      predicted: 92,
      warningLevel: 'Low',
      status: 'Excellent',
    },
  ];

  const monthlyTrends = [
    { month: 'Jan', actual: 82, predicted: 84 },
    { month: 'Feb', actual: 78, predicted: 80 },
    { month: 'Mar', actual: 85, predicted: 87 },
    { month: 'Apr', actual: 80, predicted: 82 },
    { month: 'May', actual: 83, predicted: 85 },
    { month: 'Jun', predicted: 86 },
  ];

  const departmentAnalytics = [
    { department: 'Computer Science', current: 88, predicted: 90 },
    { department: 'Electrical Engineering', current: 82, predicted: 84 },
    { department: 'Mechanical Engineering', current: 79, predicted: 81 },
    { department: 'Civil Engineering', current: 85, predicted: 87 },
    { department: 'Business Administration', current: 91, predicted: 93 },
  ];

  const warningTimeline = [
    { date: 'May 25', type: 'High Risk', count: 5 },
    { date: 'May 24', type: 'Medium Risk', count: 8 },
    { date: 'May 23', type: 'Low Risk', count: 12 },
    { date: 'May 22', type: 'High Risk', count: 3 },
    { date: 'May 21', type: 'Medium Risk', count: 6 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Prediction"
        desc="AI-powered attendance forecasting and risk analysis for student attendance."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Students Tracked', value: '245', tone: 'success' as const },
          { label: 'High Risk Alerts', value: '18', tone: 'warn' as const },
          { label: 'Average Attendance', value: '84.5%', tone: 'info' as const },
          { label: 'Prediction Accuracy', value: '92%', tone: 'success' as const },
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
            <h3 className="font-semibold">Monthly Attendance Trends</h3>
            <Badge tone="success">Forecast</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="att-actual" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="att-pred" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#4F46E5"
                  fill="url(#att-actual)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#06B6D4"
                  fill="url(#att-pred)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Department-wise Analytics</h3>
            <Badge tone="info">5 Departments</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={departmentAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="department"
                  stroke="#64748B"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="current" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Student Attendance Predictions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  'Student Name',
                  'Current Attendance',
                  'Predicted Attendance',
                  'Warning Level',
                  'Status',
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
              {attendanceData.map((student, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.current}%</td>
                  <td className="py-3 px-4 font-medium">{student.predicted}%</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        student.warningLevel === 'High'
                          ? 'warn'
                          : student.warningLevel === 'Medium'
                            ? 'info'
                            : 'success'
                      }
                    >
                      {student.warningLevel}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        student.status === 'Critical'
                          ? 'warn'
                          : student.status === 'At Risk'
                            ? 'info'
                            : 'success'
                      }
                    >
                      {student.status}
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
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-indigo" />
            <h3 className="font-semibold">Warning Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                student: 'James Wilson',
                attendance: '65%',
                type: 'Critical',
                action: 'Immediate intervention required',
              },
              {
                student: 'John Smith',
                attendance: '72%',
                type: 'High Risk',
                action: 'Counseling recommended',
              },
              {
                student: 'Robert Taylor',
                attendance: '74%',
                type: 'Medium Risk',
                action: 'Monitor closely',
              },
              {
                student: 'Michael Brown',
                attendance: '78%',
                type: 'Medium Risk',
                action: 'Regular check-ins',
              },
            ].map((warning, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition ${warning.type === 'Critical' ? 'bg-red-50 border-red-200' : warning.type === 'High Risk' ? 'bg-amber-50 border-amber-200' : ''}`}
              >
                <div
                  className={`size-10 rounded-lg ${warning.type === 'Critical' ? 'bg-red-500' : warning.type === 'High Risk' ? 'bg-amber-500' : 'bg-gradient-primary'} text-white grid place-items-center`}
                >
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{warning.student}</div>
                  <div className="text-xs text-muted-foreground">
                    {warning.attendance} attendance
                  </div>
                </div>
                <Badge
                  tone={
                    warning.type === 'Critical'
                      ? 'warn'
                      : warning.type === 'High Risk'
                        ? 'warn'
                        : 'info'
                  }
                >
                  {warning.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-indigo" />
            <h3 className="font-semibold">Attendance Trends Timeline</h3>
          </div>
          <div className="space-y-3">
            {warningTimeline.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center">
                  <Calendar className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.date}</div>
                  <div className="text-xs text-muted-foreground">{item.type}</div>
                </div>
                <Badge
                  tone={
                    item.type === 'High Risk'
                      ? 'warn'
                      : item.type === 'Medium Risk'
                        ? 'info'
                        : 'success'
                  }
                >
                  {item.count} alerts
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-indigo" />
          <h3 className="font-semibold">Prediction Summary</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Expected Improvement',
              value: '+2.5%',
              icon: TrendingUp,
              color: 'bg-gradient-primary',
            },
            { label: 'Students at Risk', value: '18', icon: AlertTriangle, color: 'bg-red-500' },
            {
              label: 'Recovery Predicted',
              value: '12',
              icon: TrendingUp,
              color: 'bg-gradient-cyan',
            },
            { label: 'Stable Attendance', value: '215', icon: Users, color: 'bg-gradient-violet' },
          ].map((summary, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`size-8 rounded-lg ${summary.color} text-white grid place-items-center`}
                >
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
