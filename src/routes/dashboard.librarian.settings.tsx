import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Lock, Bell, Palette, User, Shield } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";

export const Route = createFileRoute("/dashboard/librarian/settings")({
  component: LibrarianSettings,
});

function LibrarianSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        desc="Manage librarian profile, preferences and security."
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Security", icon: Lock },
          { id: "appearance", label: "Appearance", icon: Palette },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
              activeTab === tab.id
                ? "border-b-gradient-primary text-gradient"
                : "border-b-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="size-4" />
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Librarian Profile</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  defaultValue="Mrs. Anjali Sharma"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
                <input
                  type="text"
                  defaultValue="LIB-0001"
                  disabled
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background/40 text-sm opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  defaultValue="anjali.sharma@college.edu"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Office Location</label>
                <input
                  type="text"
                  defaultValue="Central Library, 2nd Floor"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Bio / About</label>
                <textarea
                  defaultValue="Experienced librarian with 8 years of service. Specializing in digital library management and cataloging."
                  rows={3}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary flex items-center gap-2">
                <Save className="size-4" /> Save Changes
              </button>
              <button className="px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition">
                Cancel
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Permissions & Role</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gradient-soft border flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Role</div>
                  <div className="text-xs text-muted-foreground">Library Manager</div>
                </div>
                <Badge tone="success">Active</Badge>
              </div>

              <div className="p-3 rounded-lg bg-gradient-soft border">
                <div className="text-sm font-medium mb-2">Access Permissions</div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div>✅ Manage Books</div>
                  <div>✅ Issue/Return Books</div>
                  <div>✅ Manage Members</div>
                  <div>✅ Collect Fines</div>
                  <div>✅ View Reports</div>
                  <div>✅ System Settings</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card>
          <h3 className="font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { title: "Due Date Reminders", desc: "Get alerts for books due within 3 days", enabled: true },
              { title: "Overdue Notifications", desc: "Critical alerts for overdue books", enabled: true },
              { title: "New Member Requests", desc: "Alerts when new members register", enabled: true },
              { title: "Fine Payment Reminders", desc: "Notify when fines are collected", enabled: false },
              { title: "System Notifications", desc: "Maintenance and system updates", enabled: false },
              { title: "Daily Digest", desc: "Morning summary of library activities", enabled: true },
            ].map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-soft transition">
                <div>
                  <div className="font-medium text-sm">{notif.title}</div>
                  <div className="text-xs text-muted-foreground">{notif.desc}</div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={notif.enabled} className="rounded" />
                </label>
              </div>
            ))}

            <div className="p-4 rounded-lg border bg-gradient-soft mt-4">
              <div className="text-sm font-medium mb-2">Delivery Channel</div>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="channel" defaultChecked className="rounded-full" />
                  <span className="text-sm">In-app notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="channel" className="rounded-full" />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="channel" className="rounded-full" />
                  <span className="text-sm">Both</span>
                </label>
              </div>
            </div>

            <button className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary mt-4">
              Save Preferences
            </button>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                <input type="password" className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">New Password</label>
                <input type="password" className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                <input type="password" className="w-full mt-2 px-4 py-2.5 rounded-xl border bg-background text-sm" />
              </div>
            </div>

            <button className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary mt-4">
              Update Password
            </button>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="size-4" /> Two-Factor Authentication
            </h3>
            <div className="p-4 rounded-lg bg-gradient-soft border mb-4">
              <div className="text-sm">Status: <Badge>Disabled</Badge></div>
              <p className="text-xs text-muted-foreground mt-2">Add an extra layer of security to your account.</p>
            </div>
            <button className="px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition">
              Enable 2FA
            </button>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-gradient-soft flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Current Session</div>
                  <div className="text-xs text-muted-foreground">Chrome on Windows • 192.168.1.100</div>
                </div>
                <Badge tone="success">Active Now</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Theme</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { name: "Light", icon: "☀️", selected: true },
                { name: "Dark", icon: "🌙", selected: false },
                { name: "Auto", icon: "🔄", selected: false },
              ].map((theme, i) => (
                <button
                  key={i}
                  className={`p-4 rounded-xl border-2 text-center font-medium transition ${
                    theme.selected
                      ? "border-gradient-primary bg-gradient-soft"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <div className="text-2xl mb-2">{theme.icon}</div>
                  <div className="text-sm">{theme.name}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Sidebar</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gradient-soft transition cursor-pointer">
                <input type="radio" name="sidebar" defaultChecked className="rounded-full" />
                <span className="text-sm">Default width</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gradient-soft transition cursor-pointer">
                <input type="radio" name="sidebar" className="rounded-full" />
                <span className="text-sm">Compact</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gradient-soft transition cursor-pointer">
                <input type="radio" name="sidebar" className="rounded-full" />
                <span className="text-sm">Collapsed by default</span>
              </label>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Display</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-soft transition">
                <span className="text-sm font-medium">Compact Mode</span>
                <input type="checkbox" className="rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-soft transition">
                <span className="text-sm font-medium">Show Animations</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gradient-soft transition">
                <span className="text-sm font-medium">Show Tooltips</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </Card>

          <button className="w-full px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary">
            Save Display Settings
          </button>
        </div>
      )}
    </div>
  );
}
