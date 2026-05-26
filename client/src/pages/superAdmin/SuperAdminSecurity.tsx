import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Search, ShieldAlert } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { securityLogs } from "@/mock/superAdminData";



export function SuperAdminSecurity() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const filtered = useMemo(() => securityLogs.filter(log =>
    (status === "All" || log.status === status) &&
    [log.id, log.user, log.event, log.ip].some(value => value.toLowerCase().includes(search.toLowerCase()))
  ), [search, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Security & Logs" desc="Track login activity, failed attempts, system alerts, audit logs and user activity." />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search logs..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All", "Success", "Failed", "Review"].map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Login Activity", value: "1,284", tone: "info" as const },
          { label: "Failed Attempts", value: "17", tone: "danger" as const },
          { label: "System Alerts", value: "4", tone: "warn" as const },
        ].map(item => (
          <Card key={item.label}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-2xl font-bold mt-1">{item.value}</div>
              </div>
              <Badge tone={item.tone}>Today</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Log ID", "User", "Event", "IP Address", "Time", "Status"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{log.id}</td>
                  <td className="py-3 px-4">{log.user}</td>
                  <td className="py-3 px-4 text-muted-foreground">{log.event}</td>
                  <td className="py-3 px-4 font-mono text-xs">{log.ip}</td>
                  <td className="py-3 px-4 text-muted-foreground">{log.time}</td>
                  <td className="py-3 px-4">
                    <Badge tone={log.status === "Success" ? "success" : log.status === "Failed" ? "danger" : "warn"}>{log.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="size-5 text-indigo" />
            <h3 className="font-semibold">Security Timeline</h3>
          </div>
          <div className="space-y-4">
            {securityLogs.map((log, index) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`size-8 rounded-lg ${log.status === "Failed" ? "bg-rose-500" : log.status === "Review" ? "bg-amber-500" : "bg-emerald-500"} text-white grid place-items-center text-xs font-bold`}>
                    {index + 1}
                  </div>
                  {index < securityLogs.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="font-medium text-sm">{log.event}</div>
                  <div className="text-xs text-muted-foreground">{log.user} • {log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold">Security Notifications</h3>
          </div>
          <div className="space-y-2">
            {["New device login requires review", "Failed login attempts exceeded threshold", "Monthly audit log is ready", "Permission changes pending approval"].map((item, index) => (
              <div key={item} className="p-3 rounded-xl border hover:bg-accent/50 transition flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{item}</div>
                  <div className="text-xs text-muted-foreground">{index + 1}h ago</div>
                </div>
                <Badge tone={index === 1 ? "danger" : "warn"}>Alert</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
