import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, Play, Settings2 } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { automationCards, automationLogs } from "@/lib/super-admin-data";

export const Route = createFileRoute("/dashboard/super-admin/automation")({
  component: AiAutomationControl,
});

function AiAutomationControl() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Automation Control"
        desc="Manage workflow triggers, notification automations, attendance alerts and fee reminders."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {automationCards.map(card => (
          <Card key={card.name} className="hover:-translate-y-1 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                <Bot className="size-5" />
              </div>
              <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${card.enabled ? "bg-emerald-500" : "bg-muted"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${card.enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <h3 className="font-semibold text-sm">{card.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{card.trigger}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2 rounded-lg bg-gradient-soft border text-center">
                <div className="text-xs text-muted-foreground">Runs</div>
                <div className="font-bold">{card.runs}</div>
              </div>
              <div className="p-2 rounded-lg bg-gradient-soft border text-center">
                <div className="text-xs text-muted-foreground">Success</div>
                <div className="font-bold text-emerald-600">{card.success}%</div>
              </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition flex items-center justify-center gap-1">
              <Settings2 className="size-3.5" /> Trigger Settings
            </button>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Automation Analytics</h3>
            <Badge tone="info">30 days</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={automationCards}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="runs" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="success" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Play className="size-5 text-indigo" />
            <h3 className="font-semibold">Recent Automation Activity</h3>
          </div>
          <div className="space-y-2">
            {automationLogs.map(log => (
              <div key={log.event} className="p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{log.event}</div>
                    <div className="text-xs text-muted-foreground">{log.result} • {log.time}</div>
                  </div>
                  <Badge tone={log.status === "Success" ? "success" : "warn"}>{log.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
