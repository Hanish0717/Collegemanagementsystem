import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { libraryMembers } from "@/mock/mockData";



export function LibrarianMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredMembers = libraryMembers.filter(m =>
    (filterStatus === "All" || m.status === filterStatus) &&
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Management"
        desc="Manage library members, track borrowing history and status."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
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
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", "Active", "Inactive"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
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

      {/* Members Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <Card key={member.id} className="hover:-translate-y-1 transition flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white grid place-items-center font-semibold text-lg">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              <Badge tone={member.status === "Active" ? "success" : "warn"}>{member.status}</Badge>
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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-soft rounded-lg mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Books Issued</div>
                <div className="text-lg font-bold">{member.booksIssued}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Fine Due</div>
                <div className={`text-lg font-bold ${member.fineAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  ₹{member.fineAmount}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-gradient-soft transition">
                Profile
              </button>
              <button className="flex-1 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary">
                History
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Member Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient">{libraryMembers.length}</div>
            <div className="text-xs text-muted-foreground mt-2">Total Members</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{libraryMembers.filter(m => m.status === "Active").length}</div>
            <div className="text-xs text-muted-foreground mt-2">Active Members</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold">{libraryMembers.reduce((sum, m) => sum + m.booksIssued, 0)}</div>
            <div className="text-xs text-muted-foreground mt-2">Books Issued</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600">₹{libraryMembers.reduce((sum, m) => sum + m.fineAmount, 0)}</div>
            <div className="text-xs text-muted-foreground mt-2">Outstanding Fines</div>
          </div>
        </Card>
      </div>

      {/* Member Engagement */}
      <Card>
        <h3 className="font-semibold mb-4">Member Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Student ID</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Books</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Fine</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => (
                <tr key={m.id} className="border-b hover:bg-gradient-soft transition">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.studentId}</td>
                  <td className="px-4 py-3 text-center font-semibold">{m.booksIssued}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={m.fineAmount > 0 ? "text-rose-600 font-semibold" : ""}>₹{m.fineAmount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={m.status === "Active" ? "success" : "warn"}>{m.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
