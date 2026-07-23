import { useState, useEffect } from 'react';
import { Outlet, useRouterState, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  Activity,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  MapPin,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Badge, Card, PageHeader, StatCard } from '@/components/dashboard/ui';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const statIcons = [
  GraduationCap,
  TrendingUp,
  BookOpen,
  Calendar,
  DollarSign,
  CheckCircle,
  MapPin,
  Activity,
];
const statGradients = [
  'bg-gradient-primary',
  'bg-gradient-violet',
  'bg-gradient-cyan',
  'bg-gradient-primary',
  'bg-gradient-violet',
  'bg-gradient-cyan',
  'bg-gradient-primary',
  'bg-gradient-violet',
];

const gradePoints: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0.0,
};

export function StudentDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState<any>(null);

  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [attendanceHistoryData, setAttendanceHistoryData] = useState<any[]>([]);
  const [displayMonth, setDisplayMonth] = useState<string>(() =>
    new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentCgpa, setCurrentCgpa] = useState('0.0');
  const [currentAttendance, setCurrentAttendance] = useState('0%');
  const [earnedCredits, setEarnedCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  // New detailed attendance states for dashboard integrations
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [subjectWise, setSubjectWise] = useState<any[]>([]);

  useEffect(() => {
    if (path !== '/dashboard/student' && path !== '/dashboard' && path !== '/dashboard/') return;

    const fetchDashboardData = async () => {
      setLoading(true);
      let resolvedStudentId = '';
      try {
        const dashRes = await api.get('/api/student-module/dashboard');
        if (dashRes.data?.success && dashRes.data?.data) {
          const {
            stats: dbStats,
            activities: dbActivities,
            notifications: dbNotifs,
            profile,
          } = dashRes.data.data;

          setStats(dbStats || []);
          setActivities(dbActivities || []);
          setNotifications(dbNotifs || []);

          if (profile) {
            setStudentProfile(profile);
            localStorage.setItem('cms_student_profile', JSON.stringify(profile));
            resolvedStudentId = profile._id || profile.id;
            if (profile.attendancePercentage !== undefined) {
              setCurrentAttendance(`${profile.attendancePercentage}%`);
            }
            if (profile.cgpa !== undefined) {
              setCurrentCgpa(String(profile.cgpa));
            }
          }
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      }

      try {
        const resultsRes = await api.get('/api/student-module/results');
        if (resultsRes.data?.success && resultsRes.data?.data) {
          const dbResults = resultsRes.data.data;
          if (dbResults.length > 0) {
            const semMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
            let totalCredits = 0;

            dbResults.forEach((res: any) => {
              const sem = res.semester ? `Sem ${res.semester}` : 'Sem 5';
              const grade = res.grade || 'A';
              const credits = res.credits || 3;
              const gp = gradePoints[grade] !== undefined ? gradePoints[grade] : 3.0;

              if (grade !== 'F') {
                totalCredits += credits;
              }

              if (!semMap[sem]) {
                semMap[sem] = { totalPoints: 0, totalCredits: 0 };
              }
              semMap[sem].totalPoints += gp * credits;
              semMap[sem].totalCredits += credits;
            });

            setEarnedCredits(totalCredits);

            const sortedSemesters = Object.keys(semMap).sort((a, b) => a.localeCompare(b));
            let runningPoints = 0;
            let runningCredits = 0;
            const newGpaHistory = sortedSemesters.map((sem) => {
              const gpa = Number((semMap[sem].totalPoints / semMap[sem].totalCredits).toFixed(2));
              runningPoints += semMap[sem].totalPoints;
              runningCredits += semMap[sem].totalCredits;
              const cgpa = Number((runningPoints / runningCredits).toFixed(2));
              return {
                semester: sem,
                gpa,
                cgpa,
                credits: semMap[sem].totalCredits,
              };
            });

            setGpaData(newGpaHistory);
          }
        }
      } catch (err) {
        console.error('Error loading student results for GPA trend:', err);
      }

      try {
        const studentId = resolvedStudentId || studentProfile?.id || studentProfile?._id;
        if (studentId) {
          const attRes = await api.get(`/api/attendance/student/${studentId}`);
          if (attRes.data?.success && attRes.data?.data) {
            const { monthly, stats: dbStats, subjectWise: dbSubjectWise } = attRes.data.data;
            if (dbStats) {
              setAttendanceStats(dbStats);
            }
            if (dbSubjectWise) {
              setSubjectWise(dbSubjectWise.slice(0, 4));
            }
            if (monthly && monthly.length > 0) {
              const curMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
              let targetMonthRecord = monthly.find((m: any) => m.month === curMonthStr);
              if (!targetMonthRecord) {
                targetMonthRecord = monthly[0];
              }

              if (targetMonthRecord) {
                setAttendanceHistoryData([
                  { name: 'Present', count: targetMonthRecord.present || 0, fill: '#10B981' },
                  { name: 'Absent', count: targetMonthRecord.absent || 0, fill: '#EF4444' },
                  { name: 'Late', count: targetMonthRecord.late || 0, fill: '#F59E0B' },
                ]);
                const parts = targetMonthRecord.month.split('-');
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
                setDisplayMonth(date.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
              } else {
                setAttendanceHistoryData([]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading student attendance history:', err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [path]);

  if (path !== '/dashboard/student' && path !== '/dashboard' && path !== '/dashboard/') {
    return <Outlet />;
  }

  const attPctVal = attendanceStats
    ? attendanceStats.percentage
    : studentProfile?.attendancePercentage || 85;
  const shortage = attPctVal < 75;

  const academicSummaryItems = [
    { label: 'Student Name', value: studentProfile?.fullName || user?.fullName || 'Student' },
    {
      label: 'Current Semester',
      value: studentProfile?.semester ? `Sem ${studentProfile.semester}` : 'N/A',
    },
    { label: 'Total Credits Earned', value: String(earnedCredits) },
    { label: 'CGPA', value: studentProfile?.cgpa ? String(studentProfile.cgpa) : currentCgpa },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${studentProfile?.fullName || user?.fullName || 'Student'}`}
        desc="Track attendance, view results, submit assignments, and manage academic activities."
      />

      {/* Shortage warning alert widget */}
      {shortage && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex items-start gap-3.5">
          <div className="p-2 bg-red-500 rounded-xl text-white">
            <AlertTriangle className="size-5 shrink-0" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-red-800 font-sans">Attendance Shortage Alert</h4>
            <p className="text-xs text-red-700/80 mt-1">
              Your overall attendance is <strong className="font-extrabold">{attPctVal}%</strong>,
              which is below the minimum required 75%. You are at risk of losing examination
              eligibility.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((n) => (
              <Card key={n} className="h-28 animate-pulse bg-muted/40">
                <div />
              </Card>
            ))
          : stats
              .filter((stat) => stat.label !== 'Pending Assignments')
              .map((stat, i) => {
                const label = stat.label;
                let val = stat.value;
                if (label === 'Overall Attendance' && attendanceStats) {
                  val = `${attendanceStats.percentage}%`;
                }
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <StatCard
                      label={label}
                      value={val}
                      change={stat.change}
                      icon={statIcons[i % statIcons.length]}
                      gradient={statGradients[i % statGradients.length]}
                    />
                  </motion.div>
                );
              })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Attendance Summary</h3>
              <p className="text-xs text-muted-foreground">{displayMonth} breakdown</p>
            </div>
            <Badge tone={shortage ? 'danger' : 'success'}>{attPctVal}% Overall</Badge>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />
            ) : attendanceHistoryData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={attendanceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {attendanceHistoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No attendance history records found in database.
              </div>
            )}
          </div>
        </Card>

        {/* Conducted/Attended/Absent summary cards */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <Activity className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-2.5">
              {[
                {
                  label: 'View Timetable',
                  tone: 'info' as const,
                  to: '/dashboard/student/timetable',
                },
                { label: 'Pay Fees', tone: 'warn' as const, to: '/dashboard/student/fees' },
                { label: 'Register Event', tone: 'info' as const, to: '/dashboard/student/events' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate({ to: item.to })}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer text-left"
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <Badge tone={item.tone}>Action</Badge>
                </button>
              ))}
            </div>
          </div>

          {attendanceStats && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                Class Slot Breakdown
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Conducted Classes</span>
                <span className="font-bold">{attendanceStats.total || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Attended (Present/Late)</span>
                <span className="font-bold text-emerald-600">
                  {(attendanceStats.present || 0) + (attendanceStats.late || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Absent Classes</span>
                <span className="font-bold text-red-500">{attendanceStats.absent || 0}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Subject-wise breakdown bars */}
        {subjectWise.length > 0 ? (
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-sm mb-3">Course Attendance Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subjectWise.map((sw) => {
                const isShort = sw.percentage < 75;
                return (
                  <div
                    key={sw.subject}
                    className="p-3 border rounded-xl bg-gradient-soft flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold truncate flex-1">{sw.subject}</span>
                      <span
                        className={`text-xs font-bold ${isShort ? 'text-red-500' : 'text-emerald-500'}`}
                      >
                        {sw.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isShort ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${sw.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1.5 flex justify-between">
                      <span>
                        Attended: {sw.present + sw.late}/{sw.total}
                      </span>
                      <span>{isShort ? 'Shortage' : 'Good'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">GPA & CGPA Progress</h3>
                <p className="text-xs text-muted-foreground">
                  Semester-wise GPA and Cumulative CGPA tracking
                </p>
              </div>
              <Badge tone="success">{currentCgpa}</Badge>
            </div>
            <div className="h-72">
              {gpaData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={gpaData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      name="Semester GPA"
                      stroke="#4F46E5"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cgpa"
                      name="CGPA"
                      stroke="#10B981"
                      strokeWidth={2.5}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                  No GPA progress records found in database.
                </div>
              )}
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-indigo" />
            <h3 className="font-semibold">Academic Summary</h3>
          </div>
          <div className="space-y-3">
            {loading
              ? [1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-11 bg-muted/20 animate-pulse rounded-xl border" />
                ))
              : academicSummaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
                  >
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="font-bold text-xs">{item.value}</span>
                  </div>
                ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activities</h3>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-muted/20 animate-pulse rounded-xl border" />
              ))
            ) : activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div
                  key={activity.actor + activity.time + idx}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  <div className="size-9 rounded-full bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {activity.actor.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{activity.actor}</span>{' '}
                    <span className="text-muted-foreground">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.target}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">{activity.time}</div>
                  </div>
                  <Badge>{activity.type}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent activities found in database.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications Panel</h3>
            <Bell className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-muted/20 animate-pulse rounded-xl border" />
              ))
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50' : 'hover:bg-accent/50'}`}
                >
                  <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </div>
                  <Badge
                    tone={
                      notification.type === 'Alert'
                        ? 'danger'
                        : notification.type === 'Assignment'
                          ? 'warn'
                          : 'info'
                    }
                  >
                    {notification.type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                You are all caught up! No notifications.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
