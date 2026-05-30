import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, QrCode, Search } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceAlerts, attendanceMonitoring, students } from "@/mock/adminData";
import api from "@/lib/api";

export function AdminAttendance() {
  const [reportData, setReportData] = useState<any>(null);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Map "All Departments" or similar to standard query param
        let deptParam = undefined;
        if (selectedDept !== "All Departments") {
          // Find short code from selection
          if (selectedDept.includes("Computer Science")) deptParam = "CSE";
          else if (selectedDept.includes("Artificial Intelligence & Machine Learning")) deptParam = "AIML";
          else if (selectedDept.includes("Data Science")) deptParam = "AIDS";
          else if (selectedDept.includes("Cybersecurity")) deptParam = "CYBERSECURITY";
          else if (selectedDept.includes("Information Technology")) deptParam = "IT";
          else if (selectedDept.includes("Electronics")) deptParam = "ECE";
          else if (selectedDept.includes("Electrical")) deptParam = "EEE";
          else if (selectedDept.includes("Mechanical")) deptParam = "MECH";
          else if (selectedDept.includes("Civil")) deptParam = "CIVIL";
          else deptParam = selectedDept;
        }

        const res = await api.get("/api/attendance/report", {
          params: {
            department: deptParam
          }
        });

        if (res.data?.success && res.data?.data) {
          setReportData(res.data.data);
        }

        const resStudents = await api.get("/api/students", {
          params: {
            department: deptParam,
            search: search || undefined,
            limit: 50
          }
        });

        if (resStudents.data?.success && resStudents.data?.data?.students) {
          setStudentList(resStudents.data.data.students);
        }
      } catch (err) {
        console.error("Error loading admin attendance report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [selectedDept, search]);

  const overall = reportData?.overallPercentage !== undefined ? `${reportData.overallPercentage}%` : "87.3%";
  const presentCount = reportData?.totals?.present !== undefined ? String(reportData.totals.present) : "2,484";
  const absentCount = reportData?.totals?.absent !== undefined ? String(reportData.totals.absent) : "363";
  const lowCount = reportData?.lowAttendanceStudents ? String(reportData.lowAttendanceStudents.length) : "47";

  const alerts = reportData?.lowAttendanceStudents && reportData.lowAttendanceStudents.length > 0
    ? reportData.lowAttendanceStudents.slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Monitoring"
        desc="Track daily attendance, department-wise analytics, low attendance alerts and QR-based attendance."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Overall Attendance", value: overall, tone: "success" as const },
          { label: "Present Today", value: presentCount, tone: "info" as const },
          { label: "Absent Today", value: absentCount, tone: "warn" as const },
          { label: "Low Attendance (<75%)", value: lowCount, tone: "danger" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Today
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search attendance by student ID, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm focus:outline-none"
          >
            {[
              "All Departments",
              "Computer Science & Engineering",
              "Artificial Intelligence & Machine Learning",
              "Artificial Intelligence & Data Science",
              "Cybersecurity",
              "Information Technology",
              "Electronics & Communication Engineering",
              "Electrical & Electronics Engineering",
              "Mechanical Engineering",
              "Civil Engineering"
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Daily Attendance Trends</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={attendanceMonitoring}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold">Low Attendance Alerts</h3>
          </div>
          <div className="space-y-2">
            {alerts.length > 0 ? (
              alerts.map((alert: any) => (
                <div key={alert.id || alert._id} className="p-3 rounded-xl border bg-gradient-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{alert.fullName}</span>
                    <Badge tone="danger">{alert.attendancePercentage}%</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Roll No: {alert.rollNumber} | Dept: {alert.department}
                  </div>
                </div>
              ))
            ) : (
              attendanceAlerts.map((alert) => (
                <div key={alert.department} className="p-3 rounded-xl border bg-gradient-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{alert.department}</span>
                    <Badge tone="danger">{alert.studentsBelow75} below 75%</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {alert.totalStudents} total students (Mock)
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Student Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Student ID",
                  "Name",
                  "Department",
                  "Year",
                  "Attendance Percentage",
                  "Status",
                  "Actions",
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
              {studentList.length > 0 ? (
                studentList.map((student) => (
                  <tr key={student.id || student._id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{student.rollNumber}</td>
                    <td className="py-3 px-4 font-medium">{student.fullName}</td>
                    <td className="py-3 px-4">
                      <Badge tone="info">{typeof student.department === "object" ? student.department.code : student.department}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">Year {student.year}</td>
                    <td className="py-3 px-4 font-medium">{student.attendancePercentage || 100}%</td>
                    <td className="py-3 px-4">
                      <Badge tone={Number(student.attendancePercentage || 100) >= 75 ? "success" : "danger"}>
                        {Number(student.attendancePercentage || 100) >= 75 ? "Good" : "Low"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                students.slice(0, 5).map((student) => (
                  <tr key={student.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4">
                      <Badge tone="info">{student.department}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{student.year}</td>
                    <td className="py-3 px-4 font-medium">{student.attendance}</td>
                    <td className="py-3 px-4">
                      <Badge tone="success">Good</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                        Details (Mock)
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="size-5 text-indigo" />
            <h3 className="font-semibold">QR Attendance</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <select className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none">
                {[
                  "Computer Science & Engineering",
                  "Artificial Intelligence & Machine Learning",
                  "Artificial Intelligence & Data Science",
                  "Cybersecurity",
                  "Information Technology",
                  "Electronics & Communication Engineering",
                  "Electrical & Electronics Engineering",
                  "Mechanical Engineering",
                  "Civil Engineering"
                ].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  ),
                )}
              </select>
              <input
                placeholder="Enter class/section"
                className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <QrCode className="size-4" /> Generate QR Code
            </button>
            <div className="text-center text-xs text-muted-foreground">
              Students can scan QR code to mark attendance
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
