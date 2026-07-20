import { useState, useEffect } from 'react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { CalendarCheck, Users, UserX, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '@/lib/api';

export function AttendancePage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      try {
        const res = await api.get('/api/attendance/report');
        if (res.data?.success && res.data?.data) {
          setReport(res.data.data);
        }
      } catch (err) {
        console.error('Error loading attendance ledger report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceReport();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" desc="Loading attendance report..." />
        <div className="p-8 text-center text-muted-foreground font-sans">
          Compiling attendance logs...
        </div>
      </div>
    );
  }

  // Fallbacks if database is empty
  const totals = report?.totals || { total: 0, present: 0, absent: 0, late: 0 };
  const totalsToday = report?.totalsToday || { present: 0, absent: 0 };

  // Format trend data
  const chartData =
    report?.trends && report.trends.length > 0
      ? report.trends
      : [
          { day: 'Mon', present: 92, absent: 8 },
          { day: 'Tue', present: 94, absent: 6 },
          { day: 'Wed', present: 89, absent: 11 },
          { day: 'Thu', present: 91, absent: 9 },
          { day: 'Fri', present: 95, absent: 5 },
        ];

  const studentsList = report?.lowAttendanceStudents || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" desc="Track attendance across departments and cohorts." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Present Today"
          value={String(totalsToday.present || totals.present || 0)}
          change=""
          icon={CalendarCheck}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Absent Today"
          value={String(totalsToday.absent || totals.absent || 0)}
          change=""
          icon={UserX}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="On Leave / Late"
          value={String(totals.late || 0)}
          icon={Clock}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Total Active Ledgers"
          value={String(totals.total || 0)}
          icon={Users}
          gradient="bg-gradient-primary"
        />
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Attendance Trend (% Attendance)</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="att" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Area
                type="monotone"
                dataKey="present"
                stroke="#06B6D4"
                fill="url(#att)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b font-semibold flex justify-between items-center">
          <span>Critically Low Attendance Students (Below 75%)</span>
          <Badge tone="danger">{studentsList.length} alert(s)</Badge>
        </div>
        {studentsList.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                {['Student Name', 'Roll Number', 'Current Semester Attendance %', 'Status'].map(
                  (h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {studentsList.map((s: any) => (
                <tr key={s.id || s.rollNumber} className="border-t hover:bg-muted/30">
                  <td className="px-5 py-3 font-semibold">{s.fullName}</td>
                  <td className="px-5 py-3 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-5 py-3 font-bold text-rose-600">{s.attendancePercentage}%</td>
                  <td className="px-5 py-3">
                    <Badge tone="danger">Critically Low</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-muted-foreground font-sans border-t">
            No students currently flag critical attendance issues (&lt; 75%).
          </div>
        )}
      </Card>
    </div>
  );
}
