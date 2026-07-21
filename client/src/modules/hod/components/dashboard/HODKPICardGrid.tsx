import React, { useState } from 'react';
import { KPICardData } from '../../services/hodDashboardService';
import { GlassCard } from '../shared/GlassCard';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface HODKPICardGridProps {
  kpiCards: KPICardData[];
}

export function HODKPICardGrid({ kpiCards }: HODKPICardGridProps) {
  const [expanded, setExpanded] = useState(false);

  // Show first 8 cards by default, expand to all 20 on toggle
  const visibleCards = expanded ? kpiCards : kpiCards.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Sparkles className="size-5 text-blue-600" />
          Key Performance Indicators (KPIs)
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          {expanded ? (
            <>
              Show Core 8 KPIs <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              View All 20 KPIs <ChevronDown className="size-4" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleCards.map((card) => {
          const Icon = card.icon;

          const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
            blue: { bg: 'bg-blue-50/70 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/40' },
            indigo: { bg: 'bg-indigo-50/70 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/40' },
            emerald: { bg: 'bg-emerald-50/70 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40' },
            purple: { bg: 'bg-purple-50/70 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/40' },
            amber: { bg: 'bg-amber-50/70 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/40' },
            rose: { bg: 'bg-rose-50/70 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/40' },
          };

          const style = colorStyles[card.accent] || colorStyles.blue;

          return (
            <GlassCard key={card.id} className="flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </span>
                  <div className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </div>
                </div>
                <div className={`p-3 rounded-2xl ${style.bg} ${style.text} ${style.border} border shadow-xs group-hover:scale-110 transition duration-300`}>
                  <Icon className="size-5" />
                </div>
              </div>

              {/* Sparkline Visualization */}
              <div className="mt-3 flex items-end justify-between gap-2">
                <div className="flex items-center gap-1 h-6">
                  {card.sparkline.map((val, idx) => {
                    const min = Math.min(...card.sparkline);
                    const max = Math.max(...card.sparkline);
                    const heightPercent = max === min ? 50 : Math.max(20, Math.round(((val - min) / (max - min)) * 100));
                    return (
                      <div
                        key={idx}
                        className={`w-1.5 rounded-full ${card.isPositive ? 'bg-blue-500/60' : 'bg-rose-500/60'}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      card.isPositive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                    }`}
                  >
                    {card.isPositive ? '↑' : '↓'} {card.change}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium mt-2 truncate">
                {card.subtitle}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
