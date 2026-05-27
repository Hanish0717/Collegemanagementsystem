import { createFileRoute } from "@tanstack/react-router";
import {
  Settings,
  Bell,
  Brain,
  BarChart3,
  FileText,
  Save,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";

export function AiSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Settings"
        desc="Configure AI module preferences, prediction settings, and notification options."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Save className="size-4" /> Save Settings
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "AI Module Status", value: "Active", tone: "success" as const },
          { label: "Predictions Enabled", value: "Yes", tone: "success" as const },
          { label: "Notifications", value: "On", tone: "success" as const },
          { label: "Last Updated", value: "Today", tone: "info" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="size-5 text-indigo" />
            <h3 className="font-semibold">AI Module Settings</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Enable AI Predictions",
                desc: "Allow AI to generate performance and attendance predictions",
                enabled: true,
              },
              {
                label: "Risk Analysis",
                desc: "Enable automatic risk assessment for students",
                enabled: true,
              },
              {
                label: "Smart Insights",
                desc: "Generate automated insights and recommendations",
                enabled: true,
              },
              {
                label: "Chatbot Assistant",
                desc: "Enable AI-powered chatbot for queries",
                enabled: true,
              },
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                  <div className="text-sm font-medium">{setting.label}</div>
                  <div className="text-xs text-muted-foreground">{setting.desc}</div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full ${setting.enabled ? "bg-primary" : "bg-muted"} relative cursor-pointer`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.enabled ? "left-7" : "left-1"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-5 text-indigo" />
            <h3 className="font-semibold">Prediction Preferences</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div>
              <label className="text-sm font-medium mb-2 block">Prediction Frequency</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {["Daily", "Weekly", "Monthly", "On Demand"].map((freq) => (
                  <option key={freq}>{freq}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Prediction Accuracy Threshold
              </label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {["85%", "90%", "95%", "98%"].map((threshold) => (
                  <option key={threshold}>{threshold}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Sources</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                {[
                  "All Available Data",
                  "Attendance Only",
                  "Performance Only",
                  "Custom Selection",
                ].map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="size-5 text-indigo" />
          <h3 className="font-semibold">Notification Settings</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Risk Alerts",
              desc: "Receive notifications for high-risk students",
              enabled: true,
            },
            {
              label: "Prediction Updates",
              desc: "Get notified when new predictions are generated",
              enabled: true,
            },
            {
              label: "Attendance Warnings",
              desc: "Alerts for students below attendance threshold",
              enabled: true,
            },
            {
              label: "Insight Notifications",
              desc: "New insights and recommendations",
              enabled: false,
            },
            { label: "Report Ready", desc: "When AI reports are generated", enabled: true },
            { label: "System Updates", desc: "AI module status and updates", enabled: true },
          ].map((setting, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{setting.label}</span>
                <div
                  className={`w-10 h-6 rounded-full ${setting.enabled ? "bg-primary" : "bg-muted"} relative cursor-pointer`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.enabled ? "left-5" : "left-1"}`}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{setting.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="size-5 text-indigo" />
          <h3 className="font-semibold">Report Automation Settings</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Auto-generate Reports",
              desc: "Automatically create reports on schedule",
              enabled: true,
            },
            {
              label: "Weekly Summary",
              desc: "Generate weekly performance summaries",
              enabled: true,
            },
            {
              label: "Monthly Analytics",
              desc: "Create comprehensive monthly reports",
              enabled: true,
            },
            { label: "Risk Reports", desc: "Automated risk assessment reports", enabled: true },
            {
              label: "Attendance Reports",
              desc: "Regular attendance analysis reports",
              enabled: true,
            },
            { label: "Custom Reports", desc: "Allow custom report generation", enabled: false },
          ].map((setting, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{setting.label}</span>
                <div
                  className={`w-10 h-6 rounded-full ${setting.enabled ? "bg-primary" : "bg-muted"} relative cursor-pointer`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.enabled ? "left-5" : "left-1"}`}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{setting.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="size-5 text-indigo" />
          <h3 className="font-semibold">User Preferences</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Dashboard View",
              desc: "Default dashboard layout preference",
              value: "Standard",
            },
            { label: "Data Refresh Rate", desc: "How often data is refreshed", value: "5 minutes" },
            { label: "Chart Style", desc: "Preferred chart visualization style", value: "Modern" },
            { label: "Language", desc: "Interface language preference", value: "English" },
            { label: "Timezone", desc: "Your local timezone", value: "UTC+05:30" },
            { label: "Date Format", desc: "Preferred date display format", value: "DD/MM/YYYY" },
          ].map((pref, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="text-sm font-medium mb-1">{pref.label}</div>
              <div className="text-xs text-muted-foreground mb-2">{pref.desc}</div>
              <select className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs">
                {[pref.value, "Option 2", "Option 3"].map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="size-5 text-indigo" />
          <h3 className="font-semibold">AI Configuration</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Model Version", value: "v2.4.1", desc: "Current AI model version in use" },
            {
              label: "Training Data Last Updated",
              value: "May 20, 2026",
              desc: "Last date when training data was refreshed",
            },
            { label: "API Status", value: "Connected", desc: "Connection status to AI services" },
            {
              label: "Processing Queue",
              value: "0 pending",
              desc: "Number of pending AI processing tasks",
            },
          ].map((config, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl border">
              <div>
                <div className="text-sm font-medium">{config.label}</div>
                <div className="text-xs text-muted-foreground">{config.desc}</div>
              </div>
              <Badge tone="success">{config.value}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between p-4 rounded-xl border bg-gradient-soft">
        <div>
          <div className="text-sm font-medium">Reset All Settings</div>
          <div className="text-xs text-muted-foreground">
            Restore all AI settings to default values
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2 hover:bg-red-50 transition">
          <RefreshCw className="size-4" /> Reset to Default
        </button>
      </div>
    </div>
  );
}
