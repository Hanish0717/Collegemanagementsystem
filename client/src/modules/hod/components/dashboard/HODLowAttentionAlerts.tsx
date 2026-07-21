import React from 'react';
import { AlertTriangle, ChevronRight, Bell, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { NotificationToast } from '../shared/NotificationToast';

interface LowAttentionAlertItem {
  id: string;
  title: string;
  category: string;
  metric: string;
  priority: string;
  action: string;
}

interface HODLowAttentionAlertsProps {
  alerts: LowAttentionAlertItem[];
}

export function HODLowAttentionAlerts({ alerts }: HODLowAttentionAlertsProps) {
  const handleTriggerAction = (alert: LowAttentionAlertItem) => {
    NotificationToast.success(`Action Executed: ${alert.action}`, `Dispatched alert for ${alert.title}`);
  };

  return (
    <GlassCard className="border-rose-200/60 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10">
      <div className="flex items-center justify-between border-b border-rose-200/60 dark:border-rose-900/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Low Attention Critical Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Department bottlenecks & attendance warnings requiring HOD intervention</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          {alerts.length} Critical Issues
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-xs hover:border-rose-400 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  {alert.category}
                </span>
                <span className="font-extrabold text-rose-600 text-xs">{alert.metric}</span>
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-xs">{alert.title}</h4>
            </div>

            <button
              onClick={() => handleTriggerAction(alert)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-rose-600 dark:hover:bg-rose-600 text-white dark:text-slate-900 hover:text-white text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{alert.action}</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
