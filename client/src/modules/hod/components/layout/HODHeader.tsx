import React, { useState } from 'react';
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
  User,
  Shield,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface HODHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function HODHeader({ onOpenMobileSidebar }: HODHeaderProps) {
  const { user, logout } = useAuth();
  const { departmentInfo, academicYear, setAcademicYear } = useHODDepartment();
  const navigate = useNavigate();

  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Menu className="size-5" />
        </button>

        {/* Academic Year Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-extrabold text-blue-700 dark:text-blue-300">
          <Building2 className="size-4" />
          <span>{departmentInfo.shortName} Department</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-transparent text-blue-800 dark:text-blue-200 focus:outline-none cursor-pointer font-bold ml-1"
          >
            <option value="2025-2026">AY 2025-2026</option>
            <option value="2024-2025">AY 2024-2025</option>
          </select>
        </div>
      </div>

      {/* Middle Global Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <SearchBar
          value={globalSearch}
          onChange={setGlobalSearch}
          placeholder={`Search ${departmentInfo.shortName} students, faculty, subjects, research...`}
        />
      </div>

      {/* Right User Cockpit */}
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="size-4.5 text-amber-400" /> : <Moon className="size-4.5 text-slate-600" />}
        </button>

        {/* Bell Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer relative"
          >
            <Bell className="size-4.5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Department Alerts</h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">3 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                  <p className="font-bold text-slate-900 dark:text-white">Leave Signoff Request</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Prof. Rajesh submitted leave request for 2 days.</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                  <p className="font-bold text-slate-900 dark:text-white">Attendance Audit Warning</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sem 5 Section B attendance dropped to 72%.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <AvatarCard
              name={user?.fullName || departmentInfo.headName}
              subtitle={`HOD ${departmentInfo.shortName}`}
              size="sm"
            />
            <ChevronDown className="size-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-14 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                <p className="font-black text-slate-900 dark:text-white text-xs">{user?.fullName || departmentInfo.headName}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">Head of Department (HOD)</p>
                <p className="text-[10px] text-slate-400 font-medium">{departmentInfo.name}</p>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => navigate({ to: '/hod/settings' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                >
                  <Settings className="size-4 text-blue-500" /> Department Settings
                </button>
                <button
                  onClick={() => navigate({ to: '/hod/audit-logs' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition text-left"
                >
                  <Shield className="size-4 text-purple-500" /> Audit Logs
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left font-bold"
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
