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
  Shield,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

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

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="h-16 sticky top-0 z-30 glass border-b flex items-center justify-between gap-4 px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-accent text-muted-foreground"
        >
          <Menu className="size-5" />
        </button>

        {/* Department + Academic Year */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Building2 className="size-4" />
          <span>{departmentInfo.shortName} Department</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-bold ml-1"
          >
            <option value="2025-2026">AY 2025-2026</option>
            <option value="2024-2025">AY 2024-2025</option>
          </select>
        </div>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <SearchBar
          value={globalSearch}
          onChange={setGlobalSearch}
          placeholder={`Search ${departmentInfo.shortName} students, faculty, subjects, research...`}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle synced with global theme */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground transition cursor-pointer"
            title="Toggle Dark Mode"
          >
            {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground transition cursor-pointer relative"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-2xl p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                  <h4 className="font-bold text-foreground text-xs">Department Alerts</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">3 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                    <p className="font-semibold text-foreground">Leave Signoff Request</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Prof. Rajesh submitted leave request for 2 days.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                    <p className="font-semibold text-foreground">Attendance Audit Warning</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Sem 5 Section B attendance dropped to 72%.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-accent transition cursor-pointer"
          >
            <AvatarCard
              name={user?.fullName || departmentInfo.headName}
              subtitle={`HOD ${departmentInfo.shortName}`}
              size="sm"
            />
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-14 w-56 bg-background border border-border rounded-xl p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-2 border-b border-border mb-1">
                  <p className="font-semibold text-foreground text-xs truncate">{user?.fullName || departmentInfo.headName}</p>
                  <p className="text-[10px] text-muted-foreground">HOD {departmentInfo.shortName}</p>
                </div>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate({ to: '/hod/settings' }); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-accent text-muted-foreground hover:text-foreground transition text-left"
                >
                  <Settings className="size-3.5" /> Department Settings
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate({ to: '/hod/audit-logs' }); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-accent text-muted-foreground hover:text-foreground transition text-left"
                >
                  <Shield className="size-3.5" /> Audit Logs
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition text-left"
                >
                  <LogOut className="size-3.5" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
