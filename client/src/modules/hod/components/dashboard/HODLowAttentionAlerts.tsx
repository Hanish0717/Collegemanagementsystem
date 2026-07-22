import React from 'react';
import { motion } from 'framer-motion';
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
    NotificationToast.success(`Action Dispatched: ${alert.action}`, `Notification sent for ${alert.title}`);
  };

  return (
    <GlassCard className="border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 shadow-lg">
      <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/50 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20 shadow-xs">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
              Low Attention Critical Alerts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Department bottlenecks & attendance warnings requiring HOD intervention
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md shadow-rose-500/25">
          {alerts.length} Critical Issues
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xs hover:border-rose-400 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  {alert.category}
                </span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-xs">{alert.metric}</span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">{alert.title}</h4>
            </div>

            <button
              onClick={() => handleTriggerAction(alert)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-rose-600 dark:hover:bg-rose-600 text-white dark:text-slate-900 hover:text-white text-xs font-extrabold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <span>{alert.action}</span>
              <ChevronRight className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
