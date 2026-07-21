import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function HODForbiddenPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="size-20 rounded-3xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 grid place-items-center mb-4 shadow-xl">
        <ShieldAlert className="size-10" />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">403 — Access Forbidden</h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 font-medium leading-relaxed">
        You do not have permission to access the <strong>Head of Department (HOD)</strong> Management Module. Only authorized HODs, Deans, and Principals are permitted.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Go Back
        </button>
        <Link
          to="/dashboard"
          className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
        >
          <Home className="size-4" /> Return to ERP Home
        </Link>
      </div>
    </div>
  );
}
