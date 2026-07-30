import { useMemo, useState } from "react";
import {
  Users,
  Search,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Shield,
  X,
  Send,
  ShieldAlert,
  Calendar,
  Clock,
  Activity,
  History,
  CheckCircle2
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/services/superAdminService";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  year?: string;
  semester?: string;
  idNumber?: string;
  phone?: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
  recentActivity?: string;
  assignedModule?: string;
  loginHistory?: Array<{ id: string; time: string; ip: string; device: string; status: string }>;
}

const DEFAULT_DIRECTORY: DirectoryUser[] = [
  { id: "USR-001", name: "Kambhampati Harish", email: "faculty.cse.1@college.com", role: "Faculty", department: "CSE", idNumber: "FACCSE1", phone: "+91 98765 10001", status: "Active", lastLogin: "2026-07-29 11:45 AM", recentActivity: "Submitted Semester Marks for CS501", assignedModule: "Faculty Module", loginHistory: [{ id: "LH-1", time: "2026-07-29 11:45 AM", ip: "192.168.1.45", device: "Chrome / Windows", status: "SUCCESS" }] },
  { id: "USR-002", name: "Dr. S. Suresh", email: "faculty.hod.cse@college.com", role: "HOD", department: "CSE", idNumber: "FACCSEHOD", phone: "+91 98765 10002", status: "Active", lastLogin: "2026-07-29 10:15 AM", recentActivity: "Approved Faculty Workload Roster", assignedModule: "HOD Dashboard", loginHistory: [{ id: "LH-2", time: "2026-07-29 10:15 AM", ip: "192.168.1.12", device: "Safari / macOS", status: "SUCCESS" }] },
  { id: "USR-003", name: "Dr. K. V. Sharma", email: "dean.academics@college.com", role: "Dean", department: "Central Academic", idNumber: "DEAN2026", phone: "+91 98765 10003", status: "Active", lastLogin: "2026-07-28 04:30 PM", recentActivity: "Published Mid-Term Examination Schedule", assignedModule: "Dean Boardroom" },
  { id: "USR-004", name: "Hanish Varma", email: "hanish@gmail.com", role: "Student", department: "CSE", year: "3rd Year", semester: "Semester 5", idNumber: "21CS045", phone: "+91 98765 20001", status: "Active", lastLogin: "2026-07-29 12:10 PM", recentActivity: "Paid Autumn Term Fee via Portal", assignedModule: "Student Self-Service", loginHistory: [{ id: "LH-4", time: "2026-07-29 12:10 PM", ip: "10.0.4.12", device: "Chrome Mobile / Android", status: "SUCCESS" }] },
  { id: "USR-005", name: "Satyanarayana Varma", email: "hanish.parent@gmail.com", role: "Parent", department: "CSE", year: "3rd Year", semester: "Semester 5", idNumber: "PRNT-21CS045", phone: "+91 98765 30001", status: "Active", lastLogin: "2026-07-27 08:20 PM", recentActivity: "Viewed Attendance Telemetry Report", assignedModule: "Parent Portal" },
  { id: "USR-006", name: "Ramesh Babu", email: "librarian@college.com", role: "Librarian", department: "Central Library", idNumber: "LIB2026", phone: "+91 98765 40001", status: "Active", lastLogin: "2026-07-29 09:00 AM", recentActivity: "Processed 42 Book Issue Requests", assignedModule: "Library Subsystem" },
  { id: "USR-007", name: "Vikram Malhotra", email: "placement@college.com", role: "Placement Officer", department: "CDC & Placements", idNumber: "PLAC2026", phone: "+91 98765 50001", status: "Active", lastLogin: "2026-07-29 11:00 AM", recentActivity: "Scheduled Campus Drive for Microsoft", assignedModule: "Placement Cell" },
  { id: "USR-008", name: "Subba Rao", email: "warden@college.com", role: "Hostel Warden", department: "Hostel Administration", idNumber: "WRDN2026", phone: "+91 98765 60001", status: "Active", lastLogin: "2026-07-28 10:30 PM", recentActivity: "Audited Block B Resident Attendance", assignedModule: "Hostel Management" },
  { id: "USR-009", name: "Gopal Krishna", email: "transport@college.com", role: "Transport Manager", department: "Fleet Operations", idNumber: "TRNS2026", phone: "+91 98765 70001", status: "Active", lastLogin: "2026-07-29 07:15 AM", recentActivity: "Verified Route 14 Bus Maintenance", assignedModule: "Transport Fleet" },
  { id: "USR-010", name: "Muralidhar Rao", email: "accounts@college.com", role: "Accounts", department: "Finance & Accounts", idNumber: "ACCT2026", phone: "+91 98765 80001", status: "Active", lastLogin: "2026-07-29 11:30 AM", recentActivity: "Generated Quarterly GST Tax Invoices", assignedModule: "Finance Subsystem" },
  { id: "USR-011", name: "Sreenivasulu", email: "examcell@college.com", role: "Exam Cell", department: "Examination Division", idNumber: "EXAM2026", phone: "+91 98765 90001", status: "Active", lastLogin: "2026-07-28 02:45 PM", recentActivity: "Verified 1,240 Hall Ticket Clearances", assignedModule: "Exam Cell Console" },
  { id: "USR-012", name: "Anitha Reddy", email: "lms.coordinator@college.com", role: "LMS Coordinator", department: "E-Learning Cell", idNumber: "LMS2026", phone: "+91 98765 10004", status: "Active", lastLogin: "2026-07-29 10:50 AM", recentActivity: "Uploaded AI-ML Video Lecture Series", assignedModule: "LMS Platform" },
  { id: "USR-013", name: "K. Harish", email: "admin@college.com", role: "Admin", department: "Central Administration", idNumber: "ADM-2026", phone: "+91 98765 43210", status: "Active", lastLogin: "Active Now", recentActivity: "Monitoring Department Telemetry & Approvals", assignedModule: "Admin Governance Console" },
  { id: "USR-014", name: "System Administrator", email: "superadmin@college.com", role: "Super Admin", department: "IT Infrastructure", idNumber: "SUP2026", phone: "+91 98765 00000", status: "Active", lastLogin: "Active Now", recentActivity: "Configured Institutional Role Matrix", assignedModule: "Super Admin Workspace" },
];

export function AdminUserDirectory() {
  const { data: dbUsers = [] } = useQuery({
    queryKey: ["admin-user-directory"],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
  });

  const mergedUsers: DirectoryUser[] = useMemo(() => {
    if (!dbUsers || dbUsers.length === 0) return DEFAULT_DIRECTORY;
    const mapped = dbUsers.map((u: any, idx: number) => ({
      id: u.id || `USR-${idx + 100}`,
      name: u.name || u.full_name || "Institutional Member",
      email: u.email || "",
      role: (u.role || "Student").replace("_", " ").toUpperCase(),
      department: u.department || "General Academic",
      year: u.year ? `${u.year}rd Year` : "3rd Year",
      semester: u.semester ? `Semester ${u.semester}` : "Semester 5",
      idNumber: u.idNumber || u.rollNumber || u.employeeId || u.id?.substring(0, 8),
      phone: u.phone || u.mobile || "+91 98765 00000",
      status: u.is_active ? ("Active" as const) : ("Inactive" as const),
      lastLogin: u.lastLogin || "2026-07-29 10:00 AM",
      recentActivity: u.recentActivity || "Logged in to campus portal",
      assignedModule: `${u.role || "User"} Module`,
      loginHistory: [{ id: "LH-1", time: "2026-07-29 10:00 AM", ip: "192.168.1.45", device: "Browser / Desktop", status: "SUCCESS" }]
    }));

    const combined = [...mapped];
    DEFAULT_DIRECTORY.forEach((preset) => {
      if (!combined.some((c) => c.email.toLowerCase() === preset.email.toLowerCase())) {
        combined.push(preset);
      }
    });
    return combined;
  }, [dbUsers]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");

  // Read-only Drawer State
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);

  // Notification Modal State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTargetUser, setNotifTargetUser] = useState<DirectoryUser | null>(null);
  const [notifSubject, setNotifSubject] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  // Restriction Alert Modal
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  const filteredUsers = useMemo(() => {
    return mergedUsers.filter((u) => {
      const matchesSearch =
        [u.name, u.email, u.idNumber, u.role, u.department].some((field) =>
          field?.toLowerCase().includes(search.toLowerCase())
        );
      const matchesRole =
        roleFilter === "All" || u.role.toLowerCase() === roleFilter.toLowerCase();
      const matchesDept =
        deptFilter === "All" || u.department?.toLowerCase().includes(deptFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || u.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesYear =
        yearFilter === "All" || (u.year && u.year.includes(yearFilter));
      const matchesSem =
        semFilter === "All" || (u.semester && u.semester.includes(semFilter));

      return matchesSearch && matchesRole && matchesDept && matchesStatus && matchesYear && matchesSem;
    });
  }, [mergedUsers, search, roleFilter, deptFilter, statusFilter, yearFilter, semFilter]);

  const handleExportCSV = () => {
    const headers = "ID,Name,Email,Role,Department,Year,Semester,ID Number,Phone,Status,Last Login\n";
    const rows = filteredUsers
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.role}","${u.department || "-"}","${u.year || "-"}","${u.semester || "-"}","${u.idNumber}","${u.phone}","${u.status}","${u.lastLogin}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Admin_User_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Exported User Directory CSV successfully!");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Institutional User Directory Report", 14, 18);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()} | Total Users: ${filteredUsers.length}`, 14, 25);

      let y = 35;
      doc.setFontSize(9);
      doc.text("Name", 14, y);
      doc.text("Role", 65, y);
      doc.text("Department", 100, y);
      doc.text("ID / Roll", 145, y);
      doc.text("Status", 180, y);

      doc.line(14, y + 2, 196, y + 2);
      y += 8;

      filteredUsers.slice(0, 25).forEach((u) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(u.name.substring(0, 24), 14, y);
        doc.text(u.role.substring(0, 16), 65, y);
        doc.text((u.department || "General").substring(0, 20), 100, y);
        doc.text((u.idNumber || "-").substring(0, 14), 145, y);
        doc.text(u.status, 180, y);
        y += 7;
      });

      doc.save(`User_Directory_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Generated PDF report!");
    } catch (err) {
      toast.error("Failed to generate PDF document.");
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Dispatched official notification to ${notifTargetUser?.name || "all filtered users"}!`);
    setIsNotifModalOpen(false);
    setNotifSubject("");
    setNotifMessage("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional User Directory"
        desc="Read-only governance directory: monitor users across all 16 ERP modules, search profiles, view activity telemetry, and export reports."
      />

      {/* Filter and Governance Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number, or employee ID..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-xs outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary transition cursor-pointer"
            >
              {[
                "All Roles",
                "Faculty",
                "HOD",
                "Dean",
                "Student",
                "Parent",
                "Librarian",
                "Placement Officer",
                "Hostel Warden",
                "Transport Manager",
                "Accounts",
                "Exam Cell",
                "LMS Coordinator",
                "Admin",
                "Super Admin"
              ].map((role) => (
                <option key={role} value={role === "All Roles" ? "All" : role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary transition cursor-pointer"
            >
              {["All Depts", "CSE", "AIML", "AIDS", "ECE", "EEE", "MECH", "CIVIL", "Central"].map((dept) => (
                <option key={dept} value={dept === "All Depts" ? "All" : dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary transition cursor-pointer"
            >
              {["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
                <option key={yr} value={yr === "All Years" ? "All" : yr.split(" ")[0]}>
                  {yr}
                </option>
              ))}
            </select>

            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary transition cursor-pointer"
            >
              {["All Semesters", "Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"].map((sem) => (
                <option key={sem} value={sem === "All Semesters" ? "All" : sem}>
                  {sem}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary transition cursor-pointer"
            >
              {["All Status", "Active", "Inactive"].map((st) => (
                <option key={st} value={st === "All Status" ? "All" : st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <FileSpreadsheet className="size-4" /> CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <FileText className="size-4" /> PDF
            </button>
          </div>
        </div>
      </Card>

      {/* Directory Roster Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Institutional User Roster ({filteredUsers.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Read-Only Monitoring View</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">ID / Roll No</th>
                <th className="p-3.5">Year & Sem</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-blue-600 text-white font-black grid place-items-center text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Badge tone="info">{user.role}</Badge>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                    {user.department || "General"}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                    {user.idNumber}
                  </td>
                  <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">
                    {user.year ? `${user.year} (${user.semester})` : "-"}
                  </td>
                  <td className="p-3.5">
                    <Badge tone={user.status === "Active" ? "success" : "danger"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {user.lastLogin}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setNotifTargetUser(user);
                        setIsNotifModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer inline-block"
                      title="Send Notification"
                    >
                      <Mail className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setShowPermissionAlert(true)}
                      className="p-1.5 rounded-lg border text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer inline-block"
                      title="Manage User (Restricted to Super Admin)"
                    >
                      <ShieldAlert className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Read-Only Profile Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Read-Only Profile View</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="mx-auto size-24 rounded-3xl bg-blue-600 text-white font-black grid place-items-center text-2xl shadow-lg">
                {selectedUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-xs text-blue-600 font-bold uppercase mt-0.5">{selectedUser.role}</p>
              </div>
              <Badge tone={selectedUser.status === "Active" ? "success" : "danger"}>
                {selectedUser.status} Account
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Information</span>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedUser.email}</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedUser.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ID Number / Roll</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.idNumber}</p>
                </div>
                <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedUser.department}</p>
                </div>
              </div>

              {selectedUser.year && (
                <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Standing</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedUser.year} • {selectedUser.semester}</p>
                </div>
              )}

              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Module</span>
                <p className="font-bold text-blue-600">{selectedUser.assignedModule}</p>
              </div>

              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Last Login Telemetry</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">{selectedUser.lastLogin}</p>
              </div>

              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Recent System Activity</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{selectedUser.recentActivity}</p>
              </div>

              {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 && (
                <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <History className="size-3" /> Recent Login History
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {selectedUser.loginHistory.map((lh) => (
                      <div key={lh.id} className="flex justify-between text-slate-600 dark:text-slate-400 border-b pb-1">
                        <span>{lh.time}</span>
                        <span>{lh.ip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex gap-2">
              <a
                href={`mailto:${selectedUser.email}`}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs text-center hover:bg-blue-700 cursor-pointer shadow-md"
              >
                Send Email
              </a>
              <button
                onClick={() => setShowPermissionAlert(true)}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Manage Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <Send className="size-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Send Official Notification
                </h3>
              </div>
              <button
                onClick={() => setIsNotifModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Recipient</label>
                <input
                  type="text"
                  readOnly
                  value={notifTargetUser ? `${notifTargetUser.name} (${notifTargetUser.email})` : "All Filtered Users"}
                  className="w-full p-2.5 rounded-xl border bg-slate-100 dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notification Subject</label>
                <input
                  type="text"
                  value={notifSubject}
                  onChange={(e) => setNotifSubject(e.target.value)}
                  placeholder="e.g. Official Institutional Governance Advisory"
                  required
                  className="w-full p-2.5 rounded-xl border bg-background"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type your official communication message here..."
                  required
                  className="w-full p-2.5 rounded-xl border bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Dispatch Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Governance Permission Restriction Modal */}
      {showPermissionAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-3xl w-full max-w-md p-6 space-y-4 text-center">
            <div className="size-14 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 grid place-items-center mx-auto">
              <ShieldAlert className="size-8" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Insufficient Permissions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                User Management actions (creating users, deleting accounts, changing system roles, or modifying RBAC permissions) belong <strong>exclusively to the Super Admin</strong> according to the College ERP SRS.
              </p>
            </div>
            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 font-mono">
              Role Authority: Admin (Governance & Read-Only Directory View)
            </div>
            <button
              onClick={() => setShowPermissionAlert(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
            >
              Acknowledge & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserDirectory;
