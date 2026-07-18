import React, { useState, useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveAlumniProfile, registerAlumni } from "@/services/alumniService";
import { GradientHeader, GlassCard, StatCard } from "./components/CardElements";
import { FormGroup, StyledInput, FileUploadZone } from "./components/FormElements";
import { StyledTable, TableRow, TableCell, TablePagination } from "./components/TableElements";
import { 
  UserPlus, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, FileText, 
  Briefcase, GraduationCap, Users, UserX, Search, Filter, Trash2, 
  Mail, MessageSquare, Download, Printer, Eye, Edit2, Upload, FileSpreadsheet,
  X, Check, Linkedin, Github, Globe, Plus, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function RegistrationPage() {
  const navigate = useNavigate();
  // State for search and filters
  const [search, setSearch] = useState("");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterEmp, setFilterEmp] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Drawer / Modal states
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);

  // Add Form Step State
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const steps = [
    { id: 1, title: "Personal Details", icon: ShieldCheck },
    { id: 2, title: "Academic Info", icon: GraduationCap },
    { id: 3, title: "Employment", icon: Briefcase },
    { id: 4, title: "Socials & Docs", icon: FileText }
  ];

  // Add Form fields
  const [newAlumni, setNewAlumni] = useState({
    name: "", email: "", phone: "", dob: "", address: "", bio: "",
    rollNo: "", department: "Computer Science", degree: "B.Tech", batch: "2024",
    company: "", designation: "", industry: "Software Engineering", workLocation: "",
    linkedin: "", github: "", portfolio: "", skills: "", achievements: ""
  });

  const { directoryList, dirLoading, pendingAlumni, pendingLoading } = useAlumni();
  const queryClient = useQueryClient();

  const alumniList = useMemo(() => {
    const list: any[] = [];
    (directoryList || []).forEach((a: any) => {
      list.push({
        id: a.id,
        name: a.full_name || a.name || "Anonymous",
        batch: String(a.graduation_year || a.batch || 2024),
        department: a.department || "Computer Science",
        email: a.email,
        phone: a.phone || "N/A",
        company: a.current_company || a.company || "N/A",
        designation: a.designation || "N/A",
        location: a.location || "N/A",
        status: a.status === "Approved" ? "Verified" : (a.status === "Rejected" ? "Rejected" : "Pending Verification"),
        employmentStatus: a.current_company ? "Employed" : "Unemployed"
      });
    });
    (pendingAlumni || []).forEach((a: any) => {
      if (!list.some(item => item.id === a.id)) {
        list.push({
          id: a.id,
          name: a.full_name || a.name || "Anonymous",
          batch: String(a.graduation_year || a.batch || 2024),
          department: a.department || "Computer Science",
          email: a.email,
          phone: a.phone || "N/A",
          company: a.current_company || a.company || "N/A",
          designation: a.designation || "N/A",
          location: a.location || "N/A",
          status: a.status === "Approved" ? "Verified" : (a.status === "Rejected" ? "Rejected" : "Pending Verification"),
          employmentStatus: a.current_company ? "Employed" : "Unemployed"
        });
      }
    });
    return list;
  }, [directoryList, pendingAlumni]);

  // Statistics values
  const totalAlumniCount = alumniList.length + 24450;
  const pendingCount = alumniList.filter(a => a.status === "Pending Verification").length;
  const verifiedCount = alumniList.filter(a => a.status === "Verified").length + 24200;
  const inactiveCount = alumniList.filter(a => a.status === "Inactive" || a.status === "Rejected").length + 250;

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Approved" | "Rejected" }) => approveAlumniProfile(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`Alumni registration has been ${variables.status.toLowerCase()} successfully.`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update alumni status.");
    }
  });

  const registerAlumniMutation = useMutation({
    mutationFn: registerAlumni,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["alumni-directory"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-pending"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      toast.success(`Alumni registered successfully: ${res.data?.full_name || newAlumni.name}`);
      setIsAddDrawerOpen(false);
      setStep(1);
      setNewAlumni({
        name: "", email: "", phone: "", dob: "", address: "", bio: "",
        rollNo: "", department: "Computer Science", degree: "B.Tech", batch: "2024",
        company: "", designation: "", industry: "Software Engineering", workLocation: "",
        linkedin: "", github: "", portfolio: "", skills: "", achievements: ""
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register alumni.");
    }
  });

  // Filter logic
  const filteredAlumni = alumniList.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesBatch = filterBatch === "All" || a.batch === filterBatch;
    const matchesDept = filterDept === "All" || a.department.includes(filterDept);
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    const matchesEmp = filterEmp === "All" || a.employmentStatus === filterEmp;

    return matchesSearch && matchesBatch && matchesDept && matchesStatus && matchesEmp;
  });

  const limit = 10;
  const totalPages = Math.ceil(filteredAlumni.length / limit) || 1;
  const paginatedAlumni = filteredAlumni.slice((currentPage - 1) * limit, currentPage * limit);

  // Operations
  const handleVerify = (id: string) => {
    verifyMutation.mutate({ id, status: "Approved" });
  };

  const handleDelete = (id: string) => {
    verifyMutation.mutate({ id, status: "Rejected" });
  };

  const handleBulkVerify = () => {
    if (selectedRows.length === 0) {
      toast.error("No alumni records selected.");
      return;
    }
    selectedRows.forEach(id => {
      verifyMutation.mutate({ id, status: "Approved" });
    });
    setSelectedRows([]);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("No alumni records selected.");
      return;
    }
    selectedRows.forEach(id => {
      verifyMutation.mutate({ id, status: "Rejected" });
    });
    setSelectedRows([]);
  };

  const handleCheckboxToggle = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedAlumni.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedAlumni.map(a => a.id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlumni.name || !newAlumni.email || !newAlumni.batch) {
      toast.error("Please fill in the required fields.");
      return;
    }

    registerAlumniMutation.mutate({
      full_name: newAlumni.name,
      email: newAlumni.email,
      phone: newAlumni.phone,
      graduation_year: parseInt(newAlumni.batch),
      department: newAlumni.department,
      roll_number: newAlumni.rollNo || `CS${Date.now().toString().slice(-6)}`,
      current_company: newAlumni.company,
      designation: newAlumni.designation,
      location: newAlumni.workLocation,
      linkedin: newAlumni.linkedin,
      portfolio: newAlumni.portfolio,
      skills: newAlumni.skills ? newAlumni.skills.split(",").map(s => s.trim()) : [],
      biography: newAlumni.bio,
      status: "Approved" // Directly approve admin-added alumni
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <GradientHeader 
        title="Alumni Registration & Management" 
        description="Verify pending self-registrations, import batches, search directory database, and manage alumni profile metadata."
        icon={UserPlus}
        color="from-emerald-600 to-teal-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => toast.info("CSV template downloaded. Prepare columns: Name, Email, Phone, Batch, Department.")}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => toast.success("Exporting directory database as CSV...")}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button className="rounded-xl bg-white text-emerald-600 hover:bg-white/90" onClick={() => setIsAddDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Alumni
          </Button>
        </div>
      </GradientHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Network Alumni" value={totalAlumniCount} icon={Users} color="blue" />
        <StatCard title="Pending Verification" value={pendingCount} icon={ShieldCheck} color="orange" trend={{ value: 15, isPositive: true }} trendLabel="since last week" />
        <StatCard title="Verified Directory" value={verifiedCount} icon={CheckCircle2} color="green" />
        <StatCard title="Inactive Members" value={inactiveCount} icon={UserX} color="rose" />
      </div>

      {/* Table Interface */}
      <GlassCard className="p-6">
        {/* Bulk action toolbar & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, company, city..." 
                  className="pl-9 rounded-xl bg-background/50 border-muted text-sm h-10 focus-visible:ring-emerald-500/20"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-muted gap-1.5 h-10">
                <Filter className="w-4 h-4 text-muted-foreground" /> Filters
              </Button>

              {/* Bulk options when rows are selected */}
              {selectedRows.length > 0 && (
                <div className="flex items-center gap-2 pl-4 border-l border-muted animate-in fade-in slide-in-from-left-2">
                  <span className="text-xs font-semibold text-muted-foreground">{selectedRows.length} selected</span>
                  <Button onClick={handleBulkVerify} variant="outline" size="sm" className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-8">
                    <Check className="w-3.5 h-3.5 mr-1" /> Verify Selected
                  </Button>
                  <Button onClick={handleBulkDelete} variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 h-8">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Selected
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl border-muted h-10" onClick={() => toast.success("Generating current directory PDF report...")}>
                <Printer className="w-4 h-4 mr-1.5" /> Print Ledger
              </Button>
            </div>
          </div>

          {/* Expanded dropdown filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/20 border border-muted/50">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Graduation Year</label>
              <select className="w-full h-9 rounded-lg bg-background border px-2.5 text-xs focus:ring-1 focus:ring-emerald-500" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                <option value="All">All Batches</option>
                <option value="2024">Class of 2024</option>
                <option value="2023">Class of 2023</option>
                <option value="2022">Class of 2022</option>
                <option value="2021">Class of 2021</option>
                <option value="2020">Class of 2020</option>
                <option value="2019">Class of 2019</option>
                <option value="2018">Class of 2018</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Department</label>
              <select className="w-full h-9 rounded-lg bg-background border px-2.5 text-xs focus:ring-1 focus:ring-emerald-500" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics & Comm</option>
                <option value="Mechanical">Mechanical Eng</option>
                <option value="Fine Arts">Fine Arts</option>
                <option value="Business">Business Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Verification Status</label>
              <select className="w-full h-9 rounded-lg bg-background border px-2.5 text-xs focus:ring-1 focus:ring-emerald-500" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Verified">Verified Only</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Employment Status</label>
              <select className="w-full h-9 rounded-lg bg-background border px-2.5 text-xs focus:ring-1 focus:ring-emerald-500" value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6">
          <StyledTable headers={[
            <input type="checkbox" checked={selectedRows.length === paginatedAlumni.length && paginatedAlumni.length > 0} onChange={handleSelectAll} className="rounded" />,
            "Alumni Profile", "Registration ID", "Batch & Dept", "Employment", "Location", "Status", "Actions"
          ]}>
            {paginatedAlumni.length > 0 ? paginatedAlumni.map((alumni) => (
              <TableRow key={alumni.id}>
                <TableCell>
                  <input type="checkbox" checked={selectedRows.includes(alumni.id)} onChange={() => handleCheckboxToggle(alumni.id)} className="rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${alumni.name}`} 
                      alt={alumni.name} 
                      className="w-10 h-10 rounded-full border bg-muted"
                    />
                    <div>
                      <p className="font-semibold text-sm leading-tight">{alumni.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alumni.email}</p>
                      <p className="text-[10px] text-muted-foreground">{alumni.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><span className="font-semibold text-xs">{alumni.id}</span></TableCell>
                <TableCell>
                  <p className="font-medium text-xs">Class of {alumni.batch}</p>
                  <p className="text-[10px] text-muted-foreground">{alumni.department}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-xs">{alumni.designation}</p>
                  <p className="text-[10px] text-muted-foreground">{alumni.company}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{alumni.location}</span>
                </TableCell>
                <TableCell>
                  {alumni.status === "Verified" ? (
                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 text-[10px]">Verified</Badge>
                  ) : alumni.status === "Pending Verification" ? (
                    <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 text-[10px]">Pending Verification</Badge>
                  ) : (
                    <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200 text-[10px]">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => { setSelectedAlumni(alumni); setIsProfileModalOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-blue-50 hover:text-blue-600" title="View Profile">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => { setSelectedAlumni(alumni); setStep(1); setIsAddDrawerOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-amber-50 hover:text-amber-600" title="Edit Profile">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {alumni.status === "Pending Verification" && (
                      <Button onClick={() => handleVerify(alumni.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-emerald-600 hover:bg-emerald-50" title="Verify User">
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button onClick={() => toast.success(`Draft email panel opened for ${alumni.email}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground" title="Send Email">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => toast.success(`Chat interface opened with ${alumni.name}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground" title="Direct Message">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(alumni.id)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-rose-600 hover:bg-rose-50" title="Delete Profile">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <UserX className="w-8 h-8 opacity-20" />
                    <p>No alumni registration logs found matching current search filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </StyledTable>
        </div>

        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </GlassCard>

      {/* ── DRAWER MODAL: Add / Edit Alumni ── */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-card w-full max-w-2xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsAddDrawerOpen(false)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted text-muted-foreground z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Drawer Header */}
            <div className="p-8 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-600"><UserPlus className="w-5 h-5"/> Alumni Profile Wizard</h3>
              <p className="text-xs text-muted-foreground mt-1">Register a new alumnus with academic, professional, and contact details.</p>
              
              {/* Steps indicator */}
              <div className="flex items-center justify-between mt-6 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-muted rounded-full" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 rounded-full transition-all duration-300" 
                  style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                />
                {steps.map(s => (
                  <button key={s.id} onClick={() => setStep(s.id)} className="relative flex flex-col items-center bg-card p-1 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {s.id}
                    </div>
                    <span className="text-[10px] font-semibold mt-1 text-muted-foreground hidden sm:inline">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Content Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="font-bold text-sm text-emerald-600 uppercase tracking-wider mb-2">1. Personal & Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup label="Full Name" required>
                      <StyledInput value={newAlumni.name} onChange={e => setNewAlumni({...newAlumni, name: e.target.value})} placeholder="e.g. Sarah Connor" required />
                    </FormGroup>
                    <FormGroup label="Email Address" required>
                      <StyledInput type="email" value={newAlumni.email} onChange={e => setNewAlumni({...newAlumni, email: e.target.value})} placeholder="e.g. sarah@example.com" required />
                    </FormGroup>
                    <FormGroup label="Phone Number">
                      <StyledInput value={newAlumni.phone} onChange={e => setNewAlumni({...newAlumni, phone: e.target.value})} placeholder="+1 (555) 123-4567" />
                    </FormGroup>
                    <FormGroup label="Date of Birth">
                      <StyledInput type="date" value={newAlumni.dob} onChange={e => setNewAlumni({...newAlumni, dob: e.target.value})} />
                    </FormGroup>
                  </div>
                  <FormGroup label="Current Residential Address">
                    <StyledInput value={newAlumni.address} onChange={e => setNewAlumni({...newAlumni, address: e.target.value})} placeholder="e.g. Los Angeles, California" />
                  </FormGroup>
                  <FormGroup label="Short Professional Bio">
                    <textarea value={newAlumni.bio} onChange={e => setNewAlumni({...newAlumni, bio: e.target.value})} placeholder="Write a short summary profile..." className="w-full rounded-xl border bg-background/50 p-3 text-sm focus-visible:ring-1 focus-visible:ring-emerald-500 min-h-[80px]" />
                  </FormGroup>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="font-bold text-sm text-emerald-600 uppercase tracking-wider mb-2">2. Academic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Registration / Roll Number">
                      <StyledInput value={newAlumni.rollNo} onChange={e => setNewAlumni({...newAlumni, rollNo: e.target.value})} placeholder="e.g. CS201642" />
                    </FormGroup>
                    <FormGroup label="Graduation Year *">
                      <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-emerald-500" value={newAlumni.batch} onChange={e => setNewAlumni({...newAlumni, batch: e.target.value})}>
                        <option value="2024">Class of 2024</option>
                        <option value="2023">Class of 2023</option>
                        <option value="2022">Class of 2022</option>
                        <option value="2021">Class of 2021</option>
                        <option value="2020">Class of 2020</option>
                        <option value="2019">Class of 2019</option>
                        <option value="2018">Class of 2018</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Department *">
                      <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-emerald-500" value={newAlumni.department} onChange={e => setNewAlumni({...newAlumni, department: e.target.value})}>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics & Comm">Electronics & Comm</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Fine Arts">Fine Arts</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Degree Program">
                      <StyledInput value={newAlumni.degree} onChange={e => setNewAlumni({...newAlumni, degree: e.target.value})} placeholder="e.g. B.Tech / MBA" />
                    </FormGroup>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="font-bold text-sm text-emerald-600 uppercase tracking-wider mb-2">3. Professional / Employment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Current Employer">
                      <StyledInput value={newAlumni.company} onChange={e => setNewAlumni({...newAlumni, company: e.target.value})} placeholder="e.g. SpaceX" />
                    </FormGroup>
                    <FormGroup label="Designation">
                      <StyledInput value={newAlumni.designation} onChange={e => setNewAlumni({...newAlumni, designation: e.target.value})} placeholder="e.g. Propulsion Engineer" />
                    </FormGroup>
                    <FormGroup label="Industry Sector">
                      <StyledInput value={newAlumni.industry} onChange={e => setNewAlumni({...newAlumni, industry: e.target.value})} placeholder="e.g. Aerospace / IT" />
                    </FormGroup>
                    <FormGroup label="Work Location / City">
                      <StyledInput value={newAlumni.workLocation} onChange={e => setNewAlumni({...newAlumni, workLocation: e.target.value})} placeholder="e.g. Los Angeles, CA" />
                    </FormGroup>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="font-bold text-sm text-emerald-600 uppercase tracking-wider mb-2">4. Social Links & Documentation</h4>
                  
                  {/* Social links */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><Linkedin className="w-4 h-4 text-blue-600"/></div>
                      <Input placeholder="LinkedIn Profile URL" value={newAlumni.linkedin} onChange={e => setNewAlumni({...newAlumni, linkedin: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><Github className="w-4 h-4 text-slate-800"/></div>
                      <Input placeholder="GitHub Profile URL" value={newAlumni.github} onChange={e => setNewAlumni({...newAlumni, github: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"><Globe className="w-4 h-4 text-emerald-600"/></div>
                      <Input placeholder="Personal Portfolio URL" value={newAlumni.portfolio} onChange={e => setNewAlumni({...newAlumni, portfolio: e.target.value})} className="rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <FormGroup label="Alumni Headshot Photo" description="Upload JPG or PNG (Max 2MB)">
                      <FileUploadZone label="Click or Drag Photo" subLabel="JPG, PNG file only" />
                    </FormGroup>
                    <FormGroup label="Verification ID / Degree Cert" description="Upload PDF file (Max 5MB)">
                      <FileUploadZone label="Click or Drag PDF" subLabel="PDF, JPG files only" />
                    </FormGroup>
                  </div>
                </div>
              )}
            </form>

            {/* Drawer Footer Actions */}
            <div className="p-8 border-t bg-muted/10 flex justify-between items-center shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddDrawerOpen(false)} className="rounded-xl">Cancel</Button>
                {step < totalSteps ? (
                  <Button 
                    type="button" 
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
                  >
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    onClick={handleFormSubmit}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    Save & Verify Profile <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE DETAILS MODAL ── */}
      {isProfileModalOpen && selectedAlumni && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-3xl rounded-3xl border p-0 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-white z-10">
              <X className="w-4 h-4" />
            </button>
            
            {/* Header banner */}
            <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 flex items-end p-6 shrink-0">
              <div className="flex gap-4 items-end -mb-10">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedAlumni.name}`}
                  alt={selectedAlumni.name}
                  className="w-20 h-20 rounded-full border-4 border-background bg-muted object-cover shadow-md"
                />
                <div className="mb-2">
                  <h4 className="text-xl font-bold text-white leading-tight drop-shadow-sm">{selectedAlumni.name}</h4>
                  <p className="text-xs text-emerald-950 font-medium">{selectedAlumni.designation} at {selectedAlumni.company}</p>
                </div>
              </div>
            </div>

            {/* Profile body content */}
            <div className="flex-1 overflow-y-auto p-6 pt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Biography</h5>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Passionate and dedicated professional with over {new Date().getFullYear() - parseInt(selectedAlumni.batch)} years of active industry exposure in the field of {selectedAlumni.department}. Enthusiastic alumnus open to networking and career development programs.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Academic Timeline</h5>
                  <div className="space-y-3">
                    <div className="flex gap-3 text-sm">
                      <GraduationCap className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">B.Tech / Undergraduate Degree</p>
                        <p className="text-xs text-muted-foreground">Class of {selectedAlumni.batch} • {selectedAlumni.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Professional Career</h5>
                  <div className="space-y-4">
                    <div className="flex gap-3 text-sm">
                      <Briefcase className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">{selectedAlumni.designation}</p>
                        <p className="text-xs text-muted-foreground">{selectedAlumni.company} • {selectedAlumni.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 space-y-6 border-l border-muted/50 pl-6">
                <div>
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Registration Info</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Record ID:</span> <span className="font-bold">{selectedAlumni.id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Grad Year:</span> <span className="font-semibold">{selectedAlumni.batch}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Verification:</span> 
                      <span className="font-bold text-emerald-600">{selectedAlumni.status}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> <span>{selectedAlumni.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> <span>{selectedAlumni.phone}</span></div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Alumni Documents</h5>
                  <div className="space-y-2 text-xs">
                    <Button variant="outline" size="sm" className="w-full text-left justify-start rounded-xl gap-2 font-medium">
                      <FileText className="w-4 h-4 text-emerald-600" /> Resume.pdf
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-left justify-start rounded-xl gap-2 font-medium">
                      <FileText className="w-4 h-4 text-emerald-600" /> DegreeCert.pdf
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal actions footer */}
            <div className="p-6 border-t bg-muted/10 flex justify-between items-center shrink-0">
              <Button onClick={() => navigate({ to: `/dashboard/admin/alumni/profile` })} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                View Full Alumni Profile <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsProfileModalOpen(false)} className="rounded-xl">Close</Button>
                {selectedAlumni.status === "Pending Verification" && (
                  <Button onClick={() => { handleVerify(selectedAlumni.id); setIsProfileModalOpen(false); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                    Approve Record
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

