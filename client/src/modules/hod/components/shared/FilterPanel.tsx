import React from 'react';
import { Filter, RotateCcw, GraduationCap, AlertCircle } from 'lucide-react';
import { HODFilterState } from '../../types';

interface FilterPanelProps {
  filters: Partial<HODFilterState>;
  onChange: (updated: Partial<HODFilterState>) => void;
  onReset?: () => void;
  showAcademicYear?: boolean;
  showSemester?: boolean;
  showSection?: boolean;
  showAdmissionType?: boolean;
  showFeeDefaulter?: boolean;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  showAcademicYear = true,
  showSemester = true,
  showSection = true,
  showAdmissionType = false,
  showFeeDefaulter = false,
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md text-xs font-semibold">
      <div className="flex items-center gap-1 text-slate-500 font-bold pr-2 border-r border-slate-200 dark:border-slate-800">
        <Filter className="size-3.5 text-blue-500" />
        <span>Filters</span>
      </div>

      {showAcademicYear && (
        <select
          value={filters.academicYear || ''}
          onChange={(e) => onChange({ ...filters, academicYear: e.target.value })}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none"
        >
          <option value="">All Academic Years</option>
          <option value="2025-2026">2025-2026</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
        </select>
      )}

      {showSemester && (
        <select
          value={filters.semester || ''}
          onChange={(e) => onChange({ ...filters, semester: e.target.value })}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={String(s)}>
              Sem {s}
            </option>
          ))}
        </select>
      )}

      {showSection && (
        <select
          value={filters.section || ''}
          onChange={(e) => onChange({ ...filters, section: e.target.value })}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none"
        >
          <option value="">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
      )}

      {/* ── Admission Type Filter ── */}
      {showAdmissionType && (
        <div className="flex items-center gap-1.5">
          <GraduationCap className="size-3.5 text-amber-500 shrink-0" />
          <select
            value={filters.admissionType || 'All'}
            onChange={(e) =>
              onChange({
                ...filters,
                admissionType: e.target.value as HODFilterState['admissionType'],
              })
            }
            className="px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 focus:outline-none font-bold"
          >
            <option value="All">All Students</option>
            <option value="Scholarship">🎓 Scholarship Students</option>
            <option value="Management">💼 Management Students</option>
          </select>
        </div>
      )}

      {/* ── Fee Defaulter Filter ── */}
      {showFeeDefaulter && (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
          <select
            value={filters.feeDefaulterFor || 'none'}
            onChange={(e) =>
              onChange({
                ...filters,
                feeDefaulterFor: e.target.value as HODFilterState['feeDefaulterFor'],
              })
            }
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 focus:outline-none font-bold"
          >
            <option value="none">All Fee Status</option>
            <option value="mid1">⚠ Mid-1 Fee Defaulters</option>
            <option value="mid2">⚠ Mid-2 Fee Defaulters</option>
            <option value="labs">⚠ Lab Exam Fee Defaulters</option>
            <option value="semester">⚠ Semester Exam Fee Defaulters</option>
          </select>
        </div>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
        >
          <RotateCcw className="size-3.5" /> Reset
        </button>
      )}
    </div>
  );
}

