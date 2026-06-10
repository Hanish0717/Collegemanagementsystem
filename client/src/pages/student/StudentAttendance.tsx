import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import api from "@/lib/api";

export function StudentAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [subjectWise, setSubjectWise] = useState<any[]>([]);
  const [overallPercentage, setOverallPercentage] = useState(100);
  const [stats, setStats] = useState([
    { label: "Overall Attendance", value: "0%", tone: "success" as const },
    { label: "Present Days", value: "0", tone: "info" as const },
    { label: "Absent Days", value: "0", tone: "danger" as const },
    { label: "Total Classes", value: "0", tone: "success" as const },
  ]);

  // Current Month calculations
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([
    { name: "Present", count: 0, fill: "#10B981" },
    { name: "Absent", count: 0, fill: "#EF4444" },
    { name: "Late", count: 0, fill: "#F59E0B" }
  ]);

  const thisMonthName = new Date().toLocaleString("en-US", { month: "long" });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Fetch fresh profile from dashboard API first
        const dashRes = await api.get("/api/student-module/dashboard");
        let studentId = "";
        if (dashRes.data?.success && dashRes.data?.data?.profile) {
          const profile = dashRes.data.data.profile;
          studentId = profile._id || profile.id;
          localStorage.setItem("cms_student_profile", JSON.stringify(profile));
        } else {
          // Fallback to localStorage
          const profileStr = localStorage.getItem("cms_student_profile");
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            studentId = profile?._id || profile?.id;
          }
        }

        if (!studentId) return;

        const res = await api.get(`/api/attendance/student/${studentId}`);
        if (res.data?.success && res.data?.data) {
          const { records: dbRecords, stats: dbStats, subjectWise: dbSubjectWise } = res.data.data;

          if (dbSubjectWise) {
            setSubjectWise(dbSubjectWise);
          }

          const activeRecords = dbRecords || [];
          const formatted = activeRecords.map((r: any) => ({
            date: new Date(r.date).toISOString().split('T')[0],
            subject: r.subject,
            period: r.period || null,
            time: r.time || "09:00 AM",
            status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "Present"
          }));

          // Sort records descending by date, secondary descending by period
          const sorted = [...formatted].sort((a: any, b: any) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            const pA = a.period ? Number(a.period) : 0;
            const pB = b.period ? Number(b.period) : 0;
            return pB - pA;
          });
          setRecords(sorted);

          // Group current month records
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const currentMonthRecords = formatted.filter((r: any) => {
            const recDate = new Date(r.date);
            return recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear;
          });

          const currentPresent = currentMonthRecords.filter((r: any) => r.status === "Present").length;
          const currentAbsent = currentMonthRecords.filter((r: any) => r.status === "Absent").length;
          const currentLate = currentMonthRecords.filter((r: any) => r.status === "Late").length;

          setMonthlyChartData([
            { name: "Present", count: currentPresent, fill: "#10B981" },
            { name: "Absent", count: currentAbsent, fill: "#EF4444" },
            { name: "Late", count: currentLate, fill: "#F59E0B" }
          ]);

          if (dbStats) {
            const pctVal = dbStats.percentage !== undefined ? dbStats.percentage : 100;
            setOverallPercentage(pctVal);
            const overall = `${pctVal}%`;
            const present = dbStats.present !== undefined ? String(dbStats.present) : "0";
            const absent = dbStats.absent !== undefined ? String(dbStats.absent) : "0";
            const total = dbStats.total !== undefined ? String(dbStats.total) : "0";

            setStats([
              { label: "Overall Attendance", value: overall, tone: (pctVal >= 75 ? "success" : "danger") as any },
              { label: "Present Days", value: present, tone: "info" as const },
              { label: "Absent Days", value: absent, tone: "danger" as const },
              { label: "Total Conducted", value: total, tone: "success" as const },
            ]);
          }
        }
      } catch (err) {
        console.error("Error loading attendance records:", err);
      }
    };
    fetchAttendance();
  }, []);

  const shortage = overallPercentage < 75;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Tracking"
        desc="View your attendance history, monthly statistics, subject-wise status, and exam eligibility."
      />

      {/* Exam Eligibility Warnings / Banners */}
      {shortage ? (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex items-start gap-3.5 animate-pulse">
          <div className="p-2 bg-red-500 rounded-xl text-white">
            <AlertTriangle className="size-5 shrink-0" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-red-800">Attendance Shortage Alert</h4>
            <p className="text-xs text-red-700/80 mt-1">
              Your overall attendance is currently <strong className="font-extrabold">{overallPercentage}%</strong>, which falls below the institutional minimum threshold of <strong className="font-extrabold">75%</strong>. You are currently <strong className="underline">NOT eligible</strong> to sit for examinations unless condoned or excused by academic office.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3.5">
          <div className="p-2 bg-emerald-500 rounded-xl text-white">
            <CheckCircle className="size-5 shrink-0" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-800">Attendance Status: Eligible</h4>
            <p className="text-xs text-emerald-700/80 mt-1">
              Congratulations! Your overall attendance is <strong className="font-bold">{overallPercentage}%</strong>. You meet the minimum requirements and are fully eligible for institutional evaluations, placements, and terminal examinations.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Subject-Wise Breakdown */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4 text-base">Subject-wise Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Subject Name", "Conducted", "Attended", "Absent", "Percentage", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {subjectWise.length > 0 ? (
                  subjectWise.map((sw) => {
                    const isLow = sw.percentage < 75;
                    const attended = sw.present + sw.late;
                    return (
                      <tr key={sw.subject} className={`hover:bg-accent/50 transition ${isLow ? "bg-red-50/20" : ""}`}>
                        <td className="py-3 px-4 font-medium">{sw.subject}</td>
                        <td className="py-3 px-4 text-muted-foreground">{sw.total}</td>
                        <td className="py-3 px-4 text-emerald-600 font-medium">{attended}</td>
                        <td className="py-3 px-4 text-red-500 font-medium">{sw.absent}</td>
                        <td className="py-3 px-4 font-bold">{sw.percentage}%</td>
                        <td className="py-3 px-4">
                          <Badge tone={isLow ? "danger" : "success"}>
                            {isLow ? "Shortage" : "Good"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No subject-wise details available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chart */}
        <Card>
          <h3 className="font-semibold mb-4">{thisMonthName} Attendance Summary</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Detailed Attendance Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Date", "Subject", "Period", "Time", "Status"].map((column) => (
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
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={index} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium">{record.date}</td>
                    <td className="py-3 px-4">
                      <Badge tone="info">{record.subject}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-xs">
                      {record.period ? `Period ${record.period}` : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{record.time || "N/A"}</td>
                    <td className="py-3 px-4">
                      <Badge tone={
                        record.status === "Present" 
                          ? "success" 
                          : record.status === "Late" 
                            ? "warn" 
                            : record.status === "Excused" 
                              ? "info"
                              : "danger"
                      }>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No detailed attendance logs found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Cell(props: any) {
  const { fill, ...rest } = props;
  return <path fill={fill} {...rest} />;
}
