import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, Play, Settings2, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAutomations, toggleAutomation, saveAutomationSettings, Automation, AutomationLog } from "@/services/superAdminService";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminAutomation() {
  const queryClient = useQueryClient();
  const [editingCard, setEditingCard] = useState<Automation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger Form states
  const [triggerName, setTriggerName] = useState("");
  const [triggerFreq, setTriggerFreq] = useState("Daily");
  const [triggerTarget, setTriggerTarget] = useState("All Students");

  const { data, isLoading } = useQuery({
    queryKey: ["superAdminAutomations"],
    queryFn: fetchAutomations,
  });

  const cards = data?.automations || [];
  const automationLogs = data?.logs || [];

  const toggleMutation = useMutation({
    mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) => toggleAutomation(name, enabled),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["superAdminAutomations"] });
      toast.success(`${updated.name} automation ${updated.enabled ? "enabled" : "disabled"}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to toggle automation");
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: ({ name, frequency, target }: { name: string; frequency: string; target: string }) =>
      saveAutomationSettings(name, frequency, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminAutomations"] });
      toast.success(`Trigger configuration saved for ${triggerName}`);
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to save settings");
    }
  });

  const handleToggle = (name: string, currentEnabled: boolean) => {
    toggleMutation.mutate({ name, enabled: !currentEnabled });
  };

  const handleOpenSettings = (card: Automation) => {
    setEditingCard(card);
    setTriggerName(card.name);
    setTriggerFreq(card.frequency || "Daily");
    setTriggerTarget(card.target || "All Students");
    setIsModalOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate({
      name: triggerName,
      frequency: triggerFreq,
      target: triggerTarget,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Automation Control"
        desc="Manage workflow triggers, notification automations, attendance alerts and fee reminders."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="space-y-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))
        ) : (
          cards.map((card) => (
            <Card key={card.name} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                  <Bot className="size-5" />
                </div>
                <button
                  onClick={() => handleToggle(card.name, card.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${card.enabled ? "bg-emerald-500" : "bg-muted"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${card.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
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
              <button
                onClick={() => handleOpenSettings(card)}
                className="mt-4 w-full px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Settings2 className="size-3.5" /> Trigger Settings
              </button>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Automation Analytics</h3>
            <Badge tone="info">30 days</Badge>
          </div>
          <div className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer>
                <BarChart data={cards}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="runs" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Runs" />
                  <Bar dataKey="success" fill="#06B6D4" radius={[8, 8, 0, 0]} name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Play className="size-5 text-indigo" />
            <h3 className="font-semibold">Recent Automation Activity</h3>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              automationLogs.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl border hover:bg-accent/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{log.event}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.result} • {log.time}
                      </div>
                    </div>
                    <Badge tone={log.status === "Success" ? "success" : "warn"}>{log.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient flex items-center gap-2">
                <Settings2 className="size-5 text-indigo-600" /> Trigger Settings
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Workflow Name</label>
                <input
                  type="text"
                  disabled
                  value={triggerName}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-muted text-sm outline-none opacity-80"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Frequency Schedule</label>
                <select
                  value={triggerFreq}
                  onChange={(e) => setTriggerFreq(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="Real-time">Real-time (Immediate)</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily (at 08:00 AM)</option>
                  <option value="Weekly">Weekly (Sundays)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Target Audience</label>
                <select
                  value={triggerTarget}
                  onChange={(e) => setTriggerTarget(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                >
                  <option value="All Students">All Students</option>
                  <option value="Faculty Only">Faculty Only</option>
                  <option value="Admins and Heads">Admins and Heads</option>
                  <option value="All Stakeholders">All Stakeholders</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
