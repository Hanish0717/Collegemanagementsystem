import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const statIcons = [GraduationCap, TrendingUp, BookOpen, Calendar, DollarSign, CheckCircle, MapPin, Activity];
const statGradients = [
  "bg-gradient-primary",
  "bg-gradient-violet",
  "bg-gradient-cyan",
  "bg-gradient-primary",
  "bg-gradient-violet",
  "bg-gradient-cyan",
  "bg-gradient-primary",
  "bg-gradient-violet",
];

const gradePoints: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0
};

export function StudentDashboard() {
  const path = useRouterState({ select: r => r.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState<any>(() => {
    const stored = localStorage.getItem("cms_student_profile");
    return stored ? JSON.parse(stored) : null;
  });

  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [gpaData, setGpaData] = useState<any[]>([]);
  const [attendanceHistoryData, setAttendanceHistoryData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentCgpa, setCurrentCgpa] = useState("0.0");
  const [currentAttendance, setCurrentAttendance] = useState("0%");
  const [earnedCredits, setEarnedCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (path !== "/dashboard/student") return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const dashRes = await api.get("/api/student-module/dashboard");
        if (dashRes.data?.success && dashRes.data?.data) {
          const { stats: dbStats, activities: dbActivities, notifications: dbNotifs, profile } = dashRes.data.data;

          setStats(dbStats || []);
          setActivities(dbActivities || []);
          setNotifications(dbNotifs || []);

          if (profile) {
            setStudentProfile(profile);
            localStorage.setItem("cms_student_profile", JSON.stringify(profile));
            if (profile.attendancePercentage !== undefined) {
              setCurrentAttendance(`${profile.attendancePercentage}%`);
            }
            if (profile.cgpa !== undefined) {
              setCurrentCgpa(String(profile.cgpa));
            }
          }
        }
      } catch (err) {
        console.error("Error loading student dashboard:", err);
      }

      try {
        const resultsRes = await api.get("/api/student-module/results");
        if (resultsRes.data?.success && resultsRes.data?.data) {
          const dbResults = resultsRes.data.data;
          if (dbResults.length > 0) {
            const semMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
            let totalCredits = 0;

            dbResults.forEach((res: any) => {
              const sem = res.semester ? `Sem ${res.semester}` : "Sem 5";
              const grade = res.grade || "A";
              const credits = res.credits || 3;
              const gp = gradePoints[grade] !== undefined ? gradePoints[grade] : 3.0;

              if (grade !== "F") {
                totalCredits += credits;
              }

              if (!semMap[sem]) {
                semMap[sem] = { totalPoints: 0, totalCredits: 0 };
              }
              semMap[sem].totalPoints += gp * credits;
              semMap[sem].totalCredits += credits;
            });

            setEarnedCredits(totalCredits);

            const newGpaHistory = Object.keys(semMap).map(sem => {
              const gpa = Number((semMap[sem].totalPoints / semMap[sem].totalCredits).toFixed(2));
              return {
                semester: sem,
                gpa,
                credits: semMap[sem].totalCredits
              };
            }).sort((a, b) => a.semester.localeCompare(b.semester));

            setGpaData(newGpaHistory);
          }
        }
      } catch (err) {
        console.error("Error loading student results for GPA trend:", err);
      }

      try {
        const storedProfile = localStorage.getItem("cms_student_profile");
        const profile = storedProfile ? JSON.parse(storedProfile) : null;
        const studentId = profile?.id || profile?._id;
        if (studentId) {
          const attRes = await api.get(`/api/attendance/student/${studentId}`);
          if (attRes.data?.success && attRes.data?.data) {
            const { monthly } = attRes.data.data;
            if (monthly && monthly.length > 0) {
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const formatted = monthly.map((m: any) => {
                const parts = m.month.split("-");
                const year = Number(parts[0]);
                const monthIdx = Number(parts[1]) - 1;
                const date = new Date(year, monthIdx, 1);
                return {
                  month: monthNames[date.getMonth()],
                  percentage: m.percentage
                };
              }).reverse();
              setAttendanceHistoryData(formatted);
            }
          }
        }
      } catch (err) {
        console.error("Error loading student attendance history:", err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [path]);

  if (path !== "/dashboard/student") {
    return <Outlet />;
  }

  const academicSummaryItems = [
    { label: "Student Name", value: studentProfile?.fullName || user?.fullName || "Student" },
    { label: "Current Semester", value: studentProfile?.semester ? `Sem ${studentProfile.semester}` : "N/A" },
    { label: "Total Credits Earned", value: String(earnedCredits) },
    { label: "CGPA", value: studentProfile?.cgpa ? String(studentProfile.cgpa) : currentCgpa },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${studentProfile?.fullName || user?.fullName || "Student"}`}
        desc="Track attendance, view results, submit assignments, and manage academic activities."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.length > 0 ? (
          stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <StatCard label={stat.label} value={stat.value} change={stat.change} icon={statIcons[i % statIcons.length]} gradient={statGradients[i % statGradients.length]} />
            </motion.div>
          ))
        ) : (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="h-28 animate-pulse bg-muted/40" />
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Attendance History</h3>
              <p className="text-xs text-muted-foreground">Monthly attendance percentage</p>
            </div>
            <Badge tone="success">{currentAttendance}</Badge>
          </div>
          <div className="h-72">
            {attendanceHistoryData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={attendanceHistoryData}>
                  <defs>
                    <linearGradient id="student-attendance" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4F46E5"
                    fill="url(#student-attendance)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No attendance history records found in database.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {[
              { label: "View Timetable", tone: "info" as const, to: "/dashboard/student/timetable" },
              { label: "Submit Assignment", tone: "success" as const, to: "/dashboard/student/assignments" },
              { label: "Pay Fees", tone: "warn" as const, to: "/dashboard/student/fees" },
              { label: "Register Event", tone: "info" as const, to: "/dashboard/student/events" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate({ to: item.to })}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer text-left"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <Badge tone={item.tone}>Action</Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">GPA Progress</h3>
              <p className="text-xs text-muted-foreground">Semester-wise GPA tracking</p>
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
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No GPA progress records found in database.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-indigo" />
            <h3 className="font-semibold">Academic Summary</h3>
          </div>
          <div className="space-y-3">
            {academicSummaryItems.map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-bold">{item.value}</span>
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
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div key={activity.actor + activity.time + idx} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="size-9 rounded-full bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {activity.actor.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{activity.actor}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
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
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50" : "hover:bg-accent/50"}`}
                >
                  <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </div>
                  <Badge
                    tone={
                      notification.type === "Alert"
                        ? "danger"
                        : notification.type === "Assignment"
                          ? "warn"
                          : "info"
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
