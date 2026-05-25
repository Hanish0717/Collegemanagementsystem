import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Bell, Sliders, Save, X } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";

export const Route = createFileRoute("/dashboard/placement/settings")({
  component: PlacementSettings,
});

function PlacementSettings() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security" | "notifications">("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" desc="Manage profile, preferences and security settings." />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b overflow-x-auto pb-0">
        {[
          { id: "profile", label: "Profile", icon: "👤" },
          { id: "preferences", label: "Preferences", icon: "⚙" },
          { id: "notifications", label: "Notifications", icon: "🔔" },
          { id: "security", label: "Security", icon: "🔒" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Officer Profile</h3>
            <div className="space-y-4 p-4 border rounded-lg bg-gradient-soft">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Full Name</label>
                  <input placeholder="Enter full name" defaultValue="Dr. Arun Kumar" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Email</label>
                  <input type="email" placeholder="Email" defaultValue="arun.kumar@college.edu" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Phone</label>
                  <input placeholder="Phone number" defaultValue="+91 9876543210" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Position</label>
                  <input placeholder="Position" defaultValue="Placement Officer" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Department</label>
                <input placeholder="Department" defaultValue="Administration" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Biography</label>
                <textarea placeholder="Brief biography" defaultValue="Experienced placement officer with 8+ years of industry recruitment and college placement management expertise." className="w-full rounded-lg border bg-background px-3 py-2 text-sm" rows={4} />
              </div>
              <button
                onClick={handleSave}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                <Save className="size-4" /> {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Profile Picture</h3>
            <div className="p-4 border rounded-lg bg-gradient-soft space-y-3">
              <div className="size-20 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 text-white grid place-items-center text-4xl mx-auto">
                👤
              </div>
              <button className="w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition">
                Upload New Photo
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Placement Preferences</h3>
            <div className="space-y-3">
              {[
                { label: "Minimum CGPA Cutoff", value: "6.0" },
                { label: "Maximum Backlogs Allowed", value: "0" },
                { label: "Default Interview Duration (min)", value: "45" },
                { label: "Offer Letter Validity (days)", value: "5" },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm font-medium">{pref.label}</span>
                  <input defaultValue={pref.value} className="w-24 rounded-lg border bg-background px-2 py-1 text-sm text-right" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Default Settings</h3>
            <div className="space-y-3">
              {[
                { label: "Default Interview Mode", options: ["Online", "In-Person", "Hybrid"] },
                { label: "Default Language", options: ["English", "Hindi", "Regional"] },
                { label: "Time Zone", options: ["IST (UTC+5:30)", "Other"] },
              ].map(setting => (
                <div key={setting.label} className="space-y-2">
                  <label className="text-sm font-medium block">{setting.label}</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {setting.options.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="mt-4 w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium"
            >
              Save Preferences
            </button>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4">Email Notifications</h3>
            <div className="space-y-3">
              {[
                { name: "Drive Updates", desc: "Notify when new drives are added" },
                { name: "Application Alerts", desc: "Alert for new student applications" },
                { name: "Interview Reminders", desc: "Daily interview schedule reminders" },
                { name: "Offer Updates", desc: "Notify when offers are generated" },
                { name: "System Alerts", desc: "Critical system and maintenance alerts" },
                { name: "Weekly Report", desc: "Weekly placement activity summary" },
              ].map(notif => (
                <div key={notif.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition">
                  <div>
                    <div className="font-medium text-sm">{notif.name}</div>
                    <div className="text-xs text-muted-foreground">{notif.desc}</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Notification Frequency</h3>
            <div className="space-y-2">
              {["Immediate", "Daily Digest", "Weekly Digest"].map(freq => (
                <label key={freq} className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent/50 transition cursor-pointer">
                  <input type="radio" name="frequency" defaultChecked={freq === "Daily Digest"} className="size-4" />
                  <span className="text-sm font-medium">{freq}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lock className="size-5" /> Change Password
            </h3>
            <div className="space-y-3 p-4 border rounded-lg bg-gradient-soft">
              <div>
                <label className="text-sm font-medium block mb-2">Current Password</label>
                <input type="password" placeholder="Enter current password" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">New Password</label>
                <input type="password" placeholder="Enter new password" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Confirm Password</label>
                <input type="password" placeholder="Confirm new password" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium">
                Update Password
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">2FA Status</div>
                  <div className="text-xs text-muted-foreground mt-1">Enhance account security with two-factor authentication</div>
                </div>
                <Badge tone="success">Enabled</Badge>
              </div>
              <button className="w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition">
                Manage 2FA Settings
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Active Sessions</h3>
            <div className="space-y-2">
              {[
                { device: "Windows PC", location: "New Delhi", lastActive: "2 mins ago" },
                { device: "iPhone", location: "Mumbai", lastActive: "1 hour ago" },
                { device: "MacBook", location: "Bangalore", lastActive: "5 hours ago" },
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition">
                  <div>
                    <div className="font-medium text-sm">{session.device}</div>
                    <div className="text-xs text-muted-foreground">{session.location} • {session.lastActive}</div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-red-50 transition">
                    <X className="size-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold mb-4">Account Recovery</h3>
            <div className="space-y-3 p-4 border rounded-lg bg-gradient-soft">
              <div>
                <label className="text-sm font-medium block mb-2">Recovery Email</label>
                <input type="email" placeholder="Recovery email" defaultValue="backup@email.com" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Recovery Phone</label>
                <input type="tel" placeholder="Recovery phone" defaultValue="+91 9876543211" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium">
                Update Recovery Options
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
