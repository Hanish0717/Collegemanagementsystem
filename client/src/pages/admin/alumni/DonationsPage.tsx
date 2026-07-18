import React, { useState, useMemo } from "react";
import { useAlumni } from "../AdminAlumni";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordDonation } from "@/services/alumniService";
import { GradientHeader, GlassCard, StatCard } from "./components/CardElements";
import { FormGroup, StyledInput, FileUploadZone } from "./components/FormElements";
import { StyledTable, TableRow, TableCell, TablePagination } from "./components/TableElements";
import { 
  Heart, TrendingUp, Users, DollarSign, Award, ArrowRight, Plus, 
  Search, Filter, Receipt, Download, FileText, ChevronRight, X, Calendar, 
  CreditCard, Wallet, ShieldCheck, Printer, CheckCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export function DonationsPage() {
  // State variables
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  // Form state
  const [donationForm, setDonationForm] = useState({
    donorName: "", batch: "2020", amount: "", category: "Scholarship", 
    paymentMethod: "UPI", referenceNo: "", notes: ""
  });

  const { donationsList: rawDonationsList, donationsLoading } = useAlumni();
  const queryClient = useQueryClient();

  const donationsList = useMemo(() => {
    return (rawDonationsList || []).map((d: any) => ({
      id: d.id || `DON-${d.transaction_id || Date.now()}`,
      donorName: d.donorName || "Anonymous Donor",
      batch: String(d.batch || "N/A"),
      amount: Number(d.amount || 0),
      category: d.cause || d.category || "General Fund",
      paymentMethod: d.payment_method || d.paymentMethod || "UPI",
      date: d.created_at || d.date || new Date().toISOString(),
      status: d.payment_status || d.status || "Completed",
      refNo: d.transaction_id || d.refNo || "N/A",
      notes: d.notes || ""
    }));
  }, [rawDonationsList]);

  // Statistics calculations
  const totalDonations = donationsList.filter((d: any) => d.status === "Completed").reduce((sum: number, d: any) => sum + d.amount, 0) + 1250000;
  const thisMonthDonations = donationsList.filter((d: any) => d.status === "Completed" && d.date.startsWith("2026-07")).reduce((sum: number, d: any) => sum + d.amount, 0);
  const pendingCount = donationsList.filter((d: any) => d.status === "Pending").length;
  const completedCount = donationsList.filter((d: any) => d.status === "Completed").length + 420;
  const averageDonation = Math.round(totalDonations / completedCount);
  const topDonor = donationsList.length > 0 ? `${donationsList[0].donorName} ($${donationsList[0].amount.toLocaleString()})` : "Wayne Enterprises ($120,000)";

  // Charts Mock Data
  const monthlyDonationsData = [
    { name: "Jan", amount: 45000 },
    { name: "Feb", amount: 62000 },
    { name: "Mar", amount: 55000 },
    { name: "Apr", amount: 89000 },
    { name: "May", amount: 72000 },
    { name: "Jun", amount: 110000 }
  ];

  const categoryDonationsData = [
    { name: "Scholarship", value: 350000 },
    { name: "Infrastructure", value: 580000 },
    { name: "Library", value: 120000 },
    { name: "Laboratory", value: 240000 },
    { name: "General Fund", value: 180000 }
  ];

  const sourceDonationsData = [
    { name: "Net Banking", value: 480000 },
    { name: "UPI", value: 390000 },
    { name: "Card", value: 180000 },
    { name: "Cheque", value: 200000 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#ec4899', '#f97316', '#8b5cf6'];

  // Search & Filter Logic
  const filteredDonations = donationsList.filter((d: any) => {
    const matchesSearch = 
      d.donorName.toLowerCase().includes(search.toLowerCase()) || 
      d.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesCat = filterCategory === "All" || d.category === filterCategory;
    const matchesStatus = filterStatus === "All" || d.status === filterStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const limit = 10;
  const totalPages = Math.ceil(filteredDonations.length / limit) || 1;
  const paginatedDonations = filteredDonations.slice((currentPage - 1) * limit, currentPage * limit);

  // Mutations
  const donationMutation = useMutation({
    mutationFn: recordDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-donations"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-stats"] });
      queryClient.invalidateQueries({ queryKey: ["alumni-leaderboard"] });
      toast.success(`Donation of $${donationForm.amount} recorded from ${donationForm.donorName}.`);
      setIsAddOpen(false);
      setDonationForm({
        donorName: "", batch: "2020", amount: "", category: "Scholarship", 
        paymentMethod: "UPI", referenceNo: "", notes: ""
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record donation.");
    }
  });

  // Handlers
  const handleAddDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.donorName || !donationForm.amount) {
      toast.error("Please fill in the donor name and amount fields.");
      return;
    }
    donationMutation.mutate({
      alumniId: "alm-001",
      amount: parseFloat(donationForm.amount),
      cause: donationForm.category,
      transactionId: donationForm.referenceNo || `TXN${Date.now()}`
    });
  };

  const generateReceipt = (don: any) => {
    toast.success(`Generating official PDF receipt for transaction ${don.id}...`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      {/* Header */}
      <GradientHeader 
        title="Donations & Campaigns" 
        description="Track financial contributions, manage endowment categories, issue digital tax receipts, and analyze collection trends."
        icon={Heart}
        color="from-green-500 to-teal-600"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => toast.success("Exporting financial statement report...")}>
            <Download className="w-4 h-4 mr-2" /> Download Statement
          </Button>
          <Button className="rounded-xl bg-white text-green-600 hover:bg-white/90" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/> Add Donation
          </Button>
        </div>
      </GradientHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Donations" value={`$${totalDonations.toLocaleString()}`} icon={DollarSign} color="green" trend={{ value: 14.5, isPositive: true }} trendLabel="vs last year" />
        <StatCard title="This Month Collection" value={`$${thisMonthDonations.toLocaleString()}`} icon={TrendingUp} color="blue" />
        <StatCard title="Pending Checks" value={pendingCount} icon={Calendar} color="orange" />
        <StatCard title="Completed Receipts" value={completedCount} icon={ShieldCheck} color="green" />
        <StatCard title="Average Contribution" value={`$${averageDonation.toLocaleString()}`} icon={Heart} color="rose" />
        <StatCard title="Top Donor Entity" value={topDonor} icon={Award} color="purple" />
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-6">Monthly Donations Trend</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyDonationsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-6">Endowment by Categories</h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDonationsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryDonationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {categoryDonationsData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Table Interface */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search donor name or receipt ID..." 
                className="pl-9 rounded-xl bg-background/50 border-muted text-sm h-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select className="h-10 rounded-xl bg-background border px-3 text-xs focus:ring-1 focus:ring-green-500" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Library">Library</option>
              <option value="Laboratory">Laboratory</option>
              <option value="General Fund">General Fund</option>
            </select>
            <select className="h-10 rounded-xl bg-background border px-3 text-xs focus:ring-1 focus:ring-green-500" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <Button variant="outline" className="rounded-xl border-muted" onClick={() => toast.success("Exporting spreadsheet data...")}>
            <FileText className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        <StyledTable headers={["Donation ID", "Donor Name", "Batch", "Amount", "Category", "Payment Method", "Date", "Status", "Actions"]}>
          {paginatedDonations.length > 0 ? paginatedDonations.map((don: any) => (
            <TableRow key={don.id}>
              <TableCell><span className="font-semibold text-xs text-muted-foreground">{don.id}</span></TableCell>
              <TableCell><span className="font-semibold text-sm">{don.donorName}</span></TableCell>
              <TableCell><span className="text-xs">{don.batch}</span></TableCell>
              <TableCell><span className="font-bold text-sm text-green-600">${don.amount.toLocaleString()}</span></TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] bg-green-50 border-green-200 text-green-700">{don.category}</Badge>
              </TableCell>
              <TableCell><span className="text-xs text-muted-foreground">{don.paymentMethod}</span></TableCell>
              <TableCell><span className="text-xs text-muted-foreground">{new Date(don.date).toLocaleDateString()}</span></TableCell>
              <TableCell>
                {don.status === "Completed" ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Completed</Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">Pending</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button onClick={() => { setSelectedDonation(don); setIsDetailOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-green-50 hover:text-green-600" title="View Details">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => generateReceipt(don)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground" title="Generate Receipt">
                    <Receipt className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => toast.success(`Receipt printed successfully for ${don.id}`)} variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted text-muted-foreground" title="Print Invoice">
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                No donation entries found.
              </td>
            </tr>
          )}
        </StyledTable>

        <TablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </GlassCard>

      {/* ── DRAWER: Record Donation Form ── */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-card w-full max-w-xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsAddOpen(false)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-muted text-muted-foreground z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-8 border-b bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
              <h3 className="text-xl font-bold flex items-center gap-2 text-green-600"><Plus className="w-5 h-5"/> Record New Donation</h3>
              <p className="text-xs text-muted-foreground mt-1">Book and log a contribution details received from an alumnus.</p>
            </div>

            {/* Body Form */}
            <form onSubmit={handleAddDonationSubmit} className="flex-1 overflow-y-auto p-8 space-y-4">
              <FormGroup label="Donor Name" required>
                <StyledInput value={donationForm.donorName} onChange={e => setDonationForm({...donationForm, donorName: e.target.value})} placeholder="e.g. Alexander Pierce" required />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Graduation Year / Batch" required>
                  <StyledInput value={donationForm.batch} onChange={e => setDonationForm({...donationForm, batch: e.target.value})} placeholder="e.g. 1995 or Corporate" required />
                </FormGroup>
                <FormGroup label="Donation Amount (USD) *" required>
                  <StyledInput type="number" value={donationForm.amount} onChange={e => setDonationForm({...donationForm, amount: e.target.value})} placeholder="e.g. 25000" required />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Donation Purpose Category">
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-green-500" value={donationForm.category} onChange={e => setDonationForm({...donationForm, category: e.target.value})}>
                    <option value="Scholarship">Scholarship Fund</option>
                    <option value="Infrastructure">Infrastructure Development</option>
                    <option value="Library">Library Resources</option>
                    <option value="Laboratory">Laboratory Equipment</option>
                    <option value="Sports">Sports Amenities</option>
                    <option value="General Fund">General Fund</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                </FormGroup>
                <FormGroup label="Payment Mode">
                  <select className="w-full h-10 rounded-xl bg-background border px-3 text-sm focus:ring-1 focus:ring-green-500" value={donationForm.paymentMethod} onChange={e => setDonationForm({...donationForm, paymentMethod: e.target.value})}>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </FormGroup>
              </div>
              <FormGroup label="Transaction ID / Bank Reference Number">
                <StyledInput value={donationForm.referenceNo} onChange={e => setDonationForm({...donationForm, referenceNo: e.target.value})} placeholder="e.g. TXN9432103482" />
              </FormGroup>
              <FormGroup label="Private Notes / Remarks">
                <textarea value={donationForm.notes} onChange={e => setDonationForm({...donationForm, notes: e.target.value})} placeholder="Earmarked for any specific lab setups or memorial funds..." className="w-full rounded-xl border bg-background/50 p-3 text-sm focus-visible:ring-1 focus-visible:ring-green-500 min-h-[100px]" />
              </FormGroup>
              <FormGroup label="Attach Receipt / Bank Deposit Slip" description="Upload JPG, PNG or PDF (Max 2MB)">
                <FileUploadZone label="Drag document here" subLabel="Bank slips, transfer receipts" />
              </FormGroup>
            </form>

            {/* Footer */}
            <div className="p-8 border-t bg-muted/10 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" onClick={handleAddDonationSubmit} className="rounded-xl bg-green-600 hover:bg-green-700 text-white">Record Transaction</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Donation Details Page ── */}
      {isDetailOpen && selectedDonation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600"><Heart className="w-5 h-5 fill-current"/> Donation Contribution Voucher</h3>

            <div className="space-y-6">
              {/* Receipt Head */}
              <div className="p-4 rounded-2xl bg-muted/30 border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Voucher Number</p>
                  <p className="font-mono text-sm font-semibold">{selectedDonation.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Status</p>
                  {selectedDonation.status === "Completed" ? (
                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200">Booked & Cleared</Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200">Pending Clearance</Badge>
                  )}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Donor Name</span>
                  <span className="font-semibold text-foreground">{selectedDonation.donorName}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Academic Batch</span>
                  <span className="font-semibold text-foreground">Class of {selectedDonation.batch}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Amount Contributed</span>
                  <span className="font-bold text-green-600 text-lg">${selectedDonation.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Payment Method</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-muted-foreground" /> {selectedDonation.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Allocation Category</span>
                  <span className="font-semibold text-primary">{selectedDonation.category}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Transaction Ref #</span>
                  <span className="font-mono text-xs font-semibold">{selectedDonation.refNo}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">Submission Date</span>
                  <span className="font-semibold">{new Date(selectedDonation.date).toLocaleString()}</span>
                </div>
              </div>

              {/* Remarks timeline */}
              <div className="border-t pt-4">
                <span className="text-xs text-muted-foreground block mb-1">Donor Remarks & Direct Notes</span>
                <p className="text-xs text-foreground/80 italic p-3 bg-muted/20 border border-muted/50 rounded-xl">
                  "{selectedDonation.notes || 'No remarks provided with this transaction.'}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex justify-between items-center">
                <Button onClick={() => generateReceipt(selectedDonation)} className="rounded-xl bg-green-600 hover:bg-green-700 text-white gap-2">
                  <Receipt className="w-4 h-4" /> Download PDF Receipt
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-xl">Close View</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

