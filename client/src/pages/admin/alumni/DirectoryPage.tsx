import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { useAlumni } from "../AdminAlumni";
import { GradientHeader, GlassCard } from "./components/CardElements";
import { AdvancedTableToolbar, StyledTable, TableRow, TableCell, TablePagination } from "./components/TableElements";
import { Users, Mail, MapPin, Briefcase, Eye, Download, Search, X, Building2, GraduationCap, Phone, Globe, Linkedin, Github, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DirectoryPage() {
  const { directoryList, dirLoading } = useAlumni();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  if (dirLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-muted rounded-3xl w-full" />
        <div className="h-96 bg-muted rounded-3xl w-full" />
      </div>
    );
  }

  // Map database fields to UI fields
  const directory = useMemo(() => {
    return (directoryList || []).map((a: any) => ({
      id: a.id,
      name: a.full_name || a.name || "Anonymous",
      email: a.email || "N/A",
      phone: a.phone || a.mobile || "N/A",
      batch: String(a.graduation_year || a.batch || 2024),
      department: a.department || "Computer Science",
      designation: a.designation || "Engineer",
      company: a.current_company || a.company || "Tech Inc",
      location: a.location || "Global",
      status: a.status === "Approved" ? "Verified" : (a.status || "Verified"),
      image: a.photo || a.image,
      linkedin: a.linkedin_url || a.linkedin || "",
      github: a.github_url || a.github || "",
      portfolio: a.portfolio_url || a.portfolio || "",
      bio: a.bio || a.about || ""
    }));
  }, [directoryList]);

  const filtered = directory.filter((a: any) =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.company?.toLowerCase().includes(search.toLowerCase()) ||
    a.batch?.includes(search) ||
    a.department?.toLowerCase().includes(search.toLowerCase())
  );

  const limit = 10;
  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  // ── View Profile ──
  const handleView = (alumni: any) => {
    setSelectedAlumni(alumni);
    setIsViewOpen(true);
  };

  // ── Download single profile as Excel ──
  const handleDownloadProfile = (alumni: any) => {
    const wb = XLSX.utils.book_new();
    const data = [
      ["ALUMNI PROFILE CARD"],
      [],
      ["Full Name", alumni.name],
      ["Email", alumni.email],
      ["Phone", alumni.phone],
      ["Batch / Year", alumni.batch],
      ["Department", alumni.department],
      ["Designation", alumni.designation],
      ["Company", alumni.company],
      ["Location", alumni.location],
      ["Status", alumni.status],
      ["LinkedIn", alumni.linkedin || "N/A"],
      ["GitHub", alumni.github || "N/A"],
      ["Portfolio", alumni.portfolio || "N/A"],
      ["Bio", alumni.bio || "N/A"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, "Profile");
    XLSX.writeFile(wb, `Alumni_Profile_${alumni.name.replace(/\s+/g, "_")}.xlsx`);
    toast.success(`Profile of ${alumni.name} downloaded as Excel.`);
  };

  // ── Export full directory as Excel ──
  const handleExportAll = () => {
    if (filtered.length === 0) {
      toast.error("No alumni records to export.");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["ALUMNI DIRECTORY — EXPORT REPORT"],
      [],
      ["Generated On", new Date().toLocaleString("en-IN")],
      ["Total Records", filtered.length],
      ["Search Filter", search || "None"],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Directory sheet
    const headers = ["Name", "Email", "Phone", "Batch", "Department", "Designation", "Company", "Location", "Status", "LinkedIn", "Portfolio"];
    const rows = filtered.map((a: any) => [
      a.name, a.email, a.phone, a.batch, a.department,
      a.designation, a.company, a.location, a.status,
      a.linkedin || "N/A", a.portfolio || "N/A"
    ]);
    const dirSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    dirSheet["!cols"] = [
      { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 8 },
      { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 16 },
      { wch: 12 }, { wch: 30 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, dirSheet, "Alumni Directory");

    const filename = `Alumni_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success(`Directory exported — ${filtered.length} alumni records.`);
  };

  const statusConfig: Record<string, { color: string; icon: any }> = {
    Verified:   { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    Pending:    { color: "bg-amber-50 text-amber-700 border-amber-200",       icon: Clock },
    Unverified: { color: "bg-rose-50 text-rose-700 border-rose-200",          icon: XCircle },
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader
        title="Alumni Directory"
        description="Search, filter, and connect with your global alumni network."
        icon={Users}
        color="from-blue-600 to-cyan-600"
      />

      <GlassCard className="p-6">
        <AdvancedTableToolbar
          onSearch={(val) => { setSearch(val); setPage(1); }}
          onFilter={() => toast.info("Advanced filters coming soon.")}
          onExport={handleExportAll}
          searchPlaceholder="Search by name, company, or batch..."
        />

        <StyledTable headers={["Alumni", "Batch / Dept", "Current Role", "Location", "Status", "Actions"]}>
          {paginated.length > 0 ? paginated.map((alumni: any, i: number) => {
            const statusCfg = statusConfig[alumni.status] || statusConfig.Verified;
            const StatusIcon = statusCfg.icon;
            return (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={alumni.image || `https://api.dicebear.com/7.x/initials/svg?seed=${alumni.name}`}
                      alt={alumni.name}
                      className="w-10 h-10 rounded-full bg-muted border object-cover"
                    />
                    <div>
                      <p className="font-semibold">{alumni.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {alumni.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{alumni.batch}</p>
                  <p className="text-xs text-muted-foreground">{alumni.department}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{alumni.designation}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-5">{alumni.company}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {alumni.location}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("rounded-xl border text-xs", statusCfg.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" /> {alumni.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600"
                      title="View Profile"
                      onClick={() => handleView(alumni)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 w-8 p-0 rounded-xl hover:bg-emerald-50 hover:text-emerald-600"
                      title="Download Profile"
                      onClick={() => handleDownloadProfile(alumni)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          }) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 opacity-20" />
                  <p>No alumni found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </StyledTable>

        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </GlassCard>

      {/* ── MODAL: View Alumni Profile ── */}
      {isViewOpen && selectedAlumni && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-muted text-muted-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-t-3xl flex items-center gap-6">
              <img
                src={selectedAlumni.image || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedAlumni.name}`}
                alt={selectedAlumni.name}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedAlumni.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {selectedAlumni.designation} at <span className="font-semibold text-foreground">{selectedAlumni.company}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={cn("rounded-xl border text-xs", (statusConfig[selectedAlumni.status] || statusConfig.Verified).color)}>
                    {selectedAlumni.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedAlumni.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-500" /> {selectedAlumni.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Phone</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-blue-500" /> {selectedAlumni.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Batch / Year</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-500" /> Class of {selectedAlumni.batch}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Department</p>
                  <p className="font-semibold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" /> {selectedAlumni.department}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedAlumni.bio && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">About</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedAlumni.bio}</p>
                </div>
              )}

              {/* Social Links */}
              {(selectedAlumni.linkedin || selectedAlumni.github || selectedAlumni.portfolio) && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Social Links</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlumni.linkedin && (
                      <a href={selectedAlumni.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {selectedAlumni.github && (
                      <a href={selectedAlumni.github} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-muted text-foreground border hover:bg-muted/80 transition-colors">
                        <Github className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {selectedAlumni.portfolio && (
                      <a href={selectedAlumni.portfolio} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-8 pb-8 pt-2 border-t flex items-center justify-between gap-3">
              <Button
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => { handleDownloadProfile(selectedAlumni); setIsViewOpen(false); }}
              >
                <Download className="w-4 h-4" /> Download Profile
              </Button>
              <Button variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
