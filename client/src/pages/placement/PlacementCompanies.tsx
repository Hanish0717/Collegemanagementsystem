import { useState, useEffect } from "react";
import { Search, Plus, Grid, List, Loader2, X } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { fetchPlacementData, createCompany, updateCompany, CompanyItem, DriveItem } from "@/services/placementService";
import { companies as mockCompanies, drives as mockDrives } from "@/mock/mockData";
import { toast } from "sonner";

// Helper to return beautiful vector SVG logos for top companies
export const getCompanyLogo = (name: string) => {
  const clean = name.toLowerCase().trim();
  if (clean.includes("google")) {
    return (
      <div className="bg-white rounded-xl flex flex-col items-center justify-center size-full border border-slate-100 shadow-md p-4 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="absolute -top-12 -left-12 size-24 bg-blue-500/5 rounded-full blur-xl"></div>
        <div className="absolute -bottom-12 -right-12 size-24 bg-red-500/5 rounded-full blur-xl"></div>
        <div className="size-16 flex items-center justify-center relative">
          <svg viewBox="0 0 24 24" className="size-14 drop-shadow-[0_2px_8px_rgba(66,133,244,0.15)]">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <span className="text-slate-700 font-sans font-bold text-sm tracking-wide mt-1 select-none">Google</span>
      </div>
    );
  }
  if (clean.includes("microsoft")) {
    return (
      <div className="bg-[#f5f5f5] rounded-xl flex items-center justify-center size-full p-4 border shadow-inner">
        <svg viewBox="0 0 23 23" className="size-12">
          <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
          <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
          <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
          <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
        </svg>
        <span className="text-[#737373] font-sans font-semibold text-lg ml-2 tracking-tight">Microsoft</span>
      </div>
    );
  }
  if (clean.includes("amazon")) {
    return (
      <div className="bg-gradient-to-tr from-[#0F1115] to-[#1D212A] rounded-xl flex flex-col items-center justify-center size-full p-4 border border-slate-800 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF9900]/5 rounded-full blur-xl"></div>
        <div className="w-full flex items-center justify-center py-2">
          <svg viewBox="0 0 120 38" className="w-[85%] h-auto drop-shadow-[0_2px_8px_rgba(255,153,0,0.2)]" fill="none">
            {/* amazon text in bold modern sans */}
            <text x="52%" y="16" dominantBaseline="middle" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="19" letterSpacing="0.8">amazon</text>
            {/* orange smile curve */}
            <path d="M12 25 C34 32 72 32 94 25" stroke="#FF9900" strokeWidth="2.8" strokeLinecap="round" />
            {/* smile arrowhead */}
            <path d="M89 22.5 L95.5 25.5 L91 30.5" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#FF9900" />
          </svg>
        </div>
        <span className="text-slate-400 font-sans font-semibold text-xs tracking-widest mt-2.5 uppercase select-none">Amazon</span>
      </div>
    );
  }
  if (clean.includes("goldman")) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#072448] text-white rounded-xl size-full p-3 shadow-md">
        <span className="font-serif text-2xl font-bold tracking-tight">Goldman</span>
        <span className="font-serif text-sm font-light tracking-widest -mt-1 opacity-90">Sachs</span>
      </div>
    );
  }
  if (clean.includes("accenture")) {
    return (
      <div className="flex items-center justify-center bg-black text-white rounded-xl size-full p-4 relative shadow-md">
        <span className="font-sans font-bold text-2xl tracking-tighter">accenture</span>
        <span className="text-[#A100FF] font-sans font-extrabold text-3xl ml-0.5">&gt;</span>
      </div>
    );
  }
  if (clean.includes("tcs") || clean.includes("tata consultancy")) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-tr from-[#003366] to-[#0066cc] text-white rounded-xl size-full p-2 shadow-md">
        <span className="font-sans font-black text-2xl tracking-widest">TCS</span>
        <span className="text-[9px] uppercase tracking-widest opacity-80 mt-0.5 text-center">TATA CONSULTANCY SERVICES</span>
      </div>
    );
  }
  if (clean.includes("infosys")) {
    return (
      <div className="flex items-center justify-center bg-white text-[#007CC3] size-full border border-blue-100 rounded-xl p-3 shadow-inner">
        <span className="font-sans font-black text-3xl tracking-tighter italic">Infosys</span>
      </div>
    );
  }
  if (clean.includes("oracle")) {
    return (
      <div className="bg-gradient-to-br from-[#A50909] to-[#E51212] rounded-xl flex flex-col items-center justify-center size-full p-4 shadow-md border border-[#8C0707] relative overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="size-16 flex items-center justify-center relative">
          <svg viewBox="0 0 260 56" className="w-[85%] h-auto drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            {/* O */}
            <path fill="#ffffff" d="M30 48c11.046 0 20-8.954 20-20S41.046 8 30 8s-20 8.954-20 20 8.954 20 20 20zm0-7.5c-6.904 0-12.5-5.596-12.5-12.5S23.096 15.5 30 15.5s12.5 5.596 12.5 12.5-5.596 12.5-12.5 12.5z"/>
            {/* R */}
            <path fill="#ffffff" d="M68 8h17.5c7.5 0 12.5 3.5 12.5 10c0 5-3.5 8.5-8.5 9.5l10.5 19.5c.3.5.3 1 0 1.5H89.5l-9.5-19.5H75.5V48H68V8zm7.5 14h8.5c3.5 0 5.5-1.5 5.5-4s-2-4-5.5-4h-8.5v8z"/>
            {/* A */}
            <path fill="#ffffff" d="M125.5 8l17 40h-8l-4-10.5h-15L111.5 48h-8l17-40h5zm2.5 23l-5-13.5-5 13.5h10z"/>
            {/* C */}
            <path fill="#ffffff" d="M180.5 48c-11.046 0-20-8.954-20-20s8.954-20 20-20c7.5 0 13.5 3.5 16.5 9.5l-6.5 3.5c-2-4.5-5.5-6.5-10-6.5-6.904 0-12.5 5.596-12.5 12.5s5.596 12.5 12.5 12.5c4.5 0 8-2 10-6.5l6.5 3.5c-3 6-9 9.5-16.5 9.5z"/>
            {/* L */}
            <path fill="#ffffff" d="M211 8v32.5h15.5V48H203.5V8H211z"/>
            {/* E */}
            <path fill="#ffffff" d="M231.5 8h22v7.5h-14.5v9h12.5v7.5h-12.5v9h14.5V48h-22V8z"/>
          </svg>
        </div>
        <span className="text-white/80 font-sans font-bold text-xs tracking-wider mt-1 uppercase select-none">Oracle</span>
      </div>
    );
  }
  
  // Clean fallback card for user-defined new companies
  const char = name.charAt(0).toUpperCase();
  const colors = [
    "from-rose-500 to-orange-500",
    "from-teal-500 to-emerald-500",
    "from-blue-600 to-indigo-600",
    "from-purple-600 to-pink-500",
    "from-amber-500 to-yellow-500"
  ];
  const index = name.length % colors.length;
  return (
    <div className={`rounded-xl bg-gradient-to-br ${colors[index]} text-white flex flex-col items-center justify-center size-full p-4 relative overflow-hidden shadow-md`}>
      <span className="font-sans font-black text-4xl tracking-tighter select-none">{char}</span>
      <span className="text-xs font-bold tracking-wider mt-1 opacity-90 select-none uppercase truncate max-w-[85%]">{name}</span>
    </div>
  );
};

export function PlacementCompanies() {
  const [companies, setCompanies] = useState<CompanyItem[]>(mockCompanies);
  const [drives, setDrives] = useState<DriveItem[]>(mockDrives);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  // Modal & Saving state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // View & Edit Modal States
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form input states
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [hrContact, setHrContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [packageAmount, setPackageAmount] = useState("");
  const [previousYearHires, setPreviousYearHires] = useState(0);
  const [hiringStatus, setHiringStatus] = useState("Active");



  useEffect(() => {
    fetchPlacementData()
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          setCompanies(res.companies);
        }
        if (res.drives && res.drives.length > 0) {
          setDrives(res.drives);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch live companies list, using fallback mock data:", err);
        setLoading(false);
      });
  }, []);

  const industries = ["All", "Technology", "Finance", "Consulting", "IT Services", "E-commerce"];

  const filteredCompanies = companies.filter(
    (comp) =>
      (selectedIndustry === "All" || comp.industry === selectedIndustry) &&
      (comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.industry.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getCompanyDrives = (companyName: string) => {
    return drives.filter((d) => d.company.toLowerCase() === companyName.toLowerCase()).length;
  };

  const resetForm = () => {
    setName("");
    setIndustry("Technology");
    setHrContact("");
    setEmail("");
    setPhone("");
    setPackageAmount("");
    setPreviousYearHires(0);
    setHiringStatus("Active");
  };

  const openViewModal = (company: CompanyItem) => {
    setSelectedCompany(company);
    setIsViewModalOpen(true);
  };

  const openEditModal = (company: CompanyItem) => {
    setSelectedCompany(company);
    setName(company.name);
    setIndustry(company.industry);
    setHrContact(company.hrContact);
    setEmail(company.email || "");
    setPhone(company.phone || "");
    setPackageAmount(company.package);
    setPreviousYearHires(company.previousYearHires);
    setHiringStatus(company.hiringStatus);
    setIsEditModalOpen(true);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }
    setIsSaving(true);
    try {
      const newCompany = await createCompany({
        name,
        industry,
        hrContact,
        email,
        phone,
        package: packageAmount || "8.0 LPA",
        previousYearHires: Number(previousYearHires) || 0,
        hiringStatus
      });
      setCompanies((prev) => [newCompany, ...prev]);
      toast.success("Company added successfully!");
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to add company";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateCompany(selectedCompany.id, {
        name,
        industry,
        hrContact,
        email,
        phone,
        package: packageAmount,
        previousYearHires: Number(previousYearHires) || 0,
        hiringStatus
      });
      setCompanies((prev) => prev.map((c) => (c.id === selectedCompany.id ? updated : c)));
      toast.success("Company updated successfully!");
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update company";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Management"
        desc="Manage recruiting companies, job openings and partnerships."
        actions={
          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
          >
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
            {industries.map((ind) => (
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

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading companies dataset...</span>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:-translate-y-1 transition flex flex-col">
              <div className="aspect-video w-full mb-4">
                {getCompanyLogo(company.name)}
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
                    <div className="font-bold text-lg">{getCompanyDrives(company.name)}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => openViewModal(company)}
                  className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition cursor-pointer"
                >
                  View
                </button>
                <button 
                  onClick={() => openEditModal(company)}
                  className="flex-1 px-3 py-2 rounded-lg border text-xs font-medium hover:bg-accent transition cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Industry
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Package
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    HR Contact
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Prev. Hires
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCompanies.map((company) => (
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
                    <td className="py-3 px-4 text-center font-medium">
                      {company.previousYearHires}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-center">
                        <button 
                          onClick={() => openViewModal(company)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => openEditModal(company)}
                          className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
                        >
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


      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Add Recruiting Company</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Industry *</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                    <option value="IT Services">IT Services</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Salary Package (LPA) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12.0 LPA"
                    value={packageAmount}
                    onChange={(e) => setPackageAmount(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">HR Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjali Sharma"
                    value={hrContact}
                    onChange={(e) => setHrContact(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">HR Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Previous Hires Count</label>
                  <input
                    type="number"
                    min="0"
                    value={previousYearHires}
                    onChange={(e) => setPreviousYearHires(parseInt(e.target.value) || 0)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Hiring Status</label>
                  <select
                    value={hiringStatus}
                    onChange={(e) => setHiringStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Add Company"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Company Modal */}
      {isViewModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Company Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-soft border">
                <div className="size-16 flex-shrink-0">
                  {getCompanyLogo(selectedCompany.name)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedCompany.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedCompany.industry}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-xl bg-background/50">
                  <span className="text-xs text-muted-foreground block">Salary Package</span>
                  <span className="font-bold text-sm text-emerald-600">{selectedCompany.package}</span>
                </div>
                <div className="p-3 border rounded-xl bg-background/50">
                  <span className="text-xs text-muted-foreground block">Hiring Status</span>
                  <Badge tone={selectedCompany.hiringStatus === "Active" ? "success" : "warn"} className="mt-1">
                    {selectedCompany.hiringStatus}
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-background/30 space-y-2.5">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">HR & Contact Info</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">HR Contact</span>
                    <span className="font-medium">{selectedCompany.hrContact}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span className="font-medium">{selectedCompany.phone || "N/A"}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-xs text-muted-foreground block">Email Address</span>
                    <span className="font-medium text-primary select-all">{selectedCompany.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-xl text-center">
                  <span className="text-xs text-muted-foreground block">Previous Year Hires</span>
                  <span className="font-bold text-base mt-1 block">{selectedCompany.previousYearHires}</span>
                </div>
                <div className="p-3 border rounded-xl text-center">
                  <span className="text-xs text-muted-foreground block">Active Drives</span>
                  <span className="font-bold text-base mt-1 block">{getCompanyDrives(selectedCompany.name)}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-lg p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gradient">Edit Recruiting Company</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleEditCompany} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Industry *</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Consulting">Consulting</option>
                    <option value="IT Services">IT Services</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Salary Package (LPA) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12.0 LPA"
                    value={packageAmount}
                    onChange={(e) => setPackageAmount(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">HR Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjali Sharma"
                    value={hrContact}
                    onChange={(e) => setHrContact(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">HR Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Previous Hires Count</label>
                  <input
                    type="number"
                    min="0"
                    value={previousYearHires}
                    onChange={(e) => setPreviousYearHires(parseInt(e.target.value) || 0)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Hiring Status</label>
                  <select
                    value={hiringStatus}
                    onChange={(e) => setHiringStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-muted-foreground font-semibold hover:bg-accent transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold glow-primary hover:opacity-95 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
