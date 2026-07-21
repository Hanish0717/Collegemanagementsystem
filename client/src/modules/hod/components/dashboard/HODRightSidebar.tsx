import React, { useState } from 'react';
import { GlassCard } from '../shared/GlassCard';
import { Cake, Pin, Edit3, Clock, AlertCircle } from 'lucide-react';

export function HODRightSidebar() {
  const [note, setNote] = useState('Verify BOS syllabus revisions with Dean office before Friday.');

  return (
    <div className="space-y-4">
      {/* Birthdays Widget */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-pink-600 mb-2">
          <Cake className="size-4" />
          <span>Today's Department Birthdays</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40">
            <p className="font-extrabold text-slate-900 dark:text-white">Prof. Sneha Verma</p>
            <p className="text-[10px] text-slate-500 font-medium">Assistant Professor (AIML)</p>
          </div>
        </div>
      </GlassCard>

      {/* Pinned Items */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-2">
          <Pin className="size-4" />
          <span>Pinned Department Circulars</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <p className="font-extrabold text-slate-900 dark:text-white">R23 Mid-Term 2 Time Table</p>
            <p className="text-[10px] text-slate-500 font-medium">Approved by HOD on July 15, 2026</p>
          </div>
        </div>
      </GlassCard>

      {/* Quick Notes Scratchpad */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between text-xs font-bold text-blue-600 mb-2">
          <span className="flex items-center gap-1.5"><Edit3 className="size-4" /> HOD Scratchpad</span>
          <span className="text-[10px] text-slate-400">Auto-saved</span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Jot down quick HOD notes..."
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </GlassCard>

      {/* Upcoming Deadlines */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-2">
          <Clock className="size-4" />
          <span>Upcoming Accreditation Deadlines</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
            <p className="font-extrabold text-slate-900 dark:text-white">NBA Self-Assessment Report (SAR)</p>
            <p className="text-[10px] text-rose-600 font-extrabold mt-0.5">Due in 5 Days (July 25, 2026)</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
