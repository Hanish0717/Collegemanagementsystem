import React from 'react';
import { GlassCard } from '../shared/GlassCard';
import { Sparkles, Brain, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { useHODDepartment } from '../../hooks/useHODDepartment';

export function HODAIInsightsPanel() {
  const { departmentInfo } = useHODDepartment();

  return (
    <GlassCard className="border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 via-white/50 to-purple-50/40 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-purple-950/20">
      <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-900/40 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
            <Brain className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Department Predictive Insights</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Machine Learning forecasts for {departmentInfo.shortName} Department</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs">
          AI Copilot Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <TrendingUp className="size-4" /> Predicted End-Sem Pass Rate
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">96.4%</div>
          <p className="text-[11px] text-slate-500 font-medium">
            Based on Mid-Term 1 scores & attendance momentum (+2.2% vs previous semester).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
            <AlertCircle className="size-4" /> Attendance Risk Forecast
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">6 Students</div>
          <p className="text-[11px] text-slate-500 font-medium">
            Predicted to drop below 75% attendance by end of month if unaddressed.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <Award className="size-4" /> Recommended Action
          </div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">Assign Remedial Mentors</div>
          <p className="text-[11px] text-slate-500 font-medium">
            Recommend pairing Prof. Sneha Verma with Sem 5 Section B low-performing cohorts.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
