import { useEffect, useState, useMemo } from "react";
import { Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Bed,
  DollarSign,
  Users,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Home,
  Utensils,
  UserCheck,
  Loader2,
  Plus,
  Search,
  Filter,
  Phone,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  Building2
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchStats,
  fetchDashboardCharts,
  fetchSystemNotifications,
  fetchHostelBlocksOverview,
  createHostelBlock,
  updateHostelBlock,
  deleteHostelBlock,
  fetchHostels,
  type HostelBlockRecord
} from "@/services/hostelService";
import { toast } from "sonner";

export function HostelDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const queryClient = useQueryClient();

  // ── Hostel Blocks Overview UI State ────────────────────
  const [blockSearch, setBlockSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterAcType, setFilterAcType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOccupancy, setFilterOccupancy] = useState("All");
  const [filterHostel, setFilterHostel] = useState("All");

  // Modal States
  const [viewBlock, setViewBlock] = useState<HostelBlockRecord | null>(null);
  const [editBlock, setEditBlock] = useState<HostelBlockRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [formHostelId, setFormHostelId] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("Boys");
  const [formCapacity, setFormCapacity] = useState(300);
  const [formTotalRooms, setFormTotalRooms] = useState(150);
  const [formAcRooms, setFormAcRooms] = useState(50);
  const [formNonAcRooms, setFormNonAcRooms] = useState(100);
  const [formOccupants, setFormOccupants] = useState(0);
  const [formWarden, setFormWarden] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formImage, setFormImage] = useState("");

  // Live Queries (must all be called unconditionally before any early return)
  const { data: statsList = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ["hostel-stats"],
    queryFn: fetchStats,
    staleTime: 0,
  });

  const { data: blocks = [], isLoading: isBlocksLoading } = useQuery({
    queryKey: ["hostel-blocks-overview"],
    queryFn: fetchHostelBlocksOverview,
    staleTime: 0,
  });

  const { data: hostelsList = [] } = useQuery({
    queryKey: ["hostels"],
    queryFn: fetchHostels,
    staleTime: 0,
  });

  const { data: chartData, isLoading: isChartsLoading } = useQuery({
    queryKey: ["hostel-dashboard-charts"],
    queryFn: fetchDashboardCharts,
    staleTime: 0,
  });

  const { data: notifications = [], isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["system-notifications"],
    queryFn: fetchSystemNotifications,
    staleTime: 0,
  });

  useEffect(() => {
    const invalidateHostelDashboard = () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-blocks-overview"] });
    };

    const roomChannel = supabase
      .channel("hostel-room-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_rooms" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_allocations" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_fees" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_complaints" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "system_notifications" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_blocks" }, invalidateHostelDashboard)
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [queryClient]);

  // Populate form fields on edit
  useEffect(() => {
    if (editBlock) {
      setFormName(editBlock.name);
      setFormType(editBlock.type);
      setFormCapacity(editBlock.capacity);
      setFormTotalRooms(editBlock.total_rooms);
      setFormAcRooms(editBlock.ac_rooms);
      setFormNonAcRooms(editBlock.non_ac_rooms);
      setFormOccupants(editBlock.occupants);
      setFormWarden(editBlock.block_warden || "");
      setFormContact(editBlock.contact_number || "");
      setFormStatus(editBlock.status || "Available");
      setFormImage(editBlock.image_url || "");
      setFormHostelId(editBlock.hostel_id || "");
    } else {
      setFormName("");
      setFormType("Boys");
      setFormCapacity(300);
      setFormTotalRooms(150);
      setFormAcRooms(50);
      setFormNonAcRooms(100);
      setFormOccupants(0);
      setFormWarden("");
      setFormContact("");
      setFormStatus("Available");
      setFormImage("");
      setFormHostelId(hostelsList.length > 0 ? hostelsList[0].id : "");
    }
  }, [editBlock, showAddModal, hostelsList]);

  // ── Stats Calculations (must be before early returns) ───────────────────
  const blockStats = useMemo(() => {
    const totalHostels = blocks.length;
    let totalCapacity = 0;
    let totalRooms = 0;
    let totalAcRooms = 0;
    let totalNonAcRooms = 0;
    let totalOccupiedBeds = 0;
    blocks.forEach((b: any) => {
      totalCapacity += Number(b.capacity || 0);
      totalRooms += Number(b.total_rooms || 0);
      totalAcRooms += Number(b.ac_rooms || 0);
      totalNonAcRooms += Number(b.non_ac_rooms || 0);
      totalOccupiedBeds += Number(b.occupants || 0);
    });
    const totalAvailableBeds = Math.max(0, totalCapacity - totalOccupiedBeds);
    return { totalHostels, totalCapacity, totalRooms, totalAcRooms, totalNonAcRooms, totalOccupiedBeds, totalAvailableBeds };
  }, [blocks]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b: any) => {
      if (blockSearch && !b.name.toLowerCase().includes(blockSearch.toLowerCase())) return false;
      if (filterHostel !== "All" && b.hostel_id !== filterHostel) return false;
      if (filterType !== "All" && b.type !== filterType) return false;
      if (filterAcType === "AC" && Number(b.ac_rooms) === 0) return false;
      if (filterAcType === "Non-AC" && Number(b.non_ac_rooms) === 0) return false;
      if (filterStatus !== "All" && b.status !== filterStatus) return false;
      if (filterOccupancy !== "All") {
        const pct = b.capacity > 0 ? (b.occupants / b.capacity) * 100 : 0;
        if (filterOccupancy === "low" && pct >= 50) return false;
        if (filterOccupancy === "medium" && (pct < 50 || pct > 90)) return false;
        if (filterOccupancy === "high" && pct <= 90) return false;
      }
      return true;
    });
  }, [blocks, blockSearch, filterHostel, filterType, filterAcType, filterStatus, filterOccupancy]);

  // Render child route if not on the dashboard root
  if (path !== "/dashboard/hostel") {
    return <Outlet />;
  }

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B"];

  const roomOccupancyData = chartData?.roomOccupancyData || [];
  const complaintStatusData = chartData?.complaintStatusData || [];
  const feeCollectionData = chartData?.feeCollectionData || [];
  const hostelActivities = chartData?.hostelActivities || [];

  if (isStatsLoading || isChartsLoading || isBlocksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading Warden Dashboard...</span>
      </div>
    );
  }

  // Image Upload helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD actions
  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formHostelId) {
      toast.error("Hostel selection is required.");
      return;
    }
    if (!formName.trim()) {
      toast.error("Hostel block name is required.");
      return;
    }
    if (formCapacity <= 0) {
      toast.error("Total capacity must be greater than 0.");
      return;
    }
    if (formTotalRooms <= 0) {
      toast.error("Total rooms must be greater than 0.");
      return;
    }
    if (Number(formAcRooms) + Number(formNonAcRooms) !== Number(formTotalRooms)) {
      toast.error("AC Rooms count + Non-AC Rooms count must equal Total Rooms.");
      return;
    }
    if (Number(formOccupants) > Number(formCapacity)) {
      toast.error("Current occupancy cannot exceed the block's capacity.");
      return;
    }
    
    // Check duplicate names
    const duplicate = blocks.some((b: any) => 
      b.name.toLowerCase().trim() === formName.toLowerCase().trim() && 
      b.hostel_id === formHostelId &&
      (!editBlock || b.id !== editBlock.id)
    );
    if (duplicate) {
      toast.error("A hostel block with this name already exists in the selected hostel.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hostelId: formHostelId,
        name: formName.trim(),
        type: formType,
        capacity: Number(formCapacity),
        total_rooms: Number(formTotalRooms),
        ac_rooms: Number(formAcRooms),
        non_ac_rooms: Number(formNonAcRooms),
        occupants: Number(formOccupants),
        block_warden: formWarden.trim(),
        contact_number: formContact.trim(),
        status: formStatus,
        image_url: formImage
      };

      if (editBlock) {
        await updateHostelBlock(editBlock.id, payload);
        toast.success(`Successfully updated ${formName}!`);
        setEditBlock(null);
      } else {
        await createHostelBlock(payload);
        toast.success(`Successfully added ${formName}!`);
        setShowAddModal(false);
      }
      queryClient.invalidateQueries({ queryKey: ["hostel-blocks-overview"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save block details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteHostelBlock(id, name);
      toast.success(`Successfully deleted ${name}.`);
      queryClient.invalidateQueries({ queryKey: ["hostel-blocks-overview"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete hostel block.");
    }
  };


  const defaultHostelImage = "https://images.unsplash.com/photo-1555854817-40e098ee7f28?w=800&auto=format&fit=crop&q=60";


  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Management"
        desc="Manage hostel rooms, occupancy, fees, complaints, mess, and visitors."
      />

      {/* Hostel Blocks Overview Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
              <span>Hostel Blocks Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor building capacities, current occupancies, warden assignments, and statuses.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-primary text-white text-xs font-semibold rounded-xl hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer shadow-soft hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="size-4" /> Add Hostel Block
          </button>
        </div>

        {/* Dynamic Block Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Total Hostels", value: blockStats.totalHostels, bg: "from-indigo-500/10 to-indigo-600/5", border: "border-indigo-100 dark:border-indigo-950/40", color: "text-indigo-600 dark:text-indigo-400" },
            { label: "Total Capacity", value: blockStats.totalCapacity, bg: "from-slate-500/10 to-slate-600/5", border: "border-slate-100 dark:border-slate-800", color: "text-slate-800 dark:text-slate-200" },
            { label: "Total Rooms", value: blockStats.totalRooms, bg: "from-indigo-500/10 to-indigo-600/5", border: "border-indigo-100 dark:border-indigo-950/40", color: "text-indigo-600 dark:text-indigo-400" },
            { label: "AC Rooms", value: blockStats.totalAcRooms, bg: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-100 dark:border-cyan-950/40", color: "text-cyan-600 dark:text-cyan-400" },
            { label: "Non-AC Rooms", value: blockStats.totalNonAcRooms, bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-100 dark:border-amber-950/40", color: "text-amber-600 dark:text-amber-400" },
            { label: "Occupied Beds", value: blockStats.totalOccupiedBeds, bg: "from-rose-500/10 to-rose-600/5", border: "border-rose-100 dark:border-rose-950/40", color: "text-rose-600 dark:text-rose-400" },
            { label: "Available Beds", value: blockStats.totalAvailableBeds, bg: "from-teal-500/10 to-teal-600/5", border: "border-teal-100 dark:border-teal-950/40", color: "text-teal-600 dark:text-teal-400" }
          ].map((s) => (
            <Card key={s.label} className={`p-3 text-center flex flex-col justify-center bg-gradient-to-br ${s.bg} ${s.border} rounded-2xl`}>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <span className={`text-xl font-extrabold mt-1.5 ${s.color}`}>{s.value}</span>
            </Card>
          ))}
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-background/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 gap-4 flex flex-col lg:flex-row items-center justify-between shadow-xs">
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hostel block by name..."
              value={blockSearch}
              onChange={(e) => setBlockSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-2.5 text-xs bg-background/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="w-full lg:w-auto flex flex-wrap items-center justify-start lg:justify-end gap-3">
            {/* Hostel Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hostel:</span>
              <select
                value={filterHostel}
                onChange={(e) => setFilterHostel(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground max-w-[150px] truncate"
              >
                <option value="All">All Hostels</option>
                {hostelsList.map((h: any) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground"
              >
                <option value="All">All Types</option>
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
              </select>
            </div>

            {/* AC Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rooms:</span>
              <select
                value={filterAcType}
                onChange={(e) => setFilterAcType(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground"
              >
                <option value="All">All Rooms</option>
                <option value="AC">Has AC Rooms</option>
                <option value="Non-AC">Has Non-AC Rooms</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Occupancy Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Occupancy:</span>
              <select
                value={filterOccupancy}
                onChange={(e) => setFilterOccupancy(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground"
              >
                <option value="All">All Levels</option>
                <option value="low">&lt; 50% Occupied</option>
                <option value="medium">50% - 90% Occupied</option>
                <option value="high">&gt; 90% Occupied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid of Block Cards */}
        {filteredBlocks.length === 0 ? (
          <div className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center text-muted-foreground">
            <Building2 className="size-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No hostel blocks found matching selected filters.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try modifying your search or filters above.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBlocks.map((b: any) => {
              const occupancyPercentage = b.capacity > 0 ? Math.round((b.occupants / b.capacity) * 100) : 0;
              const isFull = b.status === "Full" || occupancyPercentage >= 100;
              const statusBadgeTone = 
                b.status === "Maintenance" ? "warn" :
                isFull ? "danger" : "success";
              
              const statusText = 
                b.status === "Maintenance" ? "Maintenance" :
                isFull ? "Full" : "Available";

              return (
                <div
                  key={b.id}
                  className="bg-background border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className="h-48 w-full relative overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const sibling = (e.target as HTMLImageElement).nextElementSibling;
                          if (sibling) {
                            sibling.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    {/* Fallback gradient placeholder if no image or fails to load */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex flex-col items-center justify-center text-white ${b.image_url ? 'hidden' : ''}`}>
                      <Building2 className="size-12 animate-pulse mb-1 text-white/90" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">{b.code}</span>
                    </div>

                    {/* Dark overlay gradient to blend bottom of image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent" />

                    {/* Badges on top */}
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white bg-black/55 backdrop-blur-md border border-white/10 uppercase tracking-wider`}>
                        {b.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <Badge tone={statusBadgeTone} className="backdrop-blur-md shadow-sm">
                        {statusText}
                      </Badge>
                    </div>

                    {/* overlay title */}
                    <div className="absolute bottom-3 left-4 right-4 z-10 text-left">
                      <h4 className="font-extrabold text-white text-lg tracking-tight drop-shadow-md truncate">{b.name}</h4>
                      <p className="text-[10px] text-white/85 drop-shadow-sm font-bold tracking-wider uppercase truncate">
                        {b.hostels?.name || "General"} • Code: {b.code}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col space-y-4 text-left">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Beds Capacity</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{b.capacity} beds</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Total Rooms</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{b.total_rooms} rooms</span>
                      </div>
                      <div className="flex flex-col border-t border-slate-100 dark:border-slate-800/80 pt-2 col-span-1">
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-semibold">AC Rooms</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{b.ac_rooms}</span>
                      </div>
                      <div className="flex flex-col border-t border-slate-100 dark:border-slate-800/80 pt-2 col-span-1">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Non-AC Rooms</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{b.non_ac_rooms}</span>
                      </div>
                    </div>

                    {/* Occupancy Indicator */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Occupancy</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {b.occupants} / {b.capacity} <span className="text-muted-foreground font-normal">({occupancyPercentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-[2px]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 shadow-xs ${
                            occupancyPercentage >= 95 ? "bg-gradient-to-r from-rose-500 to-red-600" :
                            occupancyPercentage >= 75 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                            "bg-gradient-to-r from-teal-400 to-emerald-600"
                          }`}
                          style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
                        />
                      </div>
                    </div>

                    {/* Warden & Helpline Details */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Warden:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{b.block_warden || "Not Assigned"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Helpline:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Phone className="size-3.5" />
                          {b.contact_number || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/20 flex gap-2 justify-between items-center shrink-0">
                    <button
                      onClick={() => setViewBlock(b)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-background transition text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <Eye className="size-3.5" /> Details
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditBlock(b)}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-background transition text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer shadow-xs hover:shadow-sm"
                        title="Edit Block"
                      >
                        <Edit className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(b.id, b.name)}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 hover:text-rose-700 cursor-pointer shadow-xs hover:shadow-sm"
                        title="Delete Block"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-800" />

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {statsList.map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4 text-sm">Room Occupancy Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={roomOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="occupied" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="available" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold text-sm">Complaint Status</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {complaintStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {complaintStatusData.map((item, index) => (
              <div key={item.status} className="flex items-center gap-2 text-xs">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.status}: {item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Fee Trends */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Fee Collection Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="collected" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Recent Activities</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {hostelActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition animate-in fade-in duration-200"
              >
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0">
                  {activity.type ? activity.type[0] : "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    <span className="font-semibold">{activity.actor}</span> {activity.action}{" "}
                    <span className="font-semibold text-indigo-600">{activity.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
            {hostelActivities.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent activity logs
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Notifications Tray */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${notification.unread ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20" : ""}`}
              >
                <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center shrink-0">
                  <Bell className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{notification.title}</span>
                    {notification.unread && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {notification.type} • {notification.time || "Just now"}
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No new notifications
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions Router Links */}
        <Card>
          <h3 className="font-semibold mb-4 text-sm">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Bed, label: "Room Allocation", color: "bg-gradient-primary", to: "/dashboard/hostel/rooms" },
              { icon: Users, label: "Student List", color: "bg-gradient-violet", to: "/dashboard/hostel/students" },
              { icon: DollarSign, label: "Fee Collection", color: "bg-gradient-cyan", to: "/dashboard/hostel/fees" },
              { icon: Utensils, label: "Mess Menu", color: "bg-gradient-primary", to: "/dashboard/hostel/mess" },
              { icon: UserCheck, label: "Visitor Log", color: "bg-gradient-violet", to: "/dashboard/hostel/visitors" },
              { icon: AlertTriangle, label: "Complaints", color: "bg-gradient-cyan", to: "/dashboard/hostel/complaints" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition flex flex-col items-center gap-2 text-center"
              >
                <div
                  className={`size-10 rounded-lg ${action.color} text-white grid place-items-center`}
                >
                  <action.icon className="size-5" />
                </div>
                <span className="text-xs font-semibold">{action.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>



      {/* ── Modal Dialogs ──────────────────────────────────────────────────────── */}

      {/* Add / Edit Block Modal */}
      {(showAddModal || editBlock) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b p-4 px-5">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-indigo-600" />
                <span>{editBlock ? `Edit: ${editBlock.name}` : "Create New Hostel Block"}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditBlock(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveBlock} className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Hostel Block Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hostel Block E"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Associated Hostel *</label>
                  <select
                    required
                    value={formHostelId}
                    onChange={(e) => setFormHostelId(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="">Select Hostel</option>
                    {hostelsList.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Hostel Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="Boys">Boys Hostel</option>
                    <option value="Girls">Girls Hostel</option>
                    <option value="Co-Ed">Co-Ed Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Status Badge *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Total Capacity (Beds) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Total Rooms *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formTotalRooms}
                    onChange={(e) => setFormTotalRooms(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Current Occupancy *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formOccupants}
                    onChange={(e) => setFormOccupants(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">AC Rooms *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formAcRooms}
                    onChange={(e) => setFormAcRooms(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Non-AC Rooms *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formNonAcRooms}
                    onChange={(e) => setFormNonAcRooms(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Warden Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Kumar"
                    value={formWarden}
                    onChange={(e) => setFormWarden(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload & URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Block Image (URL or Upload File)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Paste image URL here..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
                  />
                  <div className="relative overflow-hidden flex items-center justify-center border rounded-xl px-4 py-2 hover:bg-accent/40 cursor-pointer shrink-0 transition text-xs font-semibold">
                    <Upload className="size-4 mr-2" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                {formImage && (
                  <div className="relative h-32 w-full rounded-xl border overflow-hidden mt-2 group">
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full size-6 flex items-center justify-center text-[10px] cursor-pointer hover:bg-black transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditBlock(null);
                  }}
                  className="flex-1 px-3 py-2.5 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{editBlock ? "Save Changes" : "Create Block"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewBlock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Image */}
            <div className="h-48 w-full relative bg-slate-100">
              <img
                src={viewBlock.image_url || defaultHostelImage}
                alt={viewBlock.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setViewBlock(null)}
                className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black transition rounded-full size-8 flex items-center justify-center text-sm cursor-pointer shadow"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-slate-900/80 backdrop-blur-xs uppercase">
                  {viewBlock.type}
                </span>
              </div>
            </div>

            <div className="p-6 text-left space-y-5">
              <div>
                <h3 className="font-bold text-xl text-foreground">{viewBlock.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hostel: {viewBlock.hostels?.name || "General"} • Code Reference: {viewBlock.code}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between border-b pb-3 text-xs">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Block Status:</span>
                <Badge
                  tone={
                    viewBlock.status === "Maintenance" ? "warn" :
                    (viewBlock.status === "Full" || viewBlock.occupants >= viewBlock.capacity) ? "danger" : "success"
                  }
                >
                  {viewBlock.status}
                </Badge>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="border rounded-xl p-2.5 bg-accent/15">
                  <span className="text-[10px] text-muted-foreground uppercase block">Capacity</span>
                  <span className="font-bold text-base block mt-0.5 text-foreground">{viewBlock.capacity}</span>
                </div>
                <div className="border rounded-xl p-2.5 bg-accent/15">
                  <span className="text-[10px] text-muted-foreground uppercase block">Occupants</span>
                  <span className="font-bold text-base block mt-0.5 text-foreground">{viewBlock.occupants}</span>
                </div>
                <div className="border rounded-xl p-2.5 bg-accent/15">
                  <span className="text-[10px] text-muted-foreground uppercase block">Available</span>
                  <span className="font-bold text-base block mt-0.5 text-teal-600">
                    {Math.max(0, viewBlock.capacity - viewBlock.occupants)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Occupancy Rate:</span>
                  <span className="text-foreground">
                    {viewBlock.capacity > 0 ? Math.round((viewBlock.occupants / viewBlock.capacity) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-accent/30 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (viewBlock.occupants / viewBlock.capacity) * 100 >= 95 ? "bg-rose-500" :
                      (viewBlock.occupants / viewBlock.capacity) * 100 >= 75 ? "bg-amber-500" :
                      "bg-teal-500"
                    }`}
                    style={{ width: `${Math.min(100, (viewBlock.occupants / viewBlock.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Room type breakdown */}
              <div className="border rounded-xl p-3 bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px]">Room inventory breakdown:</span>
                  <span className="font-bold">{viewBlock.total_rooms} rooms</span>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="text-muted-foreground">AC Accommodations:</span>
                  <span className="font-semibold text-cyan-600">{viewBlock.ac_rooms} rooms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Non-AC Accommodations:</span>
                  <span className="font-semibold text-amber-600">{viewBlock.non_ac_rooms} rooms</span>
                </div>
              </div>

              {/* Warden Details */}
              <div className="border-t pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hostel Block Warden:</span>
                  <span className="font-bold text-foreground">{viewBlock.block_warden || "Not Assigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warden Contact Helpline:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Phone className="size-3.5" />
                    {viewBlock.contact_number || "-"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setViewBlock(null)}
                  className="w-full px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-gradient-soft text-xs transition cursor-pointer"
                >
                  Dismiss Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
