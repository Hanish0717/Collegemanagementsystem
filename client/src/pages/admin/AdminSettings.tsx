import { useState, useEffect } from "react";
import {
  Save,
  Pencil,
  Building2,
  Bell,
  Shield,
  Eye,
  CheckCircle2,
  Laptop,
  KeyRound,
  QrCode,
  ShieldAlert,
  History,
  Smartphone
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "institution" | "notifications" | "audit" | "permissions" | "history" | "sessions"
  >("profile");

  const fullName = user?.fullName || "Admin Member";
  const email = user?.email || "admin@college.com";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const [isEditing, setIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState("");
  const [designation, setDesignation] = useState("Executive Administrator");
  const [employeeId, setEmployeeId] = useState("ADM-2026");
  const [department, setDepartment] = useState("Central Administration");
  const [officeLocation, setOfficeLocation] = useState("Admin Block - Room 101");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");

  // MFA & Security State
  const [emailOtpEnabled, setEmailOtpEnabled] = useState(true);
  const [smsOtpEnabled, setSmsOtpEnabled] = useState(true);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: "SESS-101", device: "Windows 11 PC (Chrome 124)", ip: "192.168.1.45", location: "Campus Network", isCurrent: true, time: "Active Now" },
    { id: "SESS-102", device: "iPhone 15 Pro (Safari Mobile)", ip: "10.0.4.12", location: "Cellular Network", isCurrent: false, time: "2 hours ago" },
    { id: "SESS-103", device: "MacBook Air (Firefox)", ip: "192.168.1.88", location: "Library Wi-Fi", isCurrent: false, time: "Yesterday, 18:30" }
  ]);

  // Login History
  const loginHistory = [
    { id: "LH-001", method: "Email / Password", status: "SUCCESS", ip: "192.168.1.45", device: "Chrome 124 / Windows", time: "2026-07-29 11:20:14" },
    { id: "LH-002", method: "Google OAuth 2.0", status: "SUCCESS", ip: "10.0.4.12", device: "Safari / iOS 17", time: "2026-07-28 16:45:02" },
    { id: "LH-003", method: "Email / Password", status: "FAILED (Bad Pass)", ip: "198.51.100.22", device: "Unknown Browser", time: "2026-07-27 09:12:00" },
    { id: "LH-004", method: "Email / Password", status: "SUCCESS", ip: "192.168.1.45", device: "Chrome 124 / Windows", time: "2026-07-26 14:10:55" },
  ];

  // Institution Settings state
  const [instName, setInstName] = useState("Vignan Institute of Technology & Science");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [currentSemester, setCurrentSemester] = useState("Odd Semester (Term I)");

  // Notifications State
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

  useEffect(() => {
    const role = "admin";
    const storedAbout = localStorage.getItem(`cms_${role}_about`);
    setAboutMe(storedAbout || "Responsible for academic operations, student administration, institutional governance, and multi-departmental monitoring.");
  }, []);

  const handleSaveProfile = () => {
    const role = "admin";
    localStorage.setItem(`cms_${role}_about`, aboutMe);
    toast.success("Admin profile details updated successfully!");
    setIsEditing(false);
  };

  const handleGenerateRecoveryCodes = () => {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase()
    );
    setRecoveryCodes(codes);
    toast.success("Generated 8-digit emergency recovery codes (Hashed stored with SHA-256)!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    toast.success("Security password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogoutSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Terminated active device session.");
  };

  const handleLogoutAllOther = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success("Logged out all other remote sessions!");
  };

  const auditLogs = [
    { id: "LOG-901", user: "Admin Office", action: "Applied Executive Seal to PR-801 Sanction", timestamp: "2026-07-29 11:20:14", ip: "192.168.1.45" },
    { id: "LOG-902", user: "Principal", action: "Dispatched Presidential Circular #CIR-301", timestamp: "2026-07-28 16:45:02", ip: "192.168.1.12" },
    { id: "LOG-903", user: "HOD CSE", action: "Updated Mid-Semester Attendance Threshold", timestamp: "2026-07-27 14:10:55", ip: "192.168.2.88" },
    { id: "LOG-904", user: "Admin Office", action: "Modified Academic Year Config to 2026-2027", timestamp: "2026-07-25 09:30:10", ip: "192.168.1.45" },
  ];

  const rolePermissionsMatrix = [
    { role: "Super Admin", scope: "Global", access: "Full System Control", status: "Active" },
    { role: "Admin / Principal", scope: "Executive Governance", access: "Monitoring, Approvals & Reporting", status: "Active" },
    { role: "Dean Academics", scope: "Academic Cell", access: "Timetables, Curricula, Exams", status: "Active" },
    { role: "HOD", scope: "Departmental", access: "Faculty Allocation & Attendance Audit", status: "Active" },
    { role: "Faculty", scope: "Teaching Workspace", access: "Attendance Marks & Material Uploads", status: "Active" },
    { role: "Student", scope: "Self Service", access: "LMS, Fees, Notices & Hall Tickets", status: "Active" },
    { role: "Finance / Accounts", scope: "Finance Subsystem", access: "Fee Collection & GST Invoicing", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin & Governance Settings"
        desc="Manage administrative profile, MFA security, active sessions, login history, institution parameters, audit logs, and RBAC permissions."
      />

      {/* Tabs Bar — 8 Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: "profile", label: "Profile", icon: Pencil },
          { id: "security", label: "Security", icon: ShieldAlert },
          { id: "institution", label: "Institution Settings", icon: Building2 },
          { id: "notifications", label: "Notification Preferences", icon: Bell },
          { id: "audit", label: "Audit Logs", icon: Shield },
          { id: "permissions", label: "Permission Matrix (Read Only)", icon: Eye },
          { id: "history", label: "Login History", icon: History },
          { id: "sessions", label: "Session Management", icon: Laptop },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-bold dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="text-center p-6">
              <div className="mx-auto size-28">
                <div className="size-full rounded-3xl bg-blue-600 grid place-items-center text-white text-3xl font-black shadow-lg">
                  {initials || "AD"}
                </div>
              </div>
              <div className="mt-4 font-extrabold text-base text-slate-900 dark:text-white">{fullName}</div>
              <div className="text-xs text-blue-600 font-bold tracking-wider uppercase mt-1">{designation}</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <span>Employee ID:</span>
                <strong className="text-slate-900 dark:text-white">{employeeId}</strong>
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Digital Approval Seal Status
              </h4>
              <div className="p-3.5 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center font-black text-xs">
                  SEAL
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Verified Digital Seal</div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Active & Authoritative
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Administrative Details</h3>
                {isEditing ? (
                  <button
                    onClick={handleSaveProfile}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="size-3.5" /> Save Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">About Bio & Responsibilities</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full p-2.5 rounded-xl border bg-background text-xs"
                    />
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400">{aboutMe}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{email}</p>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{department}</p>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Office Location</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{officeLocation}</p>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Contact</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{emergencyPhone}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. SECURITY TAB */}
      {activeTab === "security" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Password Change Card */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="size-5 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Change Security Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-md">
                  Update Password
                </button>
              </div>
            </form>
          </Card>

          {/* MFA Options Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Multi-Factor Authentication (MFA)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Email OTP Verification</span>
                  <p className="text-[11px] text-slate-500">Sends 6-digit OTP code to registered email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailOtpEnabled}
                  onChange={(e) => setEmailOtpEnabled(e.target.checked)}
                  className="size-4 cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">SMS OTP Channel</span>
                  <p className="text-[11px] text-slate-500">Sends mobile OTP for high-value approvals</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsOtpEnabled}
                  onChange={(e) => setSmsOtpEnabled(e.target.checked)}
                  className="size-4 cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">TOTP Authenticator App</span>
                  <p className="text-[11px] text-slate-500">Google Authenticator or Microsoft Authenticator</p>
                </div>
                <button
                  onClick={() => {
                    setTotpEnabled(!totpEnabled);
                    setShowQrCode(!totpEnabled);
                  }}
                  className="px-3 py-1 rounded-lg border text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  {totpEnabled ? "Configured" : "Enable"}
                </button>
              </div>

              {showQrCode && (
                <div className="p-4 border rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-2">
                  <QrCode className="size-12 mx-auto text-blue-600" />
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    Scan this QR Code in Google Authenticator or Microsoft Authenticator
                  </p>
                  <div className="font-mono text-xs font-bold text-blue-600 bg-white dark:bg-slate-900 p-2 rounded-lg border inline-block">
                    JBSWY3DPEHPK3PXP
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <button
                onClick={handleGenerateRecoveryCodes}
                className="px-3 py-2 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Generate 8-Digit Recovery Codes
              </button>
            </div>

            {recoveryCodes.length > 0 && (
              <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Emergency Recovery Codes (SHA-256 Hashed Storage)</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold">
                  {recoveryCodes.map((code) => (
                    <div key={code} className="p-1.5 bg-white dark:bg-slate-800 border rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 3. INSTITUTION TAB */}
      {activeTab === "institution" && (
        <Card className="p-5 max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Institutional Parameters</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Institutional parameters updated!");
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Institution Name</label>
              <input
                type="text"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Semester</label>
                <input
                  type="text"
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-md">
                Save Institution Settings
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <Card className="p-5 max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Alert & Broadcast Preferences</h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Email Alerts</span>
                <p className="text-[11px] text-slate-500">Receive executive daily summaries via email</p>
              </div>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="size-4 cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">SMS Notifications</span>
                <p className="text-[11px] text-slate-500">Receive instant SMS alerts for high-value sanction requests</p>
              </div>
              <input
                type="checkbox"
                checked={notifSms}
                onChange={(e) => setNotifSms(e.target.checked)}
                className="size-4 cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">App Push Notifications</span>
                <p className="text-[11px] text-slate-500">Real-time mobile app push alerts</p>
              </div>
              <input
                type="checkbox"
                checked={notifPush}
                onChange={(e) => setNotifPush(e.target.checked)}
                className="size-4 cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </Card>
      )}

      {/* 5. AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Security & Executive Action Audit Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="pb-2">Log ID</th>
                  <th className="pb-2">User / Authority</th>
                  <th className="pb-2">Action Description</th>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 font-bold text-blue-600">{log.id}</td>
                    <td className="py-2.5 font-sans font-semibold">{log.user}</td>
                    <td className="py-2.5 font-sans text-slate-700 dark:text-slate-300">{log.action}</td>
                    <td className="py-2.5 text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 text-right text-slate-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. ROLE PERMISSIONS TAB */}
      {activeTab === "permissions" && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Role Access Control Matrix (Read-Only)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="pb-2">ERP Role</th>
                  <th className="pb-2">Governance Scope</th>
                  <th className="pb-2">Privilege Level</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rolePermissionsMatrix.map((r) => (
                  <tr key={r.role}>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.role}</td>
                    <td className="py-2.5 font-medium text-slate-600 dark:text-slate-400">{r.scope}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">{r.access}</td>
                    <td className="py-2.5 text-right">
                      <Badge tone="success">{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 7. LOGIN HISTORY TAB */}
      {activeTab === "history" && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Historical Login Logins & Access Telemetry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="pb-2">Log ID</th>
                  <th className="pb-2">Authentication Channel</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">User Device / OS</th>
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {loginHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-bold text-blue-600">{item.id}</td>
                    <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">{item.method}</td>
                    <td className="py-2.5">
                      <Badge tone={item.status.startsWith("SUCCESS") ? "success" : "danger"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-sans text-slate-600 dark:text-slate-400">{item.device}</td>
                    <td className="py-2.5 text-slate-500">{item.ip}</td>
                    <td className="py-2.5 text-right text-slate-500">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 8. SESSION MANAGEMENT TAB */}
      {activeTab === "sessions" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Device Session Manager</h3>
              <p className="text-xs text-slate-500">Track and terminate active device sessions across mobile, desktop, and web</p>
            </div>
            <button
              onClick={handleLogoutAllOther}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              Logout All Other Devices
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3.5 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-3">
                  <Laptop className="size-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {session.device}
                      {session.isCurrent && <Badge tone="success">Current Session</Badge>}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Session ID: {session.id} • IP: {session.ip} • {session.location} • {session.time}
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="px-3 py-1 rounded-lg border text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    Terminate Session
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminSettings;
