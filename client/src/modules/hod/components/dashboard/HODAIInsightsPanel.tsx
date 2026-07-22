import React from 'react';
import { GlassCard } from '../shared/GlassCard';
import { Sparkles, Brain, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';

export function HODAIInsightsPanel() {
  const { departmentInfo } = useHODDepartment();

  return (
    <GlassCard className="border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white/80 to-purple-50/50 dark:from-indigo-950/30 dark:via-slate-900/80 dark:to-purple-950/30 shadow-lg">
      <div className="flex items-center justify-between border-b border-indigo-200/80 dark:border-indigo-900/50 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
            <Brain className="size-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
              AI Department Predictive Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Machine Learning forecasts for {departmentInfo.shortName} Department
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-300" /> AI Copilot Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900/40 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="size-4" /> Predicted End-Sem Pass Rate
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">96.4%</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Based on Mid-Term 1 scores & attendance momentum (+2.2% vs previous semester).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-rose-100 dark:border-rose-900/40 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-4" /> Attendance Risk Forecast
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">6 Students</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Predicted to drop below 75% attendance by end of month if unaddressed.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900/40 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            <Award className="size-4" /> Recommended Action
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white">Assign Remedial Mentors</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Recommend pairing Prof. Sneha Verma with Sem 5 Section B low-performing cohorts.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
