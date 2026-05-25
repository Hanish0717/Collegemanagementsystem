import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { Sun, Moon, Bell, Globe, Shield, User } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" desc="Manage your profile and preferences." />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 text-center">
          <div className="mx-auto size-24 rounded-3xl bg-gradient-primary grid place-items-center text-white text-3xl font-bold">AM</div>
          <div className="mt-4 font-semibold text-lg">Dr. Anjali Mehra</div>
          <div className="text-xs text-muted-foreground">Super Admin · Computer Science</div>
          <button className="mt-5 w-full rounded-xl bg-gradient-primary text-white text-sm py-2 glow-primary">Edit profile</button>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="size-4" /> Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Full name","Dr. Anjali Mehra"],
              ["Email","anjali@campusly.edu"],
              ["Phone","+1 555 0143"],
              ["Department","Computer Science"],
            ].map(([l,v])=>(
              <div key={l}>
                <label className="text-xs text-muted-foreground">{l}</label>
                <input defaultValue={v} className="mt-1 w-full rounded-xl border bg-background/60 px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Bell className="size-4" /> Preferences</h3>
          {[
            ["Email notifications", true],
            ["Push alerts", true],
            ["Weekly summary", false],
            ["Dark mode", false],
          ].map(([l,v])=>(
            <div key={l as string} className="flex items-center justify-between py-2.5 border-b last:border-0">
              <div className="text-sm">{l}</div>
              <button className={`relative w-11 h-6 rounded-full transition ${v ? "bg-gradient-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${v ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="size-4" /> Security</h3>
          <div className="space-y-3">
            <button className="w-full text-left rounded-xl border p-4 hover:bg-accent">
              <div className="font-medium text-sm">Change password</div>
              <div className="text-xs text-muted-foreground">Last changed 2 months ago</div>
            </button>
            <button className="w-full text-left rounded-xl border p-4 hover:bg-accent">
              <div className="font-medium text-sm">Two-factor authentication</div>
              <div className="text-xs text-muted-foreground">Currently enabled via app</div>
            </button>
            <button className="w-full text-left rounded-xl border p-4 hover:bg-accent">
              <div className="font-medium text-sm">Active sessions</div>
              <div className="text-xs text-muted-foreground">3 devices signed in</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
