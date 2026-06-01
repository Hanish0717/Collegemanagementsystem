import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingDown } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import api from "@/lib/api";

export function ParentAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [subjectAttendance, setSubjectAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Overall Attendance", value: "0%", tone: "success" as const },
    { label: "Present Days", value: "0", tone: "info" as const },
    { label: "Absent Days", value: "0", tone: "danger" as const },
    { label: "This Month", value: "0%", tone: "success" as const },
  ]);
  const [attendanceHistoryData, setAttendanceHistoryData] = useState<any[]>([]);

  const handleDownloadReport = () => {
    if (records.length === 0) {
      toast.error("No attendance records found to download.");
      return;
    }
    
    try {
      const headers = ["Date", "Subject", "Status", "Remarks"];
      const rows = records.map((r: any) => [
        r.date ? new Date(r.date).toISOString().split('T')[0] : "-",
        r.subject || "-",
        r.status || "-",
        r.remarks || "-"
      ]);

      const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `child_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Successfully generated and downloaded attendance report CSV!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report.");
    }
  };

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        let childId = "";
        const cached = localStorage.getItem("cms_parent_child_data");
        if (cached) {
          const parsed = JSON.parse(cached);
          childId = parsed.childId;
        }

        if (!childId) {
          const resProfile = await api.get("/api/parent-module/student-data");
          if (resProfile.data?.success && resProfile.data?.data) {
            childId = resProfile.data.data.childId;
            localStorage.setItem("cms_parent_child_data", JSON.stringify(resProfile.data.data));
          }
        }

        if (childId) {
          const res = await api.get(`/api/attendance/student/${childId}`);
          if (res.data?.success && res.data?.data) {
            const { records: dbRecords, stats: dbStats } = res.data.data;
            const activeRecords = dbRecords || [];
            
            setRecords(activeRecords);
            
            if (activeRecords.length > 0) {
              // Calculate subject wise stats
              const subjectMap: Record<string, { total: number, attended: number }> = {};
              activeRecords.forEach((r: any) => {
                const sub = r.subject || "Data Structures";
                if (!subjectMap[sub]) {
                  subjectMap[sub] = { total: 0, attended: 0 };
                }
                subjectMap[sub].total += 1;
                if (r.status.toLowerCase() === "present" || r.status.toLowerCase() === "late") {
                  subjectMap[sub].attended += 1;
                }
              });

              const computedSubjects = Object.entries(subjectMap).map(([subject, counts]) => {
                const pct = counts.total > 0 ? Math.round((counts.attended / counts.total) * 100) : 0;
                const status = pct >= 90 ? "Excellent" : pct >= 80 ? "Good" : "Average";
                return {
                  subject,
                  total: counts.total,
                  attended: counts.attended,
                  percentage: pct,
                  status
                };
              });

              setSubjectAttendance(computedSubjects);

              // Calculate monthly history dynamically (last 5 months)
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const monthlyMap: Record<string, { present: number, absent: number }> = {};
              
              const today = new Date();
              const last5Months: string[] = [];
              for (let i = 4; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const mName = months[d.getMonth()];
                last5Months.push(mName);
                monthlyMap[mName] = { present: 0, absent: 0 };
              }

              activeRecords.forEach((r: any) => {
                const recDate = new Date(r.date);
                const mName = months[recDate.getMonth()];
                if (monthlyMap[mName] !== undefined) {
                  if (r.status.toLowerCase() === "present" || r.status.toLowerCase() === "late") {
                    monthlyMap[mName].present += 1;
                  } else if (r.status.toLowerCase() === "absent") {
                    monthlyMap[mName].absent += 1;
                  }
                }
              });

              const computedHistory = last5Months.map(mName => ({
                month: mName,
                present: monthlyMap[mName].present,
                absent: monthlyMap[mName].absent
              }));
              setAttendanceHistoryData(computedHistory);
            } else {
              setSubjectAttendance([]);
              setAttendanceHistoryData([]);
            }

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
        }
      } catch (err) {
        console.error("Error loading parent child attendance:", err);
      }
    };
    loadAttendance();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Child Attendance"
        desc="Monitor child's attendance across subjects with detailed analytics and history."
        actions={
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <Download className="size-4" /> Download Report
          </button>
        }
      />

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

      <Card>
        <h3 className="font-semibold mb-4">Monthly Attendance</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={attendanceHistoryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Subject",
                  "Total Classes",
                  "Attended Classes",
                  "Attendance Percentage",
                  "Status",
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
              {subjectAttendance.map((subject, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{subject.subject}</td>
                  <td className="py-3 px-4">{subject.total}</td>
                  <td className="py-3 px-4">{subject.attended}</td>
                  <td className="py-3 px-4 font-medium">{subject.percentage}%</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        subject.status === "Excellent"
                          ? "success"
                          : subject.status === "Good"
                            ? "info"
                            : "warn"
                      }
                    >
                      {subject.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="size-5 text-amber-600" />
          <h3 className="font-semibold">Low Attendance Alerts</h3>
        </div>
        <div className="space-y-2">
          {subjectAttendance
            .filter((s) => s.percentage < 85)
            .map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <span className="text-sm font-medium">{subject.subject}</span>
                <Badge tone="warn">{subject.percentage}%</Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
