import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { AvatarCard } from './AvatarCard';
import { StatusBadge } from './StatusBadge';
import { Users, GraduationCap, Award, Calendar, FileText, FlaskConical, AlertTriangle, Activity } from 'lucide-react';

export function StudentCard({ name, roll, section, gpa, attendance }: { name: string; roll: string; section: string; gpa: string; attendance: string }) {
  return (
    <GlassCard className="p-4">
      <AvatarCard name={name} subtitle={`Roll: ${roll} • Sec ${section}`} size="md" />
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 text-xs">
        <div><p className="text-[10px] text-slate-400 font-bold uppercase">CGPA</p><p className="font-extrabold text-indigo-600">{gpa}</p></div>
        <div><p className="text-[10px] text-slate-400 font-bold uppercase">Attendance</p><p className="font-extrabold text-emerald-600">{attendance}</p></div>
      </div>
    </GlassCard>
  );
}

export function FacultyCard({ name, designation, subject, workload }: { name: string; designation: string; subject: string; workload: string }) {
  return (
    <GlassCard className="p-4">
      <AvatarCard name={name} subtitle={designation} badge="Faculty" size="md" />
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 text-xs font-semibold">
        <span className="text-slate-600">{subject}</span>
        <span className="font-extrabold text-purple-600">{workload}</span>
      </div>
    </GlassCard>
  );
}

export function ApprovalCard({ title, applicant, date, status, onApprove, onReject }: { title: string; applicant: string; date: string; status: string; onApprove?: () => void; onReject?: () => void }) {
  return (
    <GlassCard className="p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <StatusBadge status={status} />
          <span className="text-[10px] font-mono text-slate-400">{date}</span>
        </div>
        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{title}</h4>
        <p className="text-[11px] text-slate-500 font-medium mt-1">Applicant: {applicant}</p>
      </div>

      {status === 'Pending' && onApprove && (
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onReject} className="flex-1 py-1 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 cursor-pointer">Reject</button>
          <button onClick={onApprove} className="flex-1 py-1 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 cursor-pointer">Approve</button>
        </div>
      )}
    </GlassCard>
  );
}

export function AlertCard({ title, metric, category, actionLabel, onAction }: { title: string; metric: string; category: string; actionLabel: string; onAction?: () => void }) {
  return (
    <GlassCard className="p-4 border-rose-200 dark:border-rose-900/40 bg-rose-50/20">
      <div className="flex items-start justify-between">
        <div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">{category}</span>
          <h4 className="font-black text-slate-900 dark:text-white text-xs mt-2">{title}</h4>
          <p className="text-xs font-bold text-rose-600 mt-0.5">{metric}</p>
        </div>
        {onAction && (
          <button onClick={onAction} className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] cursor-pointer">
            {actionLabel}
          </button>
        )}
      </div>
    </GlassCard>
  );
}

export function ActivityCard({ user, action, timestamp }: { user: string; action: string; timestamp: string }) {
  return (
    <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs">
      <div>
        <span className="font-extrabold text-slate-900 dark:text-white">{user}</span>
        <p className="text-[11px] text-slate-500 font-medium">{action}</p>
      </div>
      <span className="font-mono text-[10px] text-slate-400">{timestamp}</span>
    </div>
  );
}

export function ResearchCard({ title, journal, doi }: { title: string; journal: string; doi: string }) {
  return (
    <GlassCard className="p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-purple-600"><FlaskConical className="size-4" /> Journal Publication</div>
      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{title}</h4>
      <p className="text-[11px] text-slate-500 font-medium">{journal}</p>
      <span className="font-mono text-[10px] text-slate-400 block">{doi}</span>
    </GlassCard>
  );
}

export function EventCard({ title, date, venue }: { title: string; date: string; venue: string }) {
  return (
    <GlassCard className="p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-blue-600"><Calendar className="size-4" /> Seminar / Event</div>
      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{title}</h4>
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>{date}</span>
        <span className="font-bold text-purple-600">{venue}</span>
      </div>
    </GlassCard>
  );
}

export function DocumentCard({ title, size }: { title: string; size: string }) {
  return (
    <GlassCard className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50"><FileText className="size-5" /></div>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{title}</h4>
          <p className="text-[10px] text-slate-400 font-mono">{size}</p>
        </div>
      </div>
    </GlassCard>
  );
}

export function AnalyticsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard className="p-5 space-y-4">
      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{title}</h4>
      <div>{children}</div>
    </GlassCard>
  );
}

export function PerformanceCard({ label, value, target }: { label: string; value: string; target: string }) {
  return (
    <GlassCard className="p-4 text-center space-y-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="text-2xl font-black text-blue-600">{value}</div>
      <span className="text-[10px] text-slate-400 font-medium">Target: {target}</span>
    </GlassCard>
  );
}
