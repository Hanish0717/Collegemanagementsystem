import { createFileRoute } from "@tanstack/react-router";
import { Bell, Database, Mail, Palette, Save, Settings } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSystemConfig,
  saveConfigToggles,
  saveConfigInstitution
} from "@/services/superAdminService";
import { Skeleton } from "@/components/ui/skeleton";

const icons = [Mail, Bell, Settings, Database, Palette];

const settingsGroups = [
  {
    title: "Email & Communication",
    items: ["SMTP Configuration", "SMS gateway Settings", "Internal chat server"],
  },
  {
    title: "System Alerts & Reminders",
    items: ["Attendance warnings", "Auto back-up alerts", "Holiday broadcast notices"],
  },
  {
    title: "Database Settings",
    items: ["Supabase auto-pruning", "Query optimization cache", "Weekly diagnostic logs"],
  },
];

export function SuperAdminConfiguration() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["superAdminSystemConfig"],
    queryFn: fetchSystemConfig,
  });

  // Institution Settings state
  const [instName, setInstName] = useState("");
  const [acadYear, setAcadYear] = useState("");
  const [bkInterval, setBkInterval] = useState("Daily Backup");
  const [admEmail, setAdmEmail] = useState("");
  const [notifNotes, setNotifNotes] = useState("");

  const configs = data?.toggles || {};

  useEffect(() => {
    if (data?.institution) {
      setInstName(data.institution.instName || "");
      setAcadYear(data.institution.acadYear || "");
      setBkInterval(data.institution.bkInterval || "Daily Backup");
      setAdmEmail(data.institution.admEmail || "");
      setNotifNotes(data.institution.notifNotes || "");
    }
  }, [data]);

  const togglesMutation = useMutation({
    mutationFn: saveConfigToggles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminSystemConfig"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update configuration toggle");
    }
  });

  const institutionMutation = useMutation({
    mutationFn: saveConfigInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminSystemConfig"] });
      toast.success("Institutional configurations saved successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to save institution configurations");
    }
  });

  const handleToggle = (item: string) => {
    const nextVal = !configs[item];
    const updated = { ...configs, [item]: nextVal };
    togglesMutation.mutate(updated);
    toast.success(`${item} has been ${nextVal ? "enabled" : "disabled"}`);
  };

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    institutionMutation.mutate({ instName, acadYear, bkInterval, admEmail, notifNotes });
  };

  const handleConfigureGroup = (title: string) => {
    toast.info(`Opening detailed settings panel for ${title}...`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        desc="Configure institutional communication, academic cycle, backup and display preferences."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsGroups.map((group, index) => {
          const Icon = icons[index] || Settings;
          const isGroupEnabled = group.items.some((item) => configs[item] !== false);
          return (
            <Card key={group.title} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center">
                  <Icon className="size-5" />
                </div>
                <Badge tone={isGroupEnabled ? "success" : "default"}>
                  {isGroupEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <h3 className="font-semibold">{group.title}</h3>
              <div className="space-y-2 mt-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ) : (
                  group.items.map((item) => {
                    const isEnabled = configs[item] !== false; // defaults to true
                    return (
                      <div
                        key={item}
                        className="flex items-center justify-between p-2.5 rounded-lg border bg-gradient-soft"
                      >
                        <span className="text-sm text-muted-foreground">{item}</span>
                        <button
                          onClick={() => handleToggle(item)}
                          disabled={togglesMutation.isPending}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${isEnabled ? "bg-emerald-500" : "bg-muted"} disabled:opacity-50`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isEnabled ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <button
                onClick={() => handleConfigureGroup(group.title)}
                className="mt-4 w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition cursor-pointer"
              >
                Configure
              </button>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Institution Settings</h3>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSaveInstitution} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Institution Name</label>
                <input
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  required
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Current Academic Year</label>
                <input
                  value={acadYear}
                  onChange={(e) => setAcadYear(e.target.value)}
                  required
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">System Backup Interval</label>
                <select
                  value={bkInterval}
                  onChange={(e) => setBkInterval(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                >
                  <option value="Daily Backup">Daily Backup</option>
                  <option value="Weekly Backup">Weekly Backup</option>
                  <option value="Manual Backup">Manual Backup</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Primary Administrative Email</label>
                <textarea
                  value={admEmail}
                  onChange={(e) => setAdmEmail(e.target.value)}
                  required
                  rows={3}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notification Settings / Notes</label>
                <textarea
                  value={notifNotes}
                  onChange={(e) => setNotifNotes(e.target.value)}
                  required
                  rows={3}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={institutionMutation.isPending}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition disabled:opacity-50"
            >
              <Save className="size-4" /> Save Configuration
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
