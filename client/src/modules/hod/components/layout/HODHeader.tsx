import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHODDepartment } from '../../hooks/useHODDepartment';
import { SearchBar } from '../shared/SearchBar';
import { AvatarCard } from '../shared/AvatarCard';
import {
  Bell,
  Menu,
  Sun,
  Moon,
  LogOut,
  Settings,
  Shield,
  Building2,
  ChevronDown,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';

interface HODHeaderProps {
  onOpenMobileSidebar: () => void;
  dark?: boolean;
  onToggleDark?: () => void;
}

export function HODHeader({ onOpenMobileSidebar, dark = false, onToggleDark }: HODHeaderProps) {
  const { user, logout } = useAuth();
  const { departmentInfo, academicYear, setAcademicYear } = useHODDepartment();
  const navigate = useNavigate();

  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [currentDateString, setCurrentDateString] = useState('');

  useEffect(() => {
    const now = new Date();
    setCurrentDateString(
      now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    );
  }, []);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4 px-6 shadow-xs">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <Menu className="size-5" />
        </button>

        {/* Department Badge + Academic Year Dropdown */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
          <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
          <span className="tracking-wide">{departmentInfo.shortName} Department</span>
          <span className="text-blue-300 dark:text-blue-700">|</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-extrabold text-blue-800 dark:text-blue-200"
          >
            <option value="2025-2026">AY 2025-2026</option>
            <option value="2024-2025">AY 2024-2025</option>
          </select>
        </div>

        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
          <Calendar className="size-3.5 text-slate-400" />
          <span>{currentDateString}</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <SearchBar
          value={globalSearch}
          onChange={setGlobalSearch}
          placeholder={`Search ${departmentInfo.shortName} students, faculty, courses, research...`}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer relative border border-slate-200/60 dark:border-slate-700/60"
            title="Department Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl z-50 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 grid place-items-center text-blue-600 dark:text-blue-400 font-bold">
                        <Bell className="size-3.5" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Department Notifications</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      3 Urgent
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                        <span className="flex items-center gap-1.5">
                          <Info className="size-3.5 text-blue-500" /> Faculty Leave Approval
                        </span>
                        <span className="text-[10px] text-slate-400">10m ago</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        Prof. Rajesh Kumar submitted casual leave request for 2 days.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="size-3.5 text-amber-500" /> Attendance Audit Alert
                        </span>
                        <span className="text-[10px] text-slate-400">1h ago</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        Section 3B attendance dropped below 75% threshold in Midterm cycle.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-xs">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-emerald-500" /> Exam Marks Verification
                        </span>
                        <span className="text-[10px] text-slate-400">3h ago</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        End-Semester lab evaluations ready for HOD final signoff.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button
                      onClick={() => { setShowNotifications(false); navigate({ to: '/hod/notifications' }); }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      View All Department Notifications →
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="size-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs grid place-items-center shadow-xs">
              {user?.fullName ? user.fullName.charAt(0) : departmentInfo.headName ? departmentInfo.headName.charAt(0) : 'H'}
            </div>
            <div className="text-left hidden lg:block leading-tight">
              <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-32">
                {user?.fullName || departmentInfo.headName || 'HOD Chair'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">HOD {departmentInfo.shortName}</p>
            </div>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-14 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 shadow-2xl z-50 text-xs font-semibold"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                      {user?.fullName || departmentInfo.headName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Department Chair ({departmentInfo.shortName})</p>
                  </div>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate({ to: '/hod/settings' }); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <Settings className="size-4 text-blue-500" /> Department Settings
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate({ to: '/hod/audit-logs' }); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <Shield className="size-4 text-indigo-500" /> Audit Logs & Security
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer font-bold"
                  >
                    <LogOut className="size-4 text-rose-500" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
