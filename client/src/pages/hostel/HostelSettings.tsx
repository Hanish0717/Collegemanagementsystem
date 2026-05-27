import { createFileRoute } from "@tanstack/react-router";
import { User, Bell, Shield, Lock, Building2, Save, Key } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";

export function HostelSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Settings"
        desc="Manage hostel admin profile, notifications, security, and preferences."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Admin Profile</h3>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-gradient-primary text-white grid place-items-center text-2xl font-semibold mb-3">
              WA
            </div>
            <div className="font-semibold text-lg">Warden Admin</div>
            <div className="text-sm text-muted-foreground">Hostel Block A-D</div>
            <Badge tone="success" className="mt-2">
              Active
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span>warden@college.edu</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Phone:</span>
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Since:</span>
              <span>Jan 2020</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Notification Settings</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Fee payment reminders",
                description: "Get notified when fee payments are due",
                enabled: true,
              },
              {
                label: "Complaint alerts",
                description: "Receive alerts for new and escalated complaints",
                enabled: true,
              },
              {
                label: "Visitor notifications",
                description: "Get notified when visitors check in/out",
                enabled: true,
              },
              {
                label: "Mess updates",
                description: "Receive updates about mess menu changes",
                enabled: false,
              },
              {
                label: "Emergency alerts",
                description: "Critical emergency notifications",
                enabled: true,
              },
              {
                label: "Maintenance requests",
                description: "Notifications for maintenance requests",
                enabled: true,
              },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft"
              >
                <div>
                  <div className="text-sm font-medium">{setting.label}</div>
                  <div className="text-xs text-muted-foreground">{setting.description}</div>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? "bg-primary" : "bg-muted"}`}
                >
                  <div
                    className={`size-5 rounded-full bg-white transition-transform ${setting.enabled ? "translate-x-6" : "translate-x-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="size-5 text-indigo" />
            <h3 className="font-semibold">Security Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border bg-gradient-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Two-Factor Authentication</span>
                <Badge tone="success">Enabled</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Your account is protected with 2FA
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-gradient-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Login Notifications</span>
                <Badge tone="success">Enabled</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Get notified of new login attempts
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-gradient-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Session Timeout</span>
                <span className="text-sm">30 minutes</span>
              </div>
              <div className="text-xs text-muted-foreground">Auto-logout after inactivity</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="size-5 text-indigo" />
            <h3 className="font-semibold">Hostel Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Room Type</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {["Single Room", "Double Room", "Triple Room"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in Time</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-out Time</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {["05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visitor Policy</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {["Strict", "Moderate", "Flexible"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="size-5 text-indigo" />
          <h3 className="font-semibold">Password Management</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-4 p-4 rounded-xl border bg-gradient-soft">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Key className="size-4" /> Update Password
            </button>
          </div>
          <div className="p-4 rounded-xl border bg-gradient-soft">
            <h4 className="text-sm font-semibold mb-3">Password Requirements</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                Minimum 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                At least one uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                At least one lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                At least one number
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                At least one special character
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-xs text-amber-700">
                <strong>Last changed:</strong> 30 days ago
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 rounded-xl border text-sm font-medium hover:bg-accent transition">
          Cancel
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary flex items-center gap-2">
          <Save className="size-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}
