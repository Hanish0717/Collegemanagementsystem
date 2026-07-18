import { Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
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
  Sparkles,
  Check,
  Trash2,
  AlertTriangle,
  DollarSign,
  Send,
  Calendar,
  Users,
} from "lucide-react";
import { getActiveRole, type Role, ROLE_LIST, setActiveRole, type RoleId } from "@/lib/roles";
import { getDashboardForRole, toBackendRole } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/dashboard/ui";
import { StudentFormModal } from "@/pages/dashboard/students/StudentDialogs";
import {
  createResident,
  registerVisitor,
  createComplaint,
  createNotification,
  fetchResidents,
} from "@/services/hostelService";
import api from "@/lib/api";
import { loginAsDemoRole } from "@/services/authService";

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
  const currentSearch = useRouterState({ select: (r) => r.location.searchStr });
  const displayName = user?.fullName ?? "Anjali Sharma";

  // Popover States
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showNewActions, setShowNewActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpActiveTab, setHelpActiveTab] = useState<"getting-started" | "role-guide" | "faqs" | "support">("getting-started");
  // Sidebar submenu open state — keyed by item.label for uniqueness
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`cms.submenus.${getActiveRole().id}`);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  // Persist submenu state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`cms.submenus.${role.id}`, JSON.stringify(openSubmenus));
    } catch {}
  }, [openSubmenus, role.id]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);

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

  // ── Hostel Warden Quick Action Form Fields ──
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vRelation, setVRelation] = useState("Parent");
  const [vPurpose, setVPurpose] = useState("Family Visit");
  const [vStudentId, setVStudentId] = useState("");
  const [vIdType, setVIdType] = useState("Aadhaar Card");
  const [vIdNumber, setVIdNumber] = useState("");

  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cCat, setCCat] = useState("Maintenance");
  const [cPriority, setCPriority] = useState("Medium");
  const [cStudentId, setCStudentId] = useState("");

  const [annTitle, setAnnTitle] = useState("");
  const [annType, setAnnType] = useState("Mess");
  const [annUrgency, setAnnUrgency] = useState("Medium");

  const queryClient = useQueryClient();
  const isWarden = role?.name === "Hostel Warden";

  // Queries for lookups
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;
      return data || [];
    },
    enabled: isWarden,
  });

  const { data: residents = [] } = useQuery({
    queryKey: ["residents-lookup"],
    queryFn: () => fetchResidents(),
    enabled: isWarden,
  });

  const isLibrarian = role?.id === "librarian";

  const { data: students = [] } = useQuery({
    queryKey: ["students-lookup"],
    queryFn: async () => {
      const res = await api.get("/api/students?limit=1000");
      const list = res.data?.data?.students || [];
      return list.map((s: any) => ({
        id: s._id || s.id,
        name: s.fullName || s.name
      }));
    },
    enabled: isLibrarian,
  });

  const { data: books = [] } = useQuery({
    queryKey: ["books-lookup"],
    queryFn: async () => {
      const res = await api.get("/api/library/books?limit=1000");
      const list = res.data?.data?.books || [];
      return list.map((b: any) => ({
        id: b._id || b.id,
        title: b.title,
        available: b.availableCopies !== undefined ? b.availableCopies : b.available
      }));
    },
    enabled: isLibrarian,
  });

  // Mutations
  const allocateRoomMutation = useMutation({
    mutationFn: ({ student, allocation }: { student: any; allocation: any }) =>
      createResident(student, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      toast.success("Resident added and room allocated successfully!");
      setActiveQuickAction(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to allocate room");
    }
  });

  const registerVisitorMutation = useMutation({
    mutationFn: (payload: any) => registerVisitor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Visitor checked-in successfully!");
      setActiveQuickAction(null);
      setVName("");
      setVPhone("");
      setVStudentId("");
      setVIdNumber("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register visitor");
    }
  });

  const logComplaintMutation = useMutation({
    mutationFn: (payload: any) => createComplaint(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      toast.success("Complaint logged successfully!");
      setActiveQuickAction(null);
      setCTitle("");
      setCDesc("");
      setCStudentId("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to log complaint");
    }
  });

  const sendWardenNotifMutation = useMutation({
    mutationFn: ({ title, type, urgency }: { title: string; type: string; urgency: string }) =>
      createNotification(title, type, urgency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchNotifs();
      toast.success("Announcement broadcasted successfully!");
      setActiveQuickAction(null);
      setAnnTitle("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to broadcast announcement");
    }
  });

  const handleAllocateSubmit = (payload: any) => {
    const studentData = {
      fullName: payload.fullName,
      rollNumber: payload.rollNumber,
      admissionNumber: payload.admissionNumber,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      department: payload.department,
      year: payload.year,
      semester: payload.semester,
      section: payload.section,
      parentName: payload.parentName,
      parentPhone: payload.parentPhone,
      parentEmail: payload.parentEmail,
      attendancePercentage: payload.attendancePercentage,
      cgpa: payload.cgpa,
      profileImage: payload.profileImage,
    };

    const allocationData = {
      hostelId: payload.hostelId,
      blockId: payload.blockId,
      roomId: payload.roomId,
      bedNumber: payload.bedNumber,
      academicYear: payload.academicYear,
      status: payload.status,
    };

    allocateRoomMutation.mutate({ student: studentData, allocation: allocationData });
  };

  const handleQuickVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vPhone.trim()) {
      toast.error("Please enter visitor name and phone");
      return;
    }

    const resi = residents.find(r => r.studentId === vStudentId);
    const payload = {
      visitor_name: vName,
      visitor_phone: vPhone,
      relationship: vRelation,
      purpose: vPurpose,
      student_id: vStudentId || null,
      room_id: resi?.roomId || null,
      hostel_id: resi?.hostelId || null,
      id_type: vIdType,
      id_number: vIdNumber || null,
      check_in_time: new Date(),
      status: "In",
    };

    registerVisitorMutation.mutate(payload);
  };

  const handleQuickComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim() || !cDesc.trim()) {
      toast.error("Please enter title and description");
      return;
    }

    const resi = residents.find(r => r.studentId === cStudentId);
    const payload = {
      student_id: cStudentId || null,
      room_id: resi?.roomId || null,
      hostel_id: resi?.hostelId || null,
      title: cTitle,
      description: cDesc,
      category: cCat,
      priority: cPriority,
      status: "Pending",
    };

    logComplaintMutation.mutate(payload);
  };

  const handleQuickAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      toast.error("Please enter announcement headline");
      return;
    }

    sendWardenNotifMutation.mutate({
      title: annTitle,
      type: annType,
      urgency: annUrgency,
    });
  };

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

  // ── Database System Notifications & Realtime ──
  const { data: dbNotifications = [], refetch: refetchNotifs } = useQuery({
    queryKey: ["system-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("system_notifications_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_notifications" },
        (payload) => {
          refetchNotifs();
          if (payload.eventType === "INSERT") {
            toast.info(`Notification: ${payload.new.title}`, {
              action: {
                label: "View",
                onClick: () => navigate({ to: "/dashboard/hostel/notifications" }),
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchNotifs, navigate]);

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      const results: SearchSuggestion[] = [];
      const isWarden = role?.name === "Hostel Warden";

      if (isWarden) {
        try {
          // 1. Search Students
          const { data: dbStudents } = await supabase
            .from("students")
            .select("full_name, roll_number, department")
            .or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%`)
            .limit(3);

          (dbStudents || []).forEach(s => {
            results.push({
              type: "Student",
              label: s.full_name,
              subtitle: `Roll No: ${s.roll_number} • Dept: ${s.department}`,
              dept: s.department
            });
          });

          // 2. Search Rooms
          const { data: dbRooms } = await supabase
            .from("hostel_rooms")
            .select("room_number, floor, type")
            .ilike("room_number", `%${q}%`)
            .limit(3);

          (dbRooms || []).forEach(r => {
            results.push({
              type: "Room",
              label: `Room ${r.room_number}`,
              subtitle: `Floor ${r.floor} • ${r.type}`,
              category: r.type
            });
          });

          // 3. Search Fees
          const { data: dbFees } = await supabase
            .from("hostel_fees")
            .select("id, status, total_amount, students(full_name)")
            .or(`status.ilike.%${q}%,students.full_name.ilike.%${q}%`)
            .limit(3);

          (dbFees || []).forEach(f => {
            const studentName = (f.students as any)?.full_name || "Unknown";
            results.push({
              type: "Fee",
              label: `Fee for ${studentName}`,
              subtitle: `Amount: ₹${f.total_amount} • Status: ${f.status}`,
              category: f.status
            });
          });

          // 4. Search System Notifications
          const { data: dbNotifs } = await supabase
            .from("system_notifications")
            .select("title, type")
            .or(`title.ilike.%${q}%,type.ilike.%${q}%`)
            .limit(3);

          (dbNotifs || []).forEach(n => {
            results.push({
              type: "Notification",
              label: n.title,
              subtitle: `Category: ${n.type}`,
              category: n.type
            });
          });

          setSuggestions(results.slice(0, 7));
        } catch (err) {
          console.error("Global search error:", err);
        } finally {
          setIsSearching(false);
          setActiveIndex(-1);
        }
      } else {
        try {
          const { data: dbStudents } = await supabase
            .from("students")
            .select("full_name, roll_number, department")
            .or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%`)
            .limit(3);

          (dbStudents || []).forEach(s => {
            results.push({
              type: "Student",
              label: s.full_name,
              subtitle: `Roll No: ${s.roll_number} • Dept: ${s.department}`,
              dept: s.department
            });
          });

          const { data: dbFaculty } = await supabase
            .from("faculty")
            .select("full_name, department")
            .or(`full_name.ilike.%${q}%`)
            .limit(3);

          (dbFaculty || []).forEach(f => {
            results.push({
              type: "Faculty",
              label: f.full_name,
              subtitle: `Dept: ${f.department}`
            });
          });

          const { data: dbBooks } = await supabase
            .from("books")
            .select("title, author, category")
            .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
            .limit(3);

          (dbBooks || []).forEach(b => {
            results.push({
              type: "Book",
              label: b.title,
              subtitle: `by ${b.author}`,
              category: b.category
            });
          });

          setSuggestions(results.slice(0, 7));
        } catch (err) {
          console.error("Global search query error:", err);
        } finally {
          setIsSearching(false);
          setActiveIndex(-1);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, role?.name]);

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
    const settingsRoute = role.nav.find((item) => item.label.toLowerCase() === "settings")?.to ?? "/dashboard/settings";
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

  const notificationsToShow = useMemo(() => {
    const isWarden = role?.name === "Hostel Warden";
    if (isWarden) {
      return dbNotifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        time: n.time || "Just now",
        type: n.type,
        unread: n.unread,
      }));
    }
    return localNotifications;
  }, [role?.name, dbNotifications, localNotifications]);

  const unreadCount = useMemo(() => {
    const isWarden = role?.name === "Hostel Warden";
    if (isWarden) {
      return dbNotifications.filter((n: any) => n.unread).length;
    }
    return localNotifications.filter((n) => n.unread).length;
  }, [role?.name, dbNotifications, localNotifications]);

  const markAllNotificationsRead = async () => {
    const isWarden = role?.name === "Hostel Warden";
    if (isWarden) {
      try {
        await supabase.from("system_notifications").update({ unread: false }).eq("unread", true);
        refetchNotifs();
        toast.success("All alerts marked as read.");
      } catch (e) {}
    } else {
      setLocalNotifications(localNotifications.map((n) => ({ ...n, unread: false })));
      toast.success("All alerts marked as read.");
    }
  };

  const markSingleRead = async (id: string) => {
    const isWarden = role?.name === "Hostel Warden";
    if (isWarden) {
      try {
        await supabase.from("system_notifications").update({ unread: false }).eq("id", id);
        refetchNotifs();
      } catch (e) {}
    } else {
      setLocalNotifications(
        localNotifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      );
    }
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
          const isNotifItem = item.to.includes("notifications");
          const hasUnread = isNotifItem && unreadCount > 0;

          // If item has children, render collapsible group
          if (item.children && (!collapsed || isMobile)) {
            // Use label as unique key (to can be identical across groups)
            const submenuKey = item.label;
            const anyChildActive = item.children.some(child => {
              const childUrl = new URL(child.to, window.location.origin);
              if (childUrl.search.length > 0) {
                const cp = new URLSearchParams(currentSearch);
                return path === childUrl.pathname &&
                  [...childUrl.searchParams.entries()].every(([k, v]) => cp.get(k) === v);
              }
              return path === child.to;
            });
            const isOpen = openSubmenus[submenuKey] !== undefined
              ? openSubmenus[submenuKey]
              : anyChildActive;
            return (
              <div key={item.to}>
                <div className="flex items-center gap-2">
                  <Link
                    key={item.to + item.label}
                    to={item.to}
                    onClick={() => { if (isMobile) setMobileOpen(false); }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? `bg-gradient-to-r ${role.gradient} text-white shadow-soft`
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      }`}
                  >
                    <span className="relative shrink-0">
                      <item.icon className="size-4" />
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 flex size-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                        </span>
                      )}
                    </span>
                    {(!collapsed || isMobile) && <span>{item.label}</span>}
                    {active && (!collapsed || isMobile) && (
                      <span className="ml-auto size-1.5 rounded-full bg-white/80" />
                    )}
                    {hasUnread && collapsed && !isMobile && (
                      <span className="absolute top-1 right-1 size-2 rounded-full bg-emerald-500" />
                    )}
                  </Link>

                  {(!collapsed || isMobile) && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenSubmenus(prev => ({ ...prev, [submenuKey]: !prev[submenuKey] })); }}
                      aria-label={`Toggle ${item.label}`}
                      className="p-2 rounded-full hover:bg-accent transition"
                    >
                      <ChevronDown className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((sub) => {
                      const subUrl = new URL(sub.to, window.location.origin);
                      const subHasQuery = subUrl.search.length > 0;
                      let subActive = false;
                      if (subHasQuery) {
                        // Match pathname + search param
                        const currentParams = new URLSearchParams(currentSearch);
                        const subParams = subUrl.searchParams;
                        subActive = path === subUrl.pathname &&
                          [...subParams.entries()].every(([k, v]) => currentParams.get(k) === v);
                      } else {
                        // Exact match for clean path routes
                        subActive = path === sub.to;
                      }
                      const handleSubClick = (e: React.MouseEvent) => {
                        if (isMobile) setMobileOpen(false);
                      };
                      return (
                        <Link
                          key={sub.to}
                          to={subHasQuery ? sub.to.split("?")[0] : sub.to}
                          search={subHasQuery ? Object.fromEntries(new URL(sub.to, window.location.origin).searchParams) : undefined}
                          onClick={handleSubClick}
                          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition cursor-pointer ${
                            subActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                          }`}
                        >
                          <span className="size-3.5">{sub.icon ? <sub.icon className="size-3" /> : null}</span>
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                )}
              </div>
            );
          }

          // Render main link (no children)
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              onClick={() => { if (isMobile) setMobileOpen(false); }}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? `bg-gradient-to-r ${role.gradient} text-white shadow-soft`
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
            >
              <span className="relative shrink-0">
                <item.icon className="size-4" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                  </span>
                )}
              </span>
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {active && (!collapsed || isMobile) && (
                <span className="ml-auto size-1.5 rounded-full bg-white/80" />
              )}
              {hasUnread && collapsed && !isMobile && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-emerald-500" />
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
              {/* Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleInfo(!showRoleInfo)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${role.gradient} cursor-pointer hover:opacity-95 shadow-soft transition`}
                >
                  <RoleIcon className="size-3.5" />
                  <span>{role.name}</span>
                  <ChevronDown className="size-3 opacity-80" />
                </button>
                {showRoleInfo && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRoleInfo(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-background border rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150 text-left max-h-96 overflow-y-auto">
                      <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                        Switch ERP Workspace
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {ROLE_LIST.filter(r => r.id !== 'alumni').map((r) => {
                          const IconComp = r.icon;
                          const active = r.id === role.id;
                          return (
                            <button
                              key={r.id}
                              onClick={() => {
                                setShowRoleInfo(false);
                                loginAsDemoRole(r.id)
                                  .then(() => {
                                    setActiveRole(r.id);
                                    setRole(r);
                                    toast.success(`Switched to ${r.name} workspace!`);
                                    if (r.id === "alumni" || r.id === "alumni_coordinator") {
                                      navigate({ to: "/alumni/dashboard" });
                                      return;
                                    }
                                    navigate({ to: "/dashboard" });
                                  })
                                  .catch((error) => {
                                    toast.error(error?.message || `Unable to switch to ${r.name} workspace.`);
                                  });
                              }}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-left cursor-pointer transition
                                ${active
                                  ? `bg-gradient-to-r ${r.gradient} text-white font-semibold shadow-soft`
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                            >
                              <IconComp className="size-3.5" />
                              <div className="leading-tight">
                                <div>{r.name}</div>
                                {!active && <div className="text-[9px] opacity-70 font-normal">{r.short}</div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Plus/New Dropdown */}
              {(role.id === "warden" || role.id === "librarian" || role.id === "alumni_coordinator") && (
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
                        {role.id === "warden" ? (
                          <>
                            <button
                              onClick={() => {
                                setActiveQuickAction("allocateRoom");
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <UserPlus className="size-3.5 text-violet-500" />
                              <span>Allocate Room</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveQuickAction("registerVisitor");
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <User className="size-3.5 text-indigo-500" />
                              <span>Register Visitor</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveQuickAction("logComplaint");
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <AlertTriangle className="size-3.5 text-amber-500" />
                              <span>Log Complaint</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveQuickAction("sendWardenNotif");
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <BellRing className="size-3.5 text-rose-500" />
                              <span>Broadcast Announcement</span>
                            </button>
                          </>
                        ) : role.id === "alumni_coordinator" ? (
                          <>
                            <button
                              onClick={() => {
                                navigate({ to: "/dashboard/admin/alumni/registration" });
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <UserPlus className="size-3.5 text-pink-500" />
                              <span>Register Alumni</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate({ to: "/dashboard/admin/alumni/events" });
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <Calendar className="size-3.5 text-rose-500" />
                              <span>Create Event</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate({ to: "/dashboard/admin/alumni/donations" });
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <DollarSign className="size-3.5 text-emerald-500" />
                              <span>Record Donation</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate({ to: "/dashboard/admin/alumni/mentorship" });
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <Users className="size-3.5 text-indigo-500" />
                              <span>Match Mentor</span>
                            </button>
                            <button
                              onClick={() => {
                                navigate({ to: "/dashboard/admin/alumni/announcements" });
                                setShowNewActions(false);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-accent flex items-center gap-2 cursor-pointer transition"
                            >
                              <Send className="size-3.5 text-amber-500" />
                              <span>Broadcast Announcement</span>
                            </button>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

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
                        {notificationsToShow.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground">No new notifications</div>
                        ) : (
                          notificationsToShow.map((notif) => (
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
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          handleProfileClick();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer text-left transition mt-1"
                      >
                        <Settings className="size-3.5" />
                        <span>Account Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowHelpModal(true);
                          setHelpActiveTab("getting-started");
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
                  {students.map((s: any) => (
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
                  {books.map((b: any) => (
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

      {/* Hostel Warden Quick Action Modals */}
      {activeQuickAction === "allocateRoom" && (
        <StudentFormModal
          open={activeQuickAction === "allocateRoom"}
          mode="create"
          student={null}
          departments={departments}
          submitting={allocateRoomMutation.isPending}
          isHostelWarden={true}
          onClose={() => setActiveQuickAction(null)}
          onSubmit={handleAllocateSubmit}
        />
      )}

      {activeQuickAction === "registerVisitor" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleQuickVisitorSubmit}
            className="bg-background rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left font-normal"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Register Visitor Entry</h3>
              <button
                type="button"
                onClick={() => setActiveQuickAction(null)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Visitor Name *</label>
                  <input
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Visitor Phone *</label>
                  <input
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Relationship</label>
                  <select
                    value={vRelation}
                    onChange={(e) => setVRelation(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                  >
                    {["Parent", "Guardian", "Friend", "Sibling", "Local Guardian", "Other"].map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Purpose of Visit</label>
                  <input
                    value={vPurpose}
                    onChange={(e) => setVPurpose(e.target.value)}
                    placeholder="e.g. Submitting laundry, meeting"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Visiting Resident Student</label>
                <select
                  value={vStudentId}
                  onChange={(e) => setVStudentId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                  required
                >
                  <option value="">-- Select Resident Student --</option>
                  {residents.map((r: any) => (
                    <option key={r.studentId} value={r.studentId}>
                      {r.fullName} ({r.rollNumber}) - Room {r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Verification ID Type</label>
                  <select
                    value={vIdType}
                    onChange={(e) => setVIdType(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                  >
                    {["Aadhaar Card", "PAN Card", "Driving License", "Student ID", "Passport", "Other"].map((idt) => (
                      <option key={idt} value={idt}>{idt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Verification ID Number</label>
                  <input
                    value={vIdNumber}
                    onChange={(e) => setVIdNumber(e.target.value)}
                    placeholder="ID Reference Number"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-soft border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveQuickAction(null)}
                className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                disabled={registerVisitorMutation.isPending}
              >
                {registerVisitorMutation.isPending ? "Registering..." : "Register Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeQuickAction === "logComplaint" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleQuickComplaintSubmit}
            className="bg-background rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left font-normal"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Register New Complaint</h3>
              <button
                type="button"
                onClick={() => setActiveQuickAction(null)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Select Resident Student</label>
                <select
                  value={cStudentId}
                  onChange={(e) => setCStudentId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                >
                  <option value="">General / Warden Reported</option>
                  {residents.map((r: any) => (
                    <option key={r.studentId} value={r.studentId}>
                      {r.fullName} ({r.rollNumber}) - Room {r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Category</label>
                  <select
                    value={cCat}
                    onChange={(e) => setCCat(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                  >
                    {["Maintenance", "Mess", "Security", "Electrical", "Other"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Priority</label>
                  <select
                    value={cPriority}
                    onChange={(e) => setCPriority(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                  >
                    {["Low", "Medium", "High"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Complaint Title</label>
                <input
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  placeholder="e.g. Water shortage in block A 2nd floor"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Detailed Description</label>
                <textarea
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  required
                />
              </div>
            </div>
            <div className="p-6 bg-gradient-soft border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveQuickAction(null)}
                className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                disabled={logComplaintMutation.isPending}
              >
                {logComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeQuickAction === "sendWardenNotif" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150 text-left font-normal">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base text-gradient flex items-center gap-2">
                <BellRing className="size-5 text-violet-600" /> Broadcast Announcement
              </h3>
              <button
                onClick={() => setActiveQuickAction(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAnnouncementSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mess timings changed / Power shutdown notice"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="Mess">Mess</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Urgency</label>
                  <select
                    value={annUrgency}
                    onChange={(e) => setAnnUrgency(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
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
                  disabled={sendWardenNotifMutation.isPending}
                >
                  {sendWardenNotifMutation.isPending ? "Broadcasting..." : "Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help & Documentation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-4xl h-[600px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-center border-b p-4 px-6 bg-accent/20">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <HelpCircle className="size-5 text-indigo-600" />
                <span>Help & Documentation Center</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Sidebar + Content Panel) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-56 border-b md:border-b-0 md:border-r bg-muted/20 p-3 flex flex-row md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-x-visible">
                <button
                  onClick={() => setHelpActiveTab("getting-started")}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer whitespace-nowrap md:w-full ${
                    helpActiveTab === "getting-started"
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Info className="size-4" />
                  <span>Getting Started</span>
                </button>
                <button
                  onClick={() => setHelpActiveTab("role-guide")}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer whitespace-nowrap md:w-full ${
                    helpActiveTab === "role-guide"
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Sparkles className="size-4" />
                  <span>{role.name} Guide</span>
                </button>
                <button
                  onClick={() => setHelpActiveTab("faqs")}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer whitespace-nowrap md:w-full ${
                    helpActiveTab === "faqs"
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <HelpCircle className="size-4" />
                  <span>FAQs</span>
                </button>
                <button
                  onClick={() => setHelpActiveTab("support")}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer whitespace-nowrap md:w-full ${
                    helpActiveTab === "support"
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <User className="size-4" />
                  <span>Contact Support</span>
                </button>
              </div>

              {/* Main Contents Panel */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {helpActiveTab === "getting-started" && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-left">
                    <h4 className="font-bold text-sm text-foreground">Welcome to College Management System!</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our platform is a state-of-the-art campus dashboard designed to integrate academic portals, 
                      library inventories, hostel warden controls, financial records, and live transit monitoring.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 border rounded-xl bg-accent/10 space-y-1">
                        <span className="font-bold text-xs text-foreground block">🎨 Modern Dashboard Design</span>
                        <span className="text-[11px] text-muted-foreground block">
                          Uses custom-harmonized dark mode support, HSL palettes, and responsive side drawers.
                        </span>
                      </div>
                      <div className="p-3 border rounded-xl bg-accent/10 space-y-1">
                        <span className="font-bold text-xs text-foreground block">🛡️ Role-Based Scope Security</span>
                        <span className="text-[11px] text-muted-foreground block">
                          Access permissions are automatically sandboxed depending on your logged-in credentials.
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-xl text-[11px] leading-relaxed">
                      <strong>💡 Quick Tip:</strong> Click the role badge with your name at the top-right corner to see a brief list of the features available to your account level.
                    </div>
                  </div>
                )}

                {helpActiveTab === "role-guide" && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-left">
                    <h4 className="font-bold text-sm text-foreground">{role.name} Operations Manual</h4>
                    <p className="text-xs text-muted-foreground">
                      Here is a tailored guide for your active role session in the system:
                    </p>
                    
                    {role.id === "warden" && (
                      <div className="space-y-3.5">
                        <div className="border-l-2 border-teal-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">🔑 Room Allocations & Transfers</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Navigate to **Hostel** &rarr; **Rooms** or click **New** &rarr; **Allocate Room** to assign beds. 
                            The system checks room capacity limits and prevents double-booking a resident in active rooms.
                          </span>
                        </div>
                        <div className="border-l-2 border-teal-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">📋 Resident Directory Control</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Manage check-ins, check-outs, status updates (Active, Vacated), and resident profiles. 
                            Only active resident profiles increment the occupied counts for rooms.
                          </span>
                        </div>
                        <div className="border-l-2 border-teal-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">🛂 Visitor Registration</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Add detailed visitor records including name, student contact, relation, and time constraints. 
                            You can mark a visitor checked-out when they leave.
                          </span>
                        </div>
                        <div className="border-l-2 border-teal-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">💰 Fees & Payments ledger</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Keep track of unpaid dues, register paid receipts, and monitor financial transactions. 
                            Always generate receipts with valid transaction IDs.
                          </span>
                        </div>
                      </div>
                    )}

                    {role.id === "student" && (
                      <div className="space-y-3.5">
                        <div className="border-l-2 border-indigo-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">📊 Academics Hub</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Check class timetables, print grade cards, and monitor your cumulative GPA trends.
                          </span>
                        </div>
                        <div className="border-l-2 border-indigo-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">📚 Borrowing Materials</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Browse physical book stocks or download digital PDFs from the e-library. 
                            Return physical books before due dates to avoid library fines.
                          </span>
                        </div>
                      </div>
                    )}

                    {role.id === "faculty" && (
                      <div className="space-y-3.5">
                        <div className="border-l-2 border-violet-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">📝 Attendance Records</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Click on the calendar classes to mark daily student presence. Ensure to submit records before midnight.
                          </span>
                        </div>
                        <div className="border-l-2 border-violet-500 pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">📂 Files Broadcast</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Upload classroom lecture notes, assignment tasks, or event notices to your specific student courses.
                          </span>
                        </div>
                      </div>
                    )}

                    {role.id !== "warden" && role.id !== "student" && role.id !== "faculty" && (
                      <div className="space-y-3.5">
                        <div className="border-l-2 border-primary pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">📈 Standard Operations Scope</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Use the sidebar navigation tabs to view registers, generate data tables, or download audit reports.
                          </span>
                        </div>
                        <div className="border-l-2 border-primary pl-3 space-y-1">
                          <span className="font-bold text-xs text-foreground block">✉️ Alerts Broadcaster</span>
                          <span className="text-[11px] text-muted-foreground block">
                            Check and send high priority notices to user groups under your designated system panel.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {helpActiveTab === "faqs" && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-left">
                    <h4 className="font-bold text-sm text-foreground">Frequently Asked Questions</h4>
                    
                    <div className="space-y-3">
                      <div className="p-3 border rounded-xl space-y-1 hover:bg-muted/10 transition">
                        <span className="font-bold text-xs text-foreground block">Q: How do I switch my active role view?</span>
                        <span className="text-[11px] text-muted-foreground block leading-relaxed">
                          A: Since this is a demo sandbox environment, you can switch active roles using the role selectors or your profile profile. Click the user badge to view configurations.
                        </span>
                      </div>
                      <div className="p-3 border rounded-xl space-y-1 hover:bg-muted/10 transition">
                        <span className="font-bold text-xs text-foreground block">Q: What happens when a room reaches maximum capacity?</span>
                        <span className="text-[11px] text-muted-foreground block leading-relaxed">
                          A: The database validations will prevent further student assignments to that room and raise a warning notification message. You must transfer occupants or assign a vacant room.
                        </span>
                      </div>
                      <div className="p-3 border rounded-xl space-y-1 hover:bg-muted/10 transition">
                        <span className="font-bold text-xs text-foreground block">Q: Where can I review system logs and automation triggers?</span>
                        <span className="text-[11px] text-muted-foreground block leading-relaxed">
                          A: High-level automated system functions are accessible only to the Super Admin role scope under the AI Automation Control and Security panels.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {helpActiveTab === "support" && (
                  <div className="space-y-4 animate-in fade-in duration-150 text-left">
                    <h4 className="font-bold text-sm text-foreground">Reach IT Help & Support</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If you encounter database timeouts, permission issues, or require custom features, 
                      please contact our system administration team.
                    </p>
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/10 transition">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">@</div>
                        <div>
                          <span className="text-xs font-semibold text-foreground block">Tech Support Email</span>
                          <span className="text-[11px] text-muted-foreground">support@collegemanage.edu</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/10 transition">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xs">📞</div>
                        <div>
                          <span className="text-xs font-semibold text-foreground block">Admin Hotline</span>
                          <span className="text-[11px] text-muted-foreground">+1 (555) 019-2834 (Ext. 204)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/10 transition">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">🏢</div>
                        <div>
                          <span className="text-xs font-semibold text-foreground block">Operations Office</span>
                          <span className="text-[11px] text-muted-foreground">Main Campus Building, Room 410A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
