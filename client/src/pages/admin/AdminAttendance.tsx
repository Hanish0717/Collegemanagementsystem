import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, QrCode, Search, Folder, ArrowLeft, RefreshCw, Download, Settings, ShieldAlert, Calendar } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import api from "@/lib/api";
import { toast } from "sonner";

const departmentsList = [
  { code: "CSE", name: "Computer Science & Engineering", iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  { code: "AIML", name: "Artificial Intelligence & Machine Learning", iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  { code: "AIDS", name: "Artificial Intelligence & Data Science", iconColor: "text-purple-600 bg-purple-50 border-purple-100" },
  { code: "ECE", name: "Electronics & Communication Engineering", iconColor: "text-amber-600 bg-amber-50 border-amber-100" },
  { code: "EEE", name: "Electrical & Electronics Engineering", iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { code: "CYBERSECURITY", name: "Cybersecurity", iconColor: "text-red-600 bg-red-50 border-red-100" },
  { code: "IT", name: "Information Technology", iconColor: "text-pink-600 bg-pink-50 border-pink-100" },
  { code: "MECH", name: "Mechanical Engineering", iconColor: "text-blue-600 bg-blue-50 border-blue-100" },
  { code: "CIVIL", name: "Civil Engineering", iconColor: "text-slate-600 bg-slate-50 border-slate-100" }
];

export function AdminAttendance() {
  const [activeTab, setActiveTab] = useState<"monitor" | "leaves" | "settings">("monitor");

  const [leaveRequests, setLeaveRequests] = useState([
    { id: "LR-001", student: "Amit Verma", roll: "21CS001", type: "Medical Leave", dates: "2026-07-03 to 2026-07-06", reason: "Viral Typhoid Fever", status: "Pending" },
    { id: "LR-002", student: "Priya Sharma", roll: "21CS003", type: "On-Duty (OD)", dates: "2026-07-12", reason: "Representing college in sports meet", status: "Approved" }
  ]);

  const handleApproveLeave = (id: string, name: string) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: "Approved" } : l));
    toast.success(`Leave/OD request for ${name} has been approved!`);
  };


  const [reportData, setReportData] = useState<any>(null);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [activeFolderDept, setActiveFolderDept] = useState<string | null>(null);

  // QR Generator States
  const [qrDept, setQrDept] = useState("Computer Science & Engineering");
  const [qrClassSection, setQrClassSection] = useState("");
  const [qrSubject, setQrSubject] = useState("");
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);

  // Settings & Policies States
  const [policyThreshold, setPolicyThreshold] = useState("75");
  const [condonationFee, setCondonationFee] = useState("500");
  const [defaultStatus, setDefaultStatus] = useState("Absent");
  const [semStartDate, setSemStartDate] = useState("2026-06-01");
  const [semEndDate, setSemEndDate] = useState("2026-11-30");
  const [alertParents, setAlertParents] = useState(true);
  const [alertSMS, setAlertSMS] = useState(false);

  // Audit Logs Mock Database
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLogs, setAuditLogs] = useState([
    { id: "AUD-3829", time: "10 mins ago", user: "Dr. Rajesh Kumar (Faculty)", event: "Updated Roll 26CSE04 status from Absent to Excused", reason: "Medical certificate approved" },
    { id: "AUD-3828", time: "1 hour ago", user: "Prof. Sarah Sen (Faculty)", event: "Modified slot attendance for section ECE-A, period 3", reason: "Typo correction" },
    { id: "AUD-3827", time: "4 hours ago", user: "Dr. Rajesh Kumar (Faculty)", event: "Deleted duplicate attendance record for 26CSE12", reason: "Double punch" },
    { id: "AUD-3826", time: "1 day ago", user: "Dr. Anjali Mehra (Admin)", event: "Changed required attendance policy threshold from 75% to 80%", reason: "Academic board order" },
    { id: "AUD-3825", time: "1 day ago", user: "System Scheduler", event: "Generated low-attendance auto warning emails for 18 students", reason: "Weekly audit report" },
    { id: "AUD-3824", time: "2 days ago", user: "Prof. Sanjay Mishra (Faculty)", event: "Condoned Roll 26MECH08 low-attendance shortage", reason: "Sports department representation" }
  ]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        let deptParam = undefined;
        if (selectedDept !== "All Departments") {
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

  const handleSelectDeptChange = (dept: string) => {
    setSelectedDept(dept);
    if (dept === "All Departments") {
      setActiveFolderDept(null);
    } else {
      const found = departmentsList.find(d => d.name === dept);
      if (found) {
        setActiveFolderDept(found.code);
      }
    }
  };

  const handleSaveSettings = () => {
    toast.success("Attendance configurations and policies saved successfully!");
  };

  const overall = reportData?.overallPercentage !== undefined ? `${reportData.overallPercentage}%` : "100%";
  const presentCount = reportData?.totalsToday?.present !== undefined ? String(reportData.totalsToday.present) : "0";
  const absentCount = reportData?.totalsToday?.absent !== undefined ? String(reportData.totalsToday.absent) : "0";
  const lowCount = reportData?.lowAttendanceStudents ? String(reportData.lowAttendanceStudents.length) : "0";

  const activeAlerts = reportData?.departmentAlerts
    ? reportData.departmentAlerts.filter((a: any) => a.studentsBelow75 > 0)
    : [];

  const trendData = reportData?.trends && reportData.trends.length > 0 ? reportData.trends : [];

  const getDeptStudentCount = (code: string) => {
    const found = reportData?.departmentAlerts?.find((d: any) => d.department === code);
    return found ? found.totalStudents : 0;
  };

  const handleGenerateQr = () => {
    if (!qrClassSection.trim()) {
      toast.error("Please enter a class/section (e.g. A, B)");
      return;
    }
    if (!qrSubject.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    const qrData = JSON.stringify({
      department: qrDept,
      section: qrClassSection.trim(),
      subject: qrSubject.trim(),
      date: new Date().toISOString().split('T')[0]
    });

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
    setGeneratedQr(qrUrl);
    toast.success("QR Code generated successfully! Students can scan this to mark attendance.");
  };

  const filteredAuditLogs = auditLogs.filter(log =>
    log.event.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.id.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Monitoring"
        desc="Track daily attendance logs, configure settings/academic schedules, display shortages, and audit edits."
      />

      {/* Tabs */}
      <div className="flex border-b border-muted overflow-x-auto">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`px-6 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "monitor"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Monitor Attendance
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`px-6 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "leaves"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Leaves &amp; On-Duty (OD) Approvals
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "settings"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Policies, Settings &amp; Audits
        </button>
      </div>

      {activeTab === "monitor" && (
        <>
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
                onChange={(e) => handleSelectDeptChange(e.target.value)}
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
              <div className="h-72 flex items-center justify-center relative">
                {trendData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                      <Bar dataKey="present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    No attendance trend data available for the selected department.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-5 text-amber-600" />
                <h3 className="font-semibold">Low Attendance Alerts</h3>
              </div>
              <div className="space-y-2">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert: any) => {
                    const deptInfo = departmentsList.find(d => d.code === alert.department);
                    return (
                      <div key={alert.department} className="p-3 rounded-xl border bg-gradient-soft">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{deptInfo?.name || alert.department}</span>
                          <Badge tone="danger">{alert.studentsBelow75} below 75%</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.totalStudents} total students
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No low attendance alerts. All departments have good attendance.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Student Attendance Records</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeFolderDept 
                    ? `Viewing students in ${departmentsList.find(d => d.code === activeFolderDept)?.name}`
                    : "Select a department folder to view student records"}
                </p>
              </div>
              {activeFolderDept && (
                <button
                  onClick={() => {
                    setActiveFolderDept(null);
                    setSelectedDept("All Departments");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-accent text-xs font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" /> Back to Folders
                </button>
              )}
            </div>

            {activeFolderDept === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                {departmentsList.map((dept) => {
                  const studentCount = getDeptStudentCount(dept.code);
                  return (
                    <div
                      key={dept.code}
                      onClick={() => {
                        setActiveFolderDept(dept.code);
                        setSelectedDept(dept.name);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl border bg-background hover:bg-accent/40 hover:border-accent-foreground/20 cursor-pointer transition shadow-soft group"
                    >
                      <div className={`p-3 rounded-xl border ${dept.iconColor} shrink-0 group-hover:scale-105 transition duration-200`}>
                        <Folder className="size-6 fill-current opacity-80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition">
                          {dept.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span>{studentCount} Students</span>
                          <span>•</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted">
                            {dept.code}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
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
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                          No student records found in this folder.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="size-5 text-indigo" />
                <h3 className="font-semibold">QR Attendance Generator</h3>
              </div>
              <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
                <div className="grid sm:grid-cols-2 gap-4">
                  <select 
                    value={qrDept}
                    onChange={(e) => setQrDept(e.target.value)}
                    className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                  >
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
                    ].map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <input
                    placeholder="Enter class/section (e.g. A, B)"
                    value={qrClassSection}
                    onChange={(e) => setQrClassSection(e.target.value)}
                    className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    placeholder="Enter subject (e.g. Mathematics, Algorithms)"
                    value={qrSubject}
                    onChange={(e) => setQrSubject(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <button 
                  onClick={handleGenerateQr}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
                >
                  <QrCode className="size-4" /> Generate QR Code
                </button>
                <div className="text-center text-xs text-muted-foreground">
                  Students can scan this generated QR code using their device to mark their attendance.
                </div>
              </div>
            </Card>

            {generatedQr && (
              <Card className="flex flex-col items-center justify-center p-6 border rounded-xl bg-gradient-soft animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-4 self-start">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active QR Code Session</span>
                </div>
                <div className="relative p-3 bg-white border rounded-2xl shadow-soft">
                  <img 
                    src={generatedQr} 
                    alt="Generated Attendance QR" 
                    className="size-48 object-contain"
                  />
                </div>
                <div className="text-center mt-4 space-y-1">
                  <h4 className="font-bold text-sm">{qrDept}</h4>
                  <p className="text-xs text-muted-foreground">Section: <span className="font-semibold text-foreground">{qrClassSection}</span> | Subject: <span className="font-semibold text-foreground">{qrSubject}</span></p>
                  <p className="text-[10px] text-muted-foreground italic">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2.5 mt-5 w-full">
                  <button 
                    onClick={handleGenerateQr}
                    className="flex-1 py-2 border rounded-xl hover:bg-accent text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="size-3.5" /> Regenerate
                  </button>
                  <a 
                    href={generatedQr} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-2 bg-gradient-primary text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition hover:opacity-90 cursor-pointer"
                  >
                    <Download className="size-3.5" /> View / Download
                  </a>
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* LEAVES & OD APPROVALS */}
      {activeTab === "leaves" && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">Leaves &amp; On-Duty (OD) Verification</h3>
            <Badge tone="info">Pending Academic Approvals</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Request ID</th>
                  <th className="text-left pb-2">Student Name</th>
                  <th className="text-left pb-2">Roll No</th>
                  <th className="text-left pb-2">Leave Category</th>
                  <th className="text-left pb-2">Requested Dates</th>
                  <th className="text-left pb-2">Reason / Note</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map(req => (
                  <tr key={req.id}>
                    <td className="py-3 font-mono font-bold text-rose-600">{req.id}</td>
                    <td className="py-3 font-bold text-slate-800">{req.student}</td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">{req.roll}</td>
                    <td className="py-3 font-semibold"><Badge tone="info">{req.type}</Badge></td>
                    <td className="py-3 text-slate-500 font-semibold">{req.dates}</td>
                    <td className="py-3 text-slate-500 font-semibold">{req.reason}</td>
                    <td className="py-3 text-right">
                      {req.status === "Approved" ? (
                        <Badge tone="success">Approved</Badge>
                      ) : (
                        <button
                          onClick={() => handleApproveLeave(req.id, req.student)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer transition"
                        >
                          Approve Exemption
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "settings" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings & Policies Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Settings className="size-5 text-indigo-600" />
                <h3 className="font-bold text-base text-foreground">Attendance Policy Configurations</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Minimum Threshold Required (%)</label>
                    <input
                      type="number"
                      value={policyThreshold}
                      onChange={(e) => setPolicyThreshold(e.target.value)}
                      min="50"
                      max="100"
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground">Students falling below this will be blocked from exam registrations automatically.</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Condonation Fee (₹)</label>
                    <input
                      type="number"
                      value={condonationFee}
                      onChange={(e) => setCondonationFee(e.target.value)}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground">Fee charged for granting exemption certificates on shortage.</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Default Status for Unmarked Slots</label>
                    <select
                      value={defaultStatus}
                      onChange={(e) => setDefaultStatus(e.target.value)}
                      className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                    >
                      {["Absent", "Present", "Late", "Excused"].map(st => <option key={st}>{st}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Automated Notification Alerts</label>
                    <div className="flex flex-col gap-2.5 mt-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertParents}
                          onChange={(e) => setAlertParents(e.target.checked)}
                          className="rounded border-muted text-indigo-600 focus:ring-indigo-500"
                        />
                        Send warning emails to Parents immediately
                      </label>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertSMS}
                          onChange={(e) => setAlertSMS(e.target.checked)}
                          className="rounded border-muted text-indigo-600 focus:ring-indigo-500"
                        />
                        Queue SMS notifications to Student mobile numbers
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2.5 bg-gradient-primary text-white rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <Calendar className="size-5 text-indigo-600" />
                <h3 className="font-bold text-base text-foreground">Academic Schedule & Semester Bounds</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Semester Term Start Date</label>
                  <input
                    type="date"
                    value={semStartDate}
                    onChange={(e) => setSemStartDate(e.target.value)}
                    className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Semester Term End Date</label>
                  <input
                    type="date"
                    value={semEndDate}
                    onChange={(e) => setSemEndDate(e.target.value)}
                    className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-5">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition"
                >
                  Apply Term Dates
                </button>
              </div>
            </Card>
          </div>

          {/* Audit Logs panel */}
          <div className="space-y-6">
            <Card className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <ShieldAlert className="size-5 text-indigo-600" />
                <h3 className="font-bold text-base text-foreground">Attendance Audit Trail</h3>
              </div>

              <p className="text-[11px] text-muted-foreground mb-4">
                Global log showing modifications made to attendance records by authorized faculty and admin.
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  placeholder="Filter logs by keyword..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredAuditLogs.length > 0 ? (
                  filteredAuditLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-xl bg-gradient-soft text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-indigo-600">{log.id}</span>
                        <span className="text-muted-foreground">{log.time}</span>
                      </div>
                      <div className="font-medium text-foreground">{log.event}</div>
                      <div className="text-muted-foreground text-[10px] italic">By: {log.user}</div>
                      <div className="text-[10px] text-muted-foreground/80 mt-1">Reason: "{log.reason}"</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No matching audit records found.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
