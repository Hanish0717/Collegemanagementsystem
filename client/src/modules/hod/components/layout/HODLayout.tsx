import React, { useState, useEffect, ReactNode } from 'react';
import { HODDepartmentProvider } from '../../hooks/useHODDepartment';
import { HODSidebar } from './HODSidebar';
import { HODHeader } from './HODHeader';
import { HODErrorBoundary } from '../shared/HODErrorBoundary';

interface HODLayoutProps {
  children?: ReactNode;
}

export function HODLayoutInner({ children }: HODLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        document.documentElement.classList.contains('dark')
      );
    }
    return false;
  });

  useEffect(() => {
    const syncTheme = () => {
      setDark(document.documentElement.classList.contains('dark'));
    };
    const interval = setInterval(syncTheme, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${dark ? 'dark' : ''} min-h-screen bg-gradient-soft text-foreground flex font-sans antialiased`}>
      <HODSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <HODHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          dark={dark}
          onToggleDark={() => {
            const newDark = !dark;
            setDark(newDark);
            if (newDark) {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            }
          }}
        />
        <main className="flex-1 p-6">
          <HODErrorBoundary>
            {children}
          </HODErrorBoundary>
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
