import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bed, Plus, Search, Building2, User, Loader2, AlertCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchHostelRooms,
  fetchStats,
  fetchDashboardCharts,
  createResident,
} from "@/services/hostelService";
import { fetchDepartments } from "@/services/studentService";
import { StudentFormModal } from "../dashboard/students/StudentDialogs";

export function HostelRooms() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [selectedBlock, setSelectedBlock] = useState("All Blocks");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: statsList = [] } = useQuery({
    queryKey: ["hostel-stats"],
    queryFn: fetchStats,
  });

  const { data: chartData } = useQuery({
    queryKey: ["hostel-charts"],
    queryFn: fetchDashboardCharts,
  });

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
  });

  // Allocation mutation
  const createMutation = useMutation({
    mutationFn: ({ student, allocation }: { student: any; allocation: any }) =>
      createResident(student, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
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

  // Compute stats values
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
            roomNumber: r.roomNumber,
            studentName: a.studentName,
            department: a.department,
            floor: r.floor,
            roomType: r.type,
            occupancyStatus: "Occupied",
          });
        });
      } else {
        rows.push({
          id: r.id,
          roomNumber: r.roomNumber,
          studentName: "",
          department: "",
          floor: r.floor,
          roomType: r.type,
          occupancyStatus: "Available",
        });
      }
    });
    return rows;
  }, [roomsList]);

  const availableRoomsList = useMemo(() => {
    return roomsList.filter((r) => r.occupants < r.capacity).slice(0, 5);
  }, [roomsList]);

  const roomOccupancyData = chartData?.roomOccupancyData || [];
  const hostelActivities = chartData?.hostelActivities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Allocation"
        desc="Manage room assignments, availability status, and allocation history."
        actions={
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Add Allocation
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Rooms", value: totalRooms, tone: "info" as const },
          { label: "Occupied", value: occupiedRooms, tone: "success" as const },
          { label: "Available", value: availableRoomsCount, tone: "warn" as const },
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
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Floors", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Blocks", "Block A", "Block B", "Block C", "Block D"].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Status", "Occupied", "Available"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Room Allocation Table</h3>
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
                <tbody className="divide-y">
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
                      <td className="py-3 px-4">
                        <span className="text-xs text-muted-foreground">Active</span>
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
            <h3 className="font-semibold">Available Rooms</h3>
          </div>
          <div className="space-y-2">
            {availableRoomsList.map((room) => (
              <div
                key={room.id}
                className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition cursor-pointer"
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
            <h3 className="font-semibold">Room Occupancy Analytics</h3>
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
            <h3 className="font-semibold">Allocation History</h3>
          </div>
          <div className="space-y-2 max-h-[256px] overflow-y-auto">
            {hostelActivities
              .filter(a => a.type === "Allocation" || a.type === "Removal")
              .slice(0, 5)
              .map((history, idx) => (
                <div
                  key={`${history.target}-${idx}`}
                  className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
                >
                  <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                    {history.target
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{history.target}</div>
                    <div className="text-xs text-muted-foreground">
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

      {/* Form Dialog Modal */}
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
    </div>
  );
}
