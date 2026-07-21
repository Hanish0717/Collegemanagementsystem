import React, { useState, useMemo } from "react";
import { GradientHeader, StatCard, GlassCard } from "./components/CardElements";
import { FormGroup } from "./components/FormElements";
import { StyledTable, TableRow, TableCell, TablePagination, AdvancedTableToolbar } from "./components/TableElements";
import { Target, Building2, Users, FileCheck, Calendar, ArrowRight, Eye, ChevronRight, CheckCircle, X, Download, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export function PlacementsPage() {
  const [activeTab, setActiveTab] = useState<'drives' | 'companies' | 'results'>('drives');
  const [search, setSearch] = useState("");
  
  // Dialog / Modals states
  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Local list states
  const [drives, setDrives] = useState([
    { id: 1, company: "Microsoft", role: "Software Engineer", date: "2026-06-10", eligible: 120, status: "Registration Open", package: "44 LPA" },
    { id: 2, company: "Deloitte", role: "Business Analyst", date: "2026-06-15", eligible: 200, status: "Upcoming", package: "12 LPA" },
    { id: 3, company: "TCS", role: "System Engineer", date: "2026-06-20", eligible: 450, status: "Upcoming", package: "7 LPA" }
  ]);

  const [companies, setCompanies] = useState([
    { id: 1, name: "Microsoft", visitedDate: "2026-05-10", selectedCount: 14, avgPackage: "28 LPA", status: "Completed" },
    { id: 2, name: "Google", visitedDate: "2026-04-12", selectedCount: 8, avgPackage: "32 LPA", status: "Completed" },
    { id: 3, name: "Deloitte", visitedDate: "2026-06-01", selectedCount: 22, avgPackage: "12 LPA", status: "Completed" },
    { id: 4, name: "TCS", visitedDate: "2026-03-20", selectedCount: 65, avgPackage: "6.5 LPA", status: "Completed" }
  ]);

  const [results, setResults] = useState([
    { id: 1, studentName: "Rahul Sharma", dept: "Computer Science", company: "Microsoft", package: "44 LPA", status: "Selected", email: "rahul@gmail.com" },
    { id: 2, studentName: "Priya Patel", dept: "Electronics", company: "Deloitte", package: "12 LPA", status: "Selected", email: "priya@gmail.com" },
    { id: 3, studentName: "Amit Kumar", dept: "Mechanical", company: "Tesla", package: "22 LPA", status: "Selected", email: "amit@gmail.com" },
    { id: 4, studentName: "Sneha Reddy", dept: "Information Technology", company: "Google", package: "32 LPA", status: "Selected", email: "sneha@gmail.com" }
  ]);

  // Form states
  const [driveForm, setDriveForm] = useState({
    company: "",
    role: "",
    date: "",
    eligible: 150,
    package: "15 LPA",
    status: "Registration Open"
  });

  // Search filter
  const filteredDrives = useMemo(() => {
    return drives.filter(d => 
      d.company.toLowerCase().includes(search.toLowerCase()) ||
      d.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [drives, search]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [companies, search]);

  const filteredResults = useMemo(() => {
    return results.filter(r => 
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase())
    );
  }, [results, search]);

  // Paginated active list
  const activeList = useMemo(() => {
    if (activeTab === 'drives') return filteredDrives;
    if (activeTab === 'companies') return filteredCompanies;
    return filteredResults;
  }, [activeTab, filteredDrives, filteredCompanies, filteredResults]);

  const paginatedList = useMemo(() => {
    return activeList.slice((currentPage - 1) * limit, currentPage * limit);
  }, [activeList, currentPage]);

  const totalPages = Math.ceil(activeList.length / limit) || 1;

  // Exporter to download Excel files
  const handleGenerateReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Drives
    const driveHeaders = ["Company", "Role", "Date", "Eligibility (Students)", "Package Offered", "Status"];
    const driveRows = drives.map(d => [d.company, d.role, d.date, d.eligible, d.package, d.status]);
    const driveSheet = XLSX.utils.aoa_to_sheet([driveHeaders, ...driveRows]);
    driveSheet["!cols"] = [{ wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, driveSheet, "Placement Drives");

    // Sheet 2: Visited Companies
    const companyHeaders = ["Company Name", "Visited Date", "Selected Students Count", "Average Package Offered", "Status"];
    const companyRows = companies.map(c => [c.name, c.visitedDate, c.selectedCount, c.avgPackage, c.status]);
    const companySheet = XLSX.utils.aoa_to_sheet([companyHeaders, ...companyRows]);
    companySheet["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 24 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, companySheet, "Recruitment Partners");

    // Sheet 3: Selected Candidates Results
    const resultHeaders = ["Student Name", "Department", "Recruited Company", "Package Offered", "Selection Status", "Contact Email"];
    const resultRows = results.map(r => [r.studentName, r.dept, r.company, r.package, r.status, r.email]);
    const resultSheet = XLSX.utils.aoa_to_sheet([resultHeaders, ...resultRows]);
    resultSheet["!cols"] = [{ wch: 20 }, { wch: 24 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, resultSheet, "Selected Students");

    // Write file
    const filename = `Campus_Placement_Analytics_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Placement reports generated successfully.");
  };

  const handleAddDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveForm.company || !driveForm.role || !driveForm.date) {
      toast.error("Please enter a company name, role designation, and interview date.");
      return;
    }
    const newDrive = {
      id: drives.length + 1,
      ...driveForm
    };
    setDrives(prev => [newDrive, ...prev]);
    toast.success(`Placement drive for ${driveForm.company} created successfully!`);
    setIsAddDriveOpen(false);
    setDriveForm({
      company: "",
      role: "",
      date: "",
      eligible: 150,
      package: "15 LPA",
      status: "Registration Open"
    });
  };

  const handleManageClick = (drive: any) => {
    setSelectedDrive(drive);
    setIsManageOpen(true);
  };

  const handleUpdateStatus = (status: string) => {
    setDrives(prev => prev.map(d => d.id === selectedDrive.id ? { ...d, status } : d));
    toast.success(`Drive status updated to ${status}.`);
    setIsManageOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <GradientHeader 
        title="Placement Portal" 
        description="Manage campus placement drives, company visits, and student recruitment."
        icon={Target}
        color="from-cyan-600 to-blue-700"
      >
        <Button onClick={() => setIsAddDriveOpen(true)} className="rounded-xl bg-white text-blue-700 hover:bg-white/90">
          Add New Drive
        </Button>
      </GradientHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Upcoming Drives" value={drives.length} icon={Calendar} color="blue" />
        <StatCard title="Companies Visited" value={companies.length} icon={Building2} color="indigo" trend={{ value: 15, isPositive: true }} />
        <StatCard title="Overall Placement Rate" value="94%" icon={CheckCircle} color="green" trend={{ value: 4, isPositive: true }} />
        <StatCard title="Highest Package" value="44 LPA" icon={Target} color="purple" />
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
            {(['drives', 'companies', 'results'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); setSearch(""); }}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                  activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <Button onClick={handleGenerateReport} variant="outline" className="w-full sm:w-auto rounded-xl gap-2">
            <Download className="w-4 h-4" /> Generate Report
          </Button>
        </div>

        <div className="space-y-6">
          <AdvancedTableToolbar 
            searchPlaceholder={`Search ${activeTab}...`} 
            onSearch={(val) => { setSearch(val); setCurrentPage(1); }} 
          />
          
          {activeTab === 'drives' && (
            <StyledTable headers={["Company", "Role", "Date", "Eligibility", "Package", "Status", "Action"]}>
              {paginatedList.length > 0 ? paginatedList.map((drive: any) => (
                <TableRow key={drive.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {drive.company.charAt(0)}
                      </div>
                      <span className="font-semibold text-base">{drive.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{drive.role}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4 mr-2" /> {new Date(drive.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Users className="w-4 h-4 mr-2" /> {drive.eligible} Students
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">{drive.package}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={drive.status.includes('Open') ? 'default' : 'secondary'} className="rounded-xl">
                      {drive.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleManageClick(drive)} variant="ghost" className="rounded-xl font-medium text-primary hover:bg-primary/5">
                      Manage <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No placement drives matching search query.
                  </td>
                </tr>
              )}
            </StyledTable>
          )}

          {activeTab === 'companies' && (
            <StyledTable headers={["Company", "Visited Date", "Selected Students", "Avg Package offered", "Status"]}>
              {paginatedList.length > 0 ? paginatedList.map((company: any) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {company.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-base">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4 mr-2" /> {new Date(company.visitedDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{company.selectedCount} Candidates</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">{company.avgPackage}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                      {company.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No visited companies found matching query.
                  </td>
                </tr>
              )}
            </StyledTable>
          )}

          {activeTab === 'results' && (
            <StyledTable headers={["Student", "Department", "Selected Company", "Package Offered", "Status"]}>
              {paginatedList.length > 0 ? paginatedList.map((result: any) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {result.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{result.studentName}</p>
                        <p className="text-[10px] text-muted-foreground">{result.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{result.dept}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{result.company}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">{result.package}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 gap-1">
                      <CheckCircle className="w-3 h-3" /> {result.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No results records found matching query.
                  </td>
                </tr>
              )}
            </StyledTable>
          )}
        </div>

        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </GlassCard>

      {/* ── MODAL: Add Drive ── */}
      {isAddDriveOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsAddDriveOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-cyan-600"><Target className="w-5 h-5"/> Schedule Recruitment Drive</h3>
            <p className="text-xs text-muted-foreground mb-6">Create a new recruitment schedule, package metrics, and criteria parameters.</p>
            <form onSubmit={handleAddDriveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Company Name *">
                  <Input value={driveForm.company} onChange={e => setDriveForm({...driveForm, company: e.target.value})} placeholder="e.g. Amazon India" required />
                </FormGroup>
                <FormGroup label="Role *">
                  <Input value={driveForm.role} onChange={e => setDriveForm({...driveForm, role: e.target.value})} placeholder="e.g. SDE-1" required />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Drive Date *">
                  <Input type="date" value={driveForm.date} onChange={e => setDriveForm({...driveForm, date: e.target.value})} required />
                </FormGroup>
                <FormGroup label="Eligible Candidates Count">
                  <Input type="number" value={driveForm.eligible} onChange={e => setDriveForm({...driveForm, eligible: parseInt(e.target.value) || 0})} />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Package Offered">
                  <Input value={driveForm.package} onChange={e => setDriveForm({...driveForm, package: e.target.value})} placeholder="e.g. 18 LPA" />
                </FormGroup>
                <div>
                  <label className="text-xs font-semibold block mb-1">Status</label>
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-cyan-500" value={driveForm.status} onChange={e => setDriveForm({...driveForm, status: e.target.value})}>
                    <option value="Registration Open">Registration Open</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDriveOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white">Schedule Drive</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Manage Placement Drive ── */}
      {isManageOpen && selectedDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsManageOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-cyan-600"><Building2 className="w-5 h-5"/> Manage Drive Parameters</h3>
            <p className="text-xs text-muted-foreground mb-4">Company: <span className="font-semibold text-foreground">{selectedDrive.company}</span> | Role: {selectedDrive.role}</p>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Drive Specifications</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border rounded-xl bg-muted/20">
                    <span className="font-bold text-muted-foreground block">DATE Scheduled</span>
                    <span className="font-semibold text-foreground text-sm">{new Date(selectedDrive.date).toLocaleDateString()}</span>
                  </div>
                  <div className="p-3 border rounded-xl bg-muted/20">
                    <span className="font-bold text-muted-foreground block">Package Core</span>
                    <span className="font-semibold text-foreground text-sm">{selectedDrive.package}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h4>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUpdateStatus("Registration Open")} 
                    variant="outline" 
                    className="flex-1 rounded-xl text-xs"
                    disabled={selectedDrive.status === "Registration Open"}
                  >
                    Open Registration
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus("Registration Closed")} 
                    variant="outline" 
                    className="flex-1 rounded-xl text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    disabled={selectedDrive.status === "Registration Closed"}
                  >
                    Close Registration
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus("Completed")} 
                    className="flex-1 rounded-xl text-xs bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={selectedDrive.status === "Completed"}
                  >
                    Mark Completed
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
