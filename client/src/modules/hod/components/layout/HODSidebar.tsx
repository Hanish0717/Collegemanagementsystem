import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { HOD_NAV_ITEMS } from '../../constants/hodNavigation';
import { useHODDepartment } from '../../hooks/useHODDepartment';
import { Building2, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

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
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white grid place-items-center font-black shadow-md shrink-0">
                <Building2 className="size-5" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    HOD ERP Portal
                  </h2>
                  <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest truncate">
                    {departmentInfo.shortName} Department
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:grid size-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-500 hover:text-blue-600 dark:text-slate-400 place-items-center transition cursor-pointer shrink-0"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50/70 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`size-4.5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-blue-100 text-blue-700 grid place-items-center font-extrabold text-xs">
                <GraduationCap className="size-4" />
              </div>
              <div className="truncate text-xs">
                <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{departmentInfo.headName}</p>
                <p className="text-[10px] text-slate-400 truncate">HOD {departmentInfo.shortName}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
