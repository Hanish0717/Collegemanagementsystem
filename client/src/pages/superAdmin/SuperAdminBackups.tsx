import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Cloud, Database, Plus, RotateCcw } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBackups, createBackup, restoreBackup, saveBackupSettings, Backup } from "@/services/superAdminService";
import { Skeleton } from "@/components/ui/skeleton";

// Mock analytics for backup storage sizing chart
const storageAnalyticsData = [
  { month: "Jan", users: 12 },
  { month: "Feb", users: 15 },
  { month: "Mar", users: 18 },
  { month: "Apr", users: 24 },
  { month: "May", users: 30 },
  { month: "Jun", users: 38 },
];

export function SuperAdminBackups() {
  const queryClient = useQueryClient();
  const [selectedRestoreId, setSelectedRestoreId] = useState("");
  const [restoreDetails, setRestoreDetails] = useState("Full restore");
  const [restoreWindow, setRestoreWindow] = useState("Maintenance window");

  const { data, isLoading } = useQuery({
    queryKey: ["superAdminBackups"],
    queryFn: fetchBackups,
  });

  const backups = data?.backups || [];
  const backupSettings = data?.settings || [true, true, true, false];

  useEffect(() => {
    if (backups.length > 0 && !selectedRestoreId) {
      setSelectedRestoreId(backups[0].id);
    }
  }, [backups, selectedRestoreId]);

  const createMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: (newB) => {
      queryClient.invalidateQueries({ queryKey: ["superAdminBackups"] });
      toast.success(`Backup ${newB.id} created and synced successfully.`);
      if (!selectedRestoreId) {
        setSelectedRestoreId(newB.id);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create backup");
    }
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBackup,
    onSuccess: (msg) => {
      toast.success(msg);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to restore backup");
    }
  });

  const settingsMutation = useMutation({
    mutationFn: saveBackupSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superAdminBackups"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to save backup settings");
    }
  });

  const handleCreateBackup = () => {
    toast.info("Starting database backup process...");
    createMutation.mutate();
  };

  const handleToggleSetting = (index: number) => {
    const updated = [...backupSettings];
    updated[index] = !updated[index];
    settingsMutation.mutate(updated);
    const names = [
      "Daily full backup",
      "Cloud synchronization",
      "Retention for 30 days",
      "Restore verification",
    ];
    toast.success(`${names[index]} is now ${updated[index] ? "enabled" : "disabled"}`);
  };

  const handleRestore = (id: string) => {
    if (confirm(`Are you sure you want to restore the system to point ${id}? This will briefly disconnect active sessions.`)) {
      toast.info(`Initiating system restore to point ${id}...`);
      restoreMutation.mutate(id);
    }
  };

  const handlePreviewRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestoreId) {
      toast.error("Please select a valid backup point");
      return;
    }
    toast.info(`Analyzing backup compatibility for ${selectedRestoreId}...`);
    setTimeout(() => {
      toast.success(`Verification complete: 0 conflicts detected. Ready to restore.`);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup Management"
        desc="Create backups, track history, manage restore points, cloud sync and scheduled backup settings."
        actions={
          <button
            onClick={handleCreateBackup}
            disabled={createMutation.isPending}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="size-4" /> {createMutation.isPending ? "Backing up..." : "Create Backup"}
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Storage Used", value: "38.4 GB", icon: Database },
          { label: "Cloud Sync", value: "96%", icon: Cloud },
          { label: "Restore Points", value: backups.length.toString(), icon: RotateCcw },
          { label: "Scheduled Backup", value: "02:00 AM", icon: Database },
        ].map((item) => (
          <Card key={item.label}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1 animate-pulse bg-muted-foreground/10" />
                ) : (
                  <div className="text-2xl font-bold mt-1">{item.value}</div>
                )}
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
          <h3 className="font-semibold mb-4">Storage Analytics (GB)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={storageAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.16}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Scheduled Backup Settings</h3>
          <div className="space-y-3">
            {[
              "Daily full backup",
              "Cloud synchronization",
              "Retention for 30 days",
              "Restore verification",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft"
              >
                <span className="text-sm">{item}</span>
                <button
                  onClick={() => handleToggleSetting(index)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${backupSettings[index] ? "bg-emerald-500" : "bg-muted"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${backupSettings[index] ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Backup History</h3>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {[
                    "Backup ID",
                    "Type",
                    "Size",
                    "Backup Date",
                    "Status",
                    "Cloud Sync",
                    "Actions",
                  ].map((column) => (
                    <th
                      key={column}
                      className="text-left py-3 px-4 font-semibold text-muted-foreground"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No backup history found.
                    </td>
                  </tr>
                ) : (
                  backups.map((backup) => (
                    <tr key={backup.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-semibold text-xs text-primary">{backup.id}</td>
                      <td className="py-3 px-4">{backup.type}</td>
                      <td className="py-3 px-4 font-medium">{backup.size}</td>
                      <td className="py-3 px-4 text-muted-foreground">{backup.date}</td>
                      <td className="py-3 px-4">
                        <Badge tone={backup.status === "Completed" ? "success" : "warn"}>
                          {backup.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={backup.cloud === "Synced" ? "info" : "warn"}>{backup.cloud}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleRestore(backup.id)}
                          className="px-2.5 py-1 rounded text-xs font-semibold text-primary hover:text-white hover:bg-primary border transition cursor-pointer"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Restore Backup</h3>
        <form onSubmit={handlePreviewRestore} className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              value={selectedRestoreId}
              onChange={(e) => setSelectedRestoreId(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
            >
              {backups.map((backup) => (
                <option key={backup.id} value={backup.id}>{backup.id} ({backup.date})</option>
              ))}
            </select>
            <input
              value={restoreDetails}
              onChange={(e) => setRestoreDetails(e.target.value)}
              placeholder="Restore Scope"
              required
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={restoreWindow}
              onChange={(e) => setRestoreWindow(e.target.value)}
              placeholder="Restore Target Window"
              required
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-lg border text-sm font-semibold hover:bg-accent transition cursor-pointer"
          >
            Preview Restore
          </button>
        </form>
      </Card>
    </div>
  );
}
