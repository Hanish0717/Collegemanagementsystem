import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";

export function StudentAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Overall Attendance", value: "0%", tone: "success" as const },
    { label: "Present Days", value: "0", tone: "info" as const },
    { label: "Absent Days", value: "0", tone: "danger" as const },
    { label: "This Month", value: "0%", tone: "success" as const },
  ]);
  const [loading, setLoading] = useState(true);

  // Current Month calculations
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([
    { name: "Present", count: 0, fill: "#10B981" },
    { name: "Absent", count: 0, fill: "#EF4444" },
    { name: "Late", count: 0, fill: "#F59E0B" }
  ]);

  const thisMonthName = new Date().toLocaleString("en-US", { month: "long" });

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        let profileStr = localStorage.getItem("cms_student_profile");
        let profile = profileStr ? JSON.parse(profileStr) : null;

        if (!profile || !profile._id) {
          const dashRes = await api.get("/api/student-module/dashboard");
          if (dashRes.data?.success && dashRes.data?.data?.profile) {
            profile = dashRes.data.data.profile;
            localStorage.setItem("cms_student_profile", JSON.stringify(profile));
          }
        }

        if (!profile || !profile._id) {
          setLoading(false);
          return;
        }

        const res = await api.get(`/api/attendance/student/${profile._id}`);
        if (res.data?.success && res.data?.data) {
          const { records: dbRecords, stats: dbStats } = res.data.data;

          const activeRecords = dbRecords || [];
          const formatted = activeRecords.map((r: any) => ({
            date: new Date(r.date).toISOString().split('T')[0],
            subject: r.subject,
            period: r.period || null,
            time: r.time || "09:00 AM",
            status: r.status.charAt(0).toUpperCase() + r.status.slice(1)
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
            const overall = dbStats.percentage !== undefined ? `${dbStats.percentage}%` : "0%";
            const present = dbStats.present !== undefined ? String(dbStats.present) : "0";
            const absent = dbStats.absent !== undefined ? String(dbStats.absent) : "0";

            setStats([
              { label: "Overall Attendance", value: overall, tone: "success" as const },
              { label: "Present Days", value: present, tone: "info" as const },
              { label: "Absent Days", value: absent, tone: "danger" as const },
              { label: "This Month", value: overall, tone: "success" as const },
            ]);
          }
        }
      } catch (err) {
        console.error("Error loading attendance records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Tracking"
        desc="View your attendance history, monthly statistics, and records."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="h-24 animate-pulse bg-muted/40" />
          ))
        ) : (
          stats.map(stat => (
            <Card key={stat.label}>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-bold mt-2">{stat.value}</div>
              <Badge tone={stat.tone} className="mt-3">
                Current
              </Badge>
            </Card>
          ))
        )}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">{thisMonthName} Attendance Summary</h3>
        <div className="h-72">
          {loading ? (
            <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />
          ) : (
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
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Attendance Records</h3>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl animate-pulse bg-muted/10">
            Loading attendance records ledger...
          </div>
        ) : (
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
                {records.map((record, index) => (
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
                      <Badge tone={record.status === "Present" ? "success" : record.status === "Late" ? "warn" : "danger"}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// Inline implementation of cell coloring if Cell is not directly imported
function Cell(props: any) {
  const { fill, ...rest } = props;
  return <path fill={fill} {...rest} />;
}
