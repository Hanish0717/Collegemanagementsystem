import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bed, Plus, Search, Building2, User, Loader2, AlertCircle, Eye, Edit, Trash2, ArrowUpDown, SlidersHorizontal, Phone, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchHostelRooms,
  fetchStats,
  fetchDashboardCharts,
  createResident,
  createHostelRoom,
  updateHostelRoom,
  deleteHostelRoom,
  checkInResident,
  checkOutResident,
  transferResident,
  cancelAllocation,
  fetchHostels,
  fetchHostelBlocks,
  fetchRoomsForBlock,
  type RoomRecord
} from "@/services/hostelService";
import { fetchDepartments } from "@/services/studentService";
import { StudentFormModal } from "../dashboard/students/StudentDialogs";
import { supabase } from "@/lib/supabaseClient";

export function HostelRooms() {
  const queryClient = useQueryClient();

  // Active Tab: allocations vs rooms
  const [activeTab, setActiveTab] = useState<"allocations" | "rooms">("allocations");

  // Search & Filter State (Allocation Tab)
  const [search, setSearch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [selectedBlock, setSelectedBlock] = useState("All Blocks");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Room Management Filters State (Rooms Tab)
  const [roomSearch, setRoomSearch] = useState("");
  const [roomBlock, setRoomBlock] = useState("All");
  const [roomFloor, setRoomFloor] = useState("All");
  const [roomStatus, setRoomStatus] = useState("All");
  const [roomType, setRoomType] = useState("All");
  const [roomAcType, setRoomAcType] = useState("All");

  // Sorting (Rooms Tab)
  const [sortBy, setSortBy] = useState<string>("roomNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination (Rooms Tab)
  const [roomPage, setRoomPage] = useState(1);
  const roomLimit = 8;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [viewingRoom, setViewingRoom] = useState<any>(null);

  // Form Fields State (Room Management Form)
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formBlockId, setFormBlockId] = useState("");
  const [formFloor, setFormFloor] = useState(1);
  const [formCapacity, setFormCapacity] = useState(2);
  const [formRoomType, setFormRoomType] = useState("Double");
  const [formAcType, setFormAcType] = useState("Non-AC");
  const [formRoomStatus, setFormRoomStatus] = useState("Vacant");
  const [formDescription, setFormDescription] = useState("");

  // Transfer state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<any>(null);
  const [transferHostelId, setTransferHostelId] = useState("");
  const [transferBlockId, setTransferBlockId] = useState("");
  const [transferRoomId, setTransferRoomId] = useState("");
  const [transferBedNumber, setTransferBedNumber] = useState<number>(1);
  const [transferBlocksList, setTransferBlocksList] = useState<any[]>([]);
  const [transferRoomsList, setTransferRoomsList] = useState<any[]>([]);
  const [hostelsList, setHostelsList] = useState<any[]>([]);

  // Fetch hostels list on transfer modal mount
  useEffect(() => {
    if (isTransferOpen) {
      fetchHostels().then(setHostelsList).catch(console.error);
    }
  }, [isTransferOpen]);

  // Fetch blocks when hostel changes in transfer modal
  useEffect(() => {
    if (transferHostelId) {
      fetchHostelBlocks(transferHostelId).then(setTransferBlocksList).catch(console.error);
    } else {
      setTransferBlocksList([]);
    }
  }, [transferHostelId]);

  // Fetch rooms when block changes in transfer modal
  useEffect(() => {
    if (transferBlockId) {
      fetchRoomsForBlock(transferBlockId).then((rms: any[]) => {
        setTransferRoomsList(rms.filter((r: any) => r.occupants < r.capacity));
      }).catch(console.error);
    } else {
      setTransferRoomsList([]);
    }
  }, [transferBlockId]);

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: statsList = [] } = useQuery({
    queryKey: ["hostel-stats"],
    queryFn: fetchStats,
    staleTime: 0,
  });

  const { data: chartData } = useQuery({
    queryKey: ["hostel-charts"],
    queryFn: fetchDashboardCharts,
    staleTime: 0,
  });

  // Query block options for rooms dropdown
  const { data: blockOptions = [] } = useQuery({
    queryKey: ["block-options"],
    queryFn: async () => {
      const { data } = await supabase.from("hostel_blocks").select("id, name").order("name");
      return data || [];
    }
  });

  // Query for rooms in Allocations Tab
  const {
    data: roomsList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rooms", search, selectedBlock, selectedFloor, selectedStatus],
    queryFn: () =>
      fetchHostelRooms({
        search,
        block: selectedBlock,
        floor: selectedFloor,
        status: selectedStatus,
      }),
    staleTime: 0,
  });

  // Query for rooms in Management Tab
  const {
    data: manageRoomsList = [],
    isLoading: isManageLoading,
    isError: isManageError,
    error: manageError,
  } = useQuery({
    queryKey: [
      "manage-rooms",
      roomSearch,
      roomBlock,
      roomFloor,
      roomStatus,
      roomType,
      roomAcType,
    ],
    queryFn: () =>
      fetchHostelRooms({
        search: roomSearch,
        block: roomBlock === "All" ? undefined : roomBlock,
        floor: roomFloor === "All" ? undefined : roomFloor,
        status: roomStatus === "All" ? undefined : roomStatus,
        roomType: roomType === "All" ? undefined : roomType,
        acType: roomAcType === "All" ? undefined : roomAcType,
      }),
    staleTime: 0,
  });

  // Mutations for room CRUD
  const createRoomMutation = useMutation({
    mutationFn: (payload: any) => createHostelRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Room created successfully!");
      setIsRoomFormOpen(false);
      resetRoomForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create room.");
    }
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string, payload: any }) => updateHostelRoom(roomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Room updated successfully!");
      setIsRoomFormOpen(false);
      setEditingRoom(null);
      resetRoomForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update room.");
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => deleteHostelRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Room deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete room.");
    }
  });

  // Mutations for allocations
  const createMutation = useMutation({
    mutationFn: ({ student, allocation }: { student: any; allocation: any }) =>
      createResident(student, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Resident added and room allocated successfully!");
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create allocation");
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (allocationId: string) => checkInResident(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Resident checked in successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to check-in resident");
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: (allocationId: string) => checkOutResident(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Resident checked out and bed vacated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to check-out resident");
    }
  });

  const cancelAllocMutation = useMutation({
    mutationFn: (allocationId: string) => cancelAllocation(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Allocation cancelled successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel allocation");
    }
  });

  const transferMutation = useMutation({
    mutationFn: ({ allocationId, newRoomId, newBedNumber }: { allocationId: string, newRoomId: string, newBedNumber: number }) =>
      transferResident(allocationId, newRoomId, newBedNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["manage-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Resident transferred successfully!");
      setIsTransferOpen(false);
      setTransferTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to transfer resident");
    }
  });

  // Populate room form for editing
  useEffect(() => {
    if (editingRoom) {
      setFormRoomNumber(editingRoom.roomNumber);
      setFormBlockId(editingRoom.blockId);
      setFormFloor(editingRoom.floor);
      setFormCapacity(editingRoom.capacity);
      setFormRoomType(editingRoom.roomType || "Double");
      setFormAcType(editingRoom.acType || "Non-AC");
      setFormRoomStatus(editingRoom.roomStatus || "Vacant");
      setFormDescription(editingRoom.description || "");
    } else {
      resetRoomForm();
    }
  }, [editingRoom]);

  const resetRoomForm = () => {
    setFormRoomNumber("");
    setFormBlockId("");
    setFormFloor(1);
    setFormCapacity(2);
    setFormRoomType("Double");
    setFormAcType("Non-AC");
    setFormRoomStatus("Vacant");
    setFormDescription("");
  };

  const handleRoomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoomNumber.trim()) {
      toast.error("Room Number is required.");
      return;
    }
    if (!formBlockId) {
      toast.error("Block selection is required.");
      return;
    }
    if (formCapacity <= 0) {
      toast.error("Capacity must be greater than 0.");
      return;
    }

    const payload = {
      roomNumber: formRoomNumber.trim(),
      blockId: formBlockId,
      floor: Number(formFloor),
      capacity: Number(formCapacity),
      roomType: formRoomType,
      acType: formAcType,
      roomStatus: formRoomStatus,
      description: formDescription.trim(),
    };

    if (editingRoom) {
      updateRoomMutation.mutate({
        roomId: editingRoom.id,
        payload: {
          ...payload,
          occupants: editingRoom.occupants
        }
      });
    } else {
      createRoomMutation.mutate(payload);
    }
  };

  const handleFormSubmit = (payload: any) => {
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

    createMutation.mutate({
      student: studentData,
      allocation: allocationData,
    });
  };

  // Calculations for Stats (Room Allocation tab)
  const totalRooms = statsList.find((s) => s.label === "Total Rooms")?.value || "0";
  const occupiedRooms = statsList.find((s) => s.label === "Occupied Rooms")?.value || "0";
  const availableRoomsCount = statsList.find((s) => s.label === "Available Rooms")?.value || "0";
  const occupancyRate = totalRooms !== "0"
    ? `${Math.round((parseInt(occupiedRooms) / parseInt(totalRooms)) * 100)}%`
    : "0%";

  const tableRows = useMemo(() => {
    const rows: any[] = [];
    roomsList.forEach((r) => {
      if (r.allocations && r.allocations.length > 0) {
        r.allocations.forEach((a) => {
          rows.push({
            id: a.id,
            roomId: r.id,
            studentId: a.studentId,
            roomNumber: r.roomNumber,
            studentName: a.studentName,
            department: a.department,
            floor: r.floor,
            roomType: r.roomType || r.type || "Double",
            occupancyStatus: "Occupied",
            allocationStatus: a.status,
            bedNumber: a.bedNumber
          });
        });
      } else {
        rows.push({
          id: r.id,
          roomId: r.id,
          studentId: "",
          roomNumber: r.roomNumber,
          studentName: "",
          department: "",
          floor: r.floor,
          roomType: r.roomType || r.type || "Double",
          occupancyStatus: "Available",
          allocationStatus: "",
          bedNumber: ""
        });
      }
    });
    return rows;
  }, [roomsList]);

  const availableRoomsList = useMemo(() => {
    return roomsList.filter((r) => r.occupants < r.capacity).slice(0, 5);
  }, [roomsList]);

  // Sorting & Pagination (Room Management tab)
  const sortedRooms = useMemo(() => {
    const rooms = [...manageRoomsList];
    rooms.sort((a, b) => {
      let valA: any = a[sortBy as keyof RoomRecord] || "";
      let valB: any = b[sortBy as keyof RoomRecord] || "";

      if (sortBy === "roomNumber") {
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * (sortOrder === "asc" ? 1 : -1);
      }
      
      if (typeof valA === "string") {
        return valA.localeCompare(valB) * (sortOrder === "asc" ? 1 : -1);
      }
      
      return (valA - valB) * (sortOrder === "asc" ? 1 : -1);
    });
    return rooms;
  }, [manageRoomsList, sortBy, sortOrder]);

  const paginatedRooms = useMemo(() => {
    const start = (roomPage - 1) * roomLimit;
    return sortedRooms.slice(start, start + roomLimit);
  }, [sortedRooms, roomPage]);

  const totalRoomPages = Math.ceil(sortedRooms.length / roomLimit) || 1;

  const roomOccupancyData = chartData?.roomOccupancyData || [];
  const hostelActivities = chartData?.hostelActivities || [];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Allocation & Management"
        desc="Manage room configurations, bed capacities, availability status, and resident allocations."
        actions={
          <div className="flex gap-2">
            {activeTab === "rooms" ? (
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setIsRoomFormOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
              >
                <Plus className="size-4" /> Add Room
              </button>
            ) : (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
              >
                <Plus className="size-4" /> Add Allocation
              </button>
            )}
          </div>
        }
      />

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: "allocations", label: "Room Allocations", icon: Bed },
          { id: "rooms", label: "Room Management", icon: Building2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "allocations" ? (
        <>
          {/* Allocation Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Total Rooms", value: totalRooms, tone: "info" as const },
              { label: "Occupied Rooms", value: occupiedRooms, tone: "success" as const },
              { label: "Available Rooms", value: availableRoomsCount, tone: "warn" as const },
              { label: "Occupancy Rate", value: occupancyRate, tone: "success" as const },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <Badge tone={stat.tone} className="mt-3">
                  Current
                </Badge>
              </Card>
            ))}
          </div>

          {/* Allocation Filters */}
          <Card>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search by room number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
              >
                {["All Floors", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
              >
                {["All Blocks", "Block A", "Block B", "Block C", "Block D"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
              >
                {["All Status", "Occupied", "Available"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Allocation Main Section */}
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="font-semibold mb-4 text-left">Room Allocation Table</h3>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading room allocations...</span>
                </div>
              ) : isError ? (
                <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
                  <AlertCircle className="size-8 mx-auto text-rose-500" />
                  <p>{error instanceof Error ? error.message : "Failed to load rooms."}</p>
                </div>
              ) : tableRows.length === 0 ? (
                <div className="py-12 px-6 text-center text-sm text-muted-foreground">
                  No rooms found matching the criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        {[
                          "Room Number",
                          "Student Name",
                          "Department",
                          "Floor",
                          "Room Type",
                          "Occupancy Status",
                          "Actions",
                        ].map((column) => (
                          <th
                            key={column}
                            className="text-left py-3 px-4 font-semibold text-muted-foreground"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y text-left">
                      {tableRows.map((allocation, index) => (
                        <tr key={`${allocation.roomNumber}-${index}`} className="hover:bg-accent/50 transition">
                          <td className="py-3 px-4 font-medium">{allocation.roomNumber}</td>
                          <td className="py-3 px-4">
                            {allocation.studentName || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="py-3 px-4">
                            {allocation.department ? (
                              <Badge tone="info">{allocation.department}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{allocation.floor}</td>
                          <td className="py-3 px-4">{allocation.roomType}</td>
                          <td className="py-3 px-4">
                            <Badge tone={allocation.occupancyStatus === "Occupied" ? "success" : "warn"}>
                              {allocation.occupancyStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 flex gap-1.5 items-center">
                            {allocation.occupancyStatus === "Occupied" ? (
                              <>
                                {allocation.allocationStatus === "Active" ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setTransferTarget(allocation);
                                        setTransferHostelId(roomsList.find(r => r.id === allocation.roomId)?.hostelId || "");
                                        setTransferBlockId(roomsList.find(r => r.id === allocation.roomId)?.blockId || "");
                                        setTransferRoomId(allocation.roomId);
                                        setTransferBedNumber(allocation.bedNumber || 1);
                                        setIsTransferOpen(true);
                                      }}
                                      className="px-2.5 py-1 text-xs border border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer font-semibold"
                                    >
                                      Transfer
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to check-out ${allocation.studentName}?`)) {
                                          checkOutMutation.mutate(allocation.id);
                                        }
                                      }}
                                      className="px-2.5 py-1 text-xs border border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition cursor-pointer font-semibold"
                                    >
                                      Check-Out
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to cancel the allocation for ${allocation.studentName}?`)) {
                                          cancelAllocMutation.mutate(allocation.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-accent rounded text-rose-500 hover:text-rose-600 transition cursor-pointer"
                                      title="Cancel Allocation"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground">{allocation.allocationStatus}</span>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => setIsFormOpen(true)}
                                className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition cursor-pointer font-semibold"
                              >
                                Allocate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="size-5 text-indigo" />
                <h3 className="font-semibold text-left">Available Rooms</h3>
              </div>
              <div className="space-y-2">
                {availableRoomsList.map((room) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{room.roomNumber}</span>
                      <Badge tone="success">Available</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Floor {room.floor} • {room.type} • Capacity: {room.capacity} (Occupied: {room.occupants})
                    </div>
                  </div>
                ))}
                {availableRoomsList.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6">
                    No available rooms found
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bed className="size-5 text-indigo" />
                <h3 className="font-semibold text-left">Room Occupancy Analytics</h3>
              </div>
              <div className="h-64">
                {roomOccupancyData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No analytics data available
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <User className="size-5 text-indigo" />
                <h3 className="font-semibold text-left">Allocation History</h3>
              </div>
              <div className="space-y-2 max-h-[256px] overflow-y-auto">
                {hostelActivities
                  .filter(a => a.type === "Allocation" || a.type === "Removal")
                  .slice(0, 5)
                  .map((history, idx) => (
                    <div
                      key={`${history.target}-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition text-left"
                    >
                      <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0">
                        {history.target
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{history.target}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {history.action} • {history.time}
                        </div>
                      </div>
                      <Badge tone={history.type === "Allocation" ? "success" : "danger"}>
                        {history.type === "Allocation" ? "Allocated" : "Vacated"}
                      </Badge>
                    </div>
                  ))}
                {hostelActivities.filter(a => a.type === "Allocation" || a.type === "Removal").length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-12">
                    No allocation history logs
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Room Management Tab View */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Total Rooms", value: String(sortedRooms.length), tone: "info" as const },
              { label: "Vacant Rooms", value: String(sortedRooms.filter(r => r.roomStatus === "Vacant").length), tone: "success" as const },
              { label: "Occupied Rooms", value: String(sortedRooms.filter(r => r.roomStatus === "Fully Occupied" || r.roomStatus === "Partially Occupied").length), tone: "warn" as const },
              { label: "Maintenance", value: String(sortedRooms.filter(r => r.roomStatus === "Maintenance").length), tone: "danger" as const },
            ].map((stat) => (
              <Card key={stat.label}>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <Badge tone={stat.tone} className="mt-3">
                  Current
                </Badge>
              </Card>
            ))}
          </div>

          {/* Room Filters & Advanced Search */}
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    placeholder="Search room by number..."
                    value={roomSearch}
                    onChange={(e) => {
                      setRoomSearch(e.target.value);
                      setRoomPage(1);
                    }}
                    className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={roomBlock}
                    onChange={(e) => { setRoomBlock(e.target.value); setRoomPage(1); }}
                    className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
                  >
                    <option value="All">All Blocks</option>
                    {blockOptions.map((b: any) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>

                  <select
                    value={roomFloor}
                    onChange={(e) => { setRoomFloor(e.target.value); setRoomPage(1); }}
                    className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
                  >
                    {["All", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"].map((f) => (
                      <option key={f} value={f === "All" ? "All" : f}>{f === "All" ? "All Floors" : f}</option>
                    ))}
                  </select>

                  <select
                    value={roomStatus}
                    onChange={(e) => { setRoomStatus(e.target.value); setRoomPage(1); }}
                    className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Partially Occupied">Partially Occupied</option>
                    <option value="Fully Occupied">Fully Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>

                  <select
                    value={roomType}
                    onChange={(e) => { setRoomType(e.target.value); setRoomPage(1); }}
                    className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
                  >
                    <option value="All">All Types</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Dormitory">Dormitory</option>
                  </select>

                  <select
                    value={roomAcType}
                    onChange={(e) => { setRoomAcType(e.target.value); setRoomPage(1); }}
                    className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary text-foreground bg-background"
                  >
                    <option value="All">All AC Status</option>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Rooms List Table */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-left">Room Inventory Directory</h3>
              <div className="text-xs text-muted-foreground">Showing {paginatedRooms.length} of {sortedRooms.length} rooms</div>
            </div>

            {isManageLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="size-8 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Loading room directory...</span>
              </div>
            ) : isManageError ? (
              <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
                <AlertCircle className="size-8 mx-auto text-rose-500" />
                <p>{manageError instanceof Error ? manageError.message : "Failed to load rooms."}</p>
              </div>
            ) : paginatedRooms.length === 0 ? (
              <div className="py-12 px-6 text-center text-sm text-muted-foreground">
                No rooms found matching filters.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        {[
                          { label: "Room Number", field: "roomNumber" },
                          { label: "Hostel Block", field: "blockName" },
                          { label: "Floor", field: "floor" },
                          { label: "AC/Non-AC", field: "acType" },
                          { label: "Room Type", field: "roomType" },
                          { label: "Capacity (Beds)", field: "capacity" },
                          { label: "Current Occupants", field: "occupants" },
                          { label: "Status", field: "roomStatus" },
                          { label: "Actions", field: null }
                        ].map((col) => (
                          <th
                            key={col.label}
                            className="text-left py-3 px-4 font-semibold text-muted-foreground"
                          >
                            {col.field ? (
                              <button
                                onClick={() => handleSort(col.field)}
                                className="flex items-center gap-1 hover:text-foreground cursor-pointer"
                              >
                                <span>{col.label}</span>
                                <ArrowUpDown className="size-3" />
                              </button>
                            ) : (
                              <span>{col.label}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y text-left">
                      {paginatedRooms.map((room) => {
                        const isFull = room.occupants >= room.capacity;
                        const badgeTone =
                          room.roomStatus === "Maintenance" ? "danger" :
                          room.roomStatus === "Fully Occupied" ? "danger" :
                          room.roomStatus === "Partially Occupied" ? "warn" : "success";

                        return (
                          <tr key={room.id} className="hover:bg-accent/50 transition">
                            <td className="py-3 px-4 font-semibold">{room.roomNumber}</td>
                            <td className="py-3 px-4">{room.blockName}</td>
                            <td className="py-3 px-4">Floor {room.floor}</td>
                            <td className="py-3 px-4">
                              <Badge tone={room.acType === "AC" ? "info" : "warn"}>{room.acType}</Badge>
                            </td>
                            <td className="py-3 px-4">{room.roomType || "Double"}</td>
                            <td className="py-3 px-4 font-medium">{room.capacity} beds</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold">{room.occupants}</span> / {room.capacity}
                            </td>
                            <td className="py-3 px-4">
                              <Badge tone={badgeTone}>
                                {room.roomStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 flex gap-1.5 items-center">
                              <button
                                onClick={() => setViewingRoom(room)}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                                title="View details"
                              >
                                <Eye className="size-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingRoom(room)}
                                className="p-1 hover:bg-accent rounded text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                                title="Edit configuration"
                              >
                                <Edit className="size-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) {
                                    deleteRoomMutation.mutate(room.id);
                                  }
                                }}
                                disabled={room.occupants > 0}
                                className="p-1 hover:bg-accent rounded text-rose-500 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                title="Delete Room"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalRoomPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t shrink-0">
                    <button
                      onClick={() => setRoomPage(prev => Math.max(1, prev - 1))}
                      disabled={roomPage === 1}
                      className="px-3.5 py-1.5 border rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 hover:bg-accent transition"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted-foreground">Page {roomPage} of {totalRoomPages}</span>
                    <button
                      onClick={() => setRoomPage(prev => Math.min(totalRoomPages, prev + 1))}
                      disabled={roomPage === totalRoomPages}
                      className="px-3.5 py-1.5 border rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 hover:bg-accent transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── Modal Dialog Dialogs ────────────────────────────────────────────────── */}

      {/* Add Allocation Student Form Modal */}
      <StudentFormModal
        open={isFormOpen}
        mode="create"
        student={null}
        departments={departments}
        submitting={createMutation.isPending}
        isHostelWarden={true}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Transfer Resident Modal */}
      {isTransferOpen && transferTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex justify-between items-center border-b p-4 px-5">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
                <span>Transfer: {transferTarget.studentName}</span>
              </h3>
              <button
                onClick={() => {
                  setIsTransferOpen(false);
                  setTransferTarget(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Hostel</label>
                <select
                  value={transferHostelId}
                  onChange={(e) => setTransferHostelId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-primary outline-none cursor-pointer text-foreground bg-background"
                >
                  <option value="">Select Hostel</option>
                  {hostelsList.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Block</label>
                <select
                  value={transferBlockId}
                  onChange={(e) => setTransferBlockId(e.target.value)}
                  disabled={!transferHostelId}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-50 cursor-pointer text-foreground bg-background"
                >
                  <option value="">Select Block</option>
                  {transferBlocksList.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Room</label>
                <select
                  value={transferRoomId}
                  onChange={(e) => setTransferRoomId(e.target.value)}
                  disabled={!transferBlockId}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-50 cursor-pointer text-foreground bg-background"
                >
                  <option value="">Select Room</option>
                  {transferRoomsList.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.room_number || r.roomNumber} ({r.type}, Occ: {r.occupants}/{r.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Bed Number</label>
                <select
                  value={transferBedNumber}
                  onChange={(e) => setTransferBedNumber(Number(e.target.value))}
                  disabled={!transferRoomId}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-primary outline-none disabled:opacity-50 cursor-pointer text-foreground bg-background"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>Bed {n}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferOpen(false);
                    setTransferTarget(null);
                  }}
                  className="flex-1 px-3 py-2.5 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!transferRoomId || !transferBedNumber) {
                      toast.error("Please select a target room and bed number.");
                      return;
                    }
                    transferMutation.mutate({
                      allocationId: transferTarget.id,
                      newRoomId: transferRoomId,
                      newBedNumber: transferBedNumber
                    });
                  }}
                  disabled={transferMutation.isPending}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {transferMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Execute Transfer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {isRoomFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b p-4 px-5 shrink-0">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
                <span>{editingRoom ? `Edit Room: ${editingRoom.roomNumber}` : "Add New Room"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsRoomFormOpen(false);
                  setEditingRoom(null);
                  resetRoomForm();
                }}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleRoomFormSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101"
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Hostel Block *</label>
                <select
                  required
                  value={formBlockId}
                  onChange={(e) => setFormBlockId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none cursor-pointer text-foreground bg-background"
                >
                  <option value="">Select Block</option>
                  {blockOptions.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Floor Number *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formFloor}
                    onChange={(e) => setFormFloor(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Capacity (Beds) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Room Type *</label>
                  <select
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none cursor-pointer text-foreground bg-background"
                  >
                    <option value="Single">Single Bed</option>
                    <option value="Double">Double Bed</option>
                    <option value="Triple">Triple Bed</option>
                    <option value="Dormitory">Dormitory</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">AC Status *</label>
                  <select
                    value={formAcType}
                    onChange={(e) => setFormAcType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none cursor-pointer text-foreground bg-background"
                  >
                    <option value="AC">AC Room</option>
                    <option value="Non-AC">Non-AC Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Room Status *</label>
                <select
                  value={formRoomStatus}
                  onChange={(e) => setFormRoomStatus(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none cursor-pointer text-foreground bg-background"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Partially Occupied">Partially Occupied</option>
                  <option value="Fully Occupied">Fully Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  placeholder="e.g. Near elevators, quiet room"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none h-16 resize-none text-foreground"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoomFormOpen(false);
                    setEditingRoom(null);
                    resetRoomForm();
                  }}
                  className="flex-1 px-3 py-2.5 rounded-xl border text-muted-foreground hover:bg-gradient-soft text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {(createRoomMutation.isPending || updateRoomMutation.isPending) && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{editingRoom ? "Save Changes" : "Create Room"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Room Details Modal */}
      {viewingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex justify-between items-center border-b p-4 px-5">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
                <span>Room Details: {viewingRoom.roomNumber}</span>
              </h3>
              <button
                onClick={() => setViewingRoom(null)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer w-7 h-7 rounded-full hover:bg-accent flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Block</span>
                  <span className="font-bold text-foreground">{viewingRoom.blockName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Floor</span>
                  <span className="font-bold text-foreground">Floor {viewingRoom.floor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Room Type</span>
                  <span className="font-bold text-foreground">{viewingRoom.roomType || "Double"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">AC Status</span>
                  <span className="font-bold text-foreground">{viewingRoom.acType || "Non-AC"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Capacity</span>
                  <span className="font-bold text-foreground">{viewingRoom.capacity} beds</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-medium">Occupancy</span>
                  <span className="font-bold text-foreground">{viewingRoom.occupants} occupants</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Available Beds:</span>
                  <span className="text-teal-600 font-bold">{Math.max(0, viewingRoom.capacity - viewingRoom.occupants)} beds</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">Room Status:</span>
                  <Badge tone={
                    viewingRoom.roomStatus === "Maintenance" ? "danger" :
                    viewingRoom.roomStatus === "Fully Occupied" ? "danger" :
                    viewingRoom.roomStatus === "Partially Occupied" ? "warn" : "success"
                  }>
                    {viewingRoom.roomStatus || "Vacant"}
                  </Badge>
                </div>
              </div>

              {viewingRoom.description && (
                <div className="text-xs border rounded-xl p-3 bg-muted/20">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider mb-1">Description</span>
                  <span className="text-foreground">{viewingRoom.description}</span>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Occupants</h4>
                {viewingRoom.allocations && viewingRoom.allocations.filter((a: any) => a.status === "Active").length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {viewingRoom.allocations.filter((a: any) => a.status === "Active").map((alloc: any) => (
                      <div key={alloc.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl border bg-background/50">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{alloc.studentName}</span>
                          <span className="text-[10px] text-muted-foreground">({alloc.department})</span>
                        </div>
                        <Badge tone="info">Bed {alloc.bedNumber}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-xl">
                    No active occupants allocated to this room.
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewingRoom(null)}
                  className="w-full px-3 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-gradient-soft text-xs transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
