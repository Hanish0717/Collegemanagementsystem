import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { HOD_NAV_ITEMS } from '../../constants/hodNavigation';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { ChevronLeft, ChevronRight, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';
import { EduSuiteLogoGraphic } from "@/components/ui/EduSuiteLogo";

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
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[#08132D] text-slate-100 border-r border-[#132549] shadow-2xl transition-all duration-300 flex flex-col justify-between select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Header Branding */}
          <div className="p-4 flex items-center justify-between border-b border-[#132549] h-16">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <EduSuiteLogoGraphic className="size-8" />
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="leading-tight truncate"
                >
                  <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                    <span>EduSuite</span>
                    <span className="text-[#0A5BFF]">Pro</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">{departmentInfo.name || 'Department ERP'}</div>
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
                      ? 'bg-[#0A5BFF] text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#122345]'
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
        <div className="p-3 border-t border-[#132549] bg-[#122345]/30">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/50 transition">
              <div className="relative shrink-0">
                <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white grid place-items-center font-bold text-xs shadow-md ring-1 ring-white/20">
                  {departmentInfo.headName ? departmentInfo.headName.charAt(0) : 'H'}
                </div>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-[#08132D]" />
              </div>
              <div className="truncate text-xs text-left">
                <p className="font-bold text-slate-100 truncate">{departmentInfo.headName || 'HOD Administrator'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">Online</p>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center">
              <div className="relative">
                <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white grid place-items-center font-bold text-xs shadow-md ring-1 ring-white/20">
                  {departmentInfo.headName ? departmentInfo.headName.charAt(0) : 'H'}
                </div>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-[#08132D]" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
