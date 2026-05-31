import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { UserCheck, Plus, Search, Shield, Clock, Phone, LogOut, Loader2, AlertCircle, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";
import {
  fetchHostelVisitors,
  registerVisitor,
  checkOutVisitor,
  fetchResidents,
} from "@/services/hostelService";

export function HostelVisitors() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedTimeRange, setSelectedTimeRange] = useState("Today");

  // Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [relationship, setRelationship] = useState("Guardian");
  const [purpose, setPurpose] = useState("Family Visit");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [idType, setIdType] = useState("Aadhaar Card");
  const [idNumber, setIdNumber] = useState("");

  // Queries
  const {
    data: visitorsList = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["visitors", search, selectedStatus],
    queryFn: () =>
      fetchHostelVisitors({
        search,
        status: selectedStatus,
      }),
  });

  const { data: residents = [] } = useQuery({
    queryKey: ["residents-lookup"],
    queryFn: () => fetchResidents(),
  });

  // Mutations
  const registerMutation = useMutation({
    mutationFn: (payload: any) => registerVisitor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Visitor registered successfully!");
      setIsRegisterOpen(false);
      // Reset
      setVisitorName("");
      setVisitorPhone("");
      setSelectedStudentId("");
      setPurpose("Family Visit");
      setIdNumber("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register visitor");
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => checkOutVisitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      toast.success("Visitor checked out successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to checkout visitor");
    },
  });

  // Calculations
  const totalToday = visitorsList.length;
  const insideCount = visitorsList.filter((v) => v.status === "Inside").length;
  const checkedOutCount = visitorsList.filter((v) => v.status === "Checked Out").length;
  const pendingApprovalCount = 0; // We can keep this 0 or mock

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    const resident = residents.find((r) => r.studentId === selectedStudentId);

    const payload = {
      visitor_name: visitorName,
      visitor_phone: visitorPhone,
      relationship,
      purpose,
      student_id: selectedStudentId || null,
      room_id: resident?.roomId || null,
      hostel_id: resident?.hostelId || null,
      id_type: idType,
      id_number: idNumber || null,
      check_in_time: new Date(),
      status: "In",
    };

    registerMutation.mutate(payload);
  };

  const visitorAnalytics = [
    { day: "Mon", visitors: 25 },
    { day: "Tue", visitors: 32 },
    { day: "Wed", visitors: 28 },
    { day: "Thu", visitors: 35 },
    { day: "Fri", visitors: 40 },
    { day: "Sat", visitors: 55 },
    { day: "Sun", visitors: 48 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Logs"
        desc="Track visitor entries, exits, and manage visitor registration."
        actions={
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Register Visitor
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors Today", value: String(totalToday), tone: "info" as const },
          { label: "Currently Inside", value: String(insideCount), tone: "success" as const },
          { label: "Checked Out", value: String(checkedOutCount), tone: "warn" as const },
          { label: "Pending Approval", value: String(pendingApprovalCount), tone: "danger" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Today
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search by visitor name or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["All Status", "Inside", "Checked Out"].map((s) => (
              <option key={s} value={s === "Inside" ? "Inside" : s === "Checked Out" ? "Checked Out" : "All Status"}>{s}</option>
            ))}
          </select>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm cursor-pointer outline-none focus:border-primary"
          >
            {["Today", "This Week", "This Month"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Visitor Entry Table</h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Loading visitor logs...</span>
            </div>
          ) : isError ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
              <AlertCircle className="size-8 mx-auto text-rose-500" />
              <p>{error instanceof Error ? error.message : "Failed to load visitors."}</p>
            </div>
          ) : visitorsList.length === 0 ? (
            <div className="py-12 px-6 text-center text-sm text-muted-foreground">
              No visitors logged today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {[
                      "Visitor Name",
                      "Student Name",
                      "Entry Time",
                      "Exit Time",
                      "Contact Number",
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
                  {visitorsList.map((log) => (
                    <tr key={log.id} className="hover:bg-accent/50 transition">
                      <td className="py-3 px-4 font-medium">{log.visitorName}</td>
                      <td className="py-3 px-4">{log.studentName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{log.checkInTime}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {log.checkOutTime || <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.visitorPhone}</td>
                      <td className="py-3 px-4">
                        <Badge tone={log.status === "Inside" ? "success" : "warn"}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {log.status === "Inside" ? (
                          <button
                            onClick={() => checkOutMutation.mutate(log.id)}
                            className="px-2 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded font-medium transition cursor-pointer"
                            disabled={checkOutMutation.isPending}
                          >
                            Checkout
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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
            <Shield className="size-5 text-indigo" />
            <h3 className="font-semibold">Security Verification</h3>
          </div>
          <div className="space-y-2">
            {visitorsList.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-gradient-soft"
              >
                <div>
                  <div className="text-sm font-medium">{log.visitorName}</div>
                  <div className="text-xs text-muted-foreground">{log.checkInTime}</div>
                </div>
                <Badge tone="success">Verified</Badge>
              </div>
            ))}
            {visitorsList.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-6">
                No verifications today
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Visitor Analytics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={visitorAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="visitors" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-5 text-indigo" />
            <h3 className="font-semibold">Pending Entry Requests</h3>
          </div>
          <div className="space-y-2">
            {[
              {
                id: "MOCK-1",
                visitor: "Rajesh Kumar",
                student: "Vikram Singh",
                purpose: "Family Visit",
                time: "10 min ago",
              },
              {
                id: "MOCK-2",
                visitor: "Meena Devi",
                student: "Anjali Gupta",
                purpose: "Parent Meeting",
                time: "25 min ago",
              },
            ].map((approval) => (
              <div
                key={approval.id}
                className="p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{approval.visitor}</div>
                    <div className="text-xs text-muted-foreground">
                      {approval.student} • {approval.purpose}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        toast.success("Visitor entry approved");
                      }}
                      className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        toast.info("Visitor entry rejected");
                      }}
                      className="px-2 py-1 rounded text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{approval.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Register Visitor Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-background rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-soft">
              <h3 className="font-semibold text-base">Register Visitor Entry</h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Visitor Name *</label>
                  <input
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 font-medium">Visitor Phone *</label>
                  <input
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
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
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
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
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Submitting laundry, meeting"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1 font-medium">Visiting Resident Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm cursor-pointer outline-none focus:border-primary"
                  required
                >
                  <option value="">-- Select Resident Student --</option>
                  {residents.map((r) => (
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
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
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
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="ID Reference Number"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-soft border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2 text-xs rounded-xl border bg-background hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-95 transition"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : "Register Entry"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
