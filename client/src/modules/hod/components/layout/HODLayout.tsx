import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className={`${dark ? 'dark' : ''} min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-blue-500 selection:text-white`}>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <HODErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
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
