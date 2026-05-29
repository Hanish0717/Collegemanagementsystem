import { createFileRoute } from "@tanstack/react-router";
import { Bell, Database, Mail, Palette, Save, Settings } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { settingsGroups } from "@/mock/superAdminData";

const icons = [Mail, Bell, Settings, Database, Palette];

export function SuperAdminConfiguration() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        desc="Configure institutional communication, academic cycle, backup and display preferences."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsGroups.map((group, index) => {
          const Icon = icons[index];
          return (
            <Card key={group.title} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                  <Icon className="size-5" />
                </div>
                <Badge tone="success">Enabled</Badge>
              </div>
              <h3 className="font-semibold">{group.title}</h3>
              <div className="space-y-2 mt-4">
                {group.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-gradient-soft"
                  >
                    <span className="text-sm text-muted-foreground">{item}</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition">
                Configure
              </button>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Institution Settings</h3>
        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              defaultValue="College Management System"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              defaultValue="2026-2027"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              <option>Daily Backup</option>
              <option>Weekly Backup</option>
              <option>Manual Backup</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <textarea
              defaultValue="admin@college.edu"
              rows={3}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <textarea
              defaultValue="Primary email, SMS and dashboard notifications are enabled for critical events."
              rows={3}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
            <Save className="size-4" /> Save Configuration
          </button>
        </div>
      </Card>
    </div>
  );
}
