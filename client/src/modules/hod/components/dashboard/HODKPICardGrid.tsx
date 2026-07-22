import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KPICardData } from '../../services/hodDashboardService';
import { GlassCard } from '../shared/GlassCard';
import { ChevronDown, ChevronUp, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

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
        <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
          <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
          Key Performance Indicators (KPIs)
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3.5 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-extrabold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
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

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {visibleCards.map((card, idx) => {
            const Icon = card.icon;

            const colorStyles: Record<string, { bg: string; text: string; border: string; bar: string }> = {
              blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-800/40', bar: 'bg-blue-500' },
              indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200/60 dark:border-indigo-800/40', bar: 'bg-indigo-500' },
              emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/40', bar: 'bg-emerald-500' },
              purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800/40', bar: 'bg-purple-500' },
              amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-800/40', bar: 'bg-amber-500' },
              rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-800/40', bar: 'bg-rose-500' },
            };

            const style = colorStyles[card.accent] || colorStyles.blue;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
              >
                <GlassCard className="flex flex-col justify-between group relative overflow-hidden h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {card.title}
                      </span>
                      <div className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {card.value}
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl ${style.bg} ${style.text} ${style.border} border shadow-xs group-hover:scale-110 transition duration-300 shrink-0`}>
                      <Icon className="size-5" />
                    </div>
                  </div>

                  {/* Sparkline Visualization */}
                  <div className="mt-4 flex items-end justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-end gap-1 h-6">
                      {card.sparkline.map((val, i) => {
                        const min = Math.min(...card.sparkline);
                        const max = Math.max(...card.sparkline);
                        const heightPercent = max === min ? 50 : Math.max(25, Math.round(((val - min) / (max - min)) * 100));
                        return (
                          <div
                            key={i}
                            className={`w-1.5 rounded-full ${style.bar} opacity-70 group-hover:opacity-100 transition-opacity`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        );
                      })}
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          card.isPositive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                        }`}
                      >
                        {card.isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {card.change}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold mt-2 truncate">
                    {card.subtitle}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
