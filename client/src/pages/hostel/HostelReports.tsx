import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Loader2,
  Printer,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  Users,
  DollarSign,
  Home,
  Bed,
  TrendingUp,
  FileDown,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

import {
  fetchResidentReport,
  fetchOccupancyReport,
  fetchBlockReport,
  fetchFeeReport,
  fetchAvailableRoomsReport,
  fetchDashboardAnalytics,
  exportResidentPDF,
  exportResidentExcel,
  exportOccupancyPDF,
  exportOccupancyExcel,
  exportFeePDF,
  exportFeeExcel,
  exportAvailableRoomsExcel,
  exportBlocksExcel,
} from "@/services/hostelReportService";

// ── CSV Export Helper ──────────────────────────────────────────────────────────
function downloadCSV(rows: Record<string, any>[], filename: string) {
  if (!rows || rows.length === 0) {
    toast.error("No data available to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          return typeof val === "string" && val.includes(",") ? `"${val}"` : String(val);
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`${filename} exported successfully!`);
}

// ── Aggregation helpers ────────────────────────────────────────────────────────
function buildOccupancyChartData(rooms: any[]) {
  const byBlock: Record<string, { occupied: number; available: number }> = {};
  rooms.forEach((r) => {
    if (!byBlock[r.block]) byBlock[r.block] = { occupied: 0, available: 0 };
    byBlock[r.block].occupied += r.occupants;
    byBlock[r.block].available += r.available;
  });
  return Object.entries(byBlock).map(([block, v]) => ({ block, ...v }));
}

function buildFeeChartData(fees: any[]) {
  const byStatus: Record<string, number> = { Paid: 0, Pending: 0, Overdue: 0 };
  fees.forEach((f) => {
    if (byStatus[f.status] !== undefined) byStatus[f.status] += f.totalAmount;
  });
  return Object.entries(byStatus).map(([status, amount]) => ({ status, amount }));
}

function buildComplaintChartData(complaints: any[]) {
  const byStatus: Record<string, number> = { "Pending": 0, "In-Progress": 0, "Resolved": 0 };
  complaints.forEach((c) => {
    if (byStatus[c.status] !== undefined) byStatus[c.status]++;
  });
  return Object.entries(byStatus).map(([status, count]) => ({ status, count }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export function HostelReports() {
  const [activeReport, setActiveReport] = useState<
    | "residents"
    | "occupancy"
    | "block"
    | "fees"
    | "available-rooms"
  >("residents");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: residentData, isLoading: residentLoading } = useQuery({
    queryKey: ["hostel-report-residents", filters, searchTerm, sortBy, sortOrder],
    queryFn: () => fetchResidentReport({ ...filters, search: searchTerm, sortBy, order: sortOrder }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: occupancyData, isLoading: occupancyLoading } = useQuery({
    queryKey: ["hostel-report-occupancy", filters],
    queryFn: () => fetchOccupancyReport(filters),
    staleTime: 1000 * 60 * 5,
  });

  const { data: blockData, isLoading: blockLoading } = useQuery({
    queryKey: ["hostel-report-blocks", filters],
    queryFn: () => fetchBlockReport(filters),
    staleTime: 1000 * 60 * 5,
  });

  const { data: feeData, isLoading: feeLoading } = useQuery({
    queryKey: ["hostel-report-fees", filters],
    queryFn: () => fetchFeeReport(filters),
    staleTime: 1000 * 60 * 5,
  });

  const { data: availableRoomsData, isLoading: availableRoomsLoading } = useQuery({
    queryKey: ["hostel-report-available-rooms", filters],
    queryFn: () => fetchAvailableRoomsReport(filters),
    staleTime: 1000 * 60 * 5,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["hostel-analytics"],
    queryFn: fetchDashboardAnalytics,
    staleTime: 1000 * 60 * 5,
  });

  const handleExport = useCallback(async (format: "pdf" | "excel", type: string) => {
    setExporting(`${type}-${format}`);
    try {
      if (type === "residents") {
        format === "pdf" ? await exportResidentPDF(filters) : await exportResidentExcel(filters);
      } else if (type === "occupancy") {
        format === "pdf" ? await exportOccupancyPDF(filters) : await exportOccupancyExcel(filters);
      } else if (type === "fees") {
        format === "pdf" ? await exportFeePDF(filters) : await exportFeeExcel(filters);
      } else if (type === "available-rooms") {
        await exportAvailableRoomsExcel(filters);
      } else if (type === "block") {
        await exportBlocksExcel(filters);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  }, [filters]);

  const handlePrint = () => window.print();

  const occupancyChartData = useMemo(() => {
    if (!occupancyData?.byBlock) return [];
    return occupancyData.byBlock.map((b: any) => ({
      name: b.blockName,
      occupied: b.occupiedBeds,
      available: b.availableBeds,
      occupancyRate: b.occupancyPercentage,
    }));
  }, [occupancyData]);

  const feeChartData = useMemo(() => {
    if (!feeData?.summary) return [];
    return [
      { name: "Paid", value: feeData.summary.paidAmount },
      { name: "Pending", value: feeData.summary.pendingAmount },
      { name: "Overdue", value: 0 },
    ];
  }, [feeData]);

  const blockChartData = useMemo(() => {
    if (!blockData?.data) return [];
    return blockData.data.map((b: any) => ({ name: b.blockName, beds: b.capacity, occupied: b.occupiedBeds, available: b.availableBeds }));
  }, [blockData]);

  const getStatusTone = (status: string) => {
    if (!status) return "info";
    const s = status.toLowerCase();
    if (s === "paid" || s === "active" || s === "available" || s === "occupied") return "success";
    if (s === "pending" || s === "partial") return "warn";
    return "danger";
  };

  const formatCurrency = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt || 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Hostel Reports & Analytics" desc="Reports, exports, and dashboard metrics" />

      {!analyticsLoading && analyticsData && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="size-4" /> Total Residents</div>
            <div className="text-3xl font-bold mt-2">{analyticsData.totalResidents}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Bed className="size-4" /> Total Rooms</div>
            <div className="text-3xl font-bold mt-2">{analyticsData.totalRooms}</div>
            <div className="text-xs text-muted-foreground mt-2">{analyticsData.occupiedRooms} occupied</div>
          </Card>
          <Card>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="size-4" /> Total Revenue</div>
            <div className="text-2xl font-bold mt-2">{formatCurrency(analyticsData.totalRevenue)}</div>
          </Card>
          <Card>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="size-4" /> Occupancy Rate</div>
            <div className="text-3xl font-bold mt-2 text-indigo-600">{analyticsData.occupancyRate}%</div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {[{ id: 'residents', label: 'Residents' }, { id: 'occupancy', label: 'Occupancy' }, { id: 'block', label: 'Blocks' }, { id: 'fees', label: 'Fees' }, { id: 'available-rooms', label: 'Available Rooms' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveReport(tab.id as any)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeReport === tab.id ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 hover:bg-accent'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setExpandedFilters(!expandedFilters)} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-accent transition flex items-center gap-2"><Filter className="size-4" /> Filters</button>
            <button onClick={handlePrint} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-accent transition flex items-center gap-2"><Printer className="size-4" /> Print</button>
            <div className="relative group">
              <button className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:opacity-95 transition flex items-center gap-2"><FileDown className="size-4" /> Export <ChevronDown className="size-4" /></button>
              <div className="absolute right-0 mt-2 w-48 bg-background border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg hidden group-hover:block z-10">
                <button onClick={() => handleExport('pdf', activeReport)} disabled={exporting === `${activeReport}-pdf`} className="block w-full text-left px-4 py-2 hover:bg-accent text-sm transition disabled:opacity-50">{exporting === `${activeReport}-pdf` ? <>Exporting...</> : 'Export as PDF'}</button>
                <button onClick={() => handleExport('excel', activeReport)} disabled={exporting === `${activeReport}-excel`} className="block w-full text-left px-4 py-2 hover:bg-accent text-sm transition disabled:opacity-50">{exporting === `${activeReport}-excel` ? <>Exporting...</> : 'Export as Excel'}</button>
              </div>
            </div>
          </div>
        </div>

        {expandedFilters && (
          <div className="border-t pt-4 mb-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Hostel Block</label>
                <input placeholder="Block ID" value={filters.blockId || ''} onChange={(e) => setFilters({ ...filters, blockId: e.target.value || undefined })} className="w-full mt-1 px-3 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Room Type</label>
                <select value={filters.roomType || ''} onChange={(e) => setFilters({ ...filters, roomType: e.target.value || undefined })} className="w-full mt-1 px-3 py-2 rounded-lg border">
                  <option value="">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">AC/Non-AC</label>
                <select value={filters.acType || ''} onChange={(e) => setFilters({ ...filters, acType: e.target.value || undefined })} className="w-full mt-1 px-3 py-2 rounded-lg border">
                  <option value="">All</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Status</label>
                <select value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })} className="w-full mt-1 px-3 py-2 rounded-lg border">
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <button onClick={() => setFilters({})} className="text-xs text-muted-foreground hover:text-foreground transition">Clear Filters</button>
          </div>
        )}
      </Card>

      <Card>
        {activeReport === 'residents' && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search residents" className="w-full pl-10 py-2.5 rounded-lg border" />
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-lg border">
                <option value="name">Sort by Name</option>
                <option value="registrationNumber">Sort by Reg No</option>
                <option value="roomNumber">Sort by Room</option>
              </select>
              <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-4 py-2.5 rounded-lg border">{sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}</button>
            </div>

            {residentLoading ? (
              <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="size-5 animate-spin text-primary" /><span>Loading residents...</span></div>
            ) : residentData?.data && residentData.data.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Reg No</th>
                      <th className="text-left px-4 py-3">Block</th>
                      <th className="text-left px-4 py-3">Room</th>
                      <th className="text-left px-4 py-3">Check-In</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residentData.data.map((r: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{r.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.registrationNumber}</td>
                        <td className="px-4 py-3">{r.hostelBlock}</td>
                        <td className="px-4 py-3 font-medium">{r.roomNumber}</td>
                        <td className="px-4 py-3">{r.checkInDate ? new Date(r.checkInDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3"><Badge tone={getStatusTone(r.status)}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground"><AlertCircle className="mr-2" /> No residents found</div>
            )}
          </div>
        )}

        {activeReport === 'occupancy' && (
          <div>
            {occupancyLoading ? (
              <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="size-5 animate-spin text-primary" /><span>Loading occupancy...</span></div>
            ) : (
              <>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <Card><div className="text-xs text-muted-foreground">Total Rooms</div><div className="text-2xl font-bold mt-2">{occupancyData?.summary?.totalRooms}</div></Card>
                  <Card><div className="text-xs text-muted-foreground">Total Beds</div><div className="text-2xl font-bold mt-2">{occupancyData?.summary?.totalBeds}</div></Card>
                  <Card><div className="text-xs text-muted-foreground">Available Beds</div><div className="text-2xl font-bold mt-2 text-emerald-600">{occupancyData?.summary?.totalAvailableBeds}</div></Card>
                  <Card><div className="text-xs text-muted-foreground">Occupancy Rate</div><div className="text-2xl font-bold mt-2 text-indigo-600">{occupancyData?.summary?.totalBeds ? Math.round((occupancyData.summary.totalOccupiedBeds / occupancyData.summary.totalBeds) * 100) : 0}%</div></Card>
                </div>

                <Card>
                  <h4 className="font-semibold mb-4">Block-wise Occupancy</h4>
                  {occupancyChartData.length > 0 ? (
                    <div className="h-80"><ResponsiveContainer><BarChart data={occupancyChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="occupied" fill="#4F46E5" /><Bar dataKey="available" fill="#06B6D4" /></BarChart></ResponsiveContainer></div>
                  ) : <div className="h-64 flex items-center justify-center text-muted-foreground">No occupancy data</div>}
                </Card>
              </>
            )}
          </div>
        )}

        {activeReport === 'fees' && (
          <div>
            {feeLoading ? <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="size-5 animate-spin text-primary" /><span>Loading fees...</span></div> : (
              <>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <Card><div className="text-xs text-muted-foreground">Total Records</div><div className="text-2xl font-bold mt-2">{feeData?.summary?.totalRecords}</div></Card>
                  <Card><div className="text-xs text-muted-foreground">Total Amount</div><div className="text-2xl font-bold mt-2">{formatCurrency(feeData?.summary?.totalAmount || 0)}</div></Card>
                  <Card><div className="text-xs text-muted-foreground">Collected</div><div className="text-2xl font-bold mt-2 text-emerald-600">{formatCurrency(feeData?.summary?.paidAmount || 0)}</div></Card>
                  <Card><div className="text-xs text-muted-foreground">Pending</div><div className="text-2xl font-bold mt-2 text-amber-600">{formatCurrency(feeData?.summary?.pendingAmount || 0)}</div></Card>
                </div>

                <Card>
                  <h4 className="font-semibold mb-4">Payment Status</h4>
                  {feeChartData.length > 0 ? (<div className="h-64"><ResponsiveContainer><PieChart><Pie data={feeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{feeChartData.map((_, i) => <Cell key={i} fill={["#4F46E5","#06B6D4","#10B981"][i % 3]} />)}</Pie><Tooltip formatter={(v: any) => formatCurrency(v)} /></PieChart></ResponsiveContainer></div>) : <div className="h-64 flex items-center justify-center text-muted-foreground">No fee data</div>}
                </Card>
              </>
            )}
          </div>
        )}

        {activeReport === 'block' && (
          <div>
            {blockLoading ? <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="size-5 animate-spin text-primary" /><span>Loading blocks...</span></div> : (
              <>
                <Card>
                  <h4 className="font-semibold mb-4">Block Overview</h4>
                  <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b"><tr><th className="px-4 py-3 text-left">Block</th><th className="px-4 py-3 text-left">Rooms</th><th className="px-4 py-3 text-left">AC Rooms</th><th className="px-4 py-3 text-left">Capacity</th><th className="px-4 py-3 text-left">Occupied</th><th className="px-4 py-3 text-left">Available</th><th className="px-4 py-3 text-left">Occupancy %</th></tr></thead><tbody>{blockData?.data?.map((b: any, i: number) => (<tr key={i} className="border-b hover:bg-muted/30"><td className="px-4 py-3 font-medium">{b.blockName}</td><td className="px-4 py-3">{b.totalRooms}</td><td className="px-4 py-3">{b.acRooms}</td><td className="px-4 py-3">{b.capacity}</td><td className="px-4 py-3 font-medium">{b.occupiedBeds}</td><td className="px-4 py-3 text-emerald-600">{b.availableBeds}</td><td className="px-4 py-3"><Badge tone={b.occupancyRate >= 80 ? 'warn' : 'info'}>{b.occupancyRate}%</Badge></td></tr>))}</tbody></table></div>
                </Card>
              </>
            )}
          </div>
        )}

        {activeReport === 'available-rooms' && (
          <div>
            {availableRoomsLoading ? <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="size-5 animate-spin text-primary" /><span>Loading rooms...</span></div> : (
              <>
                <div className="grid md:grid-cols-3 gap-4 mb-4"><Card><div className="text-xs text-muted-foreground">Total Available</div><div className="text-2xl font-bold mt-2">{availableRoomsData?.total}</div></Card><Card><div className="text-xs text-muted-foreground">Available Beds</div><div className="text-2xl font-bold mt-2 text-emerald-600">{availableRoomsData?.data?.reduce((s: any, r: any) => s + r.availableBeds, 0) || 0}</div></Card></div>
                <Card>
                  <h4 className="font-semibold mb-4">Available Rooms</h4>
                  <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b"><tr><th className="px-4 py-3 text-left">Block</th><th className="px-4 py-3 text-left">Room</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Capacity</th><th className="px-4 py-3 text-left">Current</th><th className="px-4 py-3 text-left">Available</th><th className="px-4 py-3 text-left">AC/Non-AC</th></tr></thead><tbody>{availableRoomsData?.data?.map((r: any, i: number) => (<tr key={i} className="border-b hover:bg-muted/30"><td className="px-4 py-3 font-medium">{r.hostelBlock}</td><td className="px-4 py-3 font-semibold">{r.roomNumber}</td><td className="px-4 py-3">{r.roomType}</td><td className="px-4 py-3">{r.capacity}</td><td className="px-4 py-3">{r.currentOccupancy}</td><td className="px-4 py-3 text-emerald-600">{r.availableBeds}</td><td className="px-4 py-3"><Badge tone={r.acType === 'AC' ? 'info' : 'warn'}>{r.acType}</Badge></td></tr>))}</tbody></table></div>
                </Card>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
