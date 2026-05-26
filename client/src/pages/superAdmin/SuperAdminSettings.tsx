import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Save, ShieldCheck, User } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";



export function SuperAdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Super Admin Settings" desc="Manage profile, role permissions, password settings, security controls and notification preferences." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Super Admin Profile</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <input defaultValue="Dr. Anjali Mehra" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input defaultValue="super.admin@college.edu" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input defaultValue="+91 9876543210" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input defaultValue="Super Admin" className="rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <textarea defaultValue="Responsible for global platform governance, institutional workflows and administrative security." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Save className="size-4" /> Save Profile
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Role Permissions</h3>
          </div>
          <div className="space-y-3">
            {["User management", "System configuration", "Financial reports", "Security audit logs", "Backup restore access", "Automation controls"].map((permission, index) => (
              <div key={permission} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <span className="text-sm font-medium">{permission}</span>
                <Badge tone={index < 5 ? "success" : "warn"}>{index < 5 ? "Full Access" : "Approval"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="size-5 text-indigo" />
            <h3 className="font-semibold">Password Management</h3>
          </div>
          <div className="space-y-3">
            <input type="password" placeholder="Current password" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input type="password" placeholder="New password" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <input type="password" placeholder="Confirm password" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <button className="w-full px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium">Update Password</button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Security Settings</h3>
          <div className="space-y-3">
            {["Two-factor authentication", "Session timeout", "IP monitoring", "Login alerts"].map((setting, index) => (
              <div key={setting} className="flex items-center justify-between p-3 rounded-xl border">
                <span className="text-sm">{setting}</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${index !== 1 ? "bg-emerald-500" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${index !== 1 ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            {["Critical system alerts", "Approval requests", "Security warnings", "Weekly summaries"].map((setting) => (
              <label key={setting} className="flex items-center gap-2 p-3 rounded-xl border hover:bg-accent/50 transition">
                <input type="checkbox" defaultChecked />
                <span className="text-sm font-medium">{setting}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
