import { Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  GraduationCap,
  LogOut,
  Search,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  Plus,
  Bell,
  User,
  Settings,
  HelpCircle,
  History,
  BookOpen,
  FileText,
  UserPlus,
  BellRing,
  Info,
  Check,
  Trash2,
} from "lucide-react";
import { getActiveRole, type Role } from "@/lib/roles";
import { useAuth } from "@/contexts/AuthContext";
import { students, faculty, books, libraryNotifications } from "@/mock/mockData";
import { toast } from "sonner";
import { Badge } from "@/components/dashboard/ui";

interface SearchSuggestion {
  type: string;
  label: string;
  subtitle?: string;
  category?: string;
  dept?: string;
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme State
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const [role, setRole] = useState<Role>(() => getActiveRole());
  const path = useRouterState({ select: (r) => r.location.pathname });
  const displayName = user?.fullName ?? "Anjali Sharma";

  // Popover States
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showNewActions, setShowNewActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [localNotifications, setLocalNotifications] = useState(libraryNotifications);

  // Quick Action Modal States
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  // Quick Action Form Fields
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCategory, setBookCategory] = useState("Computer Science");

  const [issueStudent, setIssueStudent] = useState("");
  const [issueBook, setIssueBook] = useState("");

  const [memberName, setMemberName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceCategory, setResourceCategory] = useState("Computer Science");
  const [resourceFormat, setResourceFormat] = useState("PDF");

  const [notifSubject, setNotifSubject] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  useEffect(() => {
    setRole(getActiveRole());
  }, []);

  // Theme effect
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      const results: SearchSuggestion[] = [];

      // 1. Search books
      books.forEach((b) => {
        if (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) {
          results.push({
            type: "Book",
            label: b.title,
            subtitle: `by ${b.author}`,
            category: b.category,
          });
        }
      });

      // 2. Search students
      students.forEach((s) => {
        if (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) {
          results.push({ type: "Student", label: s.name, subtitle: `ID: ${s.id}`, dept: s.dept });
        }
      });

      // 3. Search faculty
      faculty.forEach((f) => {
        if (f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)) {
          results.push({ type: "Faculty", label: f.name, subtitle: `Dept: ${f.dept}` });
        }
      });

      // 4. Search departments
      const depts = [
        "Computer Science",
        "Information Technology",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Electrical Engineering",
        "Civil Engineering",
        "Business Administration",
      ];
      depts.forEach((d) => {
        if (d.toLowerCase().includes(q)) {
          results.push({ type: "Department", label: d, subtitle: "Academic Department" });
        }
      });

      setSuggestions(results.slice(0, 7));
      setIsSearching(false);
      setActiveIndex(-1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Key navigation for search suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    toast.info(`Search result: Selected ${item.type} "${item.label}"`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success("Successfully logged out from system.");
    navigate({ to: "/login" });
  };

  const handleNotificationClick = () => {
    const notifRoute = role.nav.find((item) => item.label === "Notifications")?.to ?? "/dashboard/notifications";
    navigate({ to: notifRoute });
  };

  const handleProfileClick = () => {
    const settingsRoute = role.nav.find((item) => item.label === "Settings")?.to ?? "/dashboard/settings";
    navigate({ to: settingsRoute });
  };

  // Quick Action submits
  const handleQuickAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim()) {
      toast.error("Please fill in Book Title and Author.");
      return;
    }
    toast.success(`"${bookTitle}" successfully cataloged via Quick Actions!`);
    setBookTitle("");
    setBookAuthor("");
    setActiveQuickAction(null);
  };

  const handleQuickIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueStudent.trim() || !issueBook.trim()) {
      toast.error("Please select a student and book resource.");
      return;
    }
    toast.success(`Successfully allocated "${issueBook}" to student "${issueStudent}"!`);
    setIssueStudent("");
    setIssueBook("");
    setActiveQuickAction(null);
  };

  const handleQuickAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberId.trim() || !memberEmail.trim()) {
      toast.error("Please complete the required member registration details.");
      return;
    }
    toast.success(`Registered new member "${memberName}" with ID "${memberId}"!`);
    setMemberName("");
    setMemberId("");
    setMemberEmail("");
    setActiveQuickAction(null);
  };

  const handleQuickAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) {
      toast.error("Please specify a resource title.");
      return;
    }
    toast.success(`Digital file "${resourceTitle}" added to e-books register!`);
    setResourceTitle("");
    setActiveQuickAction(null);
  };

  const handleQuickSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifSubject.trim() || !notifMessage.trim()) {
      toast.error("Subject and message content are required.");
      return;
    }

    const newNotif = {
      id: `LN-${String(localNotifications.length + 1).padStart(3, "0")}`,
      title: notifSubject,
      time: "Just now",
      type: "SystemNotification",
      unread: true,
      urgency: "medium",
    };

    setLocalNotifications([newNotif, ...localNotifications]);
    toast.success("Broadcast dispatched successfully!");
    setNotifSubject("");
    setNotifMessage("");
    setActiveQuickAction(null);
  };

  const unreadCount = localNotifications.filter((n) => n.unread).length;

  const markAllNotificationsRead = () => {
    setLocalNotifications(localNotifications.map((n) => ({ ...n, unread: false })));
    toast.success("All alerts marked as read.");
  };

  const markSingleRead = (id: string) => {
    setLocalNotifications(
      localNotifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const RoleIcon = role.icon;

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="p-4 flex items-center gap-2.5 border-b border-sidebar-border h-16">
        <div
          className={`size-9 rounded-xl bg-gradient-to-br ${role.gradient} grid place-items-center text-white shrink-0`}
        >
          <GraduationCap className="size-5" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="leading-tight">
            <div className="font-bold text-base tracking-tight">College Management</div>
            <div className="text-[10px] text-muted-foreground">{role.name} workspace</div>
          </div>
        )}
      </div>

      {(!collapsed || isMobile) && (
        <div className="px-3 pt-3">
          <div
            className={`flex items-center gap-2 rounded-xl p-2.5 bg-gradient-to-br ${role.gradient} text-white shadow-soft`}
          >
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
        {role.nav.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              onClick={() => {
                if (isMobile) setMobileOpen(false);
              }}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? `bg-gradient-to-r ${role.gradient} text-white shadow-soft`
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
            >
              <item.icon className="size-4 shrink-0" />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {active && (!collapsed || isMobile) && (
                <span className="ml-auto size-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            if (isMobile) setMobileOpen(false);
            setShowLogoutConfirm(true);
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:text-rose-600 transition cursor-pointer"
        >
          <LogOut className="size-4" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-gradient-soft text-foreground`}>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`${collapsed ? "w-20" : "w-64"
            } transition-all duration-300 hidden md:flex flex-col glass border-r border-sidebar-border sticky top-0 h-screen`}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="w-64 bg-background border-r border-sidebar-border flex flex-col h-full relative z-10 animate-in slide-in-from-left duration-250">
              <SidebarContent isMobile={true} />
            </aside>
          </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 glass border-b flex items-center gap-4 px-6 justify-between">
            {/* Hamburger Button */}
            <button
              onClick={() => {
                setCollapsed(!collapsed);
                setMobileOpen(!mobileOpen);
              }}
              className="p-2 rounded-lg hover:bg-accent cursor-pointer transition flex items-center justify-center shrink-0"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="size-4" />
            </button>

            {/* Global Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search students, faculty, departments, books…"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-10 py-2 text-sm focus:outline-none focus:border-primary transition"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-background border rounded-xl shadow-lg z-50 p-2 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  {suggestions.length === 0 && !isSearching && (
                    <div className="py-6 px-4 text-center text-xs text-muted-foreground">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition flex justify-between items-center ${idx === activeIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-gradient-soft"
                        }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <Badge
                        tone={
                          item.type === "Book"
                            ? "info"
                            : item.type === "Student"
                              ? "success"
                              : "warn"
                        }
                      >
                        {item.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Role Info */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleInfo(!showRoleInfo)}
                  className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-gradient-to-r ${role.gradient} cursor-pointer hover:opacity-90 transition`}
                >
                  <RoleIcon className="size-3" /> {role.name}
                </button>
                {showRoleInfo && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRoleInfo(false)} />
                    <div className="absolute right-0 lg:left-0 lg:right-auto top-full mt-2 w-64 bg-background border rounded-xl shadow-lg z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                      <div className="font-semibold text-sm">Role Scope: {role.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{role.description}</div>
                      <div className="border-t pt-2 mt-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Navigation Items</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.nav.map(n => (
                            <Badge key={n.to} tone="info" className="text-[9px] py-0.5 px-1.5">{n.label}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Plus/New Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNewActions(!showNewActions)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                >
                  <Plus className="size-4" /> New
                </button>
                {showNewActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNewActions(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                      <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase">Quick Actions</div>
                      <button
                        onClick={() => {
                          setActiveQuickAction("addBook");
                          setShowNewActions(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                      >
                        <BookOpen className="size-3.5 text-violet-500" />
                        <span>Quick Add Book</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveQuickAction("issueBook");
                          setShowNewActions(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                      >
                        <History className="size-3.5 text-indigo-500" />
                        <span>Issue Book Resource</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveQuickAction("addMember");
                          setShowNewActions(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                      >
                        <UserPlus className="size-3.5 text-emerald-500" />
                        <span>Register Member</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveQuickAction("addDigital");
                          setShowNewActions(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                      >
                        <FileText className="size-3.5 text-amber-500" />
                        <span>Upload Digital Resource</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveQuickAction("sendNotif");
                          setShowNewActions(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                      >
                        <BellRing className="size-3.5 text-rose-500" />
                        <span>Broadcast Alert</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg hover:bg-accent cursor-pointer transition"
                aria-label="Toggle Theme"
              >
                {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-accent cursor-pointer transition"
                  aria-label="View notifications"
                >
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gradient-primary animate-pulse" />
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-xl shadow-lg z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150 text-left font-normal">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="font-semibold text-xs">Alerts & Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllNotificationsRead();
                              setShowNotifications(false);
                            }}
                            className="text-[10px] text-indigo-600 hover:underline cursor-pointer font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {localNotifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground">No new notifications</div>
                        ) : (
                          localNotifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markSingleRead(notif.id);
                              }}
                              className={`p-2 rounded-lg border text-xs cursor-pointer transition relative group ${notif.unread ? "bg-indigo-50/40 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40 font-medium" : "hover:bg-accent/40"}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="pr-4">{notif.title}</span>
                                <span className="text-[9px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                              </div>
                              {notif.unread && (
                                <span className="absolute top-2 right-2 size-1.5 rounded-full bg-indigo-500" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-accent cursor-pointer transition"
                >
                  <div className={`size-7 rounded-lg bg-gradient-to-br ${role.gradient}`} />
                  <div className="hidden md:block text-left leading-tight">
                    <div className="text-xs font-semibold">{displayName}</div>
                    <div className="text-[10px] text-muted-foreground">{role.name}</div>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-left font-normal">
                      <div className="px-2.5 py-2 border-b">
                        <div className="font-semibold text-xs text-foreground truncate">{displayName}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{role.name}</div>
                      </div>
                      <Link
                        to={role.nav.find(item => item.label.toLowerCase() === "settings")?.to || "/dashboard/settings"}
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition mt-1"
                      >
                        <Settings className="size-3.5" />
                        <span>Account Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          toast.info("Accessing help documentation...");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer text-left transition"
                      >
                        <HelpCircle className="size-3.5" />
                        <span>Help & Documentation</span>
                      </button>
                      <div className="border-t my-1" />
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 cursor-pointer text-left transition"
                      >
                        <LogOut className="size-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
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

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <LogOut className="size-5 text-rose-600" /> System Sign Out
            </h3>
            <p className="text-sm text-muted-foreground mt-3">
              Are you sure you want to end your active workspace session? Unsaved form progress will
              be cleared.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-gradient-soft transition cursor-pointer text-xs"
              >
                Go Back
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition cursor-pointer text-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Modals (Forms inside Layout) */}
      {activeQuickAction === "addBook" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base text-gradient flex items-center gap-2">
                <BookOpen className="size-5 text-violet-600" /> Quick Add Book
              </h3>
              <button
                onClick={() => setActiveQuickAction(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intro to Algorithms"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas H. Cormen"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Shelf Category
                </label>
                <select
                  value={bookCategory}
                  onChange={(e) => setBookCategory(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Business">Business</option>
                  <option value="General Knowledge">General Knowledge</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Catalog Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeQuickAction === "issueBook" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base text-gradient flex items-center gap-2">
                <History className="size-5 text-violet-600" /> Quick Allocate Book Issue
              </h3>
              <button
                onClick={() => setActiveQuickAction(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickIssueBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Student *
                </label>
                <select
                  value={issueStudent}
                  onChange={(e) => setIssueStudent(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                >
                  <option value="">Choose student record...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Book Resource *
                </label>
                <select
                  value={issueBook}
                  onChange={(e) => setIssueBook(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                >
                  <option value="">Choose book resource...</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.title}>
                      {b.title} {b.available === 0 ? "(Unavailable)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeQuickAction === "addMember" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base text-gradient flex items-center gap-2">
                <UserPlus className="size-5 text-violet-600" /> Register Member
              </h3>
              <button
                onClick={() => setActiveQuickAction(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddMember} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Student ID / Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU129"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@college.edu"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeQuickAction === "addDigital" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base text-gradient flex items-center gap-2">
                <FileText className="size-5 text-violet-600" /> Upload Digital Resource
              </h3>
              <button
                onClick={() => setActiveQuickAction(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddResource} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handbook of Physics"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Library Domain
                </label>
                <select
                  value={resourceCategory}
                  onChange={(e) => setResourceCategory(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Business">Business</option>
                  <option value="Science">Science</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">File Format</label>
                <select
                  value={resourceFormat}
                  onChange={(e) => setResourceFormat(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="EPUB">EPUB Book</option>
                  <option value="MOBI">MOBI Resource</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeQuickAction === "sendNotif" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base text-gradient flex items-center gap-2">
                <BellRing className="size-5 text-violet-600" /> Broadcast Alert
              </h3>
              <button
                onClick={() => setActiveQuickAction(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickSendNotification} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Subject Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Severe weather notice / Maintenance"
                  value={notifSubject}
                  onChange={(e) => setNotifSubject(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Message Body *
                </label>
                <textarea
                  required
                  placeholder="Type dispatch content here..."
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveQuickAction(null)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Dispatch BroadCast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          <span className={i === parts.length - 1 ? "text-foreground font-medium" : ""}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </span>
        </span>
      ))}
    </nav>
  );
}
