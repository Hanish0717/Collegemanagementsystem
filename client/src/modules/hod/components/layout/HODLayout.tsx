import React, { useState, ReactNode } from 'react';
import { HODDepartmentProvider } from '../../hooks/useHODDepartment';
import { HODSidebar } from './HODSidebar';
import { HODHeader } from './HODHeader';

interface HODLayoutProps {
  children?: ReactNode;
}

export function HODLayoutInner({ children }: HODLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased">
      {/* Sidebar */}
      <HODSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <HODHeader onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export function HODLayout({ children }: HODLayoutProps) {
  return (
    <HODDepartmentProvider>
      <HODLayoutInner>{children}</HODLayoutInner>
    </HODDepartmentProvider>
  );
}
