import React from 'react';
import { Building2, Users, GraduationCap, Award } from 'lucide-react';
import { DepartmentInfo } from '../../types';
import { GlassCard } from './GlassCard';

interface DepartmentCardProps {
  info: DepartmentInfo;
  academicYear: string;
}

export function DepartmentCard({ info, academicYear }: DepartmentCardProps) {
  return (
    <GlassCard className="relative overflow-hidden border-blue-500/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Building2 className="size-4" />
            <span>{info.building}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {info.name} ({info.code})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            HOD: <strong className="text-slate-700 dark:text-slate-200">{info.headName}</strong> ({info.headEmail})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-center px-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
              <Users className="size-3.5 text-blue-500" /> Students
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">{info.totalStudents}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center px-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
              <GraduationCap className="size-3.5 text-indigo-500" /> Faculty
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">{info.totalFaculty}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center px-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
              <Award className="size-3.5 text-purple-500" /> Labs
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">{info.totalLabs}</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
