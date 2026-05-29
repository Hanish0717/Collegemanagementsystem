import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { libraryMembers } from "@/mock/mockData";
import { toast } from "sonner";

export function LibrarianMembers() {
  const [members, setMembers] = useState(libraryMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmBlockOpen, setIsConfirmBlockOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStudentId, setFormStudentId] = useState("");

  const filteredMembers = members.filter(
    (m) =>
      (filterStatus === "All" || m.status === filterStatus) &&
      (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormStudentId("");
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formStudentId.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const newMember = {
      id: `MEM-${String(members.length + 1).padStart(3, "0")}`,
      studentId: formStudentId,
      name: formName,
      email: formEmail,
      phone: formPhone,
      joinDate: new Date().toISOString().split("T")[0],
      status: "Active",
      booksIssued: 0,
      fineAmount: 0,
    };

    setMembers([newMember, ...members]);
    toast.success(`Successfully registered new member "${formName}"!`);
    setIsAddModalOpen(false);
    resetForm();
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPhone(member.phone);
    setFormStudentId(member.studentId);
    setIsEditModalOpen(true);
  };

  const handleEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formStudentId.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setMembers(
      members.map((m) => {
        if (m.id === selectedMember.id) {
          return {
            ...m,
            name: formName,
            studentId: formStudentId,
            email: formEmail,
            phone: formPhone,
          };
        }
        return m;
      }),
    );

    toast.success(`Successfully updated member profile for "${formName}"!`);
    setIsEditModalOpen(false);
    setSelectedMember(null);
    resetForm();
  };

  const openBlockConfirm = (member: any) => {
    setSelectedMember(member);
    setIsConfirmBlockOpen(true);
  };

  const handleToggleBlock = () => {
    if (!selectedMember) return;

    const newStatus = selectedMember.status === "Active" ? "Inactive" : "Active";

    setMembers(
      members.map((m) => {
        if (m.id === selectedMember.id) {
          return {
            ...m,
            status: newStatus,
          };
        }
        return m;
      }),
    );

    if (newStatus === "Inactive") {
      toast.warning(`Suspended library card privileges for ${selectedMember.name}.`);
    } else {
      toast.success(`Activated library card privileges for ${selectedMember.name}.`);
    }

    setIsConfirmBlockOpen(false);
    setSelectedMember(null);
  };

  // Calculations for dynamic member statistics
  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "Active").length;
  const totalIssued = members.reduce((sum, m) => sum + m.booksIssued, 0);
  const outstandingFines = members.reduce((sum, m) => sum + m.fineAmount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Management"
        desc="Manage library members, track borrowing history and status."
        actions={
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <Plus className="size-4" /> Add Member
          </button>
        }
      />

      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search by name or student ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  filterStatus === status
                    ? "bg-gradient-primary text-white"
                    : "bg-background border text-muted-foreground hover:border-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-16 text-muted-foreground/40 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-semibold">No Members Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            No library members match your search criteria.
          </p>
        </Card>
      )}

      {/* Members Grid */}
      {filteredMembers.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="hover:-translate-y-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center font-semibold text-lg">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <Badge tone={member.status === "Active" ? "success" : "warn"}>
                    {member.status}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0 mb-4">
                  <div className="font-semibold truncate">{member.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{member.studentId}</div>
                  <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                  <div className="text-xs text-muted-foreground">{member.phone}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Member since: {new Date(member.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-soft rounded-lg mb-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Books Issued</div>
                    <div className="text-lg font-bold">{member.booksIssued}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Fine Due</div>
                    <div
                      className={`text-lg font-bold ${member.fineAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      ₹{member.fineAmount}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openBlockConfirm(member)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                      member.status === "Active"
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
                  >
                    {member.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Member Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient">{totalCount}</div>
            <div className="text-xs text-muted-foreground mt-2">Total Members</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-2">Active Members</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalIssued}</div>
            <div className="text-xs text-muted-foreground mt-2">Books Active Issued</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">₹{outstandingFines}</div>
            <div className="text-xs text-muted-foreground mt-2">Outstanding Fines</div>
          </div>
        </Card>
      </div>

      {/* Member Engagement Table */}
      <Card>
        <h3 className="font-semibold mb-4 text-gradient">Member Directory Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  Student ID
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Books</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Fine</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {m.studentId}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{m.booksIssued}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        m.fineAmount > 0 ? "text-rose-600 font-semibold" : "text-emerald-600"
                      }
                    >
                      ₹{m.fineAmount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={m.status === "Active" ? "success" : "warn"}>{m.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMember(m);
                        setIsProfileModalOpen(true);
                      }}
                      className="px-2 py-1 rounded border text-xs cursor-pointer hover:bg-background transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openBlockConfirm(m)}
                      className={`px-2 py-1 rounded text-xs cursor-pointer transition ${
                        m.status === "Active"
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {m.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Register New Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Student / Faculty ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU009"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@college.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Register
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Edit Member Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditMember} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Student / Faculty ID *
                </label>
                <input
                  type="text"
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Member Profile Modal */}
      {isProfileModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-lg text-gradient">Member Specifications</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center font-bold text-2xl">
                  {selectedMember.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedMember.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedMember.studentId}</p>
                  <Badge
                    tone={selectedMember.status === "Active" ? "success" : "warn"}
                    className="mt-1"
                  >
                    {selectedMember.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{selectedMember.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Join Date:</span>
                  <span className="font-medium">
                    {new Date(selectedMember.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Books Borrowed:</span>
                  <span className="font-bold text-violet-600">{selectedMember.booksIssued}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fines Outstanding:</span>
                  <span
                    className={`font-bold ${selectedMember.fineAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    ₹{selectedMember.fineAmount}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-medium glow-primary cursor-pointer hover:opacity-90 transition text-sm"
              >
                Close Profile
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Suspend/Block Modal */}
      {isConfirmBlockOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-semibold text-lg mb-3">
              {selectedMember.status === "Active" ? "Suspend Member" : "Re-activate Member"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to{" "}
              {selectedMember.status === "Active" ? "suspend" : "re-activate"} the library
              privileges for **{selectedMember.name}** ({selectedMember.studentId})?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmBlockOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-medium hover:bg-gradient-soft transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleBlock}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition cursor-pointer ${
                  selectedMember.status === "Active"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
