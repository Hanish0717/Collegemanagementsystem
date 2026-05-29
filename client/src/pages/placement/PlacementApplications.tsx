import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Filter, ChevronDown } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { applications } from "@/mock/mockData";

export function PlacementApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const statuses = [
    "Applied",
    "Shortlisted",
    "Interview Scheduled",
    "Selected",
    "Rejected",
    "Offer Released",
  ];
  const statusColors: Record<string, any> = {
    Applied: "info",
    Shortlisted: "warn",
    "Interview Scheduled": "info",
    Selected: "success",
    Rejected: "danger",
    "Offer Released": "success",
  };

  const filteredApplications = applications.filter(
    (app) =>
      (app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedStatus || app.status === selectedStatus),
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIdx, startIdx + itemsPerPage);

  const stats = [
    { label: "Total Applications", value: applications.length, color: "bg-blue-500" },
    {
      label: "Shortlisted",
      value: applications.filter((a) => a.status === "Shortlisted").length,
      color: "bg-amber-500",
    },
    {
      label: "Selected",
      value: applications.filter((a) => a.status === "Selected").length,
      color: "bg-emerald-500",
    },
    {
      label: "Rejected",
      value: applications.filter((a) => a.status === "Rejected").length,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Management"
        desc="Track student applications and manage interview workflows."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Import Applications
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div
              className={`size-12 rounded-xl ${stat.color} text-white grid place-items-center mx-auto mb-2 font-bold`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search by student name, ID or company…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
            <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
              <Filter className="size-4" /> More Filters
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                selectedStatus === null
                  ? "bg-gradient-primary text-white"
                  : "bg-background border text-muted-foreground hover:border-primary"
              }`}
            >
              All Statuses
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  selectedStatus === status
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

      {/* Applications Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Applied Date
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Score</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Round</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedApplications.map((app) => (
                <tr key={app.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-medium">{app.studentName}</div>
                    <div className="text-xs text-muted-foreground">{app.studentId}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">{app.company}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.role}</td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {app.score > 0 ? (
                      <span
                        className={`font-semibold ${app.score >= 80 ? "text-emerald-600" : app.score >= 70 ? "text-amber-600" : "text-rose-600"}`}
                      >
                        {app.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {app.round > 0 ? (
                      <Badge tone="info">Round {app.round}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge tone={statusColors[app.status] as any}>{app.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-xs text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {startIdx + 1} to{" "}
              {Math.min(startIdx + itemsPerPage, filteredApplications.length)} of{" "}
              {filteredApplications.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border text-sm hover:bg-accent disabled:opacity-50 transition"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-gradient-primary text-white"
                      : "border hover:bg-accent"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border text-sm hover:bg-accent disabled:opacity-50 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Status Workflow */}
      <Card>
        <h3 className="font-semibold mb-4">Application Status Workflow</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["Applied", "Shortlisted", "Interview Scheduled", "Selected", "Offer Released"].map(
            (status, idx) => (
              <div key={status} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 text-white grid place-items-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center whitespace-nowrap max-w-[80px]">
                    {status}
                  </div>
                </div>
                {idx < 4 && <div className="flex-1 h-1 bg-gradient-primary mx-1 min-w-[20px]" />}
              </div>
            ),
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <h3 className="font-semibold mb-4">Bulk Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition">
            📧 Send Bulk Email
          </button>
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition">
            📋 Update Status
          </button>
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition">
            📥 Import CSV
          </button>
          <button className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-accent transition">
            📤 Export Report
          </button>
        </div>
      </Card>
    </div>
  );
}
