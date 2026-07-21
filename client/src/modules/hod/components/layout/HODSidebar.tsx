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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar — uses same glass/token classes as DashboardLayout */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 glass border-r border-sidebar-border transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Branding header */}
          <div className="p-4 flex items-center gap-2.5 border-b border-sidebar-border h-16">
            <div className="size-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 grid place-items-center text-white shrink-0">
              <Building2 className="size-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-bold text-base tracking-tight">College Management</div>
                <div className="text-[10px] text-muted-foreground">HOD workspace</div>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:grid size-8 rounded-xl hover:bg-sidebar-accent text-muted-foreground hover:text-foreground place-items-center transition cursor-pointer shrink-0 ml-auto"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          {/* Role badge */}
          {!collapsed && (
            <div className="px-3 pt-3">
              <div className="flex items-center gap-2 rounded-xl p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-soft">
                <div className="size-8 rounded-lg bg-white/15 grid place-items-center backdrop-blur">
                  <Building2 className="size-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold">HOD</div>
                  <div className="text-[10px] opacity-80">{departmentInfo.shortName} Department</div>
                </div>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] mt-2">
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
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-soft'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto size-1.5 rounded-full bg-white/80" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white grid place-items-center">
                <GraduationCap className="size-4" />
              </div>
              <div className="truncate text-xs">
                <p className="font-semibold text-foreground truncate">{departmentInfo.headName}</p>
                <p className="text-[10px] text-muted-foreground truncate">HOD {departmentInfo.shortName}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
