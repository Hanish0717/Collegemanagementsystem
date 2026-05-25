import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Save, ShieldCheck, User } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";

export const Route = createFileRoute("/dashboard/faculty/settings")({
  component: FacultySettings,
});

function FacultySettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Faculty Settings" desc="Manage profile, security settings, notification preferences and teaching configuration." />

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Faculty Profile</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <input defaultValue="Dr. Rajesh Kumar" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input defaultValue="Computer Science" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input defaultValue="rajesh.kumar@college.edu" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input defaultValue="+91 9876543210" className="rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <textarea defaultValue="Specializing in Data Structures and Algorithms with 12 years of teaching experience." rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <Save className="size-4" /> Save Profile
            </button>
          </div>
        </Card>

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
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Security Settings</h3>
          </div>
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
          <h3 className="font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {["Assignment reminders", "Class notifications", "Student messages", "Meeting alerts", "System updates"].map((setting, index) => (
              <label key={setting} className="flex items-center gap-2 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer">
                <input type="checkbox" defaultChecked={index < 4} />
                <span className="text-sm font-medium">{setting}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold">Teaching Preferences</h3>
          </div>
          <div className="space-y-3">
            {["Auto-accept meeting requests", "Enable calendar sync", "Show student availability", "Send automated reminders"].map((setting, index) => (
              <label key={setting} className="flex items-center gap-2 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer">
                <input type="checkbox" defaultChecked={index < 2} />
                <span className="text-sm font-medium">{setting}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">System Preferences</h3>
        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {["Light Mode", "Dark Mode", "System Default"].map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {["English", "Hindi", "Spanish"].map(l => <option key={l}>{l}</option>)}
            </select>
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {["12-hour", "24-hour"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 p-3 rounded-lg border bg-background cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Enable email notifications</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border bg-background cursor-pointer">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Enable push notifications</span>
            </label>
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
            <Save className="size-4" /> Save Preferences
          </button>
        </div>
      </Card>
    </div>
  );
}
