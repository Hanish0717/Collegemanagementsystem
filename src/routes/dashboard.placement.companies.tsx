import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Grid, List, Building2 } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { companies, drives } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/placement/companies")({
  component: CompanyManagement,
});

function CompanyManagement() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const industries = ["All", "Technology", "Finance", "Consulting", "IT Services", "E-commerce"];

  const filteredCompanies = companies.filter(comp =>
    (selectedIndustry === "All" || comp.industry === selectedIndustry) &&
    (comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCompanyDrives = (companyId: string) => {
    return drives.filter(d => companies.find(c => c.name === d.company)?.id === companyId).length;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Management"
        desc="Manage recruiting companies, job openings and partnerships."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Company
          </button>
        }
      />

      {/* Search and Filter Section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search by company name or industry…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 border rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
              >
                <Grid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Industry Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {industries.map(ind => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  selectedIndustry === ind
                    ? "bg-gradient-primary text-white"
                    : "bg-background border text-muted-foreground hover:border-primary"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map(company => (
            <Card key={company.id} className="hover:-translate-y-1 transition flex flex-col">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 text-white grid place-items-center mb-4 relative overflow-hidden">
                <Building2 className="size-12 opacity-80" />
                <div className="absolute inset-0 grid-bg opacity-30" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{company.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{company.industry}</div>

                <div className="mt-3 space-y-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Package: </span>
                    <span className="font-semibold text-emerald-600">{company.package}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">HR: </span>
                    <span className="font-medium">{company.hrContact}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Prev. Hires: </span>
                    <span className="font-medium">{company.previousYearHires}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge tone="info">{company.industry}</Badge>
                  <Badge tone={company.hiringStatus === "Active" ? "success" : "warn"}>
                    {company.hiringStatus}
                  </Badge>
                </div>

                <div className="mt-3 p-2 bg-gradient-soft rounded-lg">
                  <div className="text-xs text-center">
                    <div className="text-muted-foreground">Active Drives</div>
                    <div className="font-bold text-lg">{getCompanyDrives(company.id)}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
                  View
                </button>
                <button className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition">
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Industry</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Package</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">HR Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Prev. Hires</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCompanies.map(company => (
                  <tr key={company.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone="info">{company.industry}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-600">{company.package}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{company.hrContact}</div>
                      <div className="text-xs text-muted-foreground">{company.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={company.hiringStatus === "Active" ? "success" : "warn"}>
                        {company.hiringStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{company.previousYearHires}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                          View
                        </button>
                        <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Drives Table */}
      <Card>
        <h3 className="font-semibold mb-4">Company Drives</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Package</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Eligibility</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Applicants</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drives.map(drive => (
                <tr key={drive.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{drive.company}</td>
                  <td className="py-3 px-4">{drive.role}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-emerald-600">
                      {companies.find(c => c.name === drive.company)?.package}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone="info">CGPA 7.0+, no backlogs</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(drive.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-medium">{drive.studentCount}</td>
                  <td className="py-3 px-4">
                    <Badge tone={drive.status === "Upcoming" ? "info" : drive.status === "Ongoing" ? "warn" : "success"}>
                      {drive.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-center">
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                        View
                      </button>
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                        Edit
                      </button>
                    </div>
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
