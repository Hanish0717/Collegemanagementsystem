import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Phone, Mail, MapPin, Activity, GraduationCap, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchResidents,
  createResident,
  updateResident,
  deleteResident,
  fetchStats,
} from "@/services/hostelService";
import { fetchDepartments } from "@/services/studentService";
import {
  StudentFormModal,
  StudentDeleteAlert,
} from "../students/StudentDialogs";

export function HostelStudents() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  const { data: statsList = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ["hostel-stats"],
    queryFn: fetchStats,
  });

  const {
    data: residentsList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["residents", search, selectedDept, selectedStatus, selectedFloor],
    queryFn: () =>
      fetchResidents({
        search,
        department: selectedDept,
        status: selectedStatus,
        floor: selectedFloor,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: ({ student, allocation }: { student: any; allocation: any }) =>
      createResident(student, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["fees-lookup"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Resident added and room allocated successfully!");
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create resident");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      allocationId,
      studentId,
      student,
      allocation,
    }: {
      allocationId: string;
      studentId: string;
      student: any;
      allocation: any;
    }) => updateResident(allocationId, studentId, student, allocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Resident updated successfully!");
      setIsFormOpen(false);
      setEditingResident(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update resident");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ allocationId, roomId, studentName }: { allocationId: string; roomId: string; studentName: string }) =>
      deleteResident(allocationId, roomId, studentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["fees-lookup"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Resident removed and room vacated successfully!");
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove resident");
    },
  });

  const openCreateModal = () => {
    setEditingResident(null);
    setIsFormOpen(true);
  };

  const openEditModal = (resident: any) => {
    setEditingResident(resident);
    setIsFormOpen(true);
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

    if (editingResident) {
      updateMutation.mutate({
        allocationId: editingResident.id,
        studentId: editingResident.studentId,
        student: studentData,
        allocation: allocationData,
      });
    } else {
      createMutation.mutate({
        student: studentData,
        allocation: allocationData,
      });
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // Dynamic statistics
  const totalStudents = statsList.find((s) => s.label === "Hostel Students")?.value || "0";
  const activeCount = residentsList.filter((r) => r.status === "Active").length;
  const warningCount = residentsList.filter((r) => parseInt(r.attendance) < 75).length;
  const inactiveCount = residentsList.filter((r) => r.status === "Vacated").length;

  const averageAttendance = useMemo(() => {
    if (!residentsList.length) return "0%";
    const sum = residentsList.reduce((acc, r) => acc + parseInt(r.attendance || "100"), 0);
    return `${Math.round(sum / residentsList.length)}%`;
  }, [residentsList]);

  const studentAnalytics = useMemo(() => {
    const counts: Record<string, number> = {};
    residentsList.forEach((r) => {
      counts[r.department] = (counts[r.department] || 0) + 1;
    });
    return Object.entries(counts).map(([department, count]) => ({
      department,
      count,
    }));
  }, [residentsList]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Students"
        desc="Manage hostel student profiles, room allocations, and attendance."
        actions={
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Users className="size-4" /> Add Student
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: totalStudents, tone: "info" as const },
          { label: "Active Residents", value: String(activeCount), tone: "success" as const },
          { label: "Warning (Low Attendance)", value: String(warningCount), tone: "warn" as const },
          { label: "Vacated", value: String(inactiveCount), tone: "danger" as const },
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
              placeholder="Search by student name, ID, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            <option>All Departments</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Status", "Active", "Vacated", "Suspended"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Floors", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="size-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading residents...</span>
        </div>
      ) : isError ? (
        <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
          <AlertCircle className="size-8 mx-auto text-rose-500" />
          <p>{error instanceof Error ? error.message : "Failed to load residents."}</p>
        </div>
      ) : residentsList.length === 0 ? (
        <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-2">
          <Users className="size-8 mx-auto text-muted-foreground" />
          <p>No residents found matching the criteria.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold mb-4">Hostel Resident Cards</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {residentsList.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer flex flex-col justify-between"
                  onClick={() => openEditModal(student)}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center text-sm font-semibold">
                          {initials(student.fullName)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{student.fullName}</div>
                          <div className="text-[11px] text-muted-foreground">{student.department}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          tone={
                            student.status === "Active"
                              ? "success"
                              : student.status === "Suspended"
                                ? "danger"
                                : "warn"
                          }
                        >
                          {student.status}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(student);
                            }}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                            title="Edit Resident"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(student);
                            }}
                            className="p-1 hover:bg-accent rounded text-rose-500 hover:text-rose-600 transition cursor-pointer"
                            title="Vacate Room"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        Room {student.roomNumber} • Bed {student.bedNumber} • Floor {student.floor}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="size-3" />
                        Attendance: {student.attendance}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        Emergency: {student.emergencyContact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="size-5 text-indigo" />
              <h3 className="font-semibold text-sm">Department Distribution</h3>
            </div>
            <div className="space-y-3">
              {studentAnalytics.map((dept) => (
                <div key={dept.department} className="flex justify-between items-center text-xs p-2 rounded-lg border bg-background/50">
                  <span className="font-medium text-muted-foreground">{dept.department}</span>
                  <Badge tone="info">{dept.count} Students</Badge>
                </div>
              ))}
              {studentAnalytics.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-8">
                  No department metrics
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Emergency and Summary Cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Emergency Contacts</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {residentsList.slice(0, 5).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft"
              >
                <div>
                  <div className="text-sm font-medium">{student.fullName}</div>
                  <div className="text-xs text-muted-foreground">Room: {student.roomNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{student.emergencyContact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Quick Student Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Average Attendance", value: averageAttendance, icon: "📊" },
              { label: "Room Occupancy Rate", value: statsList.find((s) => s.label === "Occupied Rooms") ? `${Math.round((parseInt(statsList.find((s) => s.label === "Occupied Rooms")?.value || "0") / parseInt(statsList.find((s) => s.label === "Total Rooms")?.value || "250")) * 100)}%` : "79%", icon: "🏠" },
              { label: "Fee Compliance", value: "95%", icon: "💰" },
              { label: "Complaint Rate", value: "12%", icon: "📝" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-gradient-soft border">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-base font-bold mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Form Dialog Modal */}
      <StudentFormModal
        open={isFormOpen}
        mode={editingResident ? "edit" : "create"}
        student={editingResident}
        departments={departments}
        submitting={createMutation.isPending || updateMutation.isPending}
        isHostelWarden={true}
        onClose={() => {
          setIsFormOpen(false);
          setEditingResident(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Delete/Vacate Dialog */}
      <StudentDeleteAlert
        open={Boolean(deleteTarget)}
        studentName={deleteTarget?.fullName ?? "this student"}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          deleteMutation.mutate({
            allocationId: deleteTarget.id,
            roomId: deleteTarget.roomId,
            studentName: deleteTarget.fullName,
          });
        }}
      />
    </div>
  );
}
