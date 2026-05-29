import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingDown } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceHistory, subjectAttendance as mockSubjectAttendance } from "@/mock/parentData";
import api from "@/lib/api";

export function ParentAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [subjectAttendance, setSubjectAttendance] = useState<any[]>(mockSubjectAttendance);
  const [stats, setStats] = useState([
    { label: "Overall Attendance", value: "87.3%", tone: "success" as const },
    { label: "Present Days", value: "108", tone: "info" as const },
    { label: "Absent Days", value: "12", tone: "danger" as const },
    { label: "This Month", value: "92%", tone: "success" as const },
  ]);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        let childUserId = "";
        const cached = localStorage.getItem("cms_parent_child_data");
        if (cached) {
          const parsed = JSON.parse(cached);
          childUserId = parsed.childUserId;
        }

        if (!childUserId) {
          const resProfile = await api.get("/api/parent-module/student-data");
          if (resProfile.data?.success && resProfile.data?.data) {
            childUserId = resProfile.data.data.childUserId;
            localStorage.setItem("cms_parent_child_data", JSON.stringify(resProfile.data.data));
          }
        }

        if (childUserId) {
          const res = await api.get(`/api/attendance/student/${childUserId}`);
          if (res.data?.success && res.data?.data) {
            const { records: dbRecords, stats: dbStats } = res.data.data;
            if (dbRecords && dbRecords.length > 0) {
              setRecords(dbRecords);
              
              // Calculate subject wise stats
              const subjectMap: Record<string, { total: number, attended: number }> = {};
              dbRecords.forEach((r: any) => {
                const sub = r.subject || "Data Structures";
                if (!subjectMap[sub]) {
                  subjectMap[sub] = { total: 0, attended: 0 };
                }
                subjectMap[sub].total += 1;
                if (r.status.toLowerCase() === "present") {
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

              if (computedSubjects.length > 0) {
                setSubjectAttendance(computedSubjects);
              }
            }

            if (dbStats) {
              const overall = dbStats.percentage !== undefined ? `${dbStats.percentage}%` : "87.3%";
              const present = dbStats.present !== undefined ? String(dbStats.present) : "108";
              const absent = dbStats.absent !== undefined ? String(dbStats.absent) : "12";
              
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
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Monthly Attendance</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={attendanceHistory}>
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
                {["Subject", "Total Classes", "Attended Classes", "Attendance Percentage", "Status"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
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
                    <Badge tone={subject.status === "Excellent" ? "success" : subject.status === "Good" ? "info" : "warn"}>
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
          {subjectAttendance.filter(s => s.percentage < 85).map((subject, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
              <span className="text-sm font-medium">{subject.subject}</span>
              <Badge tone="warn">{subject.percentage}%</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
