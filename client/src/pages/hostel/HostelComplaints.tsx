import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertOctagon,
  TrendingUp,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchHostelComplaints,
  updateComplaintStatus,
  createComplaint,
  fetchResidents,
} from "@/services/hostelService";

export function HostelComplaints() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPriority, setSelectedPriority] = useState("All Priority");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Complaint Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("Maintenance");
  const [newPriority, setNewPriority] = useState("Medium");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Queries
  const {
    data: complaintsList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["complaints", search, selectedCategory, selectedPriority, selectedStatus],
    queryFn: () =>
      fetchHostelComplaints({
        search,
        category: selectedCategory,
        priority: selectedPriority,
        status: selectedStatus,
      }),
  });

  const { data: residents = [] } = useQuery({
    queryKey: ["residents-lookup"],
    queryFn: () => fetchResidents(),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Pending" | "In-Progress" | "Resolved" }) =>
      updateComplaintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      toast.success("Complaint status updated!");
      setSelectedComplaint(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update complaint status");
    },
  });

  const createComplaintMutation = useMutation({
    mutationFn: (payload: any) => createComplaint(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-charts"] });
      toast.success("Complaint registered successfully!");
      setIsCreateOpen(false);
      // Reset
      setNewTitle("");
      setNewDesc("");
      setSelectedStudentId("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create complaint");
    },
  });

  // Stats
  const totalCount = complaintsList.length;
  const resolvedCount = complaintsList.filter((c) => c.status === "Resolved").length;
  const inProgressCount = complaintsList.filter((c) => c.status === "In-Progress").length;
  const pendingCount = complaintsList.filter((c) => c.status === "Pending").length;

  const complaintAnalytics = useMemo(() => {
    const counts: Record<string, number> = {
      Maintenance: 0,
      Mess: 0,
      Security: 0,
      Electrical: 0,
      Other: 0,
    };
    complaintsList.forEach((c) => {
      const cat = c.category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.Other++;
      }
    });
    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));
  }, [complaintsList]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    const resident = residents.find((r) => r.studentId === selectedStudentId);

    const payload = {
      student_id: selectedStudentId || null,
      room_id: resident?.roomId || null,
      hostel_id: resident?.hostelId || null,
      title: newTitle,
      description: newDesc,
      category: newCat,
      priority: newPriority,
      status: "Pending",
    };

    createComplaintMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaint Management"
        desc="Track, manage, and resolve student complaints efficiently."
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> New Complaint
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: String(totalCount), tone: "info" as const },
          { label: "Resolved", value: String(resolvedCount), tone: "success" as const },
          { label: "In Progress", value: String(inProgressCount), tone: "warn" as const },
          { label: "Pending", value: String(pendingCount), tone: "danger" as const },
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
              placeholder="Search by complaint title or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Categories", "Maintenance", "Mess", "Security", "Electrical", "Other"].map(
              (c) => (
                <option key={c} value={c}>{c}</option>
              ),
            )}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Priority", "High", "Medium", "Low"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Status", "Resolved", "In-Progress", "Pending"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Complaint List</h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading complaints...</span>
            </div>
          ) : isError ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
              <AlertCircle className="size-8 mx-auto text-rose-500" />
              <p>{error instanceof Error ? error.message : "Failed to load complaints."}</p>
            </div>
          ) : complaintsList.length === 0 ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground">
              No complaints found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {[
                      "Complaint ID",
                      "Student Name",
                      "Category",
                      "Title",
                      "Priority",
                      "Status",
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
                  {complaintsList.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium text-xs">#{complaint.id.substring(0, 8)}</td>
                      <td className="py-3 px-4">{complaint.studentName}</td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{complaint.category}</Badge>
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate">{complaint.title}</td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            complaint.priority === "High"
                              ? "danger"
                              : complaint.priority === "Medium"
                                ? "warn"
                                : "success"
                          }
                        >
                          {complaint.priority || "Medium"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            complaint.status === "Resolved"
                              ? "success"
                              : complaint.status === "In-Progress"
                                ? "warn"
                                : "info"
                          }
                        >
                          {complaint.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
                        >
                          View
                        </button>
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
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Complaint Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={complaintAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Pending Complaints</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {complaintsList
              .filter((c) => c.status === "Pending")
              .map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="p-3 rounded-xl border bg-gradient-soft hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{complaint.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {complaint.studentName} • {complaint.category}
                      </div>
                    </div>
                    <Badge tone={complaint.priority === "High" ? "danger" : "warn"}>
                      {complaint.priority || "Medium"}
                    </Badge>
                  </div>
                </div>
              ))}
            {complaintsList.filter((c) => c.status === "Pending").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No pending complaints
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertOctagon className="size-5 text-indigo" />
            <h3 className="font-semibold">High Priority Complaints</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {complaintsList
              .filter((c) => c.priority === "High" && c.status !== "Resolved")
              .map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="p-3 rounded-xl border bg-rose-500/5 border-rose-500/20 hover:bg-accent/50 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-rose-500">{complaint.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {complaint.studentName} • {complaint.category}
                      </div>
                    </div>
                    <Badge tone="danger">High</Badge>
                  </div>
                  <div className="text-[11px] text-rose-500/80 mt-1">Requires immediate attention</div>
                </div>
              ))}
            {complaintsList.filter((c) => c.priority === "High" && c.status !== "Resolved").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No high priority alerts
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Resolution Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <div>
                <h3 className="font-semibold text-base">Complaint Details</h3>
                <span className="text-xs text-muted-foreground">Ticket #{selectedComplaint.id.substring(0, 8)}</span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground">Title</div>
                <div className="font-medium text-sm mt-0.5">{selectedComplaint.title}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Description</div>
                <div className="text-sm mt-0.5 whitespace-pre-line text-muted-foreground bg-accent/30 p-3 rounded-lg border">
                  {selectedComplaint.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Student</div>
                  <div className="text-sm font-medium mt-0.5">{selectedComplaint.studentName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Room Number</div>
                  <div className="text-sm font-medium mt-0.5">{selectedComplaint.roomNumber || "General"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Category</div>
                  <div className="mt-1">
                    <Badge tone="info">{selectedComplaint.category}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Priority</div>
                  <div className="mt-1">
                    <Badge tone={selectedComplaint.priority === "High" ? "danger" : "warn"}>
                      {selectedComplaint.priority || "Medium"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Current Status</div>
                <div className="mt-1">
                  <Badge tone={selectedComplaint.status === "Resolved" ? "success" : "info"}>
                    {selectedComplaint.status}
                  </Badge>
                </div>
              </div>
            </div>
            {selectedComplaint.status !== "Resolved" && (
              <div className="p-6 bg-gradient-soft border-t flex justify-end gap-2">
                {selectedComplaint.status === "Pending" && (
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: selectedComplaint.id,
                        status: "In-Progress",
                      })
                    }
                    className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
                    disabled={updateStatusMutation.isPending}
                  >
                    Set In-Progress
                  </button>
                )}
                <button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedComplaint.id,
                      status: "Resolved",
                    })
                  }
                  className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-background rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Register New Complaint</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Select Resident Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                >
                  <option value="">General / Warden Reported</option>
                  {residents.map((r) => (
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
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
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
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
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
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Water shortage in block A 2nd floor"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Detailed Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                disabled={createComplaintMutation.isPending}
              >
                {createComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
