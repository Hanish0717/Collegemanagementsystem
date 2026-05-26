import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Cloud, Database, Plus, RotateCcw } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { backups, systemAnalytics } from "@/mock/superAdminData";



export function SuperAdminBackups() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup Management"
        desc="Create backups, track history, manage restore points, cloud sync and scheduled backup settings."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Create Backup
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Storage Used", value: "38.4 GB", icon: Database },
          { label: "Cloud Sync", value: "96%", icon: Cloud },
          { label: "Restore Points", value: backups.length.toString(), icon: RotateCcw },
          { label: "Scheduled Backup", value: "02:00 AM", icon: Database },
        ].map(item => (
          <Card key={item.label}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-2xl font-bold mt-1">{item.value}</div>
              </div>
              <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                <item.icon className="size-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Storage Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={systemAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="users" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.16} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Scheduled Backup Settings</h3>
          <div className="space-y-3">
            {["Daily full backup", "Cloud synchronization", "Retention for 30 days", "Restore verification"].map((item, index) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft">
                <span className="text-sm">{item}</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${index < 3 ? "bg-emerald-500" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${index < 3 ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Backup History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Backup ID", "Type", "Size", "Backup Date", "Status", "Cloud Sync", "Actions"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {backups.map(backup => (
                <tr key={backup.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{backup.id}</td>
                  <td className="py-3 px-4">{backup.type}</td>
                  <td className="py-3 px-4 font-medium">{backup.size}</td>
                  <td className="py-3 px-4 text-muted-foreground">{backup.date}</td>
                  <td className="py-3 px-4">
                    <Badge tone={backup.status === "Completed" ? "success" : "warn"}>{backup.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={backup.cloud === "Synced" ? "info" : "warn"}>{backup.cloud}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">Restore</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Restore Backup</h3>
        <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-3 gap-4">
            <select className="rounded-lg border bg-background px-3 py-2 text-sm">
              {backups.map(backup => <option key={backup.id}>{backup.id}</option>)}
            </select>
            <input defaultValue="Full restore" className="rounded-lg border bg-background px-3 py-2 text-sm" />
            <input defaultValue="Maintenance window" className="rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition">
            Preview Restore
          </button>
        </div>
      </Card>
    </div>
  );
}
