import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, GraduationCap, Award, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { DepartmentInfo } from '../../types';

interface DepartmentCardProps {
  info: DepartmentInfo;
  academicYear: string;
}

export function DepartmentCard({ info, academicYear }: DepartmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-2xl ring-1 ring-white/10"
    >
      {/* Background Mesh Glow */}
      <div className="absolute -right-12 -top-12 size-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 size-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Department Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30 flex items-center gap-1.5">
              <Building2 className="size-3.5" /> {info.building || 'Main Campus Block'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-300">
              AY {academicYear}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            {info.name} <span className="text-blue-400 font-extrabold">({info.code})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl backdrop-blur-xs">
              <GraduationCap className="size-4 text-amber-400" />
              <span>HOD: <strong className="text-white font-bold">{info.headName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Mail className="size-3.5 text-blue-400" />
              <span>{info.headEmail}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="size-3.5 text-emerald-400" />
              <span>{info.phone || '+91 98765 43210'}</span>
            </div>
          </div>
        </div>

        {/* Right Stats Pills */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xl">
          <div className="text-center px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1">
              <Users className="size-3.5 text-cyan-400" /> Enrolled Students
            </div>
            <div className="text-xl font-black text-white mt-0.5">{info.totalStudents}</div>
          </div>

          <div className="text-center px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1">
              <GraduationCap className="size-3.5 text-indigo-400" /> Faculty Members
            </div>
            <div className="text-xl font-black text-white mt-0.5">{info.totalFaculty}</div>
          </div>

          <div className="text-center px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1">
              <Award className="size-3.5 text-amber-400" /> Specialized Labs
            </div>
            <div className="text-xl font-black text-white mt-0.5">{info.totalLabs}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
