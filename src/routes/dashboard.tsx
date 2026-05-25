import { Outlet, Link, createFileRoute, useRouterState, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GraduationCap, LogOut, Search, Menu, Sun, Moon, ChevronDown, Plus, Bell,
} from "lucide-react";
import { getActiveRole, type Role } from "@/lib/roles";
import { isAuthenticated, getStoredUser } from "@/services/authService";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [role, setRole] = useState<Role>(() => getActiveRole());
  const path = useRouterState({ select: r => r.location.pathname });
  const displayName = user?.fullName ?? "User";

  useEffect(() => { setRole(getActiveRole()); }, []);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const RoleIcon = role.icon;

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-gradient-soft`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`${collapsed ? "w-20" : "w-64"} transition-all duration-300 hidden md:flex flex-col glass border-r border-sidebar-border sticky top-0 h-screen`}>
          <div className="p-4 flex items-center gap-2.5 border-b border-sidebar-border h-16">
            <div className={`size-9 rounded-xl bg-gradient-to-br ${role.gradient} grid place-items-center text-white shrink-0`}>
              <GraduationCap className="size-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-bold text-base tracking-tight">College Management System</div>
                <div className="text-[10px] text-muted-foreground">{role.name} workspace</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="px-3 pt-3">
              <div className={`flex items-center gap-2 rounded-xl p-2.5 bg-gradient-to-br ${role.gradient} text-white shadow-soft`}>
                <div className="size-8 rounded-lg bg-white/15 grid place-items-center backdrop-blur">
                  <RoleIcon className="size-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold">{role.name}</div>
                  <div className="text-[10px] opacity-80">{role.short}</div>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {role.nav.map(item => {
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              return (
                <Link
                  key={item.to + item.label} to={item.to}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? `bg-gradient-to-r ${role.gradient} text-white shadow-soft`
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"}`}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {active && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-white/80" />}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-sidebar-border">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
              <LogOut className="size-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 glass border-b flex items-center gap-4 px-6">
            <button onClick={() => setCollapsed(!collapsed)} className="md:flex hidden p-2 rounded-lg hover:bg-accent">
              <Menu className="size-4" />
            </button>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search students, faculty, departments…"
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-gradient-to-r ${role.gradient}`}>
                <RoleIcon className="size-3" /> {role.name}
              </span>
              <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium glow-primary">
                <Plus className="size-4" /> New
              </button>
              <button onClick={()=>setDark(!dark)} className="p-2 rounded-lg hover:bg-accent">
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button className="relative p-2 rounded-lg hover:bg-accent">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gradient-primary" />
              </button>
              <button className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-accent">
                <div className={`size-7 rounded-lg bg-gradient-to-br ${role.gradient}`} />
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-semibold">{displayName}</div>
                  <div className="text-[10px] text-muted-foreground">{role.name}</div>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </header>

          <div className="px-6 pt-4">
            <Breadcrumb path={path} />
          </div>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ path }: { path: string }) {
  const parts = path.split("/").filter(Boolean);
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          <span className={i === parts.length - 1 ? "text-foreground font-medium" : ""}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
        </span>
      ))}
    </nav>
  );
}
