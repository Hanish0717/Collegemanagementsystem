import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, CheckCircle2, XCircle, Clock, Search, Calendar, Save, Filter, RefreshCw
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import { 
  fetchHostelAttendance, 
  markHostelAttendance, 
  fetchHostelAttendanceStats,
  fetchHostelBlocks,
  fetchRoomsForBlock
} from "@/services/hostelService";

export function HostelAttendance() {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split("T")[0];

  // Search & Filter State
  const [date, setDate] = useState(todayStr);
  const [blockId, setBlockId] = useState("All Blocks");
  const [roomId, setRoomId] = useState("All Rooms");
  const [search, setSearch] = useState("");

  // Queries
  const { data: hostelsData = [] } = useQuery({
    queryKey: ["hostels"],
    queryFn: async () => {
      // Just fetch hostels so we have fallback boys hostel id
      const { fetchHostels } = await import("@/services/hostelService");
      return fetchHostels();
    }
  });

  const activeHostelId = hostelsData[0]?.id || "h-boys";

  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks", activeHostelId],
    queryFn: () => fetchHostelBlocks(activeHostelId),
    enabled: !!activeHostelId
  });

  const selectedBlockUuid = blocks.find((b: any) => b.name === blockId || b.id === blockId)?.id || "";

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms", selectedBlockUuid],
    queryFn: () => fetchRoomsForBlock(selectedBlockUuid),
    enabled: !!selectedBlockUuid
  });

  const {
    data: attendanceResponse = { data: [] },
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["hostel-attendance", date, blockId, roomId, search],
    queryFn: () => fetchHostelAttendance({ date, blockId, roomId, search }),
    placeholderData: (prev) => prev
  });

  const { data: stats = { totalResidents: 0, present: 0, absent: 0, onLeave: 0, attendanceRate: 100 } } = useQuery({
    queryKey: ["hostel-attendance-stats", date, blockId],
    queryFn: () => fetchHostelAttendanceStats({ date, blockId })
  });

  // Local state for temporary changes to remarks
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});

  // Mutations
  const markMutation = useMutation({
    mutationFn: (payload: { studentId: string; hostelId: string; roomId: string; date: string; status: "Present" | "Absent" | "On Leave"; remarks?: string }) =>
      markHostelAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-attendance-stats"] });
      toast.success("Attendance updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save attendance");
    }
  });

  const residents = attendanceResponse.data || [];

  const handleStatusChange = (
    studentId: string, 
    hostelId: string, 
    roomId: string, 
    newStatus: "Present" | "Absent" | "On Leave"
  ) => {
    const currentRemarks = remarksState[studentId] !== undefined 
      ? remarksState[studentId] 
      : (residents.find((r: any) => r.studentId === studentId)?.remarks || "");

    markMutation.mutate({
      studentId,
      hostelId,
      roomId,
      date,
      status: newStatus,
      remarks: currentRemarks
    });
  };

  const handleRemarksBlur = (
    studentId: string, 
    hostelId: string, 
    roomId: string, 
    currentStatus: "Present" | "Absent" | "On Leave",
    value: string
  ) => {
    markMutation.mutate({
      studentId,
      hostelId,
      roomId,
      date,
      status: currentStatus,
      remarks: value
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Daily Attendance"
        desc="Mark and monitor student presence in the hostel blocks."
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="flex items-center gap-4 p-4 border bg-gradient-soft">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo">
            <Users className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalResidents}</div>
            <div className="text-xs text-muted-foreground">Total Residents</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border bg-gradient-soft">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.present}</div>
            <div className="text-xs text-muted-foreground">Present Today</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border bg-gradient-soft">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose">
            <XCircle className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.absent}</div>
            <div className="text-xs text-muted-foreground">Absent Today</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border bg-gradient-soft">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.onLeave}</div>
            <div className="text-xs text-muted-foreground">On Leave</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4 border bg-gradient-soft">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet">
            <RefreshCw className="size-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <div className="text-xs text-muted-foreground">Attendance Rate</div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 border">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-background shadow-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium"
              />
            </div>

            {/* Block Filter */}
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-background shadow-sm">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={blockId}
                onChange={(e) => {
                  setBlockId(e.target.value);
                  setRoomId("All Rooms");
                }}
                className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium cursor-pointer"
              >
                <option value="All Blocks">All Blocks</option>
                {blocks.map((b: any) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-background shadow-sm">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium cursor-pointer"
                disabled={blockId === "All Blocks"}
              >
                <option value="All Rooms">All Rooms</option>
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>Room {r.room_number}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden border">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <RefreshCw className="size-8 animate-spin text-indigo" />
            <span className="text-sm font-medium">Fetching active resident list...</span>
          </div>
        ) : residents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="size-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">No residents found matching active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Room & Block</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {residents.map((r: any) => {
                  const localRemarks = remarksState[r.studentId] !== undefined 
                    ? remarksState[r.studentId] 
                    : (r.remarks || "");

                  return (
                    <tr key={r.studentId} className="hover:bg-accent/40 transition">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-indigo-500/10 text-indigo flex items-center justify-center font-bold text-sm">
                            {r.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{r.fullName}</div>
                            <div className="text-xs text-muted-foreground font-normal">{r.rollNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">Room {r.roomNumber}</div>
                        <div className="text-xs text-muted-foreground">{r.blockName} • Bed {r.bedNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl w-fit border shadow-sm">
                          <button
                            onClick={() => handleStatusChange(r.studentId, r.hostelId, r.roomId, "Present")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              r.status === "Present"
                                ? "bg-emerald-500 text-white shadow-soft"
                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                            }`}
                          >
                            <CheckCircle2 className="size-3.5" />
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(r.studentId, r.hostelId, r.roomId, "Absent")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              r.status === "Absent"
                                ? "bg-rose-500 text-white shadow-soft"
                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                            }`}
                          >
                            <XCircle className="size-3.5" />
                            Absent
                          </button>
                          <button
                            onClick={() => handleStatusChange(r.studentId, r.hostelId, r.roomId, "On Leave")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              r.status === "On Leave"
                                ? "bg-amber-500 text-white shadow-soft"
                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                            }`}
                          >
                            <Clock className="size-3.5" />
                            Leave
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Add warden note..."
                            value={localRemarks}
                            onChange={(e) => setRemarksState({
                              ...remarksState,
                              [r.studentId]: e.target.value
                            })}
                            onBlur={(e) => handleRemarksBlur(r.studentId, r.hostelId, r.roomId, r.status, e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-1 placeholder:text-muted-foreground/60 text-foreground"
                          />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                            <Save className="size-3.5" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
