import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { HOD_NAV_ITEMS } from '../../constants/hodNavigation';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { Building2, ChevronLeft, ChevronRight, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';

interface HODSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function HODSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: HODSidebarProps) {
  const { departmentInfo } = useHODDepartment();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Premium Vercel/Linear Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-slate-900 text-slate-100 border-r border-slate-800/80 shadow-2xl transition-all duration-300 flex flex-col justify-between select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Header Branding */}
          <div className="p-4 flex items-center justify-between border-b border-slate-800/80 h-16 bg-slate-950/40">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 grid place-items-center text-white shadow-lg shadow-blue-500/25 shrink-0 ring-1 ring-white/20">
                <Building2 className="size-5" />
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="leading-tight truncate"
                >
                  <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                    Campusly <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">HOD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">{departmentInfo.name || 'Department ERP'}</div>
                </motion.div>
              )}
            </div>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:grid size-8 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white place-items-center transition cursor-pointer shrink-0 border border-slate-700/50"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          {/* Department Role Badge */}
          {!collapsed && (
            <div className="px-3 pt-3">
              <div className="relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-blue-700/90 text-white shadow-xl ring-1 ring-white/10">
                <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md grid place-items-center shrink-0 border border-white/20">
                    <ShieldCheck className="size-5 text-cyan-300" />
                  </div>
                  <div className="leading-tight truncate">
                    <div className="text-xs font-bold tracking-wide flex items-center gap-1">
                      Department Chair <Sparkles className="size-3 text-amber-300" />
                    </div>
                    <div className="text-[11px] text-blue-100 font-medium truncate">
                      {departmentInfo.shortName} ({departmentInfo.code})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)] mt-2 scrollbar-none">
            {HOD_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? currentPath === item.to
                : currentPath.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-white/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`size-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  {!collapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <motion.span
                      layoutId="activeNavDot"
                      className="ml-auto size-1.5 rounded-full bg-cyan-300 shadow-xs shadow-cyan-300"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/50 transition">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white grid place-items-center font-bold text-xs shadow-md shrink-0 ring-1 ring-white/20">
                {departmentInfo.headName ? departmentInfo.headName.charAt(0) : 'H'}
              </div>
              <div className="truncate text-xs">
                <p className="font-bold text-slate-100 truncate">{departmentInfo.headName || 'HOD Administrator'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{departmentInfo.email || `hod.${departmentInfo.shortName.toLowerCase()}@college.edu`}</p>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center">
              <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white grid place-items-center font-bold text-xs shadow-md ring-1 ring-white/20">
                {departmentInfo.headName ? departmentInfo.headName.charAt(0) : 'H'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
